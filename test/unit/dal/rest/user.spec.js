'use strict';

describe('У объекта app.dal.rest.user', function() {
    var $rootScope,
        $q,
        UserApi,
        Api;

    beforeEach(function() {
        module('app.dal.rest.user');

        inject(function(_$rootScope_, _$q_, _UserApi_, _Api_) {
            $rootScope = _$rootScope_;
            $q = _$q_;
            UserApi = _UserApi_;
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

            UserApi.get(1).then(function(respond) {
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

            UserApi.get(1).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe('Ответ сервера не содержит секции user');
        });

        it('должен возвращать строку с сообщением об ошибке, полученную от Api', function(){
            var expected = "Сообщение об ошибке",
                actual;

            spyOn(Api, 'get').andReturn($q.reject(
                expected
            ));

            UserApi.get(1).then(null, function(respond) {
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

            UserApi.get(1).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(actual).toBe(500);
        });

    });

});