'use strict';

describe('FilterCollection', function () {
    var FilterCollection,
        TheSameValueFilter;


    beforeEach(function () {
        module('max.dal.lib.filter');

        inject(function(_FilterCollection_, _TheSameValueFilter_) {
            FilterCollection = _FilterCollection_;
            TheSameValueFilter = _TheSameValueFilter_;
        });
    });

    it('Экземпляр коллекции фильтров создается с помощью конструктора', function () {
        expect(
            new FilterCollection instanceof FilterCollection
        ).toBeTruthy();
    });

    describe('В экземпляр коллекции можно добавлять фильтры', function () {
        var collection;

        beforeEach(function () {
            collection = new FilterCollection;
        });

        it('Добавлять можно только объекты с реализованными обязательными методами', function () {
            expect(function () {
                collection.add(new TheSameValueFilter('fieldName'));
            }).not.toThrow();

            var errorMessage,
                filter = {};

            _.forEach(['getId', 'filter', 'compare', 'getAsObject'], function (method) {

                errorMessage = "У объекта типа фильтр должен быть реализован метод " + method + "()";

                expect(function () {
                    collection.add(filter);
                }).toThrow(errorMessage);

                filter[method] = {};
                expect(function () {
                    collection.add(filter);
                }).toThrow(errorMessage);

                filter[method] = function () {};
                expect(function () {
                    collection.add(filter);
                }).not.toThrow(errorMessage);
            });
        });

        it('Фильтры в коллекции упорядочены по уникальному id и при совпадении id новый фильтр заменяет старый', function () {
            var fileldName = 'someFieldName';

            expect(function () {
                collection.add(new TheSameValueFilter(fileldName));
            }).not.toThrow();
            expect(collection.length()).toEqual(1);

            expect(function () {
                collection.add(new TheSameValueFilter(fileldName));
            }).not.toThrow();
            expect(collection.length()).toEqual(1);
        });

        it('При добавлении фильтра коллекции возвращается сама коллекция', function () {
            expect(
                collection.add(new TheSameValueFilter('someField'))
            ).toBe(collection);
        });
    });

    describe('Из экземпляра коллекции можно получать ранее добавленные фильтры', function () {
        var collection;

        beforeEach(function () {
            collection = new FilterCollection;
        });

        it('Если фильтр в коллекции есть, возвращается фильр', function () {
            var filter = new TheSameValueFilter('fieldName');
            collection.add(filter);

            expect(collection.get(filter.getId())).toBe(filter);
        });

        it('Если фильтра в коллекции нет, возвращается undefined', function () {
            expect(collection.get('some name')).toBeUndefined();
        });
    });

    describe('Из экземпляра коллекции можно удалять фильтры', function () {
        var collection;

        beforeEach(function () {
            collection = new FilterCollection;
        });

        it('Удаляемый фильтр должен быть объектом с реализованными методом getId', function () {
            expect(function () {
                collection.remove("ssss");
            }).toThrow("Для удаления из коллекциии необходимо передать объект с методом getId");
        });

        it('При удалении фильтра отсутствующего в коллекции не генерируется ошибка', function () {
            expect(function () {
                collection.remove({ getId: function () { return 'uniqueName' }});
            }).not.toThrow();
            expect(collection.length()).toEqual(0);
        });

        it('При удалении фильтра возвращается сама коллекция', function () {
            expect(
                collection.remove({ getId: function () { return 'uniqueName' }})
            ).toBe(collection);
        });

        it('Фильтры, присутствующие в коллекции, удаляются', function () {
            var filter1 = new TheSameValueFilter('field1'),
                filter2 = new TheSameValueFilter('field2');

            collection.add(filter1);
            collection.add(filter2);
            expect(collection.length()).toEqual(2);

            collection.remove(filter1);
            expect(collection.length()).toEqual(1);

            // Поскольку в коллекции filter2 уже есть, повторное добавление не увеличивает коллекцию
            collection.add(filter2);
            expect(collection.length()).toEqual(1);
        });
    });

    describe('Экземпляр коллекции применяет все зарегистрированные фильтры к объекту', function () {
        var collection;

        beforeEach(function () {
            collection = new FilterCollection;
        });

        it('Если в коллекции один фильтр - проверяет только он', function () {
            var filter1 = new TheSameValueFilter('status'),
                object1 = { id: 1, status: 'active' },
                object2 = { id: 2, status: 'blocked' },
                object3 = { id: 3, status: 'active' },
                objects = [ object1, object2, object3 ];

            filter1.value = 'active';
            collection.add(filter1);

            expect(_.filter(objects, collection.filter)).toEqual([ object1, object3 ])
        });

        it('Если в коллекции несколько фильтров - проверяются все', function () {
            var filter1 = new TheSameValueFilter('status'),
                filter2 = new TheSameValueFilter('role'),
                object1 = { id: 1, status: 'active', role: 'admin' },
                object2 = { id: 2, status: 'blocked', role: 'user' },
                object3 = { id: 3, status: 'active', role: 'user' },
                object4 = { id: 4, status: 'active' },
                objects = [ object1, object2, object3, object4 ];

            filter1.value = 'active';
            collection.add(filter1);

            filter2.value = 'user';
            collection.add(filter2);

            expect(_.filter(objects, collection.filter)).toEqual([ object3 ])
        });
    });

    describe('Экземпляр коллекции умеет сравнивтаь свои фильтры с фильтрами другой коллекции', function () {
        var collection,
            comparingCollection,
            StringContainsFilter,
            FilterCompare;

        beforeEach(function () {
            inject(function(_StringContainsFilter_, _FilterCompare_) {
                StringContainsFilter = _StringContainsFilter_;
                FilterCompare = _FilterCompare_;
            });

            collection = new FilterCollection;
            comparingCollection = new FilterCollection;
        });

        it('Сравнение равных коллекции с одним фильтром', function () {
            var filter = new StringContainsFilter(['field1']),
                comparingFilter = new StringContainsFilter(['field1']);

            filter.value = 'abc';
            comparingFilter.value = 'abc';

            collection.add(filter);
            comparingCollection.add(comparingFilter);

            expect(collection.compare(comparingCollection)).toEqual(FilterCompare.THE_SAME);
        });

        it('Сравнение коллекций с одинаковыми фильтрами имеющими разные value', function () {
            var filter = new StringContainsFilter(['field1']),
                comparingFilter = new StringContainsFilter(['field1']);

            filter.value = 'abc';
            collection.add(filter);

            comparingFilter.value = 'abcd';
            comparingCollection.add(comparingFilter);

            expect(collection.compare(comparingCollection)).toEqual(FilterCompare.MORE_PRECISELY);
            expect(comparingCollection.compare(collection)).toEqual(FilterCompare.LESS_PRECISELY);
        });

        it('Сравнение равных коллекции с несколькими фильтрами', function () {
            var filter1 = new StringContainsFilter(['field1']),
                filter2 = new TheSameValueFilter('field2'),
                comparingFilter1 = new StringContainsFilter(['field1']),
                comparingFilter2 = new TheSameValueFilter('field2');

            filter1.value = 'abc';
            comparingFilter1.value = 'abc';
            filter2.value = 'some value';
            comparingFilter2.value = 'some value';

            // последовательность добавления фильтров не важна
            collection.add(filter1);
            collection.add(filter2);
            comparingCollection.add(comparingFilter1);
            comparingCollection.add(comparingFilter2);

            expect(collection.compare(comparingCollection)).toEqual(FilterCompare.THE_SAME);
            expect(comparingCollection.compare(collection)).toEqual(FilterCompare.THE_SAME);
        });

        it('Сравнение неравных коллекции с несколькими фильтрами', function () {
            var filter1, filter2, comparingFilter1, comparingFilter2;

            filter1 = new StringContainsFilter(['field1']);
            filter2 = new TheSameValueFilter('field2');
            comparingFilter1 = new StringContainsFilter(['field1']);
            comparingFilter2 = new TheSameValueFilter('field2');

            filter1.value = 'abc';
            filter2.value = 'some value';

            comparingFilter1.value = 'abcd';
            comparingFilter2.value = 'some value';

            collection.add(filter1);
            collection.add(filter2);
            comparingCollection.add(comparingFilter2);
            comparingCollection.add(comparingFilter1);

            expect(collection.compare(comparingCollection)).toEqual(FilterCompare.MORE_PRECISELY);
            expect(comparingCollection.compare(collection)).toEqual(FilterCompare.LESS_PRECISELY);
        });

        it('Сравнение коллекции с разным количеством фильтров', function () {
            var filter1, filter2, comparingFilter1, comparingFilter2, comparingFilter3;

            filter1 = new StringContainsFilter(['field1']);
            filter2 = new TheSameValueFilter('field2');
            comparingFilter1 = new StringContainsFilter(['field1']);
            comparingFilter2 = new TheSameValueFilter('field2');
            comparingFilter3 = new TheSameValueFilter('field3');

            collection.add(filter1);
            collection.add(filter2);
            comparingCollection.add(comparingFilter2);
            comparingCollection.add(comparingFilter1);
            comparingCollection.add(comparingFilter3);

            expect(collection.compare(comparingCollection)).toEqual(FilterCompare.MORE_PRECISELY);
            expect(comparingCollection.compare(collection)).toEqual(FilterCompare.LESS_PRECISELY);
        });
    });

    describe('Экземпляр коллекции умеет себя сеарилизовать в объект ключ-значение', function () {
        var collection,
            filter;

        beforeEach(function () {
            collection = new FilterCollection;
        });

        it('Сериализация с одним фильтром', function () {

            filter = new TheSameValueFilter('some field');
            filter.value = 'some value';
            collection.add(filter);

            expect(collection.getAsObject()).toEqual([{ type: 'equal', field: 'some field', value: 'some value' }])
        });

        it('Сериализация нескольких фильтров', function () {

            filter = new TheSameValueFilter('some field');
            filter.value = 'some value';
            collection.add(filter);

            filter = new TheSameValueFilter('another field');
            filter.value = 'another value';
            collection.add(filter);

            expect(collection.getAsObject()).toEqual([
                { type: 'equal', field: 'some field', value: 'some value' },
                { type: 'equal', field: 'another field', value: 'another value' }
            ]);
        });
    });
});

