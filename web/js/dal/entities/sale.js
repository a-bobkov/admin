'use strict';

angular.module('max.dal.entities.sale', ['max.dal.entities.collection', 'max.dal.rest.api',
    'max.dal.entities.dealer',
    'max.dal.entities.site',
    'max.dal.entities.tariff'
])

.factory('saleApi', function(RestApi, Api) {
    var saleApi = new RestApi('sales', 'sale');
    return saleApi;
})

.factory('Sale', function(saleApi, Item) {

    var Sale = function(itemData, directories) {
        var self = this;
        _.forOwn(itemData, function(value, key) {
            var newValue;
            if (value && value.id) {    // ссылка
                if (key === 'dealer') {
                    newValue = directories.dealers.get(value.id);
                } else if (key === 'site') {
                    newValue = directories.sites.get(value.id);
                } else if (key === 'tariff') {
                    newValue = directories.tariffs.get(value.id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
                }
                if (!newValue) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
                }
            } else if (key === 'type') {
                newValue = directories.saleTypes.get(value);
            } else if (key === 'isActive') {
                newValue = directories.saleStatuses.get(value);
            } else if (key === 'activeFrom' || key === 'activeTo' || key === 'date') {
                newValue = new Date(value);
            } else {
                newValue = value;
            }
            self[key] = newValue;
        });
    };

    _.extend(Sale.prototype, Item.prototype);

    Sale.prototype.isValid = function() {
        return _.every(this, function(value, key) {
            if (value && value.id) {    // ссылки пропускаем
                return true;
            } else {              // todo: валидация значений полей, кроме ссылок
                return true;
            }
        });
    };

    Sale.prototype.isCard = function() {
        return (this.type && (this.type.id == 'card' || this.type.id === 'addcard'));
    };

    Sale.prototype.serialize = function() {
        var itemData = {};
        _.forEach(this, function(value, key){
            if (key === 'isActive' || key === 'type') {
                itemData[key] = value.id;
            } else if (_.isDate(value)) {
                itemData[key] = value.toISOString().slice(0, 10);
            } else if (_.isObject(value)) {
                itemData[key] = {id: value.id};
            } else {
                itemData[key] = value;
            }
        });
        return itemData;
    };

    Sale.prototype.save = function(directories) {
        if (this.id) {
            return saleApi.update(this.serialize()).then(function(respond) {
                return new Sale(respond.sale, directories);
            });
        } else {
            return saleApi.create(this.serialize()).then(function(respond) {
                return new Sale(respond.sale, directories);
            });
        }
    };

    Sale.prototype.remove = function() {
        if (this.id) {
            return saleApi.remove(this.id);
        }
        throw new CollectionError('Попытка удалить элемент без id');
    };

    return Sale;
})

.factory('Sales', function(Collection) {
    var Sales = (function() {
        var Sales = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(Sales.prototype, Collection.prototype);
        return Sales;
    }());
    return Sales;
})

