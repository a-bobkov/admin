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

        it('Должен создавать URL, вызывать Api и возвращать полученные данные', function() {
            var expected = 'test',
                actual;

            spyOn(Api, 'get').andReturn($q.when({
                data: {
                    result: expected
                }
            }));

            UserApi.get(1).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(Api.get).toHaveBeenCalledWith("/users/1");
            expect(actual).toBe(expected);
        });

        it('Должен корерктно обрабатывать ошибку', function() {
            var expected = 404,
                actual;

            spyOn(Api, 'get').andReturn($q.reject({
                data: {
                    error_code: expected
                }
            }));

            UserApi.get(1).then(null, function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(Api.get).toHaveBeenCalledWith("/users/1");
            expect(actual).toBe(expected);
        });

    });

});