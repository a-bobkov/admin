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

    Tariff.prototype.name = function() {
        return this.id + ': ' + this.count + ' за ' + this.period + '  ' + this.periodUnit;
    }

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

    this.loadItems = function(queryParams, oldDirectories) {
        var self = this;
        return tariffApi.query(queryParams).then(function(tariffsData) {
            var toResolve = [];
            if (!oldDirectories || !oldDirectories.sites) {
                var siteIds = _.pluck(_.compact(_.pluck(tariffsData.tariffs, 'site')), 'id');
                if (!_.isEmpty(siteIds)) {
                    var siteQueryParams = {
                        filters: [
                            { fields: ['id'], type: 'in', value: siteIds }
                        ]
                    };
                    toResolve.push(sitesLoader.loadItems(siteQueryParams));
                }
            }
            return $q.all(toResolve).then(function(directoriesArr) {
                var newDirectories = _.transform(directoriesArr, _.assign, {});
                var directories = _.assign({}, oldDirectories, newDirectories);
                return _.assign(newDirectories, {tariffs: self.makeCollection(tariffsData.tariffs, tariffsData.params, directories)});
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