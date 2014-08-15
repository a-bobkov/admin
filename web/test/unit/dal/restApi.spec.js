'use strict';

describe('У объекта max.dal.rest.api', function() {
    var $rootScope;
    var $q;
    var Api;
    var RestApi;
    var cityApi;

    beforeEach(function() {
        module('max.dal.rest.api');

        inject(function(_$rootScope_, _$q_, _Api_, _RestApi_) {
            $rootScope = _$rootScope_;
            $q = _$q_;
            Api = _Api_;
            RestApi = _RestApi_;
        });
    
        cityApi = new RestApi('cities', 'city');
    });

    describe('Метод get(id)', function() {

        it('должен вызывать Api и возвращать полученные данные', function() {
            var expected = {
                city: {
                    id: 1,
                    name: 'название города'
                }
            };
            var actual;

            spyOn(Api, 'get').andReturn($q.when(expected));

            cityApi.get(1).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(Api.get).toHaveBeenCalledWith("/cities/1");
            expect(actual).toBe(expected);
        });

        it('должен возвращать сообщение об ошибке при отсутствии секции city', function(){
            var expected = {
                    id: 1,
                    name: 'название города'
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'get').andReturn($q.when(
                expected
            ));

            expect(function () {
                cityApi.get(1);
                $rootScope.$digest();
            }).toThrow('Ответ сервера не содержит секции city');
        });

        it('должен возвращать сообщение об ошибке при получении данных о другом городе', function(){
            var expected = {
                    id: 1,
                    name: 'название города'
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'get').andReturn($q.when({
                city: {
                    id: 5,
                    name: 'название другого города'
                }
            }));

            expect(function () {
                cityApi.get(1);
                $rootScope.$digest();
            }).toThrow('Ответ сервера не содержит данных требуемого элемента 1');
        });

        it('должен возвращать объект, полученный от Api', function(){
            var data = {
                    response: "Ответ сервера",
                    errorMessage: "Ошибка, выявленная Api"
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'get').andReturn($q.reject(data));

            cityApi.get(1).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect(actualError).toBe(data);
        });
    });

    describe('Метод query()', function() {

        it('должен вызывать Api и возвращать полученные данные', function() {
            var expected = {
                cities: [
                    { id: 1, name: 'название города' },
                    { id: 3, name: 'название другого города' }
                ]
            };
            var actualSuccess;
            var actualError;

            spyOn(Api, 'get').andReturn($q.when(expected));

            cityApi.query().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect(Api.get).toHaveBeenCalledWith('/cities', undefined);
            expect(actualSuccess).toBe(expected);
        });

        it('должен возвращать сообщение об ошибке, если полученные данные - не массив', function(){
            var data = {
                    id: 1,
                    name: 'название города'
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'get').andReturn($q.when({
                cities: data
            }));

            expect(function () {
                cityApi.query();
                $rootScope.$digest();
            }).toThrow('Ответ сервера не содержит массив в секции cities');
        });

        it('должен возвращать сообщение об ошибке при отсутствии секции cities', function(){
            var data = {
                    id: 1,
                    name: 'название города'
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'get').andReturn($q.when(data));

            expect(function () {
                cityApi.query();
                $rootScope.$digest();
            }).toThrow('Ответ сервера не содержит секции cities');
        });

        it('должен возвращать объект, полученный от Api', function(){
            var data = {
                    response: "Ответ сервера",
                    errorMessage: "Ошибка, выявленная Api"
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'get').andReturn($q.reject(data));

            cityApi.query().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect(actualError).toBe(data);
        });
    });

    describe('Метод create(data)', function() {

        it('должен вызывать Api и возвращать полученные данные c id и секцией city', function() {
            var data = {
                    name: 'название города'
                },
                expected = {
                    city: {
                        id: 1,
                        name: 'название города'
                    }
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'post').andReturn($q.when(expected));

            cityApi.create(data).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect(Api.post).toHaveBeenCalledWith("/cities/new", { city: data });
            expect(actualSuccess).toBe(expected);
        });

        it('должен возвращать сообщение об ошибке при отсутствии секции city', function(){
            var data = {
                    name: 'название города'
                },
                expected = {
                    id: 1,
                    name: 'название города'
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'post').andReturn($q.when(expected));

            expect(function () {
                cityApi.create(data);
                $rootScope.$digest();
            }).toThrow('Ответ сервера не содержит секции city');
        });

        it('должен возвращать объект, полученный от Api', function(){
            var data = {
                    response: "Ответ сервера",
                    errorMessage: "Ошибка, выявленная Api"
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'post').andReturn($q.reject(data));

            cityApi.create(data).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect(actualError).toBe(data);
        });
    });

    describe('Метод update(data)', function() {

        it('должен вызывать Api и возвращать полученные данные с секцией city', function() {
            var data = {
                    id: 1,
                    name: 'название города'
                },
                expected = {
                    city: data
                },
                actual;

            spyOn(Api, 'put').andReturn($q.when(expected));

            cityApi.update(data).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(Api.put).toHaveBeenCalledWith("/cities/1", expected);
            expect(actual).toBe(expected);
        });

        it('должен возвращать сообщение об ошибке при отсутствии в ответе секции city', function(){
            var data = {
                    id: 1,
                    name: 'название города'
                },
                expected = {
                    id: 1,
                    name: 'название города'
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'put').andReturn($q.when(
                expected
            ));

            expect(function () {
                cityApi.update(data);
                $rootScope.$digest();
            }).toThrow('Ответ сервера не содержит секции city');
        });

        it('должен возвращать сообщение об ошибке при получении данных с другим id', function(){
            var data = {
                    id: 1,
                    name: 'название города'
                },
                expected = {
                    id: 1,
                    name: 'название города'
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'put').andReturn($q.when({
                city: {
                    id: 5,
                    name: 'название другого города'
                }
            }));

            expect(function () {
                cityApi.update(data);
                $rootScope.$digest();
            }).toThrow('Ответ сервера не содержит данных требуемого элемента 1');
        });

        it('должен возвращать объект, полученный от Api', function(){
            var data = {
                    response: "Ответ сервера",
                    errorMessage: "Ошибка, выявленная Api"
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'put').andReturn($q.reject(data));

            cityApi.update(data).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect(actualError).toBe(data);
        });
    });

    describe('Метод remove(id)', function() {

        it('должен вызывать Api и возвращать null', function() {
            var id = 1,
                expected = null,
                actual;

            spyOn(Api, 'remove').andReturn($q.when(
                expected
            ));

            cityApi.remove(id).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(Api.remove).toHaveBeenCalledWith("/cities/1");
            expect(actual).toBe(expected);
        });

        it('должен возвращать объект, полученный от Api', function(){
            var data = {
                    response: "Ответ сервера",
                    errorMessage: "Ошибка, выявленная Api"
                },
                actualSuccess,
                actualError;

            spyOn(Api, 'remove').andReturn($q.reject(data));

            cityApi.remove(1).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });

            $rootScope.$digest();
            expect(actualError).toBe(data);
        });
    });
});