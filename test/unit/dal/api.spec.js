'use strict';

describe('У объекта app.dal.api', function() {
    var $httpBackend,
        Api
    ;

    beforeEach(function() {
        module('app.dal.api');

        inject(function(_$httpBackend_, _Api_) {
            $httpBackend = _$httpBackend_;
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
                .expectGET(url)
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
            Api.setErrorHandler(errorHandler);

            $httpBackend
                .expectGET(url)
                .respond(404);

            Api.get(url);

            $httpBackend.flush();

            expect(errorHandler).toHaveBeenCalled();
        });

        it('должен возвращать сообщение об ошибке при отсутствии параметра status в ответе', function(){
            var url = '/test/url',
                message;

            $httpBackend
                .expectGET(url)
                .respond({});

            Api.get(url).then(null, function(response) {
                message = response;
            });

            $httpBackend.flush();

            expect(message).toBe('Ответ сервера не соответствует формату JSend');
        });

        it('должен возвращать сообщение об ошибке при неверном значении status в ответе', function(){
            var url = '/test/url',
                message;

            $httpBackend
                .expectGET(url)
                .respond({ status: 123 });

            Api.get(url).then(null, function(response) {
                message = response;
            });

            $httpBackend.flush();

            expect(message).toBe('Сервер возвратил некорректный статус ответа: 123');
        });

        it('должен возвращать сообщение об ошибке если status="error"', function(){
            var url = '/test/url',
                message;

            $httpBackend
                .expectGET(url)
                .respond({
                    status: 'error',
                    message: 'На сервере ошибка'
                });

            Api.get(url).then(null, function(response) {
                message = response;
            });

            $httpBackend.flush();

            expect(message).toBe('Сервер возвратил ошибку: На сервере ошибка');
        });

        it('должен возвращать сообщение об ошибке при отсутствии параметра data', function(){
            var url = '/test/url',
                message;

            $httpBackend
                .expectGET(url)
                .respond({
                    status: 'success'
                });

            Api.get(url).then(null, function(response) {
                message = response;
            });

            $httpBackend.flush();

            expect(message).toBe('Ответ сервера не содержит данных');
        });
    });

    describe('Метод post()', function() {
        it('должен отправлять данные и принимать ответ', function(){
            var url = '/test/url',
                data = {some: 'data'},
                expected = 'test string',
                actual;

            $httpBackend
                .expectPOST(url, data)
                .respond(expected);

            Api.post(url, data).then(function(response) {
                actual = response;
            });

            $httpBackend.flush();

            expect(actual.data).toBe(expected);
        });

        it('должен вызывать обработчик ошибок при сбое', function(){
            var url = '/test/url',
                errorHandler,
                data = {some: 'data'};

            errorHandler = jasmine.createSpy('errorHandler');
            Api.setErrorHandler(errorHandler);

            $httpBackend
                .expectPOST(url, data)
                .respond(404);

            Api.post(url, data);

            $httpBackend.flush();

            expect(errorHandler).toHaveBeenCalled();
        });
    });

    describe('Метод remove()', function() {
        it('должен вызывать URL и получать ответ', function(){
            var url = '/test/url',
                expected = 'test string',
                actual;

            $httpBackend
                .expectDELETE(url)
                .respond(expected);

            Api.remove(url).then(function(response) {
                actual = response;
            });

            $httpBackend.flush();

            expect(actual.data).toBe(expected);
        });

        it('должен вызывать обработчик ошибок при сбое', function(){
            var url = '/test/url',
                errorHandler;

            errorHandler = jasmine.createSpy('errorHandler');
            Api.setErrorHandler(errorHandler);

            $httpBackend
                .expectDELETE(url)
                .respond(404);

            Api.remove(url);

            $httpBackend.flush();

            expect(errorHandler).toHaveBeenCalled();
        });
    });

    describe('Метод put()', function() {
        it('должен отправлять данные и принимать ответ', function(){
            var url = '/test/url',
                data = {some: 'data'},
                expected = 'test string',
                actual;

            $httpBackend
                .expectPUT(url, data)
                .respond(expected);

            Api.put(url, data).then(function(response) {
                actual = response;
            });

            $httpBackend.flush();

            expect(actual.data).toBe(expected);
        });

        it('должен вызывать обработчик ошибок при сбое', function(){
            var url = '/test/url',
                errorHandler,
                data = {some: 'data'};

            errorHandler = jasmine.createSpy('errorHandler');
            Api.setErrorHandler(errorHandler);

            $httpBackend
                .expectPUT(url, data)
                .respond(404);

            Api.put(url, data);

            $httpBackend.flush();

            expect(errorHandler).toHaveBeenCalled();
        });
    });
});