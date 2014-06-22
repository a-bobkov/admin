'use strict';

angular.module('max.dal.entities.metro', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('metroApi', function(RestApi, Api) {
    var metroApi = new RestApi('metros', 'metro');
    return metroApi;
})

.factory('Metro', function(Item) {
    var Metro = (function() {
        var entityParams = {
            refFields: {
                city: 'cities'
            }
        };
        function Metro(itemData) {
            Item.call(this, itemData, entityParams);
        };
        _.assign(Metro.prototype, Item.prototype);

        Metro.prototype.resolveRefs = function(directories) {
            return Item.prototype.resolveRefs.call(this, directories, entityParams);
        };

        Metro.prototype.serialize = function() {
            return Item.prototype.serialize.call(this, entityParams);
        };

        return Metro;
    }());
    return Metro;
})

.factory('Metros', function(Collection, Metro) {
    function Metros(itemsData, queryParams) {
        Collection.call(this, itemsData, Metro, queryParams);
    };
    _.assign(Metros.prototype, Collection.prototype);
    return Metros;
})
;