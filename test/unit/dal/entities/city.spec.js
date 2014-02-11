'use strict';

describe('Сервис cities из модуля app.dal.entities.city', function() {
    var $rootScope,
        $q,
        $log,
        cities,
        City,
        cityApi,
        Api;


    beforeEach(function() {
        module('app.dal.entities.city');

        inject(function(_$rootScope_, _$q_, _$log_, _cities_, _City_, _cityApi_, _Api_)  {
            $rootScope = _$rootScope_;
            $q = _$q_;
            $log = _$log_;
            cities = _cities_;
            City = _City_;
            cityApi = _cityApi_;
            Api = _Api_;
        });
    });

    beforeEach(function() {
    });

    describe('должен знать провайдера REST API, для чего', function() {

        it('должен иметь заданный на этапе инициализации провайдер REST API', function() {
            expect(cities.getRestApiProvider()).toBe(cityApi);
        });

        it('должен запоминать провайдера', function() {
            var restApiProvider = function () {};
            cities.setRestApiProvider(restApiProvider);

            expect(cities.getRestApiProvider()).toBe(restApiProvider);
        });

        it('должен выбрасывать эксепшин при попытке получить провайдера, если он не задан', function() {
            delete cities.restApiProvider;
            expect( function() { cities.getRestApiProvider(); } )
                .toThrow('Не задан провайдер REST API.');
        })
    });

    describe('должен знать функцию-конструктор для элементов коллекции, для чего', function() {

        it('должен иметь заданный на этапе инициализации конструктор', function() {
            expect(cities.getItemConstructor()).toBe(City);
        });

        it('должен выбрасывать эксепшин при попытке получить незaданный конструктор', function() {
            delete cities.ItemConstructor;
            expect( function() { cities.getItemConstructor(); } )
                .toThrow('Не задан конструктор для элементов коллекции.');
        });

        it('должен уметь запоминать функцию-конструктор', function() {
            var ItemConstructor = function ItemConstructor() {} ;

            cities.setItemConstructor(ItemConstructor);
            expect(cities.getItemConstructor()).toBe(ItemConstructor);
        });
    });

    describe('хранит коллекцию объектов, для чего умеет', function() {
        beforeEach(function() {
        });

        it('запрашивать данные коллекции с сервера один раз', function() {
            var actual;

            spyOn(cityApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            cities.getAll().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();

            cities.getAll().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();

            expect(cityApi.query).toHaveBeenCalled();
            expect(cityApi.query.calls.length).toEqual(1);
        });

        it('иметь возможность принудительно повторно запрашивать данные', function() {
            var actual;

            spyOn(cityApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            cities.getAll();
            $rootScope.$digest();

            cities.load().then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(cityApi.query).toHaveBeenCalled();
            expect(cityApi.query.calls.length).toEqual(2);
        });

        it('создавать коллекцию из полученных данных, используя конструктор элементов коллекции', function() {
            var actual;

            spyOn(cityApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            cities.load().then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            _.forEach(actual, function(item) {
                expect(item.constructor).toBe(City);
            });
        });

        it('проверять наличие идентификатора у элементов коллекции', function() {
            var data = [
                    { id: 1, name: 'Первый' },
                    {name: 'Без идентификатора'}
                ],
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(data));

            spyOn($log, 'error').andReturn(null);

            cities.load().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect($log.error).toHaveBeenCalledWith(['Нет параметра id в элементе: {"name":"Без идентификатора"}']);
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toEqual(['Нет параметра id в элементе: {"name":"Без идентификатора"}']);
        });

        it('возвращать массив объектов', function() {
            var actual;

            spyOn(cityApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));
            this.addMatchers({
                toBeArray: function () {
                    return angular.isArray(this.actual);
                }
            });

            cities.load().then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBeArray();
        });

        it('возвращать объект коллекции по id', function() {
            var actual;

            spyOn(cityApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            cities.load().then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();
            var city = cities._findItem(3);
            expect(city instanceof City).toBeTruthy();
        });

        it('возвращать индекс объекта коллекции по id', function() {
            var actual;

            spyOn(cityApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            cities.load().then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();
            var idx = cities._findIndex(3);
            expect(cities.collection[idx]).toBe(cities._findItem(3));
        });

        it('возвращать undefined, если требуемый элемент не найден в коллекции', function() {
            var actual;

            spyOn(cityApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            cities.get(5).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();
            expect(actual).toBeUndefined();
        });
    });

    describe('должен управлять коллекцией объектов, для чего уметь', function() {

        it('создавать элемент в коллекции после получения подтверждения от сервера', function() {
            var actual,
                expected = {
                    name: 'Другой',
                    ext: 'Extra'
                };

            spyOn(cityApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            spyOn(cityApi, 'create').andReturn($q.when(expected));

            cities.load().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();
            expect(cities.collection.length).toEqual(3);

            var city = new City (expected);

            cities.save(city).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();
            expect(cities.collection.length).toEqual(4);
        });

        it('удалять элемент из коллекции после получения подтверждения от сервера', function() {
            var actual;

            spyOn(cityApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            spyOn(cityApi, 'remove').andReturn($q.when(null));

            cities.load().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();
            expect(actual.length).toEqual(3);

            cities.remove(2).then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();
            expect(cityApi.remove).toHaveBeenCalled()
            expect(cityApi.remove).toHaveBeenCalledWith(2);

            cities.getAll().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();
            expect(actual.length).toEqual(2);
        });

        it('Удаление элемента: выдавать ошибку, если сервер вернул строку с ошибкой', function() {
            var expected = "Сообщение об ошибке",
                actual;

            spyOn(cityApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ]
            ));

            spyOn(cityApi, 'remove').andReturn($q.reject(
                expected
            ));

            cities.load().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();

            cities.remove(1).then(null, function(respond) {
                actual = respond;
            });
            $rootScope.$digest();

            expect(actual).toBe(expected);
        });

        it('не пытаться загружать опции с сервера, а выбрасывать эксепшн', function() {
            expect( function() { cities.getDirectories(); } )
                .toThrow('Не определен метод REST API для загрузки зависимых справочников коллекции.');
        });
    });
});

describe('Сервис-конструктор City из модуля app.dal.entities.city умеет', function() {
    var $rootScope,
        $q,
        cities,
        City,
        cityApi,
        Api;

    beforeEach(function() {
        module('app.dal.entities.city');

        inject(function(_$rootScope_, _$q_, _cities_, _City_, _cityApi_, _Api_)  {
            $rootScope = _$rootScope_;
            $q = _$q_;
            cities = _cities_;
            City = _City_;
            cityApi = _cityApi_;
            Api = _Api_;
        });
    });

    beforeEach(function() {
    });

    it('десериализовать город', function() {
        var expected = {
            id: 1,
            name: 'Первый',
            city: {
                id: 2,
                name: 'Вложенный'
            }
        }

        var city = (new City ())._fillData({
            id: 1,
            name: 'Первый',
            city: {
                id: 2,
                name: 'Вложенный'
            }
        });

        expect(city).toEqualData(expected);
    });

    it('сериализовать город', function() {
        var actual,
            expected = {
            id: 1,
            name: 'Первый',
            city: 2
        }

        var city = (new City)._fillData({
            id: 1,
            name: 'Первый',
            city: {
                id: 2,
                name: 'Вложенный'
            }
        });

        city.city = {
            id: 2,
            name: 'Вложенный'
        }

        actual = city._serialize();
        expect(actual).toEqualData(expected);
    });
});