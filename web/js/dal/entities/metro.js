'use strict';

angular.module('max.dal.entities.metro', ['max.dal.entities.collection'])

.factory('Metro', function(Item) {
    var Metro = (function() {
        function Metro(itemData) {
            Item.call(this, itemData);
        };
        _.assign(Metro.prototype, Item.prototype);

        Metro.prototype.entityParams = {
            refFields: {
                city: 'cities'
            }
        };

        return Metro;
    }());
    return Metro;
})

.factory('Metros', function(Collection, Metro) {
    function Metros(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, Metro, Metros);
    };
    _.assign(Metros.prototype, Collection.prototype);
    return Metros;
})
;