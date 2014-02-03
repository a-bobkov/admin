'use strict';

describe('Сервис cities из модуля app.dal.entities.city', function() {
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
            spyOn(cityApi, 'query').andReturn($q.when(
                [
                    { id: 1, name: 'Первый' },
                    {name: 'Без идентификатора'}
                ]
            ));

            expect( function () {
                cities.load();
                $rootScope.$digest();
             }).toThrow('Элемент коллекции {"name":"Без идентификатора"} не имеет параметра id.');
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
                    return Object.prototype.toString.call( this.actual ) === '[object Array]';
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
            var city = cities.getById(3);
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
            var city = cities.getById(3);
            expect(city instanceof City).toBeTruthy();
        });
    });

    describe('должен управлять коллекцией объектов, для чего уметь', function() {

        it('возвращать объект с сервера, обновляя данный элемент коллекции', function() {
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
            var city = cities.getById(3);
            expect(city.ext).toBeUndefined();

            spyOn(cityApi, 'get').andReturn($q.when(
                { id: 3, name: 'Третий', ext: 'Ещё свойство' }
            ));

            cities.get(3).then(function(respond) {
                city = respond;
            });
            $rootScope.$digest();

            expect(city.ext).toEqual('Ещё свойство');
        });

        it('выдавать ошибку, если требуемый элемент не найден в коллекции', function() {
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

            spyOn(cityApi, 'get').andReturn($q.when(
                { id: 5, name: 'Пропущенный'}
            ));

            cities.get(5).then(null, function(respond) {
                actual = respond;
            });
            $rootScope.$digest();

            expect(actual).toEqual('В коллекции не найден требуемый элемент: 5');
        });

        it('обновлять элемент в коллекции после получения подтверждения от сервера', function() {
            var actual,
                expected = {
                    id: 2,
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

            spyOn(cityApi, 'update').andReturn($q.when(expected));

            cities.load().then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();

            var city = cities.getById(2);
            city.name = 'Другой';

            cities.save(city).then(function(respond) {
                actual = respond;
            });
            $rootScope.$digest();
            expect(cityApi.update).toHaveBeenCalled()
            expect(actual).toEqualData(expected);
        });

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

        it('выдавать ошибку при удалении элемента, если элемент не найден в коллекции', function() {
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

            cities.remove(5).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('В коллекции не найден требуемый элемент: 5');
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

    it('десериализовать пользователя', function() {
        var expected = {
            id: 1,
            name: 'Первый',
            obj: 2
        }

        var city = new City ({
            id: 1,
            name: 'Первый',
            obj: {
                id: 2,
                name: 'Вложенный'
            }
        });

        expect(city).toEqualData(expected);
    });

    it('сериализовать пользователя', function() {
        var actual,
            expected = {
            id: 1,
            name: 'Первый',
            obj: 2
        }

        var city = new City ({
            id: 1,
            name: 'Первый',
            obj: {
                id: 2,
                name: 'Вложенный'
            }
        });

        city.obj = {
            id: 2,
            name: 'Вложенный'
        }

        actual = city.serialize();
        expect(actual).toEqualData(expected);
    });
});