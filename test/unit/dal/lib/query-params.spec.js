'use strict';

describe('QueryParams', function () {
    var QueryParams;

    beforeEach(function () {
        module('max.dal.lib.query-params');
        module('max.dal.lib.filter.equal');
        module('max.dal.lib.filter.string-contains');

        inject(function(_QueryParams_) {
            QueryParams = _QueryParams_;
        });
    });

    describe('Экземпляр параметров запроса создается с помощью конструктора', function () {
        it('Если в конструктор не передан объект выбрасывается эксепшин', function () {
            expect(function () {
                new QueryParams();
            }).toThrow('В конструктор параметров запроса должен быть передан объект');
        });

        it('Если переданы параметры фильтров, они сохраняются', function () {
            var queryParams = new QueryParams({ filters: [ { type: 'equal', fields: ['status'], value: 123 } ]});

            expect(queryParams.hasFilters()).toBeTruthy();
        });

        it('Если переданы параметры cортировки, они сохраняются', function () {
            var queryParams = new QueryParams({ order: { field: 'some field', direction: 'asc' } });

            expect(queryParams.hasOrder()).toBeTruthy();
        });

        it('Если переданы параметры постранички, они сохраняются', function () {
            var queryParams = new QueryParams({ pager: { page: 1, per_page: 10 } });

            expect(queryParams.hasPager()).toBeTruthy();
        });
    });

    describe('Экземпляр параметров запросов умеет возвращать параметры URL', function () {

        it('Сортировка и постраничка не заданы', function () {
            var queryParams = new QueryParams( {} );

            expect(queryParams.getUrlParams()).toEqual({});
        });

        it('Сортировка задана, постраничка не задана', function () {
            var queryParams = new QueryParams({
                order: { field: 'name', direction: 'asc' }
            });

            expect(queryParams.getUrlParams()).toEqual({
                order_field: 'name', order_direction: 'asc'
            });
        });

        it('Сортировка не задана, постраничка задана', function () {
            var queryParams = new QueryParams({
                pager: { page: 1, per_page: 10 }
            });

            expect(queryParams.getUrlParams()).toEqual({
                page: 1, per_page: 10
            });
        });

        it('Сортировка и постраничка заданы', function () {
            var queryParams = new QueryParams({
                pager: { page: 1, per_page: 10 },
                order: { field: 'name', direction: 'asc' }
            });

            expect(queryParams.getUrlParams()).toEqual({
                page: 1, per_page: 10,  order_field: 'name', order_direction: 'asc'
            });
        });
    });

    describe('Экземпляр параметров запросов умеет возвращать тело запроса', function () {

        it('Фильтры не заданы, тело запроса - пустой объект', function () {
            var queryParams = new QueryParams( { } );

            expect(queryParams.getPostParams()).toEqual({});
        });

        it('Фильтры заданы, тело запроса содержит фильтры', function () {
            var filters = [
                { type: 'equal', fields: ['id'], value: 100 },
                { type: 'contain', fields: ['name'], value: 'something' }
            ];

            var queryParams = new QueryParams({ filters: filters });

            expect(queryParams.getPostParams()).toEqual({ filters: filters });
        });
    });
});