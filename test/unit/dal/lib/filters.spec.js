'use strict';

describe('StringContainsFilterConstructor', function () {
    var StringContainsFilterConstructor;


    beforeEach(function () {
        module('max.dal.lib.filters');

        inject(function(_StringContainsFilterConstructor_) {
            StringContainsFilterConstructor = _StringContainsFilterConstructor_;

        });
    });

    describe('Экземпляр фильтра создается с помощью конструктора', function () {
        it('Конструктор должен получить валидные параметры', function () {
            expect(
                new StringContainsFilterConstructor('uniqueName', ['id']) instanceof StringContainsFilterConstructor
            ).toBeTruthy();
        });

        it('Уникальное имя фильтра обязательно должно быть передано', function () {
            expect(function () {
                new StringContainsFilterConstructor();
            }).toThrow("Имя фильтра должно быть задано строковым значением");
        });

        it('Уникальное имя фильтра должно быть строкой', function () {
            expect(function () {
                new StringContainsFilterConstructor(1);
            }).toThrow("Имя фильтра должно быть задано строковым значением");
        });

        it('Перечень полей должен быть передан', function () {
            expect(function () {
                new StringContainsFilterConstructor('uniqueName');
            }).toThrow("Названия полей, по которым выполняется фильтрация, должны быть переданы в виде массива со строками");
        });

        it('Перечень полей должен быть массивом', function () {
            expect(function () {
                new StringContainsFilterConstructor('uniqueName', '123');
            }).toThrow("Названия полей, по которым выполняется фильтрация, должны быть переданы в виде массива со строками");
        });

        it('Перечень полей должен быть не пустым массивом', function () {
            expect(function () {
                new StringContainsFilterConstructor('uniqueName', []);
            }).toThrow("Названия полей, по которым выполняется фильтрация, должны быть переданы в виде массива со строками");
        });
    });

    it('Экземпляр фильтра умеет возвращать свое уникальное название', function () {
        var filterName = 'uniqueName',
            filter = new StringContainsFilterConstructor(filterName, [ 'id' ]);
        expect(filter.getName()).toEqual(filterName);
    });

    it('Экземпляр фильтра фильтрует коллекцию объектов на условии ИЛИ по всем перечисленным в конструкторе полям', function () {
        var obj1 = { id: 1, company_name: 'Салон один', email: 'one@one.com' },
            obj2 = { id: 2, company_name: 'Салон 111', email: 'one@two.com' },
            obj3 = { id: 3, company_name: 'Салон три', email: 'one@three.com' },
            obj4 = { id: 4, company_name: 'Салон четыре', email: '1@four.com' },
            obj5 = { id: 21, company_name: 'Салон 21', email: 'one@twenty-one.com' },
            objects = [ obj1, obj2, obj3, obj4, obj5 ],
            filter = new StringContainsFilterConstructor('test', ['id', 'email', 'company_name']);

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
            filter = new StringContainsFilterConstructor(filterName, [ 'id' ]);
            anotherFilter = _.cloneDeep(filter);
        });

        it('Нельзя стравнивать фильтры с разными названиями', function () {
            anotherFilter = new StringContainsFilterConstructor('anotherFilter', [ 'id' ]);

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
    });

    it('Экземпляр фильтра умеет возвращать свое состояние в виде объекта', function () {
        var filter = new StringContainsFilterConstructor('uniqueName', [ 'id' ]);
        filter.value = 'pattern';

        expect(filter.getAsObject()).toEqual({ uniqueName: 'pattern' });
    });
});

describe('TheSameValueFilterConstructor', function () {
    var TheSameValueFilterConstructor;


    beforeEach(function () {
        module('max.dal.lib.filters');

        inject(function(_TheSameValueFilterConstructor_) {
            TheSameValueFilterConstructor = _TheSameValueFilterConstructor_;

        });
    });

    describe('Экземпляр фильтра создается с помощью конструктора', function () {
        it('Конструктор должен получить валидные параметры', function () {
            expect(
                new TheSameValueFilterConstructor('uniqueName', 'status') instanceof TheSameValueFilterConstructor
            ).toBeTruthy();
        });

        it('Уникальное имя фильтра обязательно должно быть передано', function () {
            expect(function () {
                new TheSameValueFilterConstructor();
            }).toThrow("Имя фильтра должно быть задано строковым значением");
        });

        it('Уникальное имя фильтра должно быть строкой', function () {
            expect(function () {
                new TheSameValueFilterConstructor(1);
            }).toThrow("Имя фильтра должно быть задано строковым значением");
        });

        it('Перечень полей должен быть передан', function () {
            expect(function () {
                new TheSameValueFilterConstructor('uniqueName');
            }).toThrow("Название поля по которому выполняется фильтрация должно быть передано в виде строки");
        });
    });

    it('Экземпляр фильтра умеет возвращать свое уникальное название', function () {
        var filterName = 'uniqueName',
            filter = new TheSameValueFilterConstructor('uniqueName', 'status');

        expect(filter.getName()).toEqual(filterName);
    });

    it('Экземпляр фильтра фильтрует коллекцию объектов по совпадению значения в указанном поле', function () {
        var obj1 = { id: 1, status: 'active'   },
            obj2 = { id: 2, status: 'blocked'  },
            obj3 = { id: 2, status: 'inactive' },
            obj4 = { id: 3, status: 'active'   },
            objects = [ obj1, obj2, obj3, obj4 ],
            filter = new TheSameValueFilterConstructor('test', 'status');

        filter.value = 'another value';
        expect(_.filter(objects, filter.filter)).toEqual([]);

        filter.value = 'active';
        expect(_.filter(objects, filter.filter)).toEqual([ obj1, obj4 ]);

        filter.value = 'blocked';
        expect(_.filter(objects, filter.filter)).toEqual([ obj2 ]);
    });

    describe('Экземпляр фильтра умеет себя сравнивать', function () {
        var FiltersCompare,
            filter,
            anotherFilter;

        beforeEach(function () {
            inject(function(_FiltersCompare_) {
                FiltersCompare = _FiltersCompare_;
            });

            filter = new TheSameValueFilterConstructor('uniqueName', 'status');
            anotherFilter = _.cloneDeep(filter);
        });

        it('Нельзя стравнивать фильтры с разными названиями', function () {
            anotherFilter = new TheSameValueFilterConstructor('anotherFilter', 'status' );

            expect(function () {
                filter.compare(anotherFilter);
            }).toThrow("Нельзя стравнивать разные фильтры");
        });

        it('Фильтры могут быть одинаковой точности', function () {
            filter.value = 'active';
            anotherFilter.value = 'active';

            expect(filter.compare(anotherFilter)).toBe(FiltersCompare.THE_SAME);
        });

        it('Фильтры могут быть разными', function () {
            filter.value = 'active';
            anotherFilter.value = 'blocked';

            expect(filter.compare(anotherFilter)).toBe(FiltersCompare.LESS_PRECISELY);
        });
    });

    it('Экземпляр фильтра умеет возвращать свое состояние в виде объекта', function () {
        var filter = new TheSameValueFilterConstructor('uniqueName', 'status' );
        filter.value = 'pattern';

        expect(filter.getAsObject()).toEqual({ uniqueName: 'pattern' });
    });
});