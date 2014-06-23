'use strict';

angular.module('max.dal.entities.dealersitelogin', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('dealerSiteLoginApi', function(RestApi, Api) {
    var dealerSiteLoginApi = new RestApi('dealerSiteLogins', 'dealerSiteLogin');
    return dealerSiteLoginApi;
})

.factory('DealerSiteLogin', function(dealerSiteLoginApi, Item, dealerSiteLoginTypes) {
    var DealerSiteLogin = (function() {
        function DealerSiteLogin(itemData) {
            Item.call(this, itemData);
        };
        _.assign(DealerSiteLogin.prototype, Item.prototype);

        DealerSiteLogin.prototype.lowerName = 'dealerSiteLogin';

        DealerSiteLogin.prototype.entityParams = {
            enumFields: {
                type: dealerSiteLoginTypes
            },
            refFields: {
                dealer: 'dealers',
                site: 'sites'
            }
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
        Collection.call(this, itemsData, queryParams, DealerSiteLogin, DealerSiteLogins);
    };
    _.assign(DealerSiteLogins.prototype, Collection.prototype);
    DealerSiteLogins.prototype.lowerName = 'dealerSiteLogins';
    return DealerSiteLogins;
})

.service('dealerSiteLoginsLoader', function(entityLoader, dealerSiteLoginApi, DealerSiteLogin, DealerSiteLogins) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, dealerSiteLoginApi, DealerSiteLogins);
    };
    this.loadItem = function(id, directories) {
        return entityLoader.loadItem(id, directories, dealerSiteLoginApi, DealerSiteLogin);
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
    ], null, DealerSiteLoginType);
})
;