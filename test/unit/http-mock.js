// проба пера по созданию мини-сервера http для комплексных тестов

'use strict';

describe('http-mock', function() {
    var $httpBackend,
        $rootScope,
        users;

    beforeEach(function() {
        module('app.dal.entities.user');

        inject(function(_$httpBackend_, _$rootScope_, _users_) {
            $httpBackend = _$httpBackend_;
            $rootScope = _$rootScope_;
            users = _users_;
        });
    });

    beforeEach(function() {
        var usersArray = [
                {id: 1, name: 'Пользователь один'},
                {id: 2, name: 'Пользователь два'}
            ];
        
        users._addArray(usersArray);

        var regexGet = /^\/users\/(?:([^\/]+))$/;

        $httpBackend.whenGET(regexGet).respond(function(method, url, data) {
            var id = parseInt(url.replace(regexGet,'$1'));
            var user = users._findItem(id);
            if (typeof user === 'object') {
                return [200, {
                    status: 'success',
                    data: {
                        user: user._serialize()
                    }
                }];
            } else {
                return [400, {
                    status: 'error',
                    message: 'Пользователь не найден'
                }];
            }
        });
    });

    describe('Метод get()', function() {
        it('возвращать данные пользователя', function() {
        var actualSuccess,
            actualError,
            expected = {
                id: 1,
                name: 'Пользователь один'
            }

            users.getUser(1).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            expect(actualSuccess).toEqualData(expected);
        });

        it('возвращать ошибку, если пользователь не найден', function() {
        var actualSuccess,
            actualError,
            expected = 'В коллекции не найден элемент с id: 5';

            users.getUser(5).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

//            $httpBackend.flush();
            $rootScope.$digest();

            expect(actualError).toEqualData(expected);
        });
    });
});

