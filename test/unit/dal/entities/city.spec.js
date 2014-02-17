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

    describe('должен хранить коллекцию объектов, для чего:', function() {

        it('должен иметь заданный на этапе инициализации провайдер REST API', function() {
            expect(cities._getRestApiProvider()).toBe(cityApi);
        });

        it('должен запрашивать данные коллекции с сервера один раз', function() {
            var data = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(data));

            cities.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();

            cities.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();

            expect(cityApi.query).toHaveBeenCalled();
            expect(cityApi.query.calls.length).toEqual(1);
        });

        it('не должен обращаться к серверу за одним элементом коллекции при запросе по id', function() {
            var data = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(data));
            spyOn(cityApi, 'get').andReturn($q.when({ id: 1, name: 'Первый' }));

            cities.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();

            cities.get(1).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();

            expect(cityApi.get).not.toHaveBeenCalled();
        });

        it('должен уметь принудительно повторно запрашивать данные', function() {
            var data = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(data));

            cities.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();

            cities.load().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(cityApi.query).toHaveBeenCalled();
            expect(cityApi.query.calls.length).toEqual(2);
        });
    });

    describe('должен управлять коллекцией объектов, для чего должен', function() {

        it('при сохранении без id - создавать элемент в коллекции из данных, полученных от сервера', function() {
            var items = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                newItem = {
                    id: 4,
                    name: 'Другой',
                    ext: 'Extra'
                },
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(items));
            spyOn(cityApi, 'create').andReturn($q.when(newItem));

            cities.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualSuccess.length).toBe(3);

            var city = new City ();
            cities.save(city).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(cityApi.create).toHaveBeenCalled();
            expect(actualSuccess).toEqualData(newItem);

            cities.get(actualSuccess).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualSuccess).toEqualData(newItem);

            cities.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualSuccess.length).toBe(4);
        });

        it('при сохранении без id - выдавать reject с ошибкой, выданной REST API, не изменяя коллекцию', function() {
            var items = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                errorMessage = "Сообщение REST API об ошибке",
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(items));
            spyOn(cityApi, 'create').andReturn($q.reject(errorMessage));

            var newCity = new City;
            cities.save(newCity).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(cityApi.create).toHaveBeenCalled();
            expect(actualError).toBe(errorMessage);
        });

        it('при сохранении с id - обновлять элемент в коллекции данными, полученными от сервера', function() {
            var items = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                newData = {
                    id: 2,
                    name: 'Другой',
                    ext: 'Extra'
                },
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(items));
            spyOn(cityApi, 'update').andReturn($q.when(newData));

            cities.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualSuccess.length).toBe(3);

            var city = new City;
            city._fillItem(newData);
            cities.save(city).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(cityApi.update).toHaveBeenCalled();
            expect(actualSuccess).toEqualData(newData);

            cities.get(2).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualSuccess).toEqualData(newData);

            cities.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualSuccess.length).toBe(3);
        });

        it('при сохранении с id - выдавать reject с ошибкой для элемента с отсутствующим в коллекции id', function() {
            var items = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(items));

            cities.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();

            var newCity = new City;
            newCity.id = 5;

            cities.save(newCity).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualError.errorMessage).toBe("При обновлении в коллекции не найден элемент с id: 5");
        });

        it('при сохранении с id - выдавать reject с ошибкой, выданной REST API, не изменяя коллекцию', function() {
            var items = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                errorMessage = "Сообщение REST API об ошибке",
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(items));
            spyOn(cityApi, 'update').andReturn($q.reject(errorMessage));

            cities.get(2).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            var oldCity = actualSuccess;
            expect(oldCity).toEqualData({ id: 2, name: 'Второй' });

            var newCity = new City;
            angular.extend(newCity, oldCity);
            newCity.name = 'Новое имя';
            cities.save(newCity).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(cityApi.update).toHaveBeenCalled();
            expect(actualError).toBe(errorMessage);
            expect(oldCity).toEqualData({ id: 2, name: 'Второй' });
        });

        it('при удалении - удалять элемент из коллекции после получения подтверждения от сервера', function() {
            var items = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                newData = {
                    id: 2,
                    name: 'Другой',
                    ext: 'Extra'
                },
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(items));
            spyOn(cityApi, 'remove').andReturn($q.when(null));

            cities.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualSuccess.length).toBe(3);

            cities.remove(2).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(cityApi.remove).toHaveBeenCalled();

            cities.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualSuccess.length).toEqual(2);

            cities.get(2).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualError.errorMessage).toEqual('В коллекции не найден элемент с id: 2');
        });

        it('при удалении - выдавать reject с ошибкой для элемента с отсутствующим в коллекции id', function() {
            var items = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(items));

            cities.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();

            cities.remove(5).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualError.errorMessage).toBe("При удалении в коллекции не найден элемент с id: 5");
        });

        it('при удалении - выдавать reject с ошибкой, выданной REST API, не изменяя коллекцию', function() {
            var items = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                errorMessage = "Сообщение REST API об ошибке",
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(items));
            spyOn(cityApi, 'remove').andReturn($q.reject(errorMessage));

            cities.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualSuccess.length).toBe(3);

            cities.remove(1).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualError).toBe(errorMessage);

            cities.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualSuccess.length).toBe(3);

            cities.get(1).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(actualSuccess).toEqualData({ id: 1, name: 'Первый' });
        });

        it('выбрасывать эксепшн при попытке загрузить зависимые справочники', function() {
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

        var city = (new City ())._fillItem({
            id: 1,
            name: 'Первый',
            city: {
                id: 2,
                name: 'Вложенный'
            }
        }).result;

        expect(city).toEqualData(expected);
    });

    it('сериализовать город', function() {
        var actual,
            expected = {
            id: 1,
            name: 'Первый',
            city: 2
        }

        var city = (new City)._fillItem({
            id: 1,
            name: 'Первый',
            city: {
                id: 2,
                name: 'Вложенный'
            }
        }).result;

        city.city = {
            id: 2,
            name: 'Вложенный'
        }

        actual = city._serialize();
        expect(actual).toEqualData(expected);
    });
});