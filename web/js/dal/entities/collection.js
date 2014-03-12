'use strict';

angular.module('app.dal.entities.collection', [])

.factory('Collection', function($q, $log) {
    /**
     * Реализация базовой функциональности для работы с коллекциями объектов
     */
var Collection = (function() {
    var registeredCollections = [];

    var findCollection = function(entity) {
        var collection = _.find(registeredCollections, function(collection) {
            return collection.entity === entity;
        });
        if (!collection) {
            throw new CollectionError('Не зарегистрирована коллекция для объекта: '+ angular.toJson(entity));
        }
        return collection;
    };

    var findEntity = function(name) {
        var collection = _.find(registeredCollections, function(collection) {
            return (collection.entityName === name) || (collection.collectionName === name);
        });
        if (!collection) {
            return undefined;
        }
        return collection.entity;
    };

    var getCollectionItems = function(entity) {
        return findCollection(entity).items;
    };

    var getItemConstructor = function(entity) {
        var itemConstructor = findCollection(entity).itemConstructor;
        if (typeof itemConstructor === 'undefined') {
            throw new CollectionError('Не задан конструктор элементов коллекции.');
        }
        return itemConstructor;
    };

    /**
     * @param {Number} id
     * @returns {Item} OR undefined
     * @description
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    var findItem = function(id) {
        return _.find(getCollectionItems(this), {id: id});
    };

    /**
     * @param {Object}, {Array}
     * @returns {Object}
     * @description
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    var addItem = function(itemData) {
        var newItem;

        if (typeof itemData.id === 'undefined') {
            throw new CollectionError('Нет параметра id в элементе: ' + angular.toJson(itemData));
        } else if (Object.keys(itemData).length === 1) {    // ссылка
            newItem = findItem.call(this, itemData.id);
            if (!newItem) {
                throw new CollectionError('Не найдена ссылка для элемента: ' + angular.toJson(itemData) + ' в коллекции: ' + findCollection(this).collectionName);
            }
        } else {
            newItem = findItem.call(this, itemData.id);
            if (!newItem) {
                var ItemConstructor = getItemConstructor(this);
                newItem = new ItemConstructor();
                getCollectionItems(this).push(newItem);
            }
            var respond = newItem._fillItem(itemData);
        }
        return newItem;
    };

    /**
     * @param {Array}, {Array}
     * @returns {Array}
     * @description
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    var addArray = function(itemsData) {
        var newArray = [];

        if (!angular.isArray(itemsData)) {
            throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
        }
        for (var i = 0, length = itemsData.length; i < length; i++) {
            newArray[i] = addItem.call(this, itemsData[i]);
        }
        return newArray;
    };

    /**
     * @param {Number} id
     * @returns {Number}
     */
    var findIndex = function(id) {
        return _.findIndex(getCollectionItems(this), {id: id});
    };
    
    var Collection = function() {};

    /**
     * C подчеркивания начинаются "протектед" методы, предназначенные для использования
     * только в наследниках или "дружественном" Item (и его наследниках), а также в unit-тестах
     */

    Collection.prototype._addItem = addItem;        // экспорт частных методов для Item
    Collection.prototype._findEntity = findEntity;
    Collection.prototype._getItemConstructor = getItemConstructor;

    Collection.prototype._registerCollection = function(entityName, collectionName, itemConstructor, restApiProvider) {
        registeredCollections.push({
            entity: this,
            entityName: entityName,
            collectionName: collectionName,
            restApiProvider: restApiProvider,
            //todo: проверки на наличие необходимых методов query, create, update, remove
            itemConstructor: itemConstructor,
            items: []
        });
    };

    Collection.prototype._getRestApiProvider = function() {
        var collection = findCollection(this);
        var restApiProvider = collection.restApiProvider;
        if (typeof restApiProvider === 'undefined') {
            throw new CollectionError('Не задан провайдер REST API для коллекции: ' + collection.collectionName);
        }
        return restApiProvider;
    };

    /**
     * @param {}
     * @returns {Array}
     */
    Collection.prototype._setAll = function(itemsData) {
        return addArray.call(this, itemsData);
    };

    /**
     * @param {Array}
     * @returns {Promise}
     */
    Collection.prototype.load = function() {
        var self = this;
        return this._getRestApiProvider().query().then(function(itemsData){
            return self._setAll(itemsData);
        });
    };

    /**
     * @param -
     * @returns {Promise}
     */
    Collection.prototype.getAll = function() {
        if (0 === getCollectionItems(this).length) {
            var self = this;
            return this.load().then(function (response) {
                return response;
            });
        }
        return $q.when(getCollectionItems(this));
    };

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    Collection.prototype.get = function(id) {
        var self = this;
        return this.getAll().then(function (response) {
            var item = _.find(response, {id: id});
            if (!item) {
                throw new CollectionError('В коллекции ' + findCollection(self).collectionName + ' не найден элемент с id: ' + id);
            }
            return item;
        })
    };

    /**
     * @param {Item} id
     * @returns {Promise}
     */
    Collection.prototype.save = function(itemData) {
        var self = this;
        if (itemData.id) {      // требуется обновление элемента
            var oldItem = findItem.call(self, itemData.id);
            if (!oldItem) {
                throw new CollectionError('При обновлении в коллекции не найден элемент с id: ' + itemData.id);
            }
            return self._getRestApiProvider().update(itemData._serialize()).then(function(itemData){
                return oldItem._fillItem(itemData);
            });
        } else {
            return self._getRestApiProvider().create(itemData._serialize()).then(function(itemData){
                return addItem.call(self, itemData);
            });
        }
    };

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    Collection.prototype.remove = function(id) {
        var self = this;
        if (findItem.call(self, id)) {
            return self._getRestApiProvider().remove(id).then(function(){
                return getCollectionItems(self).splice(findIndex.call(self, id), 1);
            });
        }
        throw new CollectionError('При удалении в коллекции не найден элемент с id: ' + id);
    };

    /**
     * @param -
     * @returns {Promise}
     */
    Collection.prototype.getDirectories = function() {
        var getDirectories = this._getRestApiProvider().getDirectories;
        if (!getDirectories) {
            throw new CollectionError('Не определен метод REST API для загрузки зависимых справочников коллекции.');
        }
        return getDirectories().then(function(directoriesData){
            var newDirectories = {};

            for (var key in directoriesData) {
                var collection = findEntity(key);
                if (!collection) {
                    throw new CollectionError('Неизвестная секция: ' + key);
                    newDirectories[key] = undefined;
                } else {
                    newDirectories[key] = addArray.call(collection, directoriesData[key]);
                }
            }
            return newDirectories;
        })
    };

    return Collection;
}());

return Collection;

})

