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
    Metros.prototype.lowerName = 'metros';
    return Metros;
})

.factory('metroApi', function(RestApi, Api) {
    var metroApi = new RestApi('metros', 'metro');
    return metroApi;
})

.service('metrosLoader', function metrosLoader(entityLoader, metroApi, Metro, Metros) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, metroApi, Metros);
    };
})
;