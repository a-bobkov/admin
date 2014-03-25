'use strict';

angular.module('app.dal.entities.metro', ['app.dal.entities.collection', 'app.dal.rest.api'])

.factory('metroApi', function(RestApi, Api) {
    var metroApi = new RestApi('metros', 'metro');
    return metroApi;
})

.factory('Metro', function() {
    var Metro = function(itemData) {
        angular.extend(this, itemData);
    };
    return Metro;
})

.factory('Metros', function(Metro) {
var Metros = (function() {
    var Metros = inheritCollection(function(itemsData, queryParams) {
        Collection.prototype.construct(itemsData, queryParams, Metro);
    });
    return Metros;
}());
return Metros;
})

.factory('metrosLoader', function(Metros) {

    this.makeItem = function(directories) {
        if (typeof this.id === 'undefined') {
            throw new CollectionError('Нет параметра id в элементе: ' + angular.toJson(this));
        }
        return _.mapValues(this, function(value, key) {
            var newValue = value;
            if (value.id) {    // ссылка
                if (key === 'city') {
                    newValue = directories.cities.get(id);
                } else {
                    throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
                }
                if (!newValue) {
                    throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
                }
            } else {
                // здесь можно реализовать дополнительную проверку и конвертацию данных айтема
            }
            return newValue;
        });
    });

    this.makeCollection = function(itemsData, queryParams, directories) {
        if (!_.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        var newItemsData = _.invoke(itemsData, this.makeItem, directories);
        return new Metros(newItemsData, queryParams);
    };
});