'use strict';

describe('app-mocked', function() {
    var $httpBackend,
        $http,
        $rootScope,
        usersLoader,
        User,
        Users,
        Group;

    beforeEach(function() {
        module('app.dal.entities.user');

        inject(function(_$httpBackend_, _$http_, _$rootScope_, _usersLoader_, _User_, _Users_, _Group_) {
            $httpBackend = _$httpBackend_;
            $http = _$http_;
            $rootScope = _$rootScope_;
            usersLoader = _usersLoader_;
            User = _User_;
            Users = _Users_;
            Group = _Group_;
        });

        setHttpMock($httpBackend, usersLoader, User, Users);
    });

        it('query - фильтровать данные пользователей', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                filters: [
                    { type: 'equal', fields: ['status'], value: 'active' }
                ]
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var len = directories.users.getItems().length;

            expect(len).toEqual(10);
        });

    describe('Методы CRUD должны', function() {
        it('post - сохранять данные нового пользователя', function() {
            var data = {
                    email: 'new@maxposter.ru',
                    last_login: '2013-12-01',
                    status: 'active',
                    group: {id: 2},
                    dealer: {
                        company_name: 'Новая компания',
                        city: {id: 5},
                        market: {id: 8},
                        metro: {id: 10},
                        adress: '191040, Ленинский проспект, 150, оф.505',
                        fax: '+7-812-232-4123',
                        dealer_email: 'demo@demo.ru',
                        site: 'http://www.w3schools.com',
                        contact_name: 'Аверин Константин Петрович',
                        phone: '+7-812-232-4123',
                        phone_from: '10',
                        phone_to: '20',
                        phone2: '+7-812-232-4124',
                        phone2_from: '11',
                        phone2_to: '21',
                        phone3: '+7-812-232-4125',
                        phone3_from: '7',
                        phone3_to: '15',
                        company_info: 'Здесь может быть произвольный текст...',
                        manager: {id: 4}
                    }
                },
                actualSuccess,
                actualError;
            var directories;

            usersLoader.loadItems().then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var len = directories.users.getItems().length;

            var user = new User(data, directories);
            user.save(directories).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
                console.log(actualError);
            });

            $httpBackend.flush();
            $rootScope.$digest();

            var savedUser = actualSuccess;

            usersLoader.loadItems().then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var newUser = directories.users.get(savedUser.id);
            var newLen = directories.users.getItems().length;

            expect(newUser).toEqual(savedUser);
            expect(newLen).toEqual(len+1);
        });

        it('post - возвращать ошибку при попытке сохранения пользователя со ссылками на объекты, не существующие в БД', function() {
            var dataUser = {
                    email: 'new@maxposter.ru',
                    last_login: '2013-12-01',
                    status: 'active',
                    group: {id: 2},
                    dealer: {
                        company_name: 'Новая компания',
                        city: {id: 5},
                        market: {id: 8},
                        metro: {id: 10},
                        adress: '191040, Ленинский проспект, 150, оф.505',
                        fax: '+7-812-232-4123',
                        dealer_email: 'demo@demo.ru',
                        site: 'http://www.w3schools.com',
                        contact_name: 'Аверин Константин Петрович',
                        phone: '+7-812-232-4123',
                        phone_from: '10',
                        phone_to: '20',
                        phone2: '+7-812-232-4124',
                        phone2_from: '11',
                        phone2_to: '21',
                        phone3: '+7-812-232-4125',
                        phone3_from: '7',
                        phone3_to: '15',
                        company_info: 'Здесь может быть произвольный текст...',
                        manager: {id: 4}
                    }
                },
                dataGroup = {
                    id: 99, name: 'Новая'
                },
                actualSuccess,
                actualError;
            var directories;

            usersLoader.loadItems().then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var newUser = new User(dataUser, directories);
            var newGroup = new Group(dataGroup);
            newUser.group = newGroup;

            newUser.save(directories).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            $rootScope.$digest();

            expect(actualError.data).toEqualData({
                status: 'error',
                message: 'Ошибка при создании',
                errors: 'Не найден элемент по ссылке group: {"id":99}'
            });
        });

        it('get - возвращать данные пользователя', function() {
            var actualSuccess,
                actualError;
            var directories;

            usersLoader.loadItem(5).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var user = directories.user;
            expect(user.dealer.contact_name).toEqual('Аверин Константин Петрович');
        });

        it('get - возвращать ошибку, если пользователь не найден', function() {
            var actualSuccess,
                actualError;
            var directories;

            usersLoader.loadItem(9999).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(actualError.data).toEqualData({
                status: 'error',
                message: 'Ошибка при получении',
                errors: 'Не найден пользователь с id: 9999'
            });
        });

        it('put - сохранять данные измененного пользователя', function() {
            var actualSuccess,
                actualError;

            var directories;

            usersLoader.loadItems().then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var user = directories.users.get(1);
            user.email = 'new@mail.ru';
            user.group = directories.groups.get(3);

            user.save(directories).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            usersLoader.loadItems().then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var savedUser = directories.users.get(1);
            expect(savedUser.email).toBe(user.email);
            expect(savedUser.group).toEqual(user.group);
        });

        it('put - возвращать ошибку при попытке сохранения пользователя со ссылками на объекты, не существующие в БД', function() {
            var dataGroup = {
                    id: 99, name: 'Новая'
                },
                actualSuccess,
                actualError;
            var directories;

            usersLoader.loadItems().then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var user = directories.users.get(1);
            var newGroup = new Group(dataGroup);
            user.group = newGroup;

            user.save(directories).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            $rootScope.$digest();

            expect(actualError.data).toEqualData({
                status: 'error',
                message: 'Ошибка при обновлении',
                errors: 'Не найден элемент по ссылке group: {"id":99}'
            });
        });

        it('put - возвращать ошибку при попытке сохранения пользователя со ссылками на объекты, не существующие в БД', function() {
            var actualSuccess,
                actualError;
            var directories;

            var user = new User({id: 9999});

            user.save().then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(actualError.data).toEqualData({
                status: 'error',
                message: 'Ошибка при обновлении',
                errors: 'Не найден пользователь с id: 9999'
            });
        });

        it('remove - удалять пользователя', function() {
            var actualSuccess,
                actualError;
            var directories;

            usersLoader.loadItems().then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var items = directories.users.getItems();
            var len = items.length;

            items[0].remove().then(function(respond) {
                actualSuccess = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            usersLoader.loadItems().then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var items = directories.users.getItems();
            expect(items.length).toBe(len-1);
        });

        it('remove - возвращать ошибку, если пользователь не найден', function() {
            var actualSuccess,
                actualError;
            var directories;

            var user = new User({id: 9999});

            user.remove().then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(actualError.data).toEqualData({
                status: 'error',
                message: 'Ошибка при удалении',
                errors: 'Не найден пользователь с id: 9999'
            });
        });
    });
});
