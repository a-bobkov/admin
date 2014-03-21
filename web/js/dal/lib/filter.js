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

.factory('StringContainsFilter', function (FilterCompare) {

    /**
     * Фильтр на вхождение строки
     * Вхождение строки проверяется среди полей, перечисленных в fieldNames
     *
     * @param fieldNames  Array     Массив с именами полей, обязательный параметр
     * @throw Error При вызове конструктора с неверными параметрами
     *
     */
    return function (fieldNames) {
        var type = "contain",
            that = this;

        if (_.isUndefined(fieldNames) || !_.isArray(fieldNames) || _.isEmpty(fieldNames)) {
            throw new Error("Названия полей, по которым выполняется фильтрация, должны быть переданы в виде массива со строками");
        }

        this.getId = function () {
            var delimiter = "_";
            return type + delimiter + fieldNames.join(delimiter);
        };

        this.value = "";

        this.apply = function (object) {
            var fieldName,
                fieldValue,
                value = that.value.toString();

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
            if (that.getId() !== filter.getId()) {
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

        this.getAsObject = function () {
            return {
                type: type,
                field: fieldNames,
                value: that.value
            }
        };
    };
})

.factory('EqualFilter', function (FilterCompare) {
    /**
     * Фильтр на совпадение значений в фильтре и в объекте
     *
     * @param fieldName   String    Имя поля объекта, в котором проверяется совпадение
     * @throw Error При вызове конструктора с неверными параметрами
     *
     */
    return function (fieldName) {
        var type = 'equal',
            that = this;

        if (_.isUndefined(fieldName) || !_.isString(fieldName)) {
            throw new Error("Название поля по которому выполняется фильтрация должно быть передано в виде строки");
        }

        this.getId = function () {
            return type + "_" + fieldName;
        };

        this.value = "";

        this.apply = function (object) {

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

            if (that.getId() !== filter.getId()) {
                throw new Error("Нельзя стравнивать разные фильтры");
            }

            if (that.value === filter.value) {
                return FilterCompare.THE_SAME;
            }

            return FilterCompare.LESS_PRECISELY;
        };

        this.getAsObject = function () {
            return {
                type: type,
                field: fieldName,
                value: that.value
            }
        };
    };
})

.factory('DalFilterFactory', function (StringContainsFilter, EqualFilter) {
    return {
        create: function (obj) {
            var filter;

            if (!_.isObject(obj)) {
                throw new Error('В фабрику фильтров должен быть передан объект');
            }

            if ('equal' === obj.type) {
                filter = new EqualFilter(obj.field);
            } else if ('contain' === obj.type) {
                filter = new StringContainsFilter(obj.field);
            } else {
                throw new Error('В фабрику фильтров передан передан неверный тип фильтра: ' + obj.type);
            }
            // todo: Сделать фильр in

            filter.value = obj.value;

            return filter;
        }
    };
});
