'use strict';

angular.module('max.dal.lib.collection', [])

.factory('DalLibPagination', function () {
    return function DalLibPagination(_pagination) {
        var pagination = {
            from:   undefined,
            to:     undefined,
            total:  undefined
        };

        if (_.isUndefined(_pagination)) {
            throw new Error("Необходимо передать в конструктор объект со значениями: { from: int, to: int, total: int }");
        }

        _.forEach(pagination, function(value, key){
            if (_.isUndefined(_pagination[key])) {
                throw new Error("Объект с параметрами должен содержать параметр " + key);
            }
            pagination[key] = _.parseInt(_pagination[key]);
            if (_.isNaN(pagination[key])) {
                throw new Error("Параметр " + key + " вместо числа содержит значение '" + _pagination[key] + "'");
            }
        });

        this.get = function () {
            return _.clone(pagination);
        }
    };
})

.factory('DalLibFilters', function () {
    return function DalLibFilters (_filters) {
        var filters;

        if (!_.isFunction(_filters) && !(_.isArray(_filters) && !_.isEmpty(_filters))) {
            throw new Error("Необходимо передать в конструктор функцию-фильтр либо массив с таким функциями");
        }

        filters = _.isArray(_filters) ? _filters : [ _filters ];

        _.forEach(filters, function(filter, key) {
            if (!_.isFunction(filter)) {
                throw new Error("Фильтр должен быть реализован в виде функции");
            }

            if (!_.isFunction(filter.getAsObject)) {
                throw new Error("Фильтр должен иметь метод getAsObject");
            }
        });

        this.get = function () {
            return _.clone(filters);
        };

        this.getAsObject = function () {
            var obj;

            _.forEach(filters, function (filter) {
                _.assign(obj, filter.getAsObject());
            });

            return obj;
        };

        /**
         *
         * @param anotherFilters
         * @returns {number} -1: Фильтр, сравниваемый с текущим, либо менее точный (т.е. в нем меньше условий) либо другой
         *                    0: Фильтр, сравниваемый с текущим, точно такой же
         *                    1: Фильтр, сравниваемый с текущим, более детальный (т.е. в нем есть все условия текущего фильтра + еще какие-то)
         */
        this.compare = function (_anotherFilters) {
            var anotherFilters;

            if ( !(_anotherFilters instanceof  DalLibFilters) ) {
                throw new Error("Надобр фильтров может сравниваться только с другим набором фильтров");
            }

            anotherFilters = _anotherFilters.get();

            // Если текущий фильтр точнее (больше условий фильтрации)
            if (filters.length > anotherFilters.length) {
                return -1;
            }

        };
    };
})

.factory('DalLibParams', function (DalLibFilters, DalLibPagination) {
    return function DalLibParams(_params) {
        var params = {};

        if (!_.isUndefined(_params)) {
            if (!_.isUndefined(_params.filters)) {
                if (_params.filters instanceof DalLibFilters) {
                    params.filters = _params.filters;
                } else {
                    params.filters = new DalLibFilters(_params.filters)
                }
            }

            if (!_.isUndefined(_params.pagination)) {
                if (_params.pagination instanceof DalLibPagination) {
                    params.pagination = _params.pagination;
                } else {
                    params.pagination = new DalLibPagination(_params.pagination)
                }
            }
        }

        this.get = function () {
            return _.clone(params);
        };

    };
})

.factory('DalLibCollection', function (DalLibPagination) {
    return function DalLibCollection(_items, _params) {
        var items,
            params = {
                filers: undefined,
                sorting: undefined,
                pagination: undefined
            };

        if (!_.isArray(_items)) {
            throw Error("Список элементов коллекции (items) может быть передан только в виде массива");
        }
        items = _items;

        this.getItems = function () {
            return items;
        };

        this.isPaginated = function () {

        }
    };
});