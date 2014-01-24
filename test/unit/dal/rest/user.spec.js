'use strict';

describe('У объекта app.dal.rest.user', function() {
    var $rootScope, $q, 
        UserApi,
        Api
    ;

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
            spyOn(Api, 'get').andReturn($q.when({
                data: 'test'
            }));

            var respond;
            UserApi.get(1).then(function(r) { respond = r; });

            $rootScope.$digest();
            expect(Api.get).toHaveBeenCalledWith("/users/1");
            expect(respond).toBe({
                data: 'test'
            });
        });

    });

});