'use strict';

describe('У объекта app.dal.api', function() {
    var $httpBackend,
        api
    ;

    beforeEach(function() {
        module('app.dal.api');

        inject(function(_$httpBackend_, Api) {
            $httpBackend = _$httpBackend_;
            api = Api;
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

            api.get(url).then(function(response) {
                actual = response.data.data;
            });

            $httpBackend.flush();

            expect(actual).toBe(expected);
        });

        it('должен вызывать обработчик ошибок при сбое', function(){
            var url = '/test/url',
                errorHandler;

            errorHandler = jasmine.createSpy('errorHandler');
            api.setErrorHandler(errorHandler);

            $httpBackend
                .expectGET(url)
                .respond(404);

            api.get(url);

            $httpBackend.flush();

            expect(errorHandler).toHaveBeenCalled();
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

            api.post(url, data).then(function(response) {
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
            api.setErrorHandler(errorHandler);

            $httpBackend
                .expectPOST(url, data)
                .respond(404);

            api.post(url, data);

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

            api.remove(url).then(function(response) {
                actual = response;
            });

            $httpBackend.flush();

            expect(actual.data).toBe(expected);
        });

        it('должен вызывать обработчик ошибок при сбое', function(){
            var url = '/test/url',
                errorHandler;

            errorHandler = jasmine.createSpy('errorHandler');
            api.setErrorHandler(errorHandler);

            $httpBackend
                .expectDELETE(url)
                .respond(404);

            api.remove(url);

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

            api.put(url, data).then(function(response) {
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
            api.setErrorHandler(errorHandler);

            $httpBackend
                .expectPUT(url, data)
                .respond(404);

            api.put(url, data);

            $httpBackend.flush();

            expect(errorHandler).toHaveBeenCalled();
        });
    });
});