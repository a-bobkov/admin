'use strict';

describe('У объекта app.dal.api', function() {
    var $httpBackend,
        $log,
        Api
    ;

    beforeEach(function() {
        module('app.dal.api');

        inject(function(_$httpBackend_, _$log_, _Api_) {
            $httpBackend = _$httpBackend_;
            $log = _$log_;
            Api = _Api_;
        });
    });

    describe('Метод get()', function() {
        it('должен возвращать запрошенные данные', function(){
            var url = '/test/url',
                expected = {
                    one: 'data',
                    two: 'other data'
                },
                actual;

            $httpBackend
                .expectGET('/api2' + url)
                .respond({
                    status: 'success',
                    data: expected
                });

            Api.get(url).then(function(response) {
                actual = response;
            });

            $httpBackend.flush();

            expect(actual).toBe(expected);
        });

        it('должен вызывать обработчик ошибок если код ответа не 2xx', function(){
            var url = '/test/url',
                errorHandler;

            errorHandler = jasmine.createSpy('errorHandler');
            Api._setErrorHandler(errorHandler);

            $httpBackend
                .expectGET('/api2' + url)
                .respond(404);

            Api.get(url);

            $httpBackend.flush();

            expect(errorHandler).toHaveBeenCalled();
        });

        it('должен возвращать сообщение об ошибке при отсутствии параметра status в ответе', function(){
            var url = '/test/url',
                actualSuccess,
                actualError;

            $httpBackend
                .expectGET('/api2' + url)
                .respond({});

            spyOn($log, 'error').andReturn(null);

            Api.get(url).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Ответ сервера не соответствует формату JSend');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Ответ сервера не соответствует формату JSend');
        });

        it('должен возвращать сообщение об ошибке при неверном значении status в ответе', function(){
            var url = '/test/url',
                actualSuccess,
                actualError;

            $httpBackend
                .expectGET('/api2' + url)
                .respond({ status: 123 });

            spyOn($log, 'error').andReturn(null);

            Api.get(url).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Сервер возвратил некорректный статус ответа: 123');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Сервер возвратил некорректный статус ответа: 123');
        });

        it('должен возвращать сообщение об ошибке если status="error"', function(){
            var url = '/test/url',
                actualSuccess,
                actualError;

            $httpBackend
                .expectGET('/api2' + url)
                .respond({
                    status: 'error',
                    message: 'Сбой базы данных'
                });

            spyOn($log, 'error').andReturn(null);

            Api.get(url).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Сервер возвратил ошибку: Сбой базы данных');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Сервер возвратил ошибку: Сбой базы данных');
        });

        it('должен возвращать сообщение об ошибке при отсутствии параметра data', function(){
            var url = '/test/url',
                actualSuccess,
                actualError;

            $httpBackend
                .expectGET('/api2' + url)
                .respond({
                    status: 'success'
                });

            spyOn($log, 'error').andReturn(null);

            Api.get(url).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Ответ сервера не содержит данных');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Ответ сервера не содержит данных');
        });
    });

    describe('Метод post()', function() {
        it('должен возвращать отправленные данные, а также присвоенный id', function(){
            var url = '/test/url',
                data,
                expected,
                actual;
            var city = {
                id:5,
                name: 'Городок'
            }

            data = {
                one: 'data',
                two: 'other data',
                city: city
            };

            expected = angular.extend(data, {
                id:  '999',
                ext: 'extra data'
            });

            $httpBackend
                .expectPOST('/api2' + url, data)
                .respond({
                    status: 'success',
                    data: {
                        user: expected
                    }
                });

            Api.post(url, data).then(function(response) {
                actual = response;
            });

            $httpBackend.flush();

            var key;
            for (key in expected) {
                expect(actual.user[key]).toBe(expected[key]);
            }

        });

        it('должен вызывать обработчик ошибок если код ответа не 2xx', function(){
            var url = '/test/url',
                data = {
                    one: 'data',
                    two: 'other data'
                },
                errorHandler;

            errorHandler = jasmine.createSpy('errorHandler');
            Api._setErrorHandler(errorHandler);

            $httpBackend
                .expectPOST('/api2' + url, data)
                .respond(404);

            Api.post(url, data);

            $httpBackend.flush();

            expect(errorHandler).toHaveBeenCalled();
        });

        it('должен возвращать сообщение об ошибке при отсутствии параметра status в ответе', function(){
            var url = '/test/url',
                data = {
                    one: 'data',
                    two: 'other data'
                },
                actualSuccess,
                actualError;

            $httpBackend
                .expectPOST('/api2' + url, data)
                .respond({});

            spyOn($log, 'error').andReturn(null);

            Api.post(url, data).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Ответ сервера не соответствует формату JSend');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Ответ сервера не соответствует формату JSend');
        });

        it('должен возвращать сообщение об ошибке при неверном значении status в ответе', function(){
            var url = '/test/url',
                data = {
                    one: 'data',
                    two: 'other data'
                },
                actualSuccess,
                actualError;

            $httpBackend
                .expectPOST('/api2' + url, data)
                .respond({ status: 123 });

            spyOn($log, 'error').andReturn(null);

            Api.post(url, data).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Сервер возвратил некорректный статус ответа: 123');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Сервер возвратил некорректный статус ответа: 123');
        });

        it('должен возвращать сообщение об ошибке если status="error"', function(){
            var url = '/test/url',
                data = {
                    one: 'data',
                    two: 'other data'
                },
                actualSuccess,
                actualError;

            $httpBackend
                .expectPOST('/api2' + url, data)
                .respond({
                    status: 'error',
                    message: 'Сбой базы данных'
                });

            spyOn($log, 'error').andReturn(null);

            Api.post(url, data).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Сервер возвратил ошибку: Сбой базы данных');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Сервер возвратил ошибку: Сбой базы данных');
        });

        it('должен возвращать сообщение об ошибке при отсутствии параметра data', function(){
            var url = '/test/url',
                data = {
                    one: 'data',
                    two: 'other data'
                },
                actualSuccess,
                actualError;

            $httpBackend
                .expectPOST('/api2' + url, data)
                .respond({
                    status: 'success'
                });

            spyOn($log, 'error').andReturn(null);

            Api.post(url, data).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Ответ сервера не содержит данных');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Ответ сервера не содержит данных');
        });
    });

    describe('Метод put()', function() {
        it('должен вызывать обработчик ошибок если код ответа не 2xx', function(){
            var url = '/api2/users/999',
                data = {
                    id:  1,
                    one: 'data',
                    two: 'other data'
                },
                errorHandler;

            errorHandler = jasmine.createSpy('errorHandler');
            Api._setErrorHandler(errorHandler);

            $httpBackend
                .expectPUT('/api2' + url, data)
                .respond(404);

            Api.put(url, data);

            $httpBackend.flush();

            expect(errorHandler).toHaveBeenCalled();
        });

        it('должен возвращать сообщение об ошибке при отсутствии параметра status в ответе', function(){
            var url = '/api2/users/1',
                data = {
                    id:  1,
                    one: 'data',
                    two: 'other data'
                },
                actualSuccess,
                actualError;

            $httpBackend
                .expectPUT('/api2' + url, data)
                .respond({});

            spyOn($log, 'error').andReturn(null);

            Api.put(url, data).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Ответ сервера не соответствует формату JSend');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Ответ сервера не соответствует формату JSend');
        });

        it('должен возвращать сообщение об ошибке при неверном значении status в ответе', function(){
            var url = '/api2/users/1',
                data = {
                    id:  1,
                    one: 'data',
                    two: 'other data'
                },
                actualSuccess,
                actualError;

            $httpBackend
                .expectPUT('/api2' + url, data)
                .respond({ status: 123 });

            spyOn($log, 'error').andReturn(null);

            Api.put(url, data).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Сервер возвратил некорректный статус ответа: 123');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Сервер возвратил некорректный статус ответа: 123');
        });

        it('должен возвращать сообщение об ошибке если status="error"', function(){
            var url = '/api2/users/1',
                data = {
                    id:  1,
                    one: 'data',
                    two: 'other data'
                },
                actualSuccess,
                actualError;

            $httpBackend
                .expectPUT('/api2' + url, data)
                .respond({
                    status: 'error',
                    message: 'Сбой базы данных'
                });

            spyOn($log, 'error').andReturn(null);

            Api.put(url, data).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Сервер возвратил ошибку: Сбой базы данных');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Сервер возвратил ошибку: Сбой базы данных');
        });

        it('должен возвращать сообщение об ошибке при отсутствии параметра data', function(){
            var url = '/api2/users/1',
                data = {
                    id:  1,
                    one: 'data',
                    two: 'other data'
                },
                actualSuccess,
                actualError;

            $httpBackend
                .expectPUT('/api2' + url, data)
                .respond({
                    status: 'success'
                });

            spyOn($log, 'error').andReturn(null);

            Api.put(url, data).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Ответ сервера не содержит данных');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Ответ сервера не содержит данных');
        });

        it('должен возвращать отправленные данные', function(){
            var url = '/api2/users/1',
                data,
                expected,
                actual;

            data = {
                id:  1,
                one: 'data',
                two: 'other data'
            };

            expected = angular.extend(data, {
                ext: 'extra data'
            });

            $httpBackend
                .expectPUT('/api2' + url, data)
                .respond({
                    status: 'success',
                    data: {
                        user: expected
                    }
                });

            Api.put(url, data).then(function(response) {
                actual = response;
            });

            $httpBackend.flush();

            var key;
            for (key in expected) {
                expect(actual.user[key]).toBe(expected[key]);
            }
        });
    });

    describe('Метод remove()', function() {
        it('должен вызывать обработчик ошибок если код ответа не 2xx', function(){
            var url = '/api2/users/999',
                errorHandler;

            errorHandler = jasmine.createSpy('errorHandler');
            Api._setErrorHandler(errorHandler);

            $httpBackend
                .expectDELETE('/api2' + url)
                .respond(404);

            Api.remove(url);

            $httpBackend.flush();

            expect(errorHandler).toHaveBeenCalled();
        });

        it('должен возвращать сообщение об ошибке при отсутствии параметра status в ответе', function(){
            var url = '/api2/users/1',
                actualSuccess,
                actualError;

            $httpBackend
                .expectDELETE('/api2' + url)
                .respond({});

            spyOn($log, 'error').andReturn(null);

            Api.remove(url).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Ответ сервера не соответствует формату JSend');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Ответ сервера не соответствует формату JSend');
        });

        it('должен возвращать сообщение об ошибке при неверном значении status в ответе', function(){
            var url = '/api2/users/1',
                actualSuccess,
                actualError;

            $httpBackend
                .expectDELETE('/api2' + url)
                .respond({ status: 123 });

            spyOn($log, 'error').andReturn(null);

            Api.remove(url).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Сервер возвратил некорректный статус ответа: 123');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Сервер возвратил некорректный статус ответа: 123');
        });

        it('должен возвращать сообщение об ошибке если status="error"', function(){
            var url = '/api2/users/1',
                actualSuccess,
                actualError;

            $httpBackend
                .expectDELETE('/api2' + url)
                .respond({
                    status: 'error',
                    message: 'Сбой базы данных'
                });

            spyOn($log, 'error').andReturn(null);

            Api.remove(url).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Сервер возвратил ошибку: Сбой базы данных');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Сервер возвратил ошибку: Сбой базы данных');
        });

        it('должен возвращать сообщение об ошибке при отсутствии параметра data', function(){
            var url = '/api2/users/1',
                actualSuccess,
                actualError;

            $httpBackend
                .expectDELETE('/api2' + url)
                .respond({
                    status: 'success'
                });

            spyOn($log, 'error').andReturn(null);

            Api.remove(url).then(function(response) {
                actualSuccess = response;
            }, function(response) {
                actualError = response;
            });

            $httpBackend.flush();
            expect($log.error).toHaveBeenCalledWith('Ответ сервера не содержит данных');
            expect(actualSuccess).toBeUndefined;
            expect(actualError.errorMessage).toBe('Ответ сервера не содержит данных');
        });

        it('должен принимать null в качестве данных', function(){
            var url = '/api2/users/1',
                expected = null,
                actual;

            $httpBackend
                .expectDELETE('/api2' + url)
                .respond({
                    status: 'success',
                    data: expected
                });

            Api.remove(url).then(function(response) {
                actual = response;
            });

            $httpBackend.flush();

            expect(actual).toBe(expected);
        });
    });
});