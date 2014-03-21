'use strict';

angular.module('max.dal.lib.query-params', ['max.dal.lib.filter', 'max.dal.lib.order', 'max.dal.lib.pager'])

.factory('QueryParams', function (FilterCollection, DalFilterFactory, Order, Pager) {
    return function (params) {
        var that = this;
        var queryParams = {
            filters: new FilterCollection,
            order: null,
            pager: null
        };

        if (!_.isObject(params)) {
            throw new Error('В конструктор параметров запроса должен быть передан объект');
        }

        _.forEach(params.filters, function (filterData) {
            queryParams.filters.add(DalFilterFactory.create(filterData));
        });

        if (params.order) {
            queryParams.order = new Order(params.order);
        }

        if (params.pager) {
            queryParams.pager = new Pager(params.pager);
        }

        this.hasFilters = function () {
            return queryParams.filters.length() > 0;
        };

        this.hasOrder = function () {
            return !!queryParams.order;
        };

        this.hasPager = function () {
            return !!queryParams.pager;
        };

        this.getUrlParams = function () {
            return angular.extend({},
                that.hasOrder() && queryParams.order.getAsObject(),
                that.hasPager() && queryParams.pager.getAsObject()
            );
        };

        this.getPostParams = function () {
            return angular.extend({},
                that.hasFilters() && { filters: queryParams.filters.getAsObject() }
            );
        };
    };
});