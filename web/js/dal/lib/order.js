'use strict';

angular.module('max.dal.lib.order', [])

.constant('OrderCompare', {
    OTHER:      -1,
    THE_SAME:    0
})

.factory('OrderConstructor', function (OrderCompare) {
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
                order_field:      fieldName,
                order_direction:  direction
            }
        };

        this.compare = function (order) {
            if (!_.isObject(order) || !_.isFunction(order.getFieldName) || !_.isFunction(order.getDirection)) {
                throw new Error("Сортировку можно сравнивать только с другой сортировкой");
            }

            if ((fieldName === order.getFieldName()) && (direction === order.getDirection())) {
                return OrderCompare.THE_SAME;
            }

            return OrderCompare.OTHER;
        };
    }
});