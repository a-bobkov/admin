'use strict';

angular.module('max.dal.lib.filter', [])

.constant('FilterCompare', {
    LESS_PRECISELY: -1,
    THE_SAME:        0,
    MORE_PRECISELY:  1
})

.factory('FilterCollection', function (FilterCompare) {
    return function () {
        var collection = {},
            that = this;

        this.add = function (filter) {
            if (!_.isObject(filter)) {
                throw new Error("В коллекцию фильтров можно бодавлять только объекты реализующие интерфейс фильтра");
            }

            _.forEach(['getId', 'apply', 'compare', 'getAsObject'], function (method) {
                if (!_.isFunction(filter[method])) {
                    throw new Error("У объекта типа фильтр должен быть реализован метод " + method + "()");
                }
            });

            collection[filter.getId()] = filter;

            return that;
        };

        this.get = function (id) {
            return collection[id];
        };

        this.remove = function (filter) {
            if (!_.isObject(filter) || !_.isFunction(filter.getId)) {
                throw new Error("Для удаления из коллекциии необходимо передать объект с методом getId");
            }

            delete collection[filter.getId()];

            return that;
        };

        this.length = function () {
            return _.keys(collection).length;
        };

        this.filter = function (object) {
            var getId;

            for (getId in collection) {
                if (false === collection[getId].apply(object)) {
                    return false;
                }
            }

            return true;
        };

        this.compare = function (comparingCollection) {
            var getId,
                filter,
                comparingFilter,
                filterCompareResult,
                collectionCompareResult;

            if (that.length() > comparingCollection.length()) {
                return FilterCompare.LESS_PRECISELY;
            }

            collectionCompareResult = that.length() === comparingCollection.length()
                ? FilterCompare.THE_SAME
                : FilterCompare.MORE_PRECISELY;

            for (getId in collection) {
                filter = collection[getId];
                comparingFilter = comparingCollection.get(filter.getId());
                filterCompareResult = (_.isUndefined(comparingFilter))
                    ? FilterCompare.LESS_PRECISELY
                    : filter.compare(comparingFilter);

                if (FilterCompare.LESS_PRECISELY === filterCompareResult) {
                    return FilterCompare.LESS_PRECISELY;
                } else {
                    collectionCompareResult = Math.max(collectionCompareResult, filterCompareResult);
                }
            }

            return collectionCompareResult;
        };

        this.getAsObject = function () {
            var ret = [];

            _.forEach(collection, function (filter) {
                ret.push(filter.getAsObject())
            });

            return ret;
        };
    };
})

.factory('dalFilter', function () {
    var filters = {};

    return {
        factory: {
            register: function (alias, Constructor) {
                if (!_.isString(alias) || !alias) {
                    throw new Error("Алиас для фильтра должен быть непустой строкой");
                }

                if (!_.isFunction(Constructor)) {
                    throw new Error("Конструктор для фильтра должен быть функцией-конструктором");
                }

                if (!_.isUndefined(filters[alias])) {
                    throw new Error("Для алиаса '" + alias + "' уже задан конструктор фильтра");
                }

                filters[alias] = Constructor;
            },

            create: function (obj) {
                var filter;

                if (!_.isObject(obj)) {
                    throw new Error('В фабрику фильтров должен быть передан объект');
                }

                if (_.isUndefined(filters[obj.type])) {
                    throw new Error('В фабрику фильтров передан неизвестный тип фильтра: ' + obj.type);
                }

                filter = new filters[obj.type](obj.field);
                filter.value = obj.value;

                return filter;
            }
        },
        utils: {
            getDeepValue: function (object, property) {
                var value = object;

                _.forEach(property.split('.'), function (property) {
                    return !_.isUndefined(value = value[property]);
                });

                return value;
            }
        }
    };
});
