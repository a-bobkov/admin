'use strict';

angular.module('max.dal.lib.order', [])

.constant('OrderCompare', {
    OTHER:      -1,
    THE_SAME:    0
})

.factory('Order', function (OrderCompare) {
    var directions = ['asc', 'desc'];

    return function (orderParams) {

        if (!_.isObject(orderParams)) {
            throw new Error('В конструктор параметров сортировки  должен быть передан объект');
        }

        var field = orderParams.field;
        var direction = orderParams.direction;

        if (!_.isString(field)) {
            throw new Error("Название поля для сортировки обязательно должно быть задано");
        }

        if (_.isUndefined(direction)) {
            direction = directions[0];
        } else if (!_.contains(directions, direction)) {
            throw new Error("Направление сортировки может быть задано значениеям: " + directions.join(", "));
        }

        this.getField = function () {
            return field;
        };

        this.getDirection = function () {
            return direction;
        }

        this.getAsObject = function () {
            return {
                order_field:      field,
                order_direction:  direction
            }
        };

        this.compare = function (order) {
            if (!_.isObject(order) || !_.isFunction(order.getField) || !_.isFunction(order.getDirection)) {
                throw new Error("Сортировку можно сравнивать только с другой сортировкой");
            }

            if ((field === order.getField()) && (direction === order.getDirection())) {
                return OrderCompare.THE_SAME;
            }

            return OrderCompare.OTHER;
        };
    }
});