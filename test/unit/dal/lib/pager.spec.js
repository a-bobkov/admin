'use strict';

describe('Pager', function () {
    var Pager;


    beforeEach(function () {
        module('max.dal.lib.pager');

        inject(function(_Pager_) {
            Pager = _Pager_;
        });
    });

    describe('Экземпляр паджинатора создается с помощью конструктора', function () {
        it('Конструктор должен получить валидные параметры', function () {
            expect(
                new Pager(1, 10) instanceof Pager
            ).toBeTruthy();
        });

        it('Номер страницы обязательно должен быть передан и должен быть числом больше или равным 1', function () {
            expect(function () {
                new Pager();
            }).toThrow("Парамер page должен быть целым числом больше или равным 1");

            expect(function () {
                new Pager(0.99);
            }).toThrow("Парамер page должен быть целым числом больше или равным 1");
        });

        it('Количество элементов на странице обязательно должно быть передано и должно быть числом больше или равным 1', function () {
            expect(function () {
                new Pager(1);
            }).toThrow("Парамер per_page должен быть целым числом больше или равным 1");

            expect(function () {
                new Pager(1, 0.99);
            }).toThrow("Парамер per_page должен быть целым числом больше или равным 1");
        });

        it('Если задано общее количество элементов в выборке то оно должно быть целым числом больше или равным 1', function () {
            expect(function () {
                new Pager(1, 10, 'abc');
            }).toThrow("Парамер total должен быть целым числом больше или равным 0");

            expect(function () {
                new Pager(1, 10, -1);
            }).toThrow("Парамер total должен быть целым числом больше или равным 0");
        });
    });

    it('Экземпляр паджинатора умеет возвращать свое состояние в виде объекта', function () {
        expect((new Pager(1, 10)).getAsObject()).toEqual({ page: 1, per_page: 10 });
    });

    it('Экземпляр паджинатора умеет возвращать номер страницы', function () {
        expect((new Pager(1, 10)).getPage()).toEqual(1);
    });

    it('Экземпляр паджинатора умеет возвращать количество элементов на странице', function () {
        expect((new Pager(1, 10)).getPerPage()).toEqual(10);
    });

    it('Экземпляр паджинатора умеет возвращать общее количество элементов в выборке', function () {
        expect((new Pager(1, 10)).getTotal()).toBeUndefined();
        expect((new Pager(1, 10, 777)).getTotal()).toEqual(777);
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
            pager = new Pager(1, 10);
            comparingPager = new Pager(1, 10);

            expect(pager.compare(comparingPager)).toBe(PagerCompare.THE_SAME);
            expect(comparingPager.compare(pager)).toBe(PagerCompare.THE_SAME);
        });

        it('Один пейджер включает диапазон второго пейджера', function () {
            pager = new Pager(1, 100);

            comparingPager = new Pager(1, 10);
            expect(pager.compare(comparingPager)).toBe(PagerCompare.INCLUDE);

            comparingPager = new Pager(5, 10);
            expect(pager.compare(comparingPager)).toBe(PagerCompare.INCLUDE);

            comparingPager = new Pager(10, 10);
            expect(pager.compare(comparingPager)).toBe(PagerCompare.INCLUDE);
        });

        it('У пейджеров пересекающиеся диапазоны', function () {
            pager = new Pager(2, 100);

            comparingPager = new Pager(4, 30);
            expect(pager.compare(comparingPager)).toBe(PagerCompare.DOESNT_INCLUDE);

            comparingPager = new Pager(4, 60);
            expect(pager.compare(comparingPager)).toBe(PagerCompare.DOESNT_INCLUDE);
        });

        it('У пейджеров непересекающиеся диапазоны', function () {
            pager = new Pager(2, 100);

            comparingPager = new Pager(1, 100);
            expect(pager.compare(comparingPager)).toBe(PagerCompare.DOESNT_INCLUDE);

            comparingPager = new Pager(3, 100);
            expect(pager.compare(comparingPager)).toBe(PagerCompare.DOESNT_INCLUDE);
        });
    });

    describe('Экземпляр паджинатора знает все ли данные загружены или только часть', function () {
        var pager;

        it('Загружены все данные если per_page >= total', function () {
            pager = new Pager(2, 100, 0);
            expect(pager.areAllItemsLoaded()).toBe(true);

            pager = new Pager(2, 100, 50);
            expect(pager.areAllItemsLoaded()).toBe(true);

            pager = new Pager(2, 100, 100);
            expect(pager.areAllItemsLoaded()).toBe(true);
        });

        it('Загружены НЕ все данные если per_page < total', function () {
            pager = new Pager(2, 100, 101);
            expect(pager.areAllItemsLoaded()).toBe(false);
        });
    });
});