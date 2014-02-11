'use strict';

describe('Прототипирование наследования', function() {

    it('Родитель и наследник имеют частные данные и методы', function(){
        var Collection = (function() {
            // частные данные и методы общего класса (статические)
            var _multiplier = 3;
            var _multiply = function(i) {
                return i*_multiplier;
            }

            var newCollection = function () {};
            // общий интерфейс, работающий с:
            // 1) частными данными и методами общего класса
            // 2) интерфейсом к частным данным объекта в this
            newCollection.prototype.setValue = function (i) {
                this._setCounter(_multiply(i));
            };
            newCollection.prototype.getValue = function () {
                return this._getCounter();
            };
            newCollection.prototype.checkValue = function () {
                return "Collection method";
            };
            return newCollection;
        }());

        expect(Collection._multiplier).toBeUndefined();
        expect(Collection._multiply).toBeUndefined();

        var Users = (function() {
            // частные данные наследника
            var _counter;

            var newUsers = function () {};
            newUsers.__proto__ = Collection.prototype;
            // интерфейс к частным данным
            newUsers._setCounter = function (i) {
                _counter = i;
            };
            newUsers._getCounter = function () {
                return _counter;
            };
            // публичные методы
            newUsers.checkValue = function () {
                return Collection.prototype.checkValue() + ' -> Users method';
            };
            return newUsers;
        }());

        Users.setValue(2);
        expect(Users.getValue()).toBe(6);
        expect(Users.checkValue()).toBe('Collection method -> Users method');

        var Cities = (function() {
            var _counter;
            var newCities = function () {};
            newCities.__proto__ = Collection.prototype;
            newCities._setCounter = function (i) {
                _counter = i;
            };
            newCities._getCounter = function () {
                return _counter;
            };
            return newCities;
        }());

        Cities.setValue(5);
        expect(Cities.getValue()).toBe(15);
        expect(Users.getValue()).toBe(6);
    });

});
