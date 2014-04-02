'use strict';

describe('Сервис cities должен', function() {
    var $rootScope,
        $q,
        $log,
        cities,
        City,
        cityApi;


    beforeEach(function() {
        module('app.dal.entities.city');

        inject(function(_$rootScope_, _$q_, _$log_, _cities_, _City_, _cityApi_)  {
            $rootScope = _$rootScope_;
            $q = _$q_;
            $log = _$log_;
            cities = _cities_;
            City = _City_;
            cityApi = _cityApi_;
        });
    });

    describe('хранить коллекцию объектов, для чего:', function() {

        it('иметь заданный на этапе инициализации провайдер REST API', function() {
            expect(cities._getRestApiProvider()).toBe(cityApi);
        });

        it('запрашивать данные коллекции с сервера один раз', function() {
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

        it('не обращаться к серверу за одним элементом коллекции при запросе по id', function() {
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

        it('уметь принудительно повторно запрашивать данные', function() {
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

        it('при загрузке разрешать ссылки на справочники', function() {
            var data = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий', city: {id: 2} }
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

            var city2 = actualSuccess[1],
                city3 = actualSuccess[2];
            expect(city3.city).toBe(city2);
        });

        it('при загрузке выбрасывать ошибку, если до этого не был загружен референтный справочник', function() {
            var data = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий', market: {id: 2} }
                ],
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(data));
            spyOn($log, 'error').andReturn(null);

            expect(function() {
                cities.getAll();
                $rootScope.$digest();
            }).toThrow('Неизвестный ссылочный параметр market в элементе с id: 3');
        });

        it('при загрузке выбрасывать ошибку, если во вложенном (ссылочном) объекте нет id', function() {
            var data = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 4, name: 'Четвертый', city: {ident: 2} }
                ],
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(data));
            spyOn($log, 'error').andReturn(null);

            expect(function() {
                cities.getAll();
                $rootScope.$digest();
            }).toThrow('Нет параметра id в элементе: {"ident":2}');
        });

        it('при загрузке выбрасывать ошибку, если в коллекции не найден элемент по ссылке', function() {
            var data = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий', city: {id: 22} }
                ],
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(data));
            spyOn($log, 'error').andReturn(null);

            expect(function() {
                cities.getAll();
                $rootScope.$digest();
            }).toThrow('Не найдена ссылка для элемента: {"id":22} в коллекции: cities');
        });
    });

    describe('управлять коллекцией объектов, для чего:', function() {

        it('при сохранении без id - создавать элемент в коллекции из данных, полученных от сервера', function() {
            var items = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                newItemData = {
                    name: 'Другой',
                    ext: 'Extra'
                },
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
            city.name = 'Другой';
            city.ext = 'Extra';
            cities.save(city).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(cityApi.create).toHaveBeenCalledWith(newItemData);
            expect(actualSuccess).toEqualData(newItem);

            cities.get(actualSuccess.id).then(function(respond) {
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

        it('при сохранении без id - передавать $http объект со ссылками в форме {id: ??}', function() {
            var items = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                newItemData = {
                    name: 'Другой',
                    ext: 'Extra',
                    city: {id: 2}
                },
                newItem = {
                    id: 4,
                    name: 'Другой',
                    ext: 'Extra',
                    city: {id: 2}
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

            var city2 = actualSuccess[1];
            var newCity = new City();
            newCity._fillItem(newItemData);
            expect(newCity.city).toBe(city2);

            cities.save(newCity).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(cityApi.create).toHaveBeenCalled();
            expect(cityApi.create).toHaveBeenCalledWith(newItemData);
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

        it('при сохранении c id - передавать $http объект со ссылками в форме {id: ??}', function() {
            var items = [
                    { id: 1, name: 'Первый' },
                    { id: 2, name: 'Второй' },
                    { id: 3, name: 'Третий' }
                ],
                savedItemData = {
                    id: 2, 
                    name: 'Второй',
                    city: {id: 2}
                },
                actualSuccess,
                actualError;

            spyOn(cityApi, 'query').andReturn($q.when(items));
            spyOn(cityApi, 'update').andReturn($q.when(savedItemData));

            cities.get(2).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            var city = actualSuccess;
            city.city = city;

            cities.save(city).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            expect(cityApi.update).toHaveBeenCalled();
            expect(cityApi.update).toHaveBeenCalledWith(savedItemData);
        });

        it('при сохранении с id - выбрасывать ошибку для элемента с отсутствующим в коллекции id', function() {
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

            expect(function() {
                cities.save(newCity);
                $rootScope.$digest();
            }).toThrow('При обновлении в коллекции не найден элемент с id: 5');
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

            expect(function() {
                cities.get(2);
                $rootScope.$digest();
            }).toThrow('В коллекции cities не найден элемент с id: 2');
        });

        it('при удалении - выбрасывать ошибку для элемента с отсутствующим в коллекции id', function() {
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

            expect(function() {
                cities.remove(5);
                $rootScope.$digest();
            }).toThrow('При удалении в коллекции не найден элемент с id: 5');
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