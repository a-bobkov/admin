'use strict';

describe('У объекта app.dal.rest.user', function() {
    var $rootScope,
        $q,
        userApi,
        api;

    beforeEach(function() {
        module('app.dal.rest.user');

        inject(function(_$rootScope_, _$q_, _UserApi_, _Api_) {
            $rootScope = _$rootScope_;
            $q = _$q_;
            userApi = _UserApi_;
            api = _Api_;
        });
    });

    describe('Метод get(id)', function() {

        it('Должен создавать URL, вызывать Api и возвращать полученные данные', function() {
            var expected = 'test',
                actual;

            spyOn(api, 'get').andReturn($q.when({
                data: {
                    result: expected
                }
            }));

            userApi.get(1).then(function(respond) {
                actual = respond;
            });

            $rootScope.$digest();

            expect(api.get).toHaveBeenCalledWith("/users/1");
            expect(actual).toBe(expected);
        });

    });

});