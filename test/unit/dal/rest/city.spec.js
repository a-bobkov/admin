'use strict';

describe('У объекта app.dal.rest.city', function() {
    var $rootScope,
        $q,
        CityApi,
        Api;

    beforeEach(function() {
        module('app.dal.rest.city');

        inject(function(_$rootScope_, _$q_, _CityApi_, _Api_) {
            $rootScope = _$rootScope_;
            $q = _$q_;
            CityApi = _CityApi_;
            Api = _Api_;
        });
    });

    describe('Метод get(id)', function() {

        it('должен вызывать Api и возвращать полученные данные без секции city', function() {
            var expected = {
                    id: 1,
                    name: 'название города'
                },
                actual;

            spyOn(Api, 'get').andReturn($q.when({
                city: expected
            }));

            CityApi.get(1).then(function(respond) {
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
                actual;

            spyOn(Api, 'get').andReturn($q.when(
                expected
            ));

            CityApi.get(1).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('Ответ сервера не содержит секции city');
        });

        it('должен возвращать сообщение об ошибке при получении данных о другом городе', function(){
            var expected = {
                    id: 1,
                    name: 'название города'
                },
                actual;

            spyOn(Api, 'get').andReturn($q.when({
                city: {
                    id: 5,
                    name: 'название другого города'
                }
            }));

            CityApi.get(1).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('Ответ сервера не содержит данных требуемого элемента 1');
        });

        it('должен возвращать строку с сообщением об ошибке, полученную от Api', function(){
            var expected = "Сообщение об ошибке",
                actual;

            spyOn(Api, 'get').andReturn($q.reject(
                expected
            ));

            CityApi.get(1).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(expected);
        });

        it('должен возвращать код ошибки из объекта, полученного от Api', function(){
            var expected = {
                    data: {
                        error_code: 500
                    }
                },
                actual;

            spyOn(Api, 'get').andReturn($q.reject(
                expected
            ));

            CityApi.get(1).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(500);
        });
    });

    describe('Метод query()', function() {

        it('должен вызывать Api и возвращать полученные данные без секции cities', function() {
            var expected = [
                    {
                        id: 1,
                        name: 'название города'
                    },
                    {
                        id: 3,
                        name: 'название другого города'
                    }
                ],
                actual;

            spyOn(Api, 'get').andReturn($q.when({
                cities: expected
            }));

            CityApi.query().then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(Api.get).toHaveBeenCalledWith("/cities/", {});
            expect(actual).toBe(expected);
        });

        it('должен возвращать сообщение об ошибке, если полученные данные - не массив', function(){
            var expected = {
                    id: 1,
                    name: 'название города'
                },
                actual;

            spyOn(Api, 'get').andReturn($q.when({
                cities: expected
            }));

            CityApi.query().then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('Ответ сервера не содержит массив в секции cities');
        });

        it('должен возвращать сообщение об ошибке при отсутствии секции cities', function(){
            var expected = {
                    id: 1,
                    name: 'название города'
                },
                actual;

            spyOn(Api, 'get').andReturn($q.when(
                expected
            ));

            CityApi.query().then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('Ответ сервера не содержит секции cities');
        });

        it('должен возвращать строку с сообщением об ошибке, полученную от Api', function(){
            var expected = "Сообщение об ошибке",
                actual;

            spyOn(Api, 'get').andReturn($q.reject(
                expected
            ));

            CityApi.query().then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(expected);
        });

        it('должен возвращать код ошибки из объекта, полученного от Api', function(){
            var expected = {
                    data: {
                        error_code: 500
                    }
                },
                actual;

            spyOn(Api, 'get').andReturn($q.reject(
                expected
            ));

            CityApi.query().then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(500);
        });
    });

    describe('Метод create(data)', function() {

        it('должен вызывать Api и возвращать полученные данные без секции city', function() {
            var data = {
                    name: 'название города'
                },
                expected = {
                    id: 1,
                    name: 'название города'
                },
                actual;

            spyOn(Api, 'post').andReturn($q.when({
                city: expected
            }));

            CityApi.create(data).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(Api.post).toHaveBeenCalledWith("/cities/", data);
            expect(actual).toBe(expected);
        });

        it('должен возвращать сообщение об ошибке при отсутствии секции city', function(){
            var data = {
                    name: 'название города'
                },
                expected = {
                    id: 1,
                    name: 'название города'
                },
                actual;

            spyOn(Api, 'post').andReturn($q.when(
                expected
            ));

            CityApi.create(data).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('Ответ сервера не содержит секции city');
        });

        it('должен возвращать строку с сообщением об ошибке, полученную от Api', function(){
            var data = {
                    name: 'название города'
                },
                expected = "Сообщение об ошибке",
                actual;

            spyOn(Api, 'post').andReturn($q.reject(
                expected
            ));

            CityApi.create(data).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(expected);
        });

        it('должен возвращать код ошибки из объекта, полученного от Api', function(){
            var data = {
                    name: 'название города'
                },
                expected = {
                    data: {
                        error_code: 500
                    }
                },
                actual;

            spyOn(Api, 'post').andReturn($q.reject(
                expected
            ));

            CityApi.create(data).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(500);
        });
    });

    describe('Метод update(data)', function() {

        it('должен вызывать Api и возвращать полученные данные без секции city', function() {
            var data = {
                    id: 1,
                    name: 'название города'
                },
                expected = {
                    id: 1,
                    name: 'название города'
                },
                actual;

            spyOn(Api, 'put').andReturn($q.when({
                city: expected
            }));

            CityApi.update(data).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(Api.put).toHaveBeenCalledWith("/cities/1", data);
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
                actual;

            spyOn(Api, 'put').andReturn($q.when(
                expected
            ));

            CityApi.update(data).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('Ответ сервера не содержит секции city');
        });

        it('должен возвращать сообщение об ошибке при получении данных о другом пользователе', function(){
            var data = {
                    id: 1,
                    name: 'название города'
                },
                expected = {
                    id: 1,
                    name: 'название города'
                },
                actual;

            spyOn(Api, 'put').andReturn($q.when({
                city: {
                    id: 5,
                    name: 'название другого города'
                }
            }));

            CityApi.update(data).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('Ответ сервера не содержит данных требуемого элемента 1');
        });

        it('должен возвращать строку с сообщением об ошибке, полученную от Api', function(){
            var data = {
                    id: 1,
                    name: 'название города'
                },
                expected = "Сообщение об ошибке",
                actual;

            spyOn(Api, 'put').andReturn($q.reject(
                expected
            ));

            CityApi.update(data).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(expected);
        });

        it('должен возвращать код ошибки из объекта, полученного от Api', function(){
            var data = {
                    id: 1,
                    name: 'название города'
                },
                expected = {
                    data: {
                        error_code: 500
                    }
                },
                actual;

            spyOn(Api, 'put').andReturn($q.reject(
                expected
            ));

            CityApi.update(data).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(500);
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

            CityApi.remove(id).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(Api.remove).toHaveBeenCalledWith("/cities/1");
            expect(actual).toBe(expected);
        });

        it('должен возвращать строку с сообщением об ошибке, полученную от Api', function(){
            var id = 1,
                expected = "Сообщение об ошибке",
                actual;

            spyOn(Api, 'remove').andReturn($q.reject(
                expected
            ));

            CityApi.remove(id).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(expected);
        });

        it('должен возвращать код ошибки из объекта, полученного от Api', function(){
            var id = 1,
                expected = {
                    data: {
                        error_code: 500
                    }
                },
                actual;

            spyOn(Api, 'remove').andReturn($q.reject(
                expected
            ));

            CityApi.remove(id).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(500);
        });
    });
});