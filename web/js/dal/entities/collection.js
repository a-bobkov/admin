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
        var errorMessages = [];

        if (typeof itemData.id === 'undefined') {
            errorMessages.push(new CollectionError('Нет параметра id в элементе: ' + angular.toJson(itemData)));
        } else if (Object.keys(itemData).length === 1) {    // ссылка
            newItem = findItem.call(this, itemData.id);
            if (!newItem) {
                errorMessages.push(new CollectionError('Не найдена ссылка для элемента ' + angular.toJson(itemData)));
            }
        } else {
            newItem = findItem.call(this, itemData.id);
            if (!newItem) {
                var ItemConstructor = getItemConstructor(this);
                newItem = new ItemConstructor();
                getCollectionItems(this).push(newItem);
            }
            var respond = newItem._fillItem(itemData);
            errorMessages = _.union(errorMessages, respond.errorMessages);
        }
        return {result: newItem, errorMessages: errorMessages};    // если нет id, то вернется result: undefined
    };

    /**
     * @param {Array}, {Array}
     * @returns {Array}
     * @description
     * метод для разбора ответа от сервера, вызывается синхронно
     */
    var addArray = function(itemsData) {
        var newArray = [];
        var errorMessages = [];

        if (!angular.isArray(itemsData)) {
            errorMessages.push(new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData)));
        }
        for (var i = 0, length = itemsData.length; i < length; i++) {
            var respond = addItem.call(this, itemsData[i]);
            newArray[i] = respond.result;
            errorMessages = _.union(errorMessages, respond.errorMessages)
        }
        return {result: newArray, errorMessages: errorMessages};
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
     * @returns {Promise}
     */
    Collection.prototype._setAll = function(itemsData) {
        var respond = addArray.call(this, itemsData);
        var errorMessages = respond.errorMessages;
        if (errorMessages.length) {
            $log.error(errorMessages);
        }
        return respond.result;
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
        return this.getAll().then(function (response) {
            var item = _.find(response, {id: id});
            if (!item) {
                var errorMessage = 'В коллекции не найден элемент с id: ' + id;
                $log.error(errorMessage);
                return $q.reject({response: response, errorMessage: errorMessage});
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
                var errorMessage = 'При обновлении в коллекции не найден элемент с id: ' + itemData.id;
                $log.error(errorMessage);
                return $q.reject({errorMessage: errorMessage});
            }
            return self._getRestApiProvider().update(itemData._serialize()).then(function(itemData){
                var respond = oldItem._fillItem(itemData);
                var errorMessages = respond.errorMessages;
                if (errorMessages.length) {
                    $log.error(errorMessages);
                    return $q.reject({response: respond.result, errorMessage: errorMessages});
                }
                return respond.result;
            });
        } else {
            return self._getRestApiProvider().create(itemData._serialize()).then(function(itemData){
                var respond = addItem.call(self, itemData);
                var errorMessages = respond.errorMessages;
                if (errorMessages.length) {
                    $log.error(errorMessages);
                    return $q.reject({response: respond.result, errorMessage: errorMessages});
                }
                return respond.result;
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
        var errorMessage = 'При удалении в коллекции не найден элемент с id: ' + id;
        $log.error(errorMessage);
        return $q.reject({errorMessage: errorMessage});
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
            var newDirectories = {},
                errorMessages = [];

            for (var key in directoriesData) {
                var collection = findEntity(key);
                if (!collection) {
                    errorMessages.push(new CollectionError('Неизвестная секция: ' + key));
                    newDirectories[key] = undefined;
                } else {
                    var respond = addArray.call(collection, directoriesData[key]);
                    newDirectories[key] = respond.result;
                    errorMessages = _.union(errorMessages, respond.errorMessages);
                }
            }
            if (errorMessages.length) {
                $log.error(errorMessages);
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
        var errorMessages = [];
        for (var key in itemData) {
            var attr = itemData[key],
                refElem = attr;
            if (typeof attr === 'object') {
                var entity = findEntity(key);
                if (!entity) {
                    errorMessages.push(new CollectionError('Неизвестный ссылочный параметр ' + key + ' в элементе с id: ' + itemData.id));
                } else {
                    if (typeof attr.id === 'undefined') {   // создаем элемент без коллекции
                        var newItem = new (getItemConstructor(entity));
                        var respond = newItem._fillItem(attr);
                    } else {
                        var respond = addItem.call(entity, attr);
                    }
                    refElem = respond.result;
                    errorMessages = _.union(errorMessages, respond.errorMessages);
                }
            }
            this[key] = refElem;
        }
        return {result: this, errorMessages: errorMessages};
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
            if (typeof value === "object") {
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
    //console.log(this.message);
}
CollectionError.prototype = new Error();
CollectionError.prototype.constructor = CollectionError;