describe('StringContainsFilter', function () {
    var StringContainsFilter;


    beforeEach(function () {
        module('max.dal.lib.filter');

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
        expect(_.filter(objects, filter.filter)).toEqual([ obj1, obj2, obj4, obj5 ]);

        filter.value = 2;
        expect(_.filter(objects, filter.filter)).toEqual([ obj2, obj5 ]);

        filter.value = 4;
        expect(_.filter(objects, filter.filter)).toEqual([ obj4 ]);

        filter.value = 'twenty';
        expect(_.filter(objects, filter.filter)).toEqual([ obj5 ]);
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

describe('TheSameValueFilter', function () {
    var TheSameValueFilter;


    beforeEach(function () {
        module('max.dal.lib.filter');

        inject(function(_TheSameValueFilter_) {
            TheSameValueFilter = _TheSameValueFilter_;
        });
    });

    describe('Экземпляр фильтра создается с помощью конструктора', function () {
        it('Конструктор должен получить валидные параметры', function () {
            expect(
                new TheSameValueFilter('status') instanceof TheSameValueFilter
            ).toBeTruthy();
        });

        it('Название фильтруемого поля должно быть передано', function () {
            expect(function () {
                new TheSameValueFilter();
            }).toThrow("Название поля по которому выполняется фильтрация должно быть передано в виде строки");
        });
    });

    it('Экземпляр фильтра умеет возвращать свой уникальный идентификатор', function () {
        var filter = new TheSameValueFilter('status');

        expect(filter.getId()).toEqual('equal_status');
    });

    describe('Экземпляр фильтра фильтрует коллекцию объектов', function () {
        it('При фильтрации проверяется совпадений значения в указанном поле', function () {
            var obj1 = { id: 1, status: 'active'   },
                obj2 = { id: 2, status: 'blocked'  },
                obj3 = { id: 2, status: 'inactive' },
                obj4 = { id: 3, status: 'active'   },
                objects = [ obj1, obj2, obj3, obj4 ],
                filter = new TheSameValueFilter('status');

            filter.value = 'another value';
            expect(_.filter(objects, filter.filter)).toEqual([]);

            filter.value = 'active';
            expect(_.filter(objects, filter.filter)).toEqual([ obj1, obj4 ]);

            filter.value = 'blocked';
            expect(_.filter(objects, filter.filter)).toEqual([ obj2 ]);
        });

        it('Объекты не имеющие поля, по которому выполняется фильтрация, отбрасываются', function () {
            var obj1 = { id: 1, status: 'active'   },
                obj2 = { id: 2 },
                objects = [ obj1, obj2 ],
                filter = new TheSameValueFilter('status');

            filter.value = 'active';
            expect(_.filter(objects, filter.filter)).toEqual([ obj1 ]);

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

            filter = new TheSameValueFilter('status');
            comparingFilter = new TheSameValueFilter('status');
        });

        it('Нельзя стравнивать фильтры с разными идентификаторами', function () {
            comparingFilter = new TheSameValueFilter('name' );

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
        var filter = new TheSameValueFilter('status' );
        filter.value = 'pattern';

        expect(filter.getAsObject()).toEqual({ type: 'equal', field: 'status', value: 'pattern' });
    });
});