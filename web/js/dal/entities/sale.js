'use strict';

angular.module('max.dal.entities.sale', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('saleApi', function(RestApi) {
    var saleApi = new RestApi('sales', 'sale');
    return saleApi;
})

.factory('Sale', function(saleApi, Item, saleTypes, saleStatuses) {
    var Sale = (function() {
        function Sale(itemData) {
            Item.call(this, itemData);
        };
        _.assign(Sale.prototype, Item.prototype);

        Sale.prototype.lowerName = 'sale';

        Sale.prototype.entityParams = {
            dateFields: ['date', 'activeFrom', 'activeTo'],
            enumFields: {
                type: saleTypes,
                isActive: saleStatuses
            },
            refFields: {
                dealer: 'dealers',
                site: 'sites',
                tariff: 'tariffs'
            }
        };

        Sale.prototype.isCard = function() {
            return (this.type && this.type.id === 'card');
        };

        Sale.prototype.isAddcard = function() {
            return (this.type && this.type.id === 'addcard');
        };

        Sale.prototype.isExtra = function() {
            return (this.type && this.type.id === 'extra');
        };

        Sale.prototype.save = function(directories) {
            if (this.id) {
                return saleApi.update(this.serialize()).then(function(respond) {
                    return new Sale(respond.sale).resolveRefs(directories);
                });
            } else {
                return saleApi.create(this.serialize()).then(function(respond) {
                    return new Sale(respond.sale).resolveRefs(directories);
                });
            }
        };

        Sale.prototype.remove = function() {
            if (this.id) {
                return saleApi.remove(this.id);
            }
            throw new CollectionError('Попытка удалить элемент без id');
        };

        Sale.prototype.name = function() {
            return 'салона "' + this.dealer.companyName + '" на сайте "' + this.site.name + '"';
        }

        return Sale;
    }());
    return Sale;
})

.factory('Sales', function(Collection, Sale) {
    function Sales(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, Sale, Sales);
    };
    Sales.prototype.lowerName = 'sales';
    _.assign(Sales.prototype, Collection.prototype);
    return Sales;
})

.service('salesLoader', function(entityLoader, saleApi, Sale, Sales) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, saleApi, Sales);
    };
    this.loadItem = function(id, directories) {
        return entityLoader.loadItem(id, directories, saleApi, Sale);
    };
})

.factory('SaleStatus', function(Item) {
    function SaleStatus(itemData) {
        Item.call(this, itemData);
    };
    _.assign(SaleStatus.prototype, Item.prototype);
    return SaleStatus;
})

.factory('saleStatuses', function(Collection, SaleStatus) {
    return new Collection([
        { id: true, name: 'А' },
        { id: false, name: 'Н/А' }
    ], null, SaleStatus);
})

.factory('SaleType', function(Item) {
    function SaleType(itemData) {
        Item.call(this, itemData);
    };
    _.assign(SaleType.prototype, Item.prototype);
    return SaleType;
})

.factory('saleTypes', function(Collection, SaleType) {
    return new Collection([
        { id: 'card', name: 'Осн' },
        { id: 'addcard', name: 'Расш' },
        { id: 'extra', name: 'Доп' }
    ], null, SaleType);
})
;