'use strict';

angular.module('max.dal.entities.brand', ['max.dal.entities.collection', 'max.dal.rest.api'])

.factory('Brand', function(Item) {
    function Brand(itemData) {
        Item.call(this, itemData);
    };
    _.assign(Brand.prototype, Item.prototype);
    Brand.prototype.lowerName = 'brand';
    Brand.prototype.idName = function() {
        return this.id + ': ' + this.name;
    }
    return Brand;
})

.factory('Brands', function(Collection, Brand) {
    function Brands(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, Brand, Brands);
    };
    _.assign(Brands.prototype, Collection.prototype);
    Brands.prototype.lowerName = 'brands';
    return Brands;
})

.factory('brandApi', function(RestApi, Api) {
    var brandApi = new RestApi('brands', 'brand');
    return brandApi;
})

.service('brandsLoader', function brandsLoader(entityLoader, brandApi, Brand, Brands) {
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, brandApi, Brands);
    };
})
;