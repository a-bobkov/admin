'use strict';

describe('PagerConstructor', function () {
    var PagerConstructor;


    beforeEach(function () {
        module('max.dal.lib.pager');

        inject(function(_PagerConstructor_) {
            PagerConstructor = _PagerConstructor_;
        });
    });

    describe('Экземпляр паджинатора создается с помощью конструктора', function () {
        it('Конструктор должен получить валидные параметры', function () {
            expect(
                new PagerConstructor(1, 10) instanceof PagerConstructor
            ).toBeTruthy();
        });

        it('Номер страницы обязательно должен быть передан и должен быть числом больше или равным 1', function () {
            expect(function () {
                new PagerConstructor();
            }).toThrow("Парамер page должен быть целым числом больше или равным 1");

            expect(function () {
                new PagerConstructor(0.99);
            }).toThrow("Парамер page должен быть целым числом больше или равным 1");
        });

        it('Количество элементов на странице обязательно должно быть передано и должно быть числом больше или равным 1', function () {
            expect(function () {
                new PagerConstructor(1);
            }).toThrow("Парамер per_page должен быть целым числом больше или равным 1");

            expect(function () {
                new PagerConstructor(1, 0.99);
            }).toThrow("Парамер per_page должен быть целым числом больше или равным 1");
        });

        it('Если задано общее количество элементов в выборке то оно должно быть целым числом больше или равным 1', function () {
            expect(function () {
                new PagerConstructor(1, 10, 'abc');
            }).toThrow("Парамер total должен быть целым числом больше или равным 0");

            expect(function () {
                new PagerConstructor(1, 10, -1);
            }).toThrow("Парамер total должен быть целым числом больше или равным 0");
        });
    });

    it('Экземпляр паджинатора умеет возвращать свое состояние в виде объекта', function () {
        expect((new PagerConstructor(1, 10)).getAsObject()).toEqual({ page: 1, per_page: 10 });
    });

    it('Экземпляр паджинатора умеет возвращать номер страницы', function () {
        expect((new PagerConstructor(1, 10)).getPage()).toEqual(1);
    });

    it('Экземпляр паджинатора умеет возвращать количество элементов на странице', function () {
        expect((new PagerConstructor(1, 10)).getPerPage()).toEqual(10);
    });

    it('Экземпляр паджинатора умеет возвращать общее количество элементов в выборке', function () {
        expect((new PagerConstructor(1, 10)).getTotal()).toBeUndefined();
        expect((new PagerConstructor(1, 10, 777)).getTotal()).toEqual(777);
    });

    describe('Экземпляр паджинатора умеет сравнивтаь себя с другим паджинатором', function () {
        var pager,
            comparingPager,
            PagerCompare;

        beforeEach(function () {
            inject(function(_PagerCompare_) {
                PagerCompare = _PagerCompare_;
            });
        });

        it('Сравнение равных пейджеров', function () {
            pager = new PagerConstructor(1, 10);
            comparingPager = new PagerConstructor(1, 10);

            expect(pager.compare(comparingPager)).toBe(PagerCompare.THE_SAME);
            expect(comparingPager.compare(pager)).toBe(PagerCompare.THE_SAME);
        });

        it('Один пейджер включает диапазон второго пейджера', function () {
            pager = new PagerConstructor(1, 100);

            comparingPager = new PagerConstructor(1, 10);
            expect(pager.compare(comparingPager)).toBe(PagerCompare.INCLUDE);

            comparingPager = new PagerConstructor(5, 10);
            expect(pager.compare(comparingPager)).toBe(PagerCompare.INCLUDE);

            comparingPager = new PagerConstructor(10, 10);
            expect(pager.compare(comparingPager)).toBe(PagerCompare.INCLUDE);
        });

        it('У пейджеров пересекающиеся диапазоны', function () {
            pager = new PagerConstructor(2, 100);

            comparingPager = new PagerConstructor(4, 30);
            expect(pager.compare(comparingPager)).toBe(PagerCompare.DOESNT_INCLUDE);

            comparingPager = new PagerConstructor(4, 60);
            expect(pager.compare(comparingPager)).toBe(PagerCompare.DOESNT_INCLUDE);
        });

        it('У пейджеров непересекающиеся диапазоны', function () {
            pager = new PagerConstructor(2, 100);

            comparingPager = new PagerConstructor(1, 100);
            expect(pager.compare(comparingPager)).toBe(PagerCompare.DOESNT_INCLUDE);

            comparingPager = new PagerConstructor(3, 100);
            expect(pager.compare(comparingPager)).toBe(PagerCompare.DOESNT_INCLUDE);
        });
    });
});