'use strict';

angular.module('max.dal.entities.billingunion', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('billingUnionApi', function(RestApi) {
    var billingUnionApi = new RestApi('billingUnions', 'billingUnion');
    return billingUnionApi;
})

.factory('BillingUnion', function(billingUnionApi, Item) {
    var BillingUnion = (function() {
        function BillingUnion(itemData) {
            Item.call(this, itemData);
        };
        _.assign(BillingUnion.prototype, Item.prototype);

        BillingUnion.prototype.lowerName = 'billingUnion';

        BillingUnion.prototype.entityParams = {
            refFields: {
                site: 'sites',
                masterDealer: 'dealers',
                slaveDealer: 'dealers'
            }
        };

        BillingUnion.prototype.save = function(directories) {
            if (this.id) {
                return billingUnionApi.update(this.serialize()).then(function(respond) {
                    return new BillingUnion(respond.billingUnion).resolveRefs(directories);
                });
            } else {
                return billingUnionApi.create(this.serialize()).then(function(respond) {
                    return new BillingUnion(respond.billingUnion).resolveRefs(directories);
                });
            }
        };

        BillingUnion.prototype.remove = function() {
            if (this.id) {
                return billingUnionApi.remove(this.id);
            }
            throw new CollectionError('Попытка удалить элемент без id');
        };

        BillingUnion.prototype.name = function() {
            return 'салона "' + this.masterDealer.companyName + '" и салона "' + this.slaveDealer.companyName + '"';
        }

        return BillingUnion;
    }());
    return BillingUnion;
})

.factory('BillingUnions', function(Collection, BillingUnion) {
    function BillingUnions(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, BillingUnion, BillingUnions);
    };
    BillingUnions.prototype.lowerName = 'billingUnions';
    _.assign(BillingUnions.prototype, Collection.prototype);
    return BillingUnions;
})

.service('billingUnionsLoader', function billingUnionsLoader(entityLoader, billingUnionApi, BillingUnion, BillingUnions) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, billingUnionApi, BillingUnions);
    };
    this.loadItem = function(id, directories) {
        return entityLoader.loadItem(id, directories, billingUnionApi, BillingUnion);
    };
})
;