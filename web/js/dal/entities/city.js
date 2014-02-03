'use strict';

angular.module('app.dal.entities.city', ['app.dal.entities.collection', 'app.dal.rest.city'])

.factory('cities', function(Collection, CityApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(CityApi);

    return collection;
})

.factory('City', function(cities) {
    var City = function (data) {
        this.deserialize(data);
    };

    City.prototype.deserialize = function(data) {
        var key;

        for (key in data) {
            if (typeof data[key] === "object") {
                this[key] = data[key].id;
                // для ссылочной целостности, здесь должен быть либо:
                // 1. если в объекте - только id, то поиск ранее созданного объекта и сохранение ссылки на него
                //    если объекта еще нет, то можно здесь создать пустой, а когда он будет создаваться - наполнить
                // 2. иначе - вызов конструктора объекта (data[key]) и сохранение ссылки на него
            } else if (typeof data[key] === "number") {
                this[key] = data[key];
            } else if (typeof data[key] === "string") {
                this[key] = data[key];
            }
        }

        return this;
    }

    City.prototype.serialize = function() {
        var key,
            data = {};

        for (key in this) {
            if (typeof this[key] === "object") {
                data[key] = this[key].id;
                //data[key] = this[key].serialize();        // исключение! для дилера здесь должно быть так
            } else if (typeof this[key] === "number") {
                data[key] = this[key];
            } else if (typeof this[key] === "string") {
                data[key] = this[key];
            }
        }
        return data;
    }

    City.prototype.remove = function () {
        if (typeof this.id !== 'undefined') {
            var message = cities.remove(this.id);
            if (message) {
                // здесь должна быть визуализация диалогового окна с полученным собщением и кнопкой "Осознал"
            }
        }
    }

    return City;
})

.run(function(cities, City) {
    cities.setItemConstructor(City);
});
