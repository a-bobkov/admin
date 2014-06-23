'use strict';

angular.module('max.dal.entities.market', ['max.dal.entities.collection'])

.factory('Market', function(Item) {
    var Market = (function() {
        function Market(itemData) {
            Item.call(this, itemData);
        };
        _.assign(Market.prototype, Item.prototype);

        Market.prototype.entityParams = {
            refFields: {
                city: 'cities'
            }
        };

        return Market;
    }());
    return Market;
})

.factory('Markets', function(Collection, Market) {
    function Markets(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, Market, Markets);
    };
    _.assign(Markets.prototype, Collection.prototype);
    return Markets;
})
;