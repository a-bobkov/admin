'use strict';

describe('FilterCollection', function () {
    var FilterCollection,
        EqualFilter;

    beforeEach(function () {
        module('max.dal.lib.filter.equal');
        module('max.dal.lib.filter.string-contains');

        inject(function(_FilterCollection_, _EqualFilter_) {
            FilterCollection = _FilterCollection_;
            EqualFilter = _EqualFilter_;
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
                collection.add(new EqualFilter(['fieldName']));
            }).not.toThrow();

            var errorMessage,
                filter = {};

            _.forEach(['getId', 'apply', 'compare', 'getAsObject'], function (method) {

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
            var fileldNames = ['someFieldName'];

            expect(function () {
                collection.add(new EqualFilter(fileldNames));
            }).not.toThrow();
            expect(collection.length()).toEqual(1);

            expect(function () {
                collection.add(new EqualFilter(fileldNames));
            }).not.toThrow();
            expect(collection.length()).toEqual(1);
        });

        it('При добавлении фильтра возвращается сама коллекция', function () {
            expect(
                collection.add(new EqualFilter(['someField']))
            ).toBe(collection);
        });
    });

    describe('Из экземпляра коллекции можно получать ранее добавленные фильтры', function () {
        var collection;

        beforeEach(function () {
            collection = new FilterCollection;
        });

        it('Если фильтр в коллекции есть, возвращается фильр', function () {
            var filter = new EqualFilter(['fieldName']);
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
            var filter1 = new EqualFilter(['field1']),
                filter2 = new EqualFilter(['field2']);

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
            var filter1 = new EqualFilter(['status']),
                object1 = { id: 1, status: 'active' },
                object2 = { id: 2, status: 'blocked' },
                object3 = { id: 3, status: 'active' },
                objects = [ object1, object2, object3 ];

            filter1.value = 'active';
            collection.add(filter1);

            expect(_.filter(objects, collection.filter)).toEqual([ object1, object3 ])
        });

        it('Если в коллекции несколько фильтров - проверяются все', function () {
            var filter1 = new EqualFilter(['status']),
                filter2 = new EqualFilter(['role']),
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
                filter2 = new EqualFilter(['field2']),
                comparingFilter1 = new StringContainsFilter(['field1']),
                comparingFilter2 = new EqualFilter(['field2']);

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
            filter2 = new EqualFilter(['field2']);
            comparingFilter1 = new StringContainsFilter(['field1']);
            comparingFilter2 = new EqualFilter(['field2']);

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
            filter2 = new EqualFilter(['field2']);
            comparingFilter1 = new StringContainsFilter(['field1']);
            comparingFilter2 = new EqualFilter(['field2']);
            comparingFilter3 = new EqualFilter(['field3']);

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

            filter = new EqualFilter(['some field']);
            filter.value = 'some value';
            collection.add(filter);

            expect(collection.getAsObject()).toEqual([{ type: 'equal', fields: ['some field'], value: 'some value' }])
        });

        it('Сериализация нескольких фильтров', function () {

            filter = new EqualFilter(['some field']);
            filter.value = 'some value';
            collection.add(filter);

            filter = new EqualFilter(['another field']);
            filter.value = 'another value';
            collection.add(filter);

            expect(collection.getAsObject()).toEqual([
                { type: 'equal', fields: ['some field'], value: 'some value' },
                { type: 'equal', fields: ['another field'], value: 'another value' }
            ]);
        });
    });
});


describe('dalFilter включает библиотеки для работы с фильтрами', function () {
    var dalFilter,
        StringContainsFilter,
        EqualFilter;


    beforeEach(function () {
        module('max.dal.lib.filter.equal');
        module('max.dal.lib.filter.string-contains');

        inject(function(_dalFilter_, _StringContainsFilter_, _EqualFilter_) {
            dalFilter = _dalFilter_;
            StringContainsFilter = _StringContainsFilter_;
            EqualFilter = _EqualFilter_;
        });
    });

    describe('dalFilter.factory', function () {

        describe('Позволяет регистрировать фильтры', function () {
            it('Чтобы зарегистрировать фильтр неоходимо передать его алиас и конструктор', function () {
                expect(function () {
                    dalFilter.factory.register('some alias', EqualFilter);
                }).not.toThrow();
            });

            it('Алиас должен быть не пустой строкой', function () {
                expect(function () {
                    dalFilter.factory.register(123);
                }).toThrow("Алиас для фильтра должен быть непустой строкой");

                expect(function () {
                    dalFilter.factory.register("");
                }).toThrow("Алиас для фильтра должен быть непустой строкой");
            });

            it('Конструктор функции должен быть именно функцией', function () {
                expect(function () {
                    dalFilter.factory.register('some alias', {});
                }).toThrow("Конструктор для фильтра должен быть функцией-конструктором");
            });

            it('Попытка повторной регистрации алиаса приводит в выбросу исключения', function () {

                dalFilter.factory.register('some alias', EqualFilter);

                expect(function () {
                    dalFilter.factory.register('some alias', StringContainsFilter);
                }).toThrow("Для алиаса 'some alias' уже задан конструктор фильтра");
            });
        });

        describe('Позволяет создавать экземпляры фильтров', function () {
            it('В метод create должен быть передан объект', function () {
                expect(function () {
                    dalFilter.factory.create('not an object');
                }).toThrow('В фабрику фильтров должен быть передан объект');
            });

            it('Если у объекта указан тип contain создается фильтр StringContainsFilter', function () {
                expect(dalFilter.factory.create({ type: 'contain', fields: ['id'] }) instanceof StringContainsFilter).toBeTruthy();
            });

            it('Если у объекта указан тип contain создается фильтр EqualFilter', function () {
                expect(dalFilter.factory.create({ type: 'equal', fields: ['status'] }) instanceof EqualFilter).toBeTruthy();
            });

            it('Если тип фильтра неизвестен выбрасывается exception', function () {
                expect(function () {
                    dalFilter.factory.create({});
                }).toThrow('В фабрику фильтров передан неизвестный тип фильтра: undefined');

                expect(function () {
                    dalFilter.factory.create({type: 'in'});
                }).toThrow('В фабрику фильтров передан неизвестный тип фильтра: in');
            });
        });
    });

    describe('dalFilter.factory', function () {
        describe('Позволяет получать значение из вложенных объектов по имени через точку', function () {
            var object;

            beforeEach(function () {
                object = {
                    id: 1,
                    dealer: {
                        id: 5,
                        name: 'Some dealer',
                        city: { id: 10 }
                    },
                    market: {
                        id: 13,
                        name: 'Some market'
                    }
                }
            });

            it('Если имя не содержит точки, то возвращается непосредственное свойство объекта', function () {
                expect(
                    dalFilter.utils.getDeepValue(object, 'id')
                ).toBe(object.id);

                expect(
                    dalFilter.utils.getDeepValue(object, 'dealer')
                ).toBe(object.dealer);
            });

            it('Если имя содержит точки, то возвращается свойство вложенного объекта', function () {
                expect(
                    dalFilter.utils.getDeepValue(object, 'dealer.id')
                ).toBe(object.dealer.id);

                expect(
                    dalFilter.utils.getDeepValue(object, 'dealer.city.id')
                ).toBe(object.dealer.city.id);
            });

            it('Если свойство не удалось найти возвращается undefined', function () {
                expect(
                    dalFilter.utils.getDeepValue(object, 'nothing')
                ).toBeUndefined();

                expect(
                    dalFilter.utils.getDeepValue(object, 'nothing.city.id')
                ).toBeUndefined();
            });
        })
    });
});