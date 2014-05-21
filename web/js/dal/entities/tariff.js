'use strict';

angular.module('max.dal.entities.tariff', ['max.dal.entities.collection', 'max.dal.rest.api',
    'max.dal.entities.site'
])

.factory('tariffApi', function(RestApi, Api) {
    var tariffApi = new RestApi('tariffs', 'tariff');
    return tariffApi;
})

.factory('Tariff', function(tariffApi, Item) {

    var Tariff = function(itemData, directories) {
        var self = this;
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (value && value.id) {    // ссылка
                if (key === 'site') {
                    newValue = directories.sites.get(value.id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' + angular.toJson(value));
                }
                if (!newValue) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' + angular.toJson(value));
                }
            } else {
                newValue = value;
            }
            self[key] = newValue;
        });
    };

    _.extend(Tariff.prototype, Item.prototype);

    Tariff.prototype.isValid = function() {
        return _.every(this, function(value, key) {
            if (value && value.id) {    // ссылки пропускаем
                return true;
            } else {              // todo: валидация значений полей, кроме ссылок
                return true;
            }
        });
    };

    Tariff.prototype.serialize = function() {
        var itemData = {};
        _.forEach(this, function(value, key){
            if (_.isObject(value)) {
                itemData[key] = {id: value.id};
            } else {
                itemData[key] = value;
            }
        });
        return itemData;
    };

    return Tariff;
})

.factory('Tariffs', function(Collection) {
    var Tariffs = (function() {
        var Tariffs = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(Tariffs.prototype, Collection.prototype);
        return Tariffs;
    }());
    return Tariffs;
})

.service('tariffsLoader', function(tariffApi, Tariff, Tariffs, sitesLoader, $q) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new Tariff(itemData, directories);
        });
        return new Tariffs(items, queryParams);
    };

    this.loadItems = function(queryParams, directories) {
        var self = this;
        return tariffApi.query(queryParams).then(function(tariffsData) {
            var tariffs = tariffsData.tariffs;
            if (directories) {
                return {tariffs: self.makeCollection(tariffs, tariffsData.params, directories)};
            }
            var getFilterFieldsValue = function(filters, fields) {
                var filter = _.find(filters, {fields: fields});
                if (filter) {
                    return filter.value;
                }
            }

            var siteIds = getFilterFieldsValue(queryParams && queryParams.filters, ['site']);
            if (_.isEmpty(siteIds)) {
                siteIds = _.pluck(_.pluck(tariffs, 'site'), 'id');
            }
            var siteQueryParams = {
                filters: [
                    { fields: ['id'], type: 'in', value: siteIds }
                ]
            };
            return $q.all({
                sites: sitesLoader.loadItems(siteQueryParams).then(function(respond) {
                    return respond.sites;
                })
            }).then(function(directories) {
                _.assign(directories, {tariffs: self.makeCollection(tariffs, tariffsData.params, directories)});
                return directories;
            });
        });
    };

    this.loadItem = function(id, directories) {
        var self = this;
        return tariffApi.get(id).then(function(tariffData) {
            var tariff = tariffData.tariff;
            if (directories) {
                return {tariff: new Tariff(tariff, directories)};
            }
            var siteQueryParams = {
                filters: [
                    { fields: ['id'], type: 'equal', value: tariff.site.id }
                ]
            };
            return $q.all({
                sites: sitesLoader.loadItems(siteQueryParams).then(function(respond) {
                    return respond.sites;
                })
            }).then(function(directories) {
                directories.tariff = new Tariff(tariff, directories);
                return directories;
            });
        });
    };
});