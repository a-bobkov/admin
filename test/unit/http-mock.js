// проба пера по созданию мини-сервера http для комплексных тестов

'use strict';

describe('http-mock', function() {
    var $httpBackend,
        $http,
        $rootScope,
        users;

    beforeEach(function() {
        module('app.dal.entities.user');

        inject(function(_$httpBackend_, _$http_, _$rootScope_, _users_) {
            $httpBackend = _$httpBackend_;
            $http = _$http_;
            $rootScope = _$rootScope_;
            users = _users_;
        });
    });

    beforeEach(function() {
        var usersArray = [];
        var _addItem = function(itemData) {
            usersArray.push(itemData);
        }
        _addItem({id: 1, name: 'Пользователь один'});
        _addItem({id: 2, name: 'Пользователь два'});

        var regexQuery = /^\/api2\/users\/partial$/;
        $httpBackend.whenGET(regexQuery).respond(function(method, url, data) {
            return [200, {
                status: 'success',
                data: {
                    users: usersArray
                }
            }];
        });

        var regexGet = /^\/api2\/users\/(?:([^\/]+))$/;
        $httpBackend.whenGET(regexGet).respond(function(method, url, data) {
            var id = parseInt(url.replace(regexGet,'$1'));
            var user = _.find(usersArray, {id: id});
            if (typeof user === 'object') {
                return [200, {
                    status: 'success',
                    data: {
                        user: user
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

            users.get(1).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            expect(actualSuccess).toEqualData(expected);
        });

        it('возвращать ошибку, если пользователь не найден', function() {
        var actualSuccess,
            actualError;

            users.get(5).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            $rootScope.$digest();

            expect(actualError.errorMessage).toEqual('В коллекции не найден элемент с id: 5');
        });
    });
});

