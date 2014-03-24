'use strict';

describe('StringContainsFilter', function () {
    var StringContainsFilter;


    beforeEach(function () {
        module('max.dal.lib.filter.string-contains');

        inject(function(_StringContainsFilter_) {
            StringContainsFilter = _StringContainsFilter_;

        });
    });

    describe('Экземпляр фильтра создается с помощью конструктора', function () {
        it('Конструктор должен получить валидные параметры', function () {
            expect(
                new StringContainsFilter(['id']) instanceof StringContainsFilter
            ).toBeTruthy();
        });

        it('Перечень полей должен быть передан', function () {
            expect(function () {
                new StringContainsFilter();
            }).toThrow("Названия полей, по которым выполняется фильтрация, должны быть переданы в виде массива со строками");
        });

        it('Перечень полей должен быть массивом', function () {
            expect(function () {
                new StringContainsFilter('123');
            }).toThrow("Названия полей, по которым выполняется фильтрация, должны быть переданы в виде массива со строками");
        });

        it('Перечень полей должен быть не пустым массивом', function () {
            expect(function () {
                new StringContainsFilter([]);
            }).toThrow("Названия полей, по которым выполняется фильтрация, должны быть переданы в виде массива со строками");
        });
    });

    it('Экземпляр фильтра умеет возвращать свой уникальный идентификатор', function () {
        var filter = new StringContainsFilter([ 'id' ]);
        expect(filter.getId()).toEqual('contain_id');
    });

    it('Экземпляр фильтра фильтрует коллекцию объектов на условии ИЛИ по всем перечисленным в конструкторе полям', function () {
        var obj1 = { id: 1, company_name: 'Салон один', email: 'one@one.com' },
            obj2 = { id: 2, company_name: 'Салон 111', email: 'one@two.com' },
            obj3 = { id: 3, company_name: 'Салон три', email: 'one@three.com' },
            obj4 = { id: 4, company_name: 'Салон четыре', email: '1@four.com' },
            obj5 = { id: 21, company_name: 'Салон 21', email: 'one@twenty-one.com' },
            objects = [ obj1, obj2, obj3, obj4, obj5 ],
            filter = new StringContainsFilter(['id', 'email', 'company_name']);

        filter.value = 1;
        expect(_.filter(objects, filter.apply)).toEqual([ obj1, obj2, obj4, obj5 ]);

        filter.value = 2;
        expect(_.filter(objects, filter.apply)).toEqual([ obj2, obj5 ]);

        filter.value = 4;
        expect(_.filter(objects, filter.apply)).toEqual([ obj4 ]);

        filter.value = 'twenty';
        expect(_.filter(objects, filter.apply)).toEqual([ obj5 ]);
    });

    describe('Экземпляр фильтра умеет себя сравнивать', function () {
        var FilterCompare,
            filterName,
            filter,
            comparingFilter;

        beforeEach(function () {
            inject(function(_FilterCompare_) {
                FilterCompare = _FilterCompare_;

            });

            filter = new StringContainsFilter([ 'id' ]);
            comparingFilter = new StringContainsFilter([ 'id' ]);
        });

        it('Нельзя стравнивать фильтры разного типа применяемые к разным полям', function () {
            comparingFilter = new StringContainsFilter([ 'name' ]);

            expect(function () {
                filter.compare(comparingFilter);
            }).toThrow("Нельзя стравнивать разные фильтры");
        });

        it('Фильтры могут быть одинаковой точности', function () {
            filter.value = 'Букв одинаково';
            comparingFilter.value = 'Букв одинаково';

            expect(filter.compare(comparingFilter)).toBe(FilterCompare.THE_SAME);
            expect(comparingFilter.compare(filter)).toBe(FilterCompare.THE_SAME);
        });

        it('Фильтры могут быть разной точности', function () {
            filter.value = 'Букв';
            comparingFilter.value = 'Букв больше';

            expect(filter.compare(comparingFilter)).toBe(FilterCompare.MORE_PRECISELY);
            expect(comparingFilter.compare(filter)).toBe(FilterCompare.LESS_PRECISELY);
        });
    });

    it('Экземпляр фильтра умеет возвращать свое состояние в виде объекта', function () {
        var filter = new StringContainsFilter([ 'id' ]);
        filter.value = 'pattern';

        expect(filter.getAsObject()).toEqual({ type: 'contain', field: ['id'], value: 'pattern'});
    });
});