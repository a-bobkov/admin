'use strict';

describe('SortingConstructor', function () {
    var SortingConstructor;


    beforeEach(function () {
        module('max.dal.lib.sorting');

        inject(function(_SortingConstructor_) {
            SortingConstructor = _SortingConstructor_;
        });
    });

    describe('Экземпляр сортировки создается с помощью конструктора', function () {
        it('Конструктор должен получить валидные параметры', function () {
            expect(
                new SortingConstructor('field_name') instanceof SortingConstructor
            ).toBeTruthy();
        });

        it('Название поля сортировки обязательно должен быть задано', function () {
            expect(function () {
                new SortingConstructor();
            }).toThrow("Название поля для сортировки обязательно должно быть задано");
        });

        it('Если задано направление сортировки, то его значение должно быть "asc" или "desc"', function () {
            expect(function () {
                new SortingConstructor('field_name', 123);
            }).toThrow("Направление сортировки может быть задано значениеям: asc, desc");
        });

        it('По умолчанию направление сортировки устанавливается в "asc"', function () {
            var sorting = new SortingConstructor('field_name');
            expect(sorting.getDirection()).toEqual('asc');
        });
    });

    it('Экземпляр сортировки умеет возвращать название поля сортировки', function () {
        expect((new SortingConstructor('field_name')).getFieldName()).toEqual('field_name');
    });

    it('Экземпляр сортировки умеет возвращать направление сортировки', function () {
        expect((new SortingConstructor('field_name', 'desc')).getDirection()).toEqual('desc');
    });

    it('Экземпляр сортировки умеет возвращать свое состояние в виде объекта', function () {
        expect(
            (new SortingConstructor('field_name', 'desc')).getAsObject()
        ).toEqual({ sorting_field: 'field_name', sorting_direction: 'desc' });
    });

    describe('Экземпляр сортировки умеет сравнивтаь себя с другим сортировками', function () {
        var sorting,
            comparingSorting,
            SortingCompare;

        beforeEach(function () {
            inject(function(_SortingCompare_) {
                SortingCompare = _SortingCompare_;
            });
        });

        it('Сравнение одинаковых сортировок', function () {
            sorting = new SortingConstructor('field_name');
            comparingSorting = new SortingConstructor('field_name');

            expect(sorting.compare(comparingSorting)).toBe(SortingCompare.THE_SAME);
            expect(comparingSorting.compare(sorting)).toBe(SortingCompare.THE_SAME);
        });

        it('Сравнение разных сортировок', function () {
            sorting = new SortingConstructor('field_name', 'asc');

            comparingSorting = new SortingConstructor('field_name', 'desc');
            expect(sorting.compare(comparingSorting)).toBe(SortingCompare.OTHER);
            expect(comparingSorting.compare(sorting)).toBe(SortingCompare.OTHER);

            comparingSorting = new SortingConstructor('other_field', 'asc');
            expect(sorting.compare(comparingSorting)).toBe(SortingCompare.OTHER);
            expect(comparingSorting.compare(sorting)).toBe(SortingCompare.OTHER);

            comparingSorting = new SortingConstructor('other_field', 'desc');
            expect(sorting.compare(comparingSorting)).toBe(SortingCompare.OTHER);
            expect(comparingSorting.compare(sorting)).toBe(SortingCompare.OTHER);
        });
    });

});