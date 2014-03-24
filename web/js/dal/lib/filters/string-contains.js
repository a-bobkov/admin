'use strict';

angular.module('max.dal.lib.filter.string-contains', ['max.dal.lib.filter'])

.factory('StringContainsFilter', function (FilterCompare, dalFilter) {

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
                fieldValue = dalFilter.utils.getDeepValue(object, fieldName);
                if (!_.isUndefined(fieldValue)){
                    fieldValue = fieldValue.toString();
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

.run(function (dalFilter, StringContainsFilter) {
    dalFilter.factory.register('contain', StringContainsFilter);
});