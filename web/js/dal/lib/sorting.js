'use strict';

angular.module('max.dal.lib.sorting', [])

.constant('SortingCompare', {
    OTHER:      -1,
    THE_SAME:    0
})

.factory('SortingConstructor', function (SortingCompare) {
    var directions = ['asc', 'desc'];

    return function (fieldName, direction) {
        if (!_.isString(fieldName)) {
            throw new Error("Название поля для сортировки обязательно должно быть задано");
        }

        if (_.isUndefined(direction)) {
            direction = directions[0];
        } else if (!_.contains(directions, direction)) {
            throw new Error("Направление сортировки может быть задано значениеям: " + directions.join(", "));
        }

        this.getFieldName = function () {
            return fieldName;
        };

        this.getDirection = function () {
            return direction;
        }

        this.getAsObject = function () {
            return {
                sorting_field:      fieldName,
                sorting_direction:  direction
            }
        };

        this.compare = function (sorting) {
            if (!_.isObject(sorting) || !_.isFunction(sorting.getFieldName) || !_.isFunction(sorting.getDirection)) {
                throw new Error("Сортировку можно сравнивать только с другой сортировкой");
            }

            if ((fieldName === sorting.getFieldName()) && (direction === sorting.getDirection())) {
                return SortingCompare.THE_SAME;
            }

            return SortingCompare.OTHER;
        };
    }
});