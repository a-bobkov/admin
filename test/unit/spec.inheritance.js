'use strict';

describe('Прототипирование наследования', function() {

    it('Второй вариант - без proto', function(){
        var inherit = function(child, parent) {
            // var F = function() {};
            // F.prototype = parent.prototype;
            // child.prototype = new F;
            child.prototype = new parent;
            return child;
        };

        var Collection = (function() {
            // частные данные и методы общего класса, работающие с 
            // 1) частными данными и методами общего класса
            // 2) интерфейсом к частным данным объекта в this
            var children = {};
            var _findItem = function(id) {};
            var _addItem = function(itemData) {return itemData*2};
            var _addArray = function(itemsData) {};
            var _findIndex = function(id) {};

            var _multiplier = 3;
            var _multiply = function(i) {
                return i*_multiplier*this._getPriv();
            }

            var NewCollection = function() {};
            // общий интерфейс, работающий с:
            // 1) частными данными и методами общего класса
            // 2) интерфейсом к частным данным объекта в this
            NewCollection.prototype.registerChild = function(entityName, collectionName) {};
            NewCollection.prototype.getChild = function(name) {};   // todo: реализовать
            NewCollection.prototype.setItemConstructor = function(ItemConstructor) {};
            NewCollection.prototype.getItemConstructor = function() {};
            NewCollection.prototype.setRestApiProvider = function(restApiProvider) {};
            NewCollection.prototype.getRestApiProvider = function() {};
            NewCollection.prototype.load = function() {};
            NewCollection.prototype.getAll = function() {};
            NewCollection.prototype.get = function(id) {};
            NewCollection.prototype.save = function(item) {};
            NewCollection.prototype.remove = function(id) {};
            NewCollection.prototype.getAll = function() {};
            NewCollection.prototype.getDirectories = function() {};
            NewCollection.prototype.addItem = _addItem;     // передача частного метода для дружественного Item

            NewCollection.prototype.setValue = function(i) {
                this._setCounter(_multiply.call(this, i));
            };
            NewCollection.prototype.getValue = function() {
                return this._getCounter();
            };
            NewCollection.prototype.checkValue = function() {
                return "Collection method";
            };
            return NewCollection;
        }());

        expect(Collection._multiplier).toBeUndefined();
        expect(Collection._multiply).toBeUndefined();
        expect(Collection.prototype.addItem).toBeDefined();

        var Item = (function() {
            // частные данные наследника
            var _addItem = Collection.prototype.addItem;    // забираем нужную функцию
            delete Collection.prototype.addItem;            // и заметаем следы

            var NewItem = function() {};

            // интерфейс к частным данным и публичные методы
            NewItem.prototype.check_addItem = function() {
                return _addItem(11);
            };
            return NewItem;
        }());

        expect(Item.prototype.check_addItem(11)).toBe(22);
        expect(Collection.prototype.addItem).toBeUndefined();

        var users = (function() {
            // частные данные наследника
            var _counter;
            var _priv = 10;
            var _addItem = Collection.prototype.addItem;
            delete Collection.prototype.addItem

            var Users = inherit(function() {    // инициализация экземпляра
                this.registerChild('user', 'users');
            }, Collection);

            // интерфейс к частным данным
            Users.prototype._setCounter = function(i) {
                _counter = i;
            };
            Users.prototype._getCounter = function() {
                return _counter;
            };
            Users.prototype._getPriv = function() {
                return _priv;
            };
            // публичные методы
            Users.prototype.checkValue = function() {
                return Collection.prototype.checkValue() + ' -> Users method';
            };
            return new Users;
        }());

        users.setValue(2);
        expect(users.getValue()).toBe(60);
        expect(users.checkValue()).toBe('Collection method -> Users method');

        var cities = (function() {
            var _counter;
            var _priv = 100;

            var Cities = inherit(function() {}, Collection);

            Cities.prototype._setCounter = function(i) {
                _counter = i;
            };
            Cities.prototype._getCounter = function() {
                return _counter;
            };
            Cities.prototype._getPriv = function() {
                return _priv;
            };
            return new Cities;
        }());

        cities.setValue(5);
        expect(cities.getValue()).toBe(1500);
        expect(users.getValue()).toBe(60);
    });

    it('Родитель и наследник имеют частные данные и методы', function(){
        var Collection = (function() {
            // частные данные и методы общего класса (статические)
            var _multiplier = 3;
            var _multiply = function(i) {
                return i*_multiplier;
            }

            var NewCollection = function() {};
            // общий интерфейс, работающий с:
            // 1) частными данными и методами общего класса
            // 2) интерфейсом к частным данным объекта в this
            NewCollection.prototype.setValue = function(i) {
                this._setCounter(_multiply(i));
            };
            NewCollection.prototype.getValue = function() {
                return this._getCounter();
            };
            NewCollection.prototype.checkValue = function() {
                return "Collection method";
            };
            return NewCollection;
        }());

        expect(Collection._multiplier).toBeUndefined();
        expect(Collection._multiply).toBeUndefined();

        var Users = (function() {
            // частные данные наследника
            var _counter;

            var Users = function() {};
            Users.__proto__ = Collection.prototype;
            // интерфейс к частным данным
            Users._setCounter = function(i) {
                _counter = i;
            };
            Users._getCounter = function() {
                return _counter;
            };
            // публичные методы
            Users.checkValue = function() {
                return Collection.prototype.checkValue() + ' -> Users method';
            };
            return Users;
        }());

        Users.setValue(2);
        expect(Users.getValue()).toBe(6);
        expect(Users.checkValue()).toBe('Collection method -> Users method');

        var Cities = (function() {
            var _counter;
            var Cities = function() {};
            Cities.__proto__ = Collection.prototype;
            Cities._setCounter = function(i) {
                _counter = i;
            };
            Cities._getCounter = function() {
                return _counter;
            };
            return Cities;
        }());

        Cities.setValue(5);
        expect(Cities.getValue()).toBe(15);
        expect(Users.getValue()).toBe(6);
    });
});
