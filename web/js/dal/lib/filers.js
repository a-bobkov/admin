'use strict';

angular.module('max.dal.lib.filters', [])

.constant('FiltersCompare', {
    THE_SAME:        0,
    LESS_PRECISELY: -1,
    MORE_PRECISELY:  1
})

.factory('StringContainsFilter', function (FiltersCompare) {

    /**
     * Фильтр на вхождение строки
     * Вхождение строки проверяется среди полей, перечисленных в fieldNames
     *
     * @param filterName  String    Уникальное название фильтра, обязательный параметр
     * @param fieldNames  Array     Массив с именами полей, обязательный параметр
     * @throw Error При вызове конструктора с неверными параметрами
     *
     */
    return function StringContainFilter(filterName, fieldNames) {
        var that = this;

        if (!filterName || !_.isString(filterName)) {
            throw new Error("Имя фильтра должно быть задано строковым значением");
        }

        if (_.isUndefined(fieldNames) || !_.isArray(fieldNames) || _.isEmpty(fieldNames)) {
            throw new Error("Названия полей, по которым выполняется фильтрация, должны быть переданы в виде массива со строками");
        }

        this.getName = function () {
            return filterName;
        };

        this.value = "";

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
                filterValue;

            if (that.getName() !== filter.getName()) {
                throw new Error("Нельзя стравнивать разные фильтры");
            }

            value = _.isString(that.value) ? that.value : that.value.toString();
            filterValue = _.isString(filter.value) ? filter.value : filter.value.toString();

            if (value === filterValue) {
                return FiltersCompare.THE_SAME;
            } else if (-1 !== filterValue.indexOf(value)) {
                return FiltersCompare.MORE_PRECISELY;
            }

            return FiltersCompare.LESS_PRECISELY;
        }
    };
})

.factory('TheSameValueFilter', function (FiltersCompare) {
    /**
     * Фильтр на совпадение значений в фильтре и в объекте
     *
     * @param filterName  String    Уникальное название фильтра, обязательный параметр
     * @param fieldName   String    Имя поля объекта, в котором проверяется совпадение
     * @throw Error При вызове конструктора с неверными параметрами
     *
     */
    return function TheSameValueFilter(filterName, fieldName) {
        var that = this;

        if (!filterName || !_.isString(filterName)) {
            throw new Error("Имя фильтра должно быть задано строковым значением");
        }

        if (_.isUndefined(fieldName) || !_.isString(fieldName)) {
            throw new Error("Название поля по которому выполняется фильтрация должно быть передано в виде строки");
        }

        this.getName = function () {
            return filterName;
        };

        this.value = "";

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
                return FiltersCompare.THE_SAME;
            }

            return FiltersCompare.LESS_PRECISELY;
        }
    };
});
