'use strict';

angular.module('max.dal.entities.dealersitelogin', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('dealerSiteLoginApi', function(RestApi, Api) {
    var dealerSiteLoginApi = new RestApi('dealerSiteLogins', 'dealerSiteLogin');
    return dealerSiteLoginApi;
})

.factory('DealerSiteLogin', function(dealerSiteLoginApi, Item, dealerSiteLoginTypes) {
    var DealerSiteLogin = (function() {
        var entityParams = {
            enumFields: {
                type: dealerSiteLoginTypes
            },
            refFields: {
                dealer: 'dealers',
                site: 'sites'
            }
        };
        function DealerSiteLogin(itemData) {
            Item.call(this, itemData, entityParams);
        };
        _.assign(DealerSiteLogin.prototype, Item.prototype);

        DealerSiteLogin.prototype.resolveRefs = function(directories) {
            return Item.prototype.resolveRefs.call(this, directories, entityParams);
        };

        DealerSiteLogin.prototype.serialize = function() {
            return Item.prototype.serialize.call(this, entityParams);
        };

        DealerSiteLogin.prototype.save = function(directories) {
            if (this.id) {
                return dealerSiteLoginApi.update(this.serialize()).then(function(respond) {
                    return new DealerSiteLogin(respond.dealerSiteLogin).resolveRefs(directories);
                });
            } else {
                return dealerSiteLoginApi.create(this.serialize()).then(function(respond) {
                    return new DealerSiteLogin(respond.dealerSiteLogin).resolveRefs(directories);
                });
            }
        };

        DealerSiteLogin.prototype.remove = function() {
            if (this.id) {
                return dealerSiteLoginApi.remove(this.id);
            }
            throw new CollectionError('Попытка удалить элемент без id');
        };

        DealerSiteLogin.prototype.name = function() {
            return 'типа ' + this.type + ' салона "' + this.dealer.companyName + '" на сайте "' + this.site.name + '"';
        }

        return DealerSiteLogin;
    }());
    return DealerSiteLogin;
})

.factory('DealerSiteLogins', function(Collection, DealerSiteLogin) {
    function DealerSiteLogins(itemsData, queryParams) {
        Collection.call(this, itemsData, DealerSiteLogin, queryParams);
    };
    _.assign(DealerSiteLogins.prototype, Collection.prototype);
    return DealerSiteLogins;
})

.service('dealerSiteLoginsLoader', function(dealerSiteLoginApi, DealerSiteLogin, DealerSiteLogins) {
    this.loadItems = function(queryParams) {
        return dealerSiteLoginApi.query(queryParams).then(function(dealerSiteLoginsData) {
            return new DealerSiteLogins(dealerSiteLoginsData, queryParams);
        });
    };
    this.loadItem = function(id) {
        return dealerSiteLoginApi.get(id).then(function(dealerSiteLoginData) {
            return new DealerSiteLogin(dealerSiteLoginData);
        });
    };
})

.factory('DealerSiteLoginType', function(Item) {
    function DealerSiteLoginType(itemData) {
        Item.call(this, itemData);
    };
    _.assign(DealerSiteLoginType.prototype, Item.prototype);
    return DealerSiteLoginType;
})

.factory('dealerSiteLoginTypes', function(Collection, DealerSiteLoginType) {
    return new Collection([
        { id: 'site' },
        { id: 'ftp' }
    ], DealerSiteLoginType);
})
;