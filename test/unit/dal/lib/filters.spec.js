'use strict';

describe('StringContainsFilter', function () {
    var StringContainsFilter;


    beforeEach(function () {
        module('max.dal.lib.filters');

        inject(function(_StringContainsFilter_) {
            StringContainsFilter = _StringContainsFilter_;

        });
    });

    describe('Экземпляр фильтра создается с помощью конструктора', function () {
        it('Конструктор должен получить валидные параметры', function () {
            expect(new StringContainsFilter('uniqueName', ['id']) instanceof StringContainsFilter).toBeTruthy();
        });

        it('Уникальное имя фильтра обязательно должно быть передано', function () {
            expect(function () {
                new StringContainsFilter();
            }).toThrow("Имя фильтра должно быть задано строковым значением");
        });

        it('Уникальное имя фильтра должно быть строкой', function () {
            expect(function () {
                new StringContainsFilter(1);
            }).toThrow("Имя фильтра должно быть задано строковым значением");
        });

        it('Перечень полей должен быть передан', function () {
            expect(function () {
                new StringContainsFilter('uniqueName');
            }).toThrow("Названия полей, по которым выполняется фильтрация, должны быть переданы в виде массива со строками");
        });

        it('Перечень полей должен быть массивом', function () {
            expect(function () {
                new StringContainsFilter('uniqueName', '123');
            }).toThrow("Названия полей, по которым выполняется фильтрация, должны быть переданы в виде массива со строками");
        });

        it('Перечень полей должен быть не пустым массивом', function () {
            expect(function () {
                new StringContainsFilter('uniqueName', []);
            }).toThrow("Названия полей, по которым выполняется фильтрация, должны быть переданы в виде массива со строками");
        });
    });

    it('Экземпляр фильтра умеет возвращать свое уникальное название', function () {
        var filterName = 'uniqueName',
            filter = new StringContainsFilter(filterName, [ 'id' ]);
        expect(filter.getName()).toEqual(filterName);
    });

    it('Экземпляр фильтра фильтрует коллекцию объектов на условии ИЛИ по всем перечисленным в конструкторе полям', function () {
        var filter,
            obj1 = { id: 1, company_name: 'Салон один', email: 'one@one.com' },
            obj2 = { id: 2, company_name: 'Салон 111', email: 'one@two.com' },
            obj3 = { id: 3, company_name: 'Салон три', email: 'one@three.com' },
            obj4 = { id: 4, company_name: 'Салон четыре', email: '1@four.com' },
            obj5 = { id: 21, company_name: 'Салон 21', email: 'one@twenty-one.com' },
            objects = [ obj1, obj2, obj3, obj4, obj5 ],
            filter = new StringContainsFilter('test', ['id', 'email', 'company_name']);

        filter.value = 1;
        expect(_.filter(objects, filter.filter)).toEqual([ obj1, obj2, obj4, obj5 ]);

        filter.value = 2;
        expect(_.filter(objects, filter.filter)).toEqual([ obj2, obj5 ]);

        filter.value = 4;
        expect(_.filter(objects, filter.filter)).toEqual([ obj4 ]);

        filter.value = 'twenty';
        expect(_.filter(objects, filter.filter)).toEqual([ obj5 ]);
    });

    describe('Экземпляр фильтра умеет себя сравнивать', function () {
        var FiltersCompare,
            filterName,
            filter,
            anotherFilter;

        beforeEach(function () {
            inject(function(_FiltersCompare_) {
                FiltersCompare = _FiltersCompare_;

            });

            filterName = 'uniqueName';
            filter = new StringContainsFilter(filterName, [ 'id' ]);
            anotherFilter = _.cloneDeep(filter);
        });

        it('Нельзя стравнивать фильтры с разными названиями', function () {
            anotherFilter = new StringContainsFilter('anotherFilter', [ 'id' ]);

            expect(function () {
                filter.compare(anotherFilter);
            }).toThrow("Нельзя стравнивать разные фильтры");
        });

        it('Фильтры могут быть одинаковой точности', function () {
            filter.value = 'Букв одинаково';
            anotherFilter.value = 'Букв одинаково';

            expect(filter.compare(anotherFilter)).toBe(FiltersCompare.THE_SAME);
        });

        it('Фильтры могут быть более точными', function () {
            filter.value = 'Букв';
            anotherFilter.value = 'Букв больше';

            expect(filter.compare(anotherFilter)).toBe(FiltersCompare.MORE_PRECISELY);
        });

        it('Фильтры могут быть менее точными', function () {
            filter.value = 'Букв больше';
            anotherFilter.value = 'Букв';

            expect(filter.compare(anotherFilter)).toBe(FiltersCompare.LESS_PRECISELY);
        });
    })
});