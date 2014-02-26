'use strict';

describe('http-mock', function() {
    var $httpBackend,
        $http,
        $rootScope,
        Collection,
        Item,
        users,
        User,
        Dealer;

    beforeEach(function() {
        module('app.dal.entities.user');

        inject(function(_$httpBackend_, _$http_, _$rootScope_, _Collection_, _Item_, _users_, _User_, _Dealer_) {
            $httpBackend = _$httpBackend_;
            $http = _$http_;
            $rootScope = _$rootScope_;
            Collection = _Collection_;
            Item = _Item_;
            users = _users_;
            User = _User_;
            Dealer = _Dealer_;
        });

        setHttpMock($httpBackend, Collection, Item, User);
    });

    describe('Методы CRUD должны', function() {

        it('remove - удалять данные пользователя', function() {
            var data = {
                    email: 'new@maxposter.ru',
                    last_login: '2013-12-01',
                    status: {id: 'active'},
                    group: {id: 1},
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
                        manager: {id: 3}
                    }
                },
                actualSuccess,
                actualError;

            users.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();
            var usersArr = actualSuccess;
            expect(usersArr.length).toBe(15);

            var dealer = new Dealer();
            dealer._fillItem(data.dealer);
            var user = new User();
            user._fillItem(data);
            user.dealer = dealer;

            users.save(user).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();
            var savedUser = actualSuccess;
            users.getAll().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $rootScope.$digest();
            var usersArr = actualSuccess;
            expect(usersArr.length).toBe(16);

            users.remove(savedUser.id).then(function(respond) {
                actualSuccess = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();
            expect(usersArr.length).toBe(15);
        });

        it('post - сохранять данные нового пользователя', function() {
            var data = {
                    email: 'new@maxposter.ru',
                    last_login: '2013-12-01',
                    status: {id: 'active'},
                    group: {id: 1},
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
                        manager: {id: 3}
                    }
                },
                actualSuccess,
                actualError;

            var dealer = new Dealer();
            dealer._fillItem(data.dealer);
            var user = new User();
            user._fillItem(data);
            user.dealer = dealer;

            users.save(user).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            $rootScope.$digest();

            var savedUser = actualSuccess;

            users.get(savedUser.id).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            $rootScope.$digest();

            expect(savedUser.id).toBeDefined();
            expect(savedUser.dealer.id).toBeDefined();
            delete savedUser.id;
            delete savedUser.dealer.id;
            expect(savedUser).toEqualData(user);
        });

        it('post - выдавать ошибки при попытке сохранения пользователя со ссылками на несуществующие в БД объекты', function() {
            var data = {
                    email: 'new@maxposter.ru',
                    last_login: '2013-12-01',
                    status: {id: 'active'},
                    group: {id: 1},
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
                        manager: {id: 3}
                    }
                },
                actualSuccess,
                actualError;

            var dealer = new Dealer();
            dealer._fillItem(data.dealer);
            var user = new User();
            user._fillItem(data);
            user.dealer = dealer;

            dealer.city = {id: 999};

            users.save(user).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            $rootScope.$digest();

            expect(actualError.data).toEqual({
                status: 'error',
                message : 'Ошибка при создании',
                errors: [{message: 'Не найдена ссылка для элемента {"id":999}'}]
            });
        });

        it('put - сохранять данные измененного пользователя', function() {
            var data = {
                    email: 'new@maxposter.ru',
                    last_login: '2013-12-01',
                    status: {id: 'active'},
                    group: {id: 1},
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
                        manager: {id: 3}
                    }
                },
                actualSuccess,
                actualError;

            var dealer = new Dealer();
            dealer._fillItem(data.dealer);
            var user = new User();
            user._fillItem(data);
            user.dealer = dealer;

            users.save(user).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var savedUser = actualSuccess;
            savedUser.dealer.company_name = 'Самая новая компания';

            users.save(savedUser).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();
            var savedUser2 = actualSuccess;
            expect(savedUser2.dealer.company_name).toBe('Самая новая компания');
        });

        it('put - выдавать ошибки при попытке сохранения пользователя со ссылками на несуществующие в БД объекты', function() {
            var data = {
                    email: 'new@maxposter.ru',
                    last_login: '2013-12-01',
                    status: {id: 'active'},
                    group: {id: 1},
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
                        manager: {id: 3}
                    }
                },
                actualSuccess,
                actualError;

            var dealer = new Dealer();
            dealer._fillItem(data.dealer);
            var user = new User();
            user._fillItem(data);
            user.dealer = dealer;

            users.save(user).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
                console.log(actualError.data.errors);
            });
            $httpBackend.flush();
            $rootScope.$digest();
            var savedUser = actualSuccess;

            savedUser.dealer.city = {id: 999};
            users.save(savedUser).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            $rootScope.$digest();

            expect(actualError.data).toEqual({
                status: 'error',
                message : 'Ошибка при обновлении',
                errors: [{message: 'Не найдена ссылка для элемента {"id":999}'}]
            });
        });

        it('get - возвращать данные пользователя', function() {
            var actualSuccess,
                actualError;

            users.getDirectories().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            users.get(5).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            expect(actualSuccess.dealer.contact_name).toEqual('Аверин Константин Петрович');
        });

        it('get - возвращать ошибку, если пользователь не найден', function() {
            var actualSuccess,
                actualError;

            users.get(999).then(function(respond) {
                actualSuccess = respond;
            }, function(respond){
                actualError = respond;
            });

            $httpBackend.flush();
            $rootScope.$digest();

            expect(actualError.errorMessage).toEqual('В коллекции не найден элемент с id: 999');
        });

        it('get - загружать пользователей после опций', function() {
            var actualSuccess,
                actualError;

            users.getDirectories().then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();
            var city = actualSuccess.cities[0];
            var market = actualSuccess.markets[2];

            users.get(5).then(function(respond) {
                actualSuccess = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();
            var user = actualSuccess;

            expect(user.dealer.city).toBe(city);
            expect(user.dealer.market).toBe(market);
        });
    });
});
