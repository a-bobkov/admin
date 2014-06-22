'use strict';

angular.module('max.dal.entities.market', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('marketApi', function(RestApi, Api) {
    var marketApi = new RestApi('markets', 'market');
    return marketApi;
})

.factory('Market', function(Item) {
    var Market = (function() {
        var entityParams = {
            refFields: {
                city: 'cities'
            }
        };
        function Market(itemData) {
            Item.call(this, itemData, entityParams);
        };
        _.assign(Market.prototype, Item.prototype);

        Market.prototype.resolveRefs = function(directories) {
            return Item.prototype.resolveRefs.call(this, directories, entityParams);
        };

        Market.prototype.serialize = function() {
            return Item.prototype.serialize.call(this, entityParams);
        };

        return Market;
    }());
    return Market;
})

.factory('Markets', function(Collection, Market) {
    function Markets(itemsData, queryParams) {
        Collection.call(this, itemsData, Market, queryParams);
    };
    _.assign(Markets.prototype, Collection.prototype);
    return Markets;
})
;