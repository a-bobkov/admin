'use strict';

angular.module('max.dal.entities.billingcredit', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('billingCreditApi', function(RestApi) {
    var billingCreditApi = new RestApi('billingCredits', 'billingCredit');
    return billingCreditApi;
})

.factory('BillingCredit', function(billingCreditApi, Item) {
    var BillingCredit = (function() {
        function BillingCredit(itemData) {
            Item.call(this, itemData);
        };
        _.assign(BillingCredit.prototype, Item.prototype);

        BillingCredit.prototype.lowerName = 'billingCredit';

        BillingCredit.prototype.entityParams = {
            dateFields: ['expiresAt'],
            refFields: {
                dealer: 'dealers'
            }
        };

        BillingCredit.prototype.save = function(directories) {
            if (this.id) {
                return billingCreditApi.update(this.serialize()).then(function(respond) {
                    return new BillingCredit(respond.billingCredit).resolveRefs(directories);
                });
            } else {
                return billingCreditApi.create(this.serialize()).then(function(respond) {
                    return new BillingCredit(respond.billingCredit).resolveRefs(directories);
                });
            }
        };

        BillingCredit.prototype.remove = function() {
            if (this.id) {
                return billingCreditApi.remove(this.id);
            }
            throw new CollectionError('Попытка удалить элемент без id');
        };

        BillingCredit.prototype.name = function() {
            return 'салона "' + this.dealer.companyName + '"';
        }

        return BillingCredit;
    }());
    return BillingCredit;
})

.factory('BillingCredits', function(Collection, BillingCredit) {
    function BillingCredits(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, BillingCredit, BillingCredits);
    };
    BillingCredits.prototype.lowerName = 'billingCredits';
    _.assign(BillingCredits.prototype, Collection.prototype);
    return BillingCredits;
})

.service('billingCreditsLoader', function billingCreditsLoader(entityLoader, billingCreditApi, BillingCredit, BillingCredits) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, billingCreditApi, BillingCredits);
    };
    this.loadItem = function(id, directories) {
        return entityLoader.loadItem(id, directories, billingCreditApi, BillingCredit);
    };
    this.loadItemDealer = function(dealerId, directories) {
        return this.loadItems({
            filters: [
                { fields: ['dealer'], type: 'equal', value: dealerId }
            ]
        }, directories).then(function(billingCredits) {
            return billingCredits.getItems()[0];
        });
    };
})
;