.factory('Item', function(Collection) {

    /**
     * импорт частных методов из Collection
     */
    var addItem = Collection.prototype._addItem;          // забираем нужную функцию
    delete Collection.prototype._addItem;                 // и заметаем следы
    var findEntity = Collection.prototype._findEntity;
    delete Collection.prototype._findEntity;
    var getItemConstructor = Collection.prototype._getItemConstructor;
    delete Collection.prototype._getItemConstructor;

    var Item = function () {};

    /**
     * C подчеркивания начинаются "протектед" методы, предназначенные для использования
     * только в наследниках или "дружественном" Collection (и его наследниках), а также в unit-тестах
     */

    /**
     * @param {Object}
     * @returns {Object}
     * @description
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    Item.prototype._fillItem = function(itemData) {
        for (var key in itemData) {
            var attr = itemData[key],
                refElem = attr;
            if (angular.isObject(attr)) {
                var entity = findEntity(key);
                if (!entity) {
                    throw new CollectionError('Неизвестный ссылочный параметр ' + key + ' в элементе с id: ' + itemData.id);
                } else {
                    refElem = addItem.call(entity, attr);
                }
            }
            this[key] = refElem;
        }
        return this;
    };

    /**
     * @param {Object}
     * @returns {Object}
     * @description
     * метод для подготовки запроса на сервер, вызывается синхронно
     */
    Item.prototype._serialize = function() {
        var itemData = {};
        angular.forEach(this, function(value, key){
            if (angular.isObject(value) && (key !== 'phones')) {
                if (key === "dealer") {               // todo: перекрытием данного метода на User
                    itemData[key] = value._serialize();
                } else {
                    itemData[key] = {id: value.id};
                }
            } else {
                itemData[key] = value;
            }
        });
        return itemData;
    };

    return Item;
});

var inheritCollection = function(child, parent) {
    child.prototype = new parent;
    return child;
};

var CollectionError = function(message) {
    this.message = message || "Неопределенная ошибка";
    this.stack = (new Error()).stack;
    // console.log(this.message);
}
CollectionError.prototype = new Error();
CollectionError.prototype.constructor = CollectionError;
