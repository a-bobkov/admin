'use strict';

angular.module('max.dal.lib.filter.equal', ['max.dal.lib.filter'])

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

.run(function (dalFilter, EqualFilter) {
    dalFilter.register('equal', EqualFilter);
});