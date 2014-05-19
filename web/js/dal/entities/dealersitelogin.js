'use strict';

angular.module('max.dal.entities.dealersitelogin', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('dealerSiteLoginApi', function(RestApi, Api) {
    var dealerSiteLoginApi = new RestApi('dealerSiteLogins', 'dealerSiteLogin');
    return dealerSiteLoginApi;
})

.factory('DealerSiteLogin', function(dealerSiteLoginApi, Item) {

    var DealerSiteLogin = function(itemData, directories) {
        var self = this;
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (value && value.id) {    // ссылка
                if (key === 'dealer') {
                    newValue = directories.dealers.get(value.id);
                } else if (key === 'site') {
                    newValue = directories.sites.get(value.id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
                }
                if (!newValue) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
                }
            } else {
                newValue = value;
            }
            self[key] = newValue;
        });
    };

    _.extend(DealerSiteLogin.prototype, Item.prototype);

    DealerSiteLogin.prototype.isValid = function() {
        return _.every(this, function(value, key) {
            if (value && value.id) {    // ссылки пропускаем
                return true;
            } else {              // todo: валидация значений полей, кроме ссылок
                return true;
            }
        });
    };

    DealerSiteLogin.prototype.save = function(directories) {
        if (this.id) {
            return dealerSiteLoginApi.update(this.serialize()).then(function(respond) {
                return new DealerSiteLogin(respond.dealerSiteLogin, directories);
            });
        } else {
            return dealerSiteLoginApi.create(this.serialize()).then(function(respond) {
                return new DealerSiteLogin(respond.dealerSiteLogin, directories);
            });
        }
    };

    DealerSiteLogin.prototype.remove = function() {
        if (this.id) {
            return dealerSiteLoginApi.remove(this.id);
        }
        throw new CollectionError('Попытка удалить элемент без id');
    };

    return DealerSiteLogin;
})

.factory('DealerSiteLogins', function(Collection) {
    var DealerSiteLogins = (function() {
        var DealerSiteLogins = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(DealerSiteLogins.prototype, Collection.prototype);
        return DealerSiteLogins;
    }());
    return DealerSiteLogins;
})

.service('dealerSiteLoginsLoader', function(dealerSiteLoginApi, DealerSiteLogin, DealerSiteLogins, dealersLoader, sitesLoader, $q) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new DealerSiteLogin(itemData, directories);
        });
        return new DealerSiteLogins(items, queryParams);
    };

    this.loadItems = function(queryParams, directories) {
        var self = this;
        return dealerSiteLoginApi.query(queryParams).then(function(dealerSiteLoginsData) {
            if (!directories) {
                var getFilterFieldsValue = function(filters, fields) {
                    var filter = _.find(filters, {fields: fields});
                    if (filter) {
                        return filter.value;
                    }
                }

                var dealerIds = getFilterFieldsValue(queryParams && queryParams.filters, ['dealer']);
                if (_.isEmpty(dealerIds)) {
                    dealerIds = _.pluck(_.pluck(dealerSiteLoginsData.dealerSiteLogins, 'dealer'), 'id');
                }
                var dealerQueryParams = {
                    filters: [
                        { type: 'in', fields: ['user.id'], value: dealerIds }
                    ],
                    fields: [ 'dealer_list_name' ]
                };

                var siteIds = getFilterFieldsValue(queryParams && queryParams.filters, ['site']);
                if (_.isEmpty(siteIds)) {
                    siteIds = _.pluck(_.pluck(dealerSiteLoginsData.dealerSiteLogins, 'site'), 'id');
                }
                var siteQueryParams = {
                    filters: [
                        { type: 'in', fields: ['id'], value: siteIds }
                    ]
                };
                return $q.all({
                    dealers: dealersLoader.loadItems(dealerQueryParams).then(function(respond) {
                        return respond.dealers;
                    }),
                    sites: sitesLoader.loadItems(siteQueryParams).then(function(respond) {
                        return respond.sites;
                    })
                }).then(function(directories) {
                    return _.extend(directories, {dealerSiteLogins: self.makeCollection(dealerSiteLoginsData.dealerSiteLogins, dealerSiteLoginsData.params, directories)});
                });
            }
            return {dealerSiteLogins: self.makeCollection(dealerSiteLoginsData.dealerSiteLogins, dealerSiteLoginsData.params, directories)};
        });
    };
});