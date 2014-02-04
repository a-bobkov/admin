'use strict';

angular.module('app.dal.entities.city', ['app.dal.entities.collection', 'app.dal.rest.city'])

.factory('cities', function(Collection, cityApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(cityApi);

    return collection;
})

.factory('City', function(cities, Item) {
    var City = function (data) {};

    angular.extend(City.prototype, Item.prototype);

    City.prototype.remove = function () {
        if (typeof this.id !== 'undefined') {
            var message = cities.remove(this.id);
            if (message) {
                // здесь должна быть визуализация диалогового окна с полученным собщением и кнопкой "Осознал"
            }
        }
    };

    return City;
})

.run(function(cities, City) {
    cities.setItemConstructor(City);
});
