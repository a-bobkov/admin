'use strict';

angular.module('max.dal.lib.filter.equal', ['max.dal.lib.filter'])

.factory('EqualFilter', function (FilterCompare, dalFilter) {
    /**
     * Фильтр на совпадение значений в фильтре и в объекте
     *
     * @param fieldNames   Arrau    Массив имен полей объекта, по которым проверяется совпадение
     * @throw Error При вызове конструктора с неверными параметрами
     *
     */
    return function (fieldNames) {
        var type = 'equal',
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
            var ret = false;
            if (_.isEmpty(that.value)) {
                return true;
            }

            _.forEach(fieldNames, function (fieldName) {
                var value = dalFilter.utils.getDeepValue(object, fieldName);

                // todo: log.error на отсутствие значения в объекте
                ret = !_.isUndefined(value) && (that.value === value);

                return ret;
            });

            return  ret;
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
                type:   type,
                fields: fieldNames,
                value:  that.value
            }
        };
    };
})

.run(function (dalFilter, EqualFilter) {
    dalFilter.factory.register('equal', EqualFilter);
});