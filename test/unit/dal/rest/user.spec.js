'use strict';

describe('У объекта app.dal.rest.user', function() {
    var $rootScope,
        $q,
        userApi,
        Api;

    beforeEach(function() {
        module('app.dal.rest.user');

        inject(function(_$rootScope_, _$q_, _userApi_, _Api_) {
            $rootScope = _$rootScope_;
            $q = _$q_;
            userApi = _userApi_;
            Api = _Api_;
        });
    });

    describe('Метод get(id)', function() {

        it('должен вызывать Api и возвращать полученные данные без секции user', function() {
            var expected = {
                    id: 1,
                    name: 'имя пользователя'
                },
                actual;

            spyOn(Api, 'get').andReturn($q.when({
                user: expected
            }));

            userApi.get(1).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(Api.get).toHaveBeenCalledWith("/users/1");
            expect(actual).toBe(expected);
        });

        it('должен возвращать сообщение об ошибке при отсутствии секции user', function(){
            var expected = {
                    id: 1,
                    name: 'имя пользователя'
                },
                actual;

            spyOn(Api, 'get').andReturn($q.when(
                expected
            ));

            userApi.get(1).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('Ответ сервера не содержит секции user');
        });

        it('должен возвращать сообщение об ошибке при получении данных о другом пользователе', function(){
            var expected = {
                    id: 1,
                    name: 'имя пользователя'
                },
                actual;

            spyOn(Api, 'get').andReturn($q.when({
                user: {
                    id: 5,
                    name: 'имя другого пользователя'
                }
            }));

            userApi.get(1).then(null, function(respond) {
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

            userApi.get(1).then(null, function(respond) {
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

            userApi.get(1).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(500);
        });
    });

    describe('Метод query()', function() {

        it('должен вызывать Api и возвращать полученные данные без секции users', function() {
            var expected = [
                    {
                        id: 1,
                        name: 'имя пользователя'
                    },
                    {
                        id: 3,
                        name: 'имя другого пользователя'
                    }
                ],
                actual;

            spyOn(Api, 'get').andReturn($q.when({
                users: expected
            }));

            userApi.query().then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(Api.get).toHaveBeenCalledWith("/users/", {});
            expect(actual).toBe(expected);
        });

        it('должен возвращать сообщение об ошибке, если полученные данные - не массив', function(){
            var expected = {
                    id: 1,
                    name: 'имя пользователя'
                },
                actual;

            spyOn(Api, 'get').andReturn($q.when({
                users: expected
            }));

            userApi.query().then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('Ответ сервера не содержит массив в секции users');
        });

        it('должен возвращать сообщение об ошибке при отсутствии секции users', function(){
            var expected = {
                    id: 1,
                    name: 'имя пользователя'
                },
                actual;

            spyOn(Api, 'get').andReturn($q.when(
                expected
            ));

            userApi.query().then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('Ответ сервера не содержит секции users');
        });

        it('должен возвращать строку с сообщением об ошибке, полученную от Api', function(){
            var expected = "Сообщение об ошибке",
                actual;

            spyOn(Api, 'get').andReturn($q.reject(
                expected
            ));

            userApi.query().then(null, function(respond) {
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

            userApi.query().then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(500);
        });
    });

    describe('Метод create(data)', function() {

        it('должен вызывать Api и возвращать полученные данные без секции user', function() {
            var data = {
                    name: 'имя пользователя'
                },
                expected = {
                    id: 1,
                    name: 'имя пользователя'
                },
                actual;

            spyOn(Api, 'post').andReturn($q.when({
                user: expected
            }));

            userApi.create(data).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(Api.post).toHaveBeenCalledWith("/users/", data);
            expect(actual).toBe(expected);
        });

        it('должен возвращать сообщение об ошибке при отсутствии секции user', function(){
            var data = {
                    name: 'имя пользователя'
                },
                expected = {
                    id: 1,
                    name: 'имя пользователя'
                },
                actual;

            spyOn(Api, 'post').andReturn($q.when(
                expected
            ));

            userApi.create(data).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('Ответ сервера не содержит секции user');
        });

        it('должен возвращать строку с сообщением об ошибке, полученную от Api', function(){
            var data = {
                    name: 'имя пользователя'
                },
                expected = "Сообщение об ошибке",
                actual;

            spyOn(Api, 'post').andReturn($q.reject(
                expected
            ));

            userApi.create(data).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(expected);
        });

        it('должен возвращать код ошибки из объекта, полученного от Api', function(){
            var data = {
                    name: 'имя пользователя'
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

            userApi.create(data).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(500);
        });
    });

    describe('Метод update(data)', function() {

        it('должен вызывать Api и возвращать полученные данные без секции user', function() {
            var data = {
                    id: 1,
                    name: 'имя пользователя'
                },
                expected = {
                    id: 1,
                    name: 'имя пользователя'
                },
                actual;

            spyOn(Api, 'put').andReturn($q.when({
                user: expected
            }));

            userApi.update(data).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(Api.put).toHaveBeenCalledWith("/users/1", data);
            expect(actual).toBe(expected);
        });

        it('должен возвращать сообщение об ошибке при отсутствии в ответе секции user', function(){
            var data = {
                    id: 1,
                    name: 'имя пользователя'
                },
                expected = {
                    id: 1,
                    name: 'имя пользователя'
                },
                actual;

            spyOn(Api, 'put').andReturn($q.when(
                expected
            ));

            userApi.update(data).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('Ответ сервера не содержит секции user');
        });

        it('должен возвращать сообщение об ошибке при получении данных о другом пользователе', function(){
            var data = {
                    id: 1,
                    name: 'имя пользователя'
                },
                expected = {
                    id: 1,
                    name: 'имя пользователя'
                },
                actual;

            spyOn(Api, 'put').andReturn($q.when({
                user: {
                    id: 5,
                    name: 'имя другого пользователя'
                }
            }));

            userApi.update(data).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('Ответ сервера не содержит данных требуемого элемента 1');
        });

        it('должен возвращать строку с сообщением об ошибке, полученную от Api', function(){
            var data = {
                    id: 1,
                    name: 'имя пользователя'
                },
                expected = "Сообщение об ошибке",
                actual;

            spyOn(Api, 'put').andReturn($q.reject(
                expected
            ));

            userApi.update(data).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(expected);
        });

        it('должен возвращать код ошибки из объекта, полученного от Api', function(){
            var data = {
                    id: 1,
                    name: 'имя пользователя'
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

            userApi.update(data).then(null, function(respond) {
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

            userApi.remove(id).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(Api.remove).toHaveBeenCalledWith("/users/1");
            expect(actual).toBe(expected);
        });

        it('должен возвращать строку с сообщением об ошибке, полученную от Api', function(){
            var id = 1,
                expected = "Сообщение об ошибке",
                actual;

            spyOn(Api, 'remove').andReturn($q.reject(
                expected
            ));

            userApi.remove(id).then(null, function(respond) {
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

            userApi.remove(id).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(500);
        });
    });
});