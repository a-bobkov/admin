'use strict';

angular.module('max.dal.lib.filter', [])

.constant('FilterCompare', {
    LESS_PRECISELY: -1,
    THE_SAME:        0,
    MORE_PRECISELY:  1
})

.factory('FilterCollectionConstructor', function (FilterCompare) {
    return function () {
        var collection = {},
            that = this;

        this.add = function (filter) {
            if (!_.isObject(filter)) {
                throw new Error("В коллекцию фильтров можно бодавлять только объекты реализующие интерфейс фильтра");
            }

            _.forEach(['getName', 'filter', 'compare', 'getAsObject'], function (method) {
                if (!_.isFunction(filter[method])) {
                    throw new Error("У объекта типа фильтр должен быть реализован метод " + method + "()");
                }
            });

            collection[filter.getName()] = filter;
        };

        this.get = function (filterName) {
            return collection[filterName];
        };

        this.remove = function (filter) {
            if (!_.isObject(filter) || !_.isFunction(filter.getName)) {
                throw new Error("Для удаления из коллекциии необходимо передать объект с методом getName");
            }

            delete collection[filter.getName()];
        };

        this.length = function () {
            return _.keys(collection).length;
        };

        this.filter = function (object) {
            var filterName;

            for (filterName in collection) {
                if (false === collection[filterName].filter(object)) {
                    return false;
                }
            }

            return true;
        };

        this.compare = function (comparingCollection) {
            var filterName,
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

            for (filterName in collection) {
                filter = collection[filterName];
                comparingFilter = comparingCollection.get(filter.getName());
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
            var ret = {};

            _.forEach(collection, function (filter) {
                _.merge(ret, filter.getAsObject());
            });

            return ret;
        };
    };
})

.factory('FilterConstructor', function (FilterCompare) {
    return function (filterName) {
        var that = this;

        if (!filterName || !_.isString(filterName)) {
            throw new Error("Имя фильтра должно быть задано строковым значением");
        }

        this.getName = function () {
            return filterName;
        };

        this.value = "";

        this.filter = function (object) {
            return true;
        };

        this.compare = function () {
            return FilterCompare.LESS_PRECISELY;
        };

        this.getAsObject = function () {
            var object = {};

            object[that.getName()] = that.value;

            return object;
        };
    };
})

.factory('StringContainsFilterConstructor', function (FilterConstructor, FilterCompare) {

    /**
     * Фильтр на вхождение строки
     * Вхождение строки проверяется среди полей, перечисленных в fieldNames
     *
     * @param filterName  String    Уникальное название фильтра, обязательный параметр
     * @param fieldNames  Array     Массив с именами полей, обязательный параметр
     * @throw Error При вызове конструктора с неверными параметрами
     *
     */
    return function (filterName, fieldNames) {
        var that = this;

        _.bind(FilterConstructor, this, filterName)();

        if (_.isUndefined(fieldNames) || !_.isArray(fieldNames) || _.isEmpty(fieldNames)) {
            throw new Error("Названия полей, по которым выполняется фильтрация, должны быть переданы в виде массива со строками");
        }

        this.filter = function (object) {
            var fieldName,
                fieldValue,
                value = _.isString(that.value) ? that.value : that.value.toString();

            if (_.isEmpty(value)) {
                return true;
            }

            for (var i = 0, l = fieldNames.length; i < l ; i++) {
                fieldName = fieldNames[i];
                if (!_.isUndefined(object[fieldName])){
                    fieldValue = object[fieldName].toString();
                    if (-1 !== fieldValue.indexOf(value)) {
                        return true;
                    }
                } // todo: log.error на отсутствие значения в объекте
            }

            return  false;
        };

        this.compare = function (filter) {
            var value,
                comparingValue;
            if (that.getName() !== filter.getName()) {
                throw new Error("Нельзя стравнивать разные фильтры");
            }

            value = _.isString(that.value) ? that.value : that.value.toString();
            comparingValue = _.isString(filter.value) ? filter.value : filter.value.toString();

            if (value === comparingValue) {
                return FilterCompare.THE_SAME;
            } else if (-1 !== comparingValue.indexOf(value)) {
                return FilterCompare.MORE_PRECISELY;
            }

            return FilterCompare.LESS_PRECISELY;
        };
    };
})

.factory('TheSameValueFilterConstructor', function (FilterConstructor, FilterCompare) {
    /**
     * Фильтр на совпадение значений в фильтре и в объекте
     *
     * @param filterName  String    Уникальное название фильтра, обязательный параметр
     * @param fieldName   String    Имя поля объекта, в котором проверяется совпадение
     * @throw Error При вызове конструктора с неверными параметрами
     *
     */
    return function (filterName, fieldName) {
        var that = this;

        _.bind(FilterConstructor, this, filterName)();

        if (_.isUndefined(fieldName) || !_.isString(fieldName)) {
            throw new Error("Название поля по которому выполняется фильтрация должно быть передано в виде строки");
        }

        this.filter = function (object) {

            if (_.isEmpty(that.value)) {
                return true;
            }

            if (!_.isUndefined(object[fieldName])){
                if (that.value === object[fieldName]) {
                    return true;
                }
            } // todo: log.error на отсутствие значения в объекте

            return  false;
        };


        this.compare = function (filter) {

            if (that.getName() !== filter.getName()) {
                throw new Error("Нельзя стравнивать разные фильтры");
            }

            if (that.value === filter.value) {
                return FilterCompare.THE_SAME;
            }

            return FilterCompare.LESS_PRECISELY;
        };
    };
});