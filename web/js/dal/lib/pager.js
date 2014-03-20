'use strict';

angular.module('max.dal.lib.pager', [])

.constant('PagerCompare', {
    DOESNT_INCLUDE:   -1,
    THE_SAME:          0,
    INCLUDE:           1
})

.factory('PagerConstructor', function (PagerCompare) {
    var validate = function (value, min, name) {
        var errorMessage = "Парамер " + name + " должен быть целым числом больше или равным " + min;

        if (_.isUndefined(value)) {
            throw new Error(errorMessage);
        }

        value = _.parseInt(value);
        if (_.isNaN(value) || value < min) {
            throw new Error(errorMessage);
        }

        return value;
    };

    return function (page, per_page, total) {

        page = validate(page, 1, 'page');
        per_page = validate(per_page, 1, 'per_page');

        if (!_.isUndefined(total)) {
            total = validate(total, 0, 'total');
        }

        this.getPage = function () {
            return page;
        };

        this.getPerPage = function () {
            return per_page;
        };

        this.getTotal = function () {
            return total;
        };

        this.getAsObject = function () {
            return {
                page:       page,
                per_page:   per_page
            }
        };

        this.compare = function (pager) {
            var from, to, comparingFrom, comparingTo;

            if (!_.isObject(pager) || !_.isFunction(pager.getPage) || !_.isFunction(pager.getPerPage)) {
                throw new Error("Паджинатор можно сравнивать только с другим паджинатором");
            }

            from = ( page - 1 ) * per_page;
            to = page * per_page;

            comparingFrom = ( pager.getPage() - 1 ) * pager.getPerPage();
            comparingTo = pager.getPage() * pager.getPerPage();

            if ((from === comparingFrom) && (to === comparingTo)) {
                return PagerCompare.THE_SAME;
            } else if ((from <= comparingFrom) && (comparingTo <= to)) {
                return PagerCompare.INCLUDE;
            }

            return PagerCompare.DOESNT_INCLUDE;
        };

        this.areAllItemsLoaded = function () {
            return per_page >= total ? true : false;
        }
    }
});