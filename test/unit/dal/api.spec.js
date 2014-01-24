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
                expected = 'test string',
                actual;

            $httpBackend
                .expectGET(url)
                .respond(expected);

            api.get(url).then(function(response) {
                actual = response;
            });

            $httpBackend.flush();

            expect(actual.data).toBe(expected);
        });

        it('должен вызывать обработчик ошибок при сбое', function(){
            var url = '/test/url',
                errorHandler;

            errorHandler = jasmine.createSpy('errorHandler')
            api.setErrorHandler(errorHandler);

            $httpBackend
                .expectGET(url)
                .respond(404);

            api.get(url);

            $httpBackend.flush();

            expect(errorHandler).toHaveBeenCalled();
        });
    });


});