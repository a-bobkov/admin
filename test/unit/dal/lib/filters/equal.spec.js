'use strict';

describe('EqualFilter', function () {
    var EqualFilter;


    beforeEach(function () {
        module('max.dal.lib.filter.equal');

        inject(function(_EqualFilter_) {
            EqualFilter = _EqualFilter_;
        });
    });

    describe('Экземпляр фильтра создается с помощью конструктора', function () {
        it('Конструктор должен получить валидные параметры', function () {
            expect(
                new EqualFilter('status') instanceof EqualFilter
            ).toBeTruthy();
        });

        it('Название фильтруемого поля должно быть передано', function () {
            expect(function () {
                new EqualFilter();
            }).toThrow("Название поля по которому выполняется фильтрация должно быть передано в виде строки");
        });
    });

    it('Экземпляр фильтра умеет возвращать свой уникальный идентификатор', function () {
        var filter = new EqualFilter('status');

        expect(filter.getId()).toEqual('equal_status');
    });

    describe('Экземпляр фильтра фильтрует коллекцию объектов', function () {
        it('При фильтрации проверяется совпадений значения в указанном поле', function () {
            var obj1 = { id: 1, status: 'active'   },
                obj2 = { id: 2, status: 'blocked'  },
                obj3 = { id: 2, status: 'inactive' },
                obj4 = { id: 3, status: 'active'   },
                objects = [ obj1, obj2, obj3, obj4 ],
                filter = new EqualFilter('status');

            filter.value = 'another value';
            expect(_.filter(objects, filter.apply)).toEqual([]);

            filter.value = 'active';
            expect(_.filter(objects, filter.apply)).toEqual([ obj1, obj4 ]);

            filter.value = 'blocked';
            expect(_.filter(objects, filter.apply)).toEqual([ obj2 ]);
        });

        it('Объекты не имеющие поля, по которому выполняется фильтрация, отбрасываются', function () {
            var obj1 = { id: 1, status: 'active'   },
                obj2 = { id: 2 },
                objects = [ obj1, obj2 ],
                filter = new EqualFilter('status');

            filter.value = 'active';
            expect(_.filter(objects, filter.apply)).toEqual([ obj1 ]);

        });
    });

    describe('Экземпляр фильтра умеет себя сравнивать', function () {
        var FilterCompare,
            filter,
            comparingFilter;

        beforeEach(function () {
            inject(function(_FilterCompare_) {
                FilterCompare = _FilterCompare_;
            });

            filter = new EqualFilter('status');
            comparingFilter = new EqualFilter('status');
        });

        it('Нельзя стравнивать фильтры с разными идентификаторами', function () {
            comparingFilter = new EqualFilter('name' );

            expect(function () {
                filter.compare(comparingFilter);
            }).toThrow("Нельзя стравнивать разные фильтры");
        });

        it('Фильтры могут быть одинаковой точности', function () {
            filter.value = 'active';
            comparingFilter.value = 'active';

            expect(filter.compare(comparingFilter)).toBe(FilterCompare.THE_SAME);
            expect(comparingFilter.compare(filter)).toBe(FilterCompare.THE_SAME);
        });

        it('Фильтры могут быть разными', function () {
            filter.value = 'active';
            comparingFilter.value = 'blocked';

            expect(filter.compare(comparingFilter)).toBe(FilterCompare.LESS_PRECISELY);
        });
    });

    it('Экземпляр фильтра умеет возвращать свое состояние в виде объекта', function () {
        var filter = new EqualFilter('status' );
        filter.value = 'pattern';

        expect(filter.getAsObject()).toEqual({ type: 'equal', field: 'status', value: 'pattern' });
    });
});