.service('salesLoader', function(saleApi, Sale, Sales, saleTypesLoader, saleStatusesLoader,
    dealersLoader, sitesLoader, tariffsLoader, $q) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new Sale(itemData, directories);
        });
        return new Sales(items, queryParams);
    };

    this.loadItems = function(queryParams, oldDirectories) {
        var self = this;
        return saleApi.query(queryParams).then(function(salesData) {
            var toResolve = [];
            if (!oldDirectories || !oldDirectories.saleTypes) {
                toResolve.push(saleTypesLoader.loadItems());
            }
            if (!oldDirectories || !oldDirectories.saleStatuses) {
                toResolve.push(saleStatusesLoader.loadItems());
            }
            if (!oldDirectories || !oldDirectories.dealers) {
                var dealerIds = _.pluck(_.compact(_.pluck(salesData.sales, 'dealer')), 'id');
                if (!_.isEmpty(dealerIds)) {
                    var dealerQueryParams = {
                        filters: [
                            { fields: ['id'], type: 'in', value: dealerIds }
                        ],
                        fields: ['dealer_list_name']
                    };
                    toResolve.push(dealersLoader.loadItems(dealerQueryParams));
                }
            }
            if (!oldDirectories || !oldDirectories.sites) {
                var siteIds = _.pluck(_.compact(_.pluck(salesData.sales, 'site')), 'id');
                if (!_.isEmpty(siteIds)) {
                    var siteQueryParams = {
                        filters: [
                            { fields: ['id'], type: 'in', value: siteIds }
                        ]
                    };
                    toResolve.push(sitesLoader.loadItems(siteQueryParams));
                }
            }
            if (!oldDirectories || !oldDirectories.tariffs) {
                var tariffIds = _.pluck(_.compact(_.pluck(salesData.sales, 'tariff')), 'id');
                if (!_.isEmpty(tariffIds)) {
                    var tariffQueryParams = {
                        filters: [
                            { fields: ['id'], type: 'in', value: tariffIds }
                        ]
                    };
                    toResolve.push(tariffsLoader.loadItems(tariffQueryParams));
                }
            }
            return $q.all(toResolve).then(function(directoriesArr) {
                var newDirectories = {};
                _.forEach(directoriesArr, function(directory) {
                    _.assign(newDirectories, directory)
                });
                var directories = _.assign({}, oldDirectories, newDirectories);
                return _.assign(newDirectories, {sales: self.makeCollection(salesData.sales, salesData.params, directories)});
            });
        });
    };

    this.loadItem = function(id, oldDirectories) {
        var self = this;
        return saleApi.get(id).then(function(saleData) {
            var toResolve = [];
            if (!oldDirectories.saleTypes) {
                toResolve.push(saleTypesLoader.loadItems());
            }
            if (!oldDirectories.saleStatuses) {
                toResolve.push(saleStatusesLoader.loadItems());
            }
            if (!oldDirectories.dealers) {
                var dealerIds = _.pluck(_.compact(_.pluck([saleData.sale], 'dealer')), 'id');
                if (!_.isEmpty(dealerIds)) {
                    var dealerQueryParams = {
                        filters: [
                            { fields: ['id'], type: 'in', value: dealerIds }
                        ],
                        fields: ['dealer_list_name']
                    };
                    toResolve.push(dealersLoader.loadItems(dealerQueryParams));
                }
            }
            if (!oldDirectories.sites) {
                var siteIds = _.pluck(_.compact(_.pluck([saleData.sale], 'site')), 'id');
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
                var toResolve = [];
                if (!oldDirectories.tariffs) {
                    var tariffIds = _.pluck(_.compact(_.pluck([saleData.sale], 'tariff')), 'id');
                    if (!_.isEmpty(tariffIds)) {
                        var tariffQueryParams = {
                            filters: [
                                { fields: ['site'], type: 'in', value: siteIds }
                            ]
                        };
                        toResolve.push(tariffsLoader.loadItems(tariffQueryParams, newDirectories));
                    }
                    toResolve.push(tariffsLoader.loadItems(tariffQueryParams, newDirectories));
                }
                return $q.all(toResolve).then(function(directoriesArr) {
                    _.transform(directoriesArr, _.assign, newDirectories);
                    var directories = _.assign({}, oldDirectories, newDirectories);
                    return _.assign(newDirectories, {sale: new Sale(saleData.sale, directories)});
                });
            });
        });
    };
})

.factory('SaleStatus', function(Item) {
    var SaleStatus = function(itemData, directories) {
        _.extend(this, itemData);
    };
    _.extend(SaleStatus.prototype, Item.prototype);
    return SaleStatus;
})

.factory('SaleStatuses', function(Collection) {
    var SaleStatuses = (function() {
        var SaleStatuses = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(SaleStatuses.prototype, Collection.prototype);
        return SaleStatuses;
    }());
    return SaleStatuses;
})

.service('saleStatusesLoader', function(SaleStatus, SaleStatuses, $q) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new SaleStatus(itemData, directories);
        });
        return new SaleStatuses(items, queryParams);
    };

    this.loadItems = function() {
        var self = this;
        return $q.when({saleStatuses: self.makeCollection([
            { id: true, name: 'Акт' },
            { id: false, name: 'Н/А' }
        ])});
    };
})

.factory('SaleType', function(Item) {
    var SaleType = function(itemData, directories) {
        _.extend(this, itemData);
    };
    _.extend(SaleType.prototype, Item.prototype);
    return SaleType;
})

.factory('SaleTypes', function(Collection) {
    var SaleTypes = (function() {
        var SaleTypes = function(itemsData, queryParams) {
            Collection.call(this, itemsData, queryParams);
        };
        angular.extend(SaleTypes.prototype, Collection.prototype);
        return SaleTypes;
    }());
    return SaleTypes;
})

.service('saleTypesLoader', function(SaleType, SaleTypes, $q) {

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var items = _.collect(itemsData, function(itemData) {
            if (typeof itemData.id === 'undefined') {
                throw new CollectionError('Нет параметра id в данных: ' + angular.toJson(itemData));
            }
            return new SaleType(itemData, directories);
        });
        return new SaleTypes(items, queryParams);
    };

    this.loadItems = function() {
        var self = this;
        return $q.when({saleTypes: self.makeCollection([
            { id: 'card', name: 'Осн' },
            { id: 'addcard', name: 'Расш' },
            { id: 'extra', name: 'Доп' }
        ])});
    };
});