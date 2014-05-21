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

    Sale.prototype.serialize = function() {
        var itemData = {};
        _.forEach(this, function(value, key){
            if (key === 'isActive' || key === 'type') {
                itemData[key] = value.id;
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
    dealersLoader, tariffsLoader, $q) {

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

    this.loadItems = function(queryParams) {
        var self = this;
        return saleApi.query(queryParams).then(function(salesData) {
            var sales = salesData.sales;

            var cards = _.filter(sales, function(value) {
                return (value.type === 'card' || value.type === 'addcard');
            });
            var cardIds = _.pluck(cards, 'cardId');

            var addSaleQueryParams = {
                filters: [
                    { fields: ['type'], type: 'equal', value: 'addcard' },
                    { fields: ['parentId'], type: 'in', value: cardIds }
                ]
            };
            return saleApi.query(addSaleQueryParams).then(function(salesDataAdd) {
                function getFilterFieldsValue(filters, fields) {
                    var filter = _.find(filters, {fields: fields});
                    if (filter) {
                        return filter.value;
                    }
                }

                var dealerIds = getFilterFieldsValue(queryParams && queryParams.filters, ['dealer']);
                if (_.isEmpty(dealerIds)) {
                    dealerIds = _.pluck(_.pluck(sales, 'dealer'), 'id');
                }
                var dealerQueryParams = {
                    filters: [
                        { fields: ['id'], type: 'in', value: dealerIds }
                    ],
                    fields: ['dealer_list_name']
                };

                var tariffIds = _.pluck(_.pluck(cards, 'tariff'), 'id');
                var tariffQueryParams = {
                    filters: [
                        { fields: ['id'], type: 'in', value: tariffIds }
                    ]
                };

                return $q.all({
                    dealers: dealersLoader.loadItems(dealerQueryParams).then(function(respond) {
                        return respond.dealers;
                    }),
                    tariffs_sites: tariffsLoader.loadItems(tariffQueryParams).then(function(respond) {
                        return respond;
                    }),
                    saleTypes: saleTypesLoader.loadItems().then(function(respond) {
                        return respond.saleTypes;
                    }),
                    saleStatuses: saleStatusesLoader.loadItems().then(function(respond) {
                        return respond.saleStatuses;
                    })
                }).then(function(directories) {
                    directories.tariffs = directories.tariffs_sites.tariffs;
                    directories.sites = directories.tariffs_sites.sites;
                    _.assign(directories, {sales: self.makeCollection(salesData.sales, salesData.params, directories)});
                    _.assign(directories, {salesAdd: self.makeCollection(salesDataAdd.sales, salesDataAdd.params, directories)});
                    return directories;
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
            { id: false, name: 'Бло' }
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