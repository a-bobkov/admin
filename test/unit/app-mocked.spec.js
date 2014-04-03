'use strict';

describe('app-mocked', function() {
    var $httpBackend,
        $http,
        $rootScope,
        usersLoader,
        User,
        Users,
        Group;

    function getDeepValue(item, field) {
        var value = item[field.shift()];
        if (field.length && value) {
            return getDeepValue(value, field);
        } else {
            return value;
        }
    }

    beforeEach(function() {
        module('max.dal.entities.user');

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

    describe('Методы query должны', function() {

        it('equal - фильтровать данные пользователей по равенству в одном поле', function() {
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

            expect(_.every(directories.users.getItems(), function(value) {
                var status = String(value.status.id);
                return (status === 'active');
            })).toBeTruthy();
        });

        it('equal - фильтровать данные пользователей по равенству в нескольких полях', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                filters: [
                    { type: 'equal', fields: ['status', 'group'], value: '3' }
                ]
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(_.every(directories.users.getItems(), function(value) {
                var status = String(value.status.id);
                var group = String(value.group.id);
                return (status === '3' || group === '3');
            })).toBeTruthy();
        });

        it('equal - фильтровать данные пользователей по равенству в полях во вложенных объектах', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                filters: [
                    { type: 'equal', fields: ['dealer.companyName', 'group'], value: 'Демокомпания' }
                ]
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(_.every(directories.users.getItems(), function(value) {
                var companyName = String(value.dealer.companyName);
                var group = String(value.group.id);
                return (companyName === 'Демокомпания' || group === 'Демокомпания');
            })).toBeTruthy();
        });

        it('equal - значение фильтра может быть числом', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                filters: [
                    { type: 'equal', fields: ['id'], value: 1 }
                ]
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(_.every(directories.users.getItems(), function(value) {
                var id = String(value.id);
                return (id === '1');
            })).toBeTruthy();
        });

        it('in - фильтровать данные пользователей по равенству в одном поле', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                filters: [
                    { type: 'in', fields: ['status'], value: ['inactive', 'blocked'] }
                ]
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(_.every(directories.users.getItems(), function(value) {
                var status = String(value.status.id);
                return (status === 'inactive' || status === 'blocked');
            })).toBeTruthy();
        });

        it('in - фильтровать данные пользователей по равенству в нескольких поле', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                filters: [
                    { type: 'in', fields: ['status', 'group'], value: ['blocked', '2'] }
                ]
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(_.every(directories.users.getItems(), function(value) {
                var status = String(value.status.id);
                var group = String(value.group.id);
                return (status === 'blocked' || status === '2' || group === 'blocked' || group === '2');
            })).toBeTruthy();
        });

        it('in - фильтровать данные пользователей по равенству в полях во вложенных объектах', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                filters: [
                    { type: 'in', fields: ['dealer.companyName', 'group'], value: ['Свет', '3'] }
                ]
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(_.every(directories.users.getItems(), function(value) {
                var companyName = value.dealer && String(value.dealer.companyName);
                var group = String(value.group.id);
                return (companyName === 'Свет' || companyName === '3' || group === 'Свет' || group === '3');
            })).toBeTruthy();
        });

        it('in - значение фильтра может быть массивом чисел', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                filters: [
                    { type: 'in', fields: ['id'], value: [1, 2] }
                ]
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(_.every(directories.users.getItems(), function(value) {
                var id = String(value.id);
                return (id === '1' || id === '2');
            })).toBeTruthy();
        });

        it('contain - фильтровать данные пользователей по подстроке в одном поле', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                filters: [
                    { type: 'contain', fields: ['lastLogin'], value: ['2000'] }
                ]
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(_.every(directories.users.getItems(), function(value) {
                var lastLogin = String(value.lastLogin);
                return (lastLogin.indexOf('2000') !== -1);
            })).toBeTruthy();
        });

        it('contain - фильтровать данные пользователей по подстроке в нескольких полях', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                filters: [
                    { type: 'contain', fields: ['email', 'status'], value: ['act'] }
                ]
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(_.every(directories.users.getItems(), function(value) {
                var email = String(value.email);
                var status = String(value.status.id);
                return (email.indexOf('act') !== -1 || status.indexOf('act') !== -1);
            })).toBeTruthy();
        });

        it('contain - фильтровать данные пользователей по подстроке в полях во вложенных объектах', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                filters: [
                    { type: 'contain', fields: ['email', 'dealer.companyName'], value: ['компания'] }
                ]
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(_.every(directories.users.getItems(), function(value) {
                var email = String(value.email);
                var companyName = String(value.dealer.companyName);
                return (email.indexOf('компания') !== -1 || companyName.indexOf('компания') !== -1);
            })).toBeTruthy();
        });

        it('contain - значение фильтра может быть числом', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                filters: [
                    { type: 'contain', fields: ['lastLogin'], value: 2000 }
                ]
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(_.every(directories.users.getItems(), function(value) {
                var lastLogin = String(value.lastLogin);
                return (lastLogin.indexOf('2000') !== -1);
            })).toBeTruthy();
        });

        it('filters - комбинация трех разных фильтров', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                filters: [
                    { type: 'contain', fields: ['id', 'email', 'dealer.companyName'], value: '1' },
                    { type: 'in', fields: ['status'], value: ['active'] },
                    { type: 'equal', fields: ['dealer.manager'], value: '2' }
                ]
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(_.every(directories.users.getItems(), function(value) {
                var id = String(value.id);
                var email = String(value.email);
                var companyName = String(value.dealer.companyName);
                var status = String(value.status.id);
                var manager = String(value.dealer.manager.id);
                return ((id.indexOf('1') !== -1 || email.indexOf('1') !== -1 || companyName.indexOf('1') !== -1) 
                    && (status === 'active') && (manager === '2'));
            })).toBeTruthy();
        });

        it('если параметр filters в запросе указан, то в ответе filters должен быть таким же', function() {
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

            var pars = directories.users.getParams();
            expect(pars.filters).toEqual(params.filters);
        });

        it('если параметр filters в запросе НЕ указан, то в ответе filters должен быть пустым массивом', function() {
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

            var params = directories.users.getParams();
            expect(params.filters).toEqual([]);
        });

        it('order - сортировать данные пользователей по возрастанию id', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'asc'
                }
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var usersId = _.pluck(directories.users.getItems(), 'id');
            expect(usersId).toBeSorted('AscendingNumbers');
        });

        it('order - сортировать данные пользователей по убыванию id', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var usersId = _.pluck(directories.users.getItems(), 'id');
            expect(usersId).toBeSorted('DescendingNumbers');
        });

        it('order - сортировать данные пользователей по возрастанию email', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                order: {
                    order_field: 'email',
                    order_direction: 'asc'
                }
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var usersEmail = _.pluck(directories.users.getItems(), 'email');
            expect(usersEmail).toBeSorted('AscendingStrings');
        });

        it('order - сортировать данные пользователей по убыванию email', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                order: {
                    order_field: 'email',
                    order_direction: 'desc'
                }
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var usersEmail = _.pluck(directories.users.getItems(), 'email');
            expect(usersEmail).toBeSorted('DescendingStrings');
        });

        it('order - сортировать данные пользователей по возрастанию даты', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                order: {
                    order_field: 'lastLogin',
                    order_direction: 'asc'
                }
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var usersDates = _.pluck(directories.users.getItems(), 'lastLogin');
            expect(usersDates).toBeSorted('AscendingDates');
        });

        it('order - сортировать данные пользователей по убыванию даты', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                order: {
                    order_field: 'lastLogin',
                    order_direction: 'desc'
                }
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var usersDates = _.pluck(directories.users.getItems(), 'lastLogin');
            expect(usersDates).toBeSorted('DescendingDates');
        });

        it('order - сортировать данные пользователей по возрастанию поля вложенного объекта', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                order: {
                    order_field: 'dealer.companyName',
                    order_direction: 'asc'
                }
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var usersCompany_name = _.invoke(directories.users.getItems(), function() {
                return getDeepValue(this, params.order.order_field.split('.'));
            });
            expect(usersCompany_name).toBeSorted('AscendingStrings');
        });

        it('order - сортировать данные пользователей по убыванию поля вложенного объекта', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                order: {
                    order_field: 'dealer.companyName',
                    order_direction: 'desc'
                }
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var usersCompany_name = _.invoke(directories.users.getItems(), function() {
                return getDeepValue(this, params.order.order_field.split('.'));
            });
            expect(usersCompany_name).toBeSorted('DescendingStrings');
        });

        it('если параметр order в запросе указан, то в ответе order должен быть таким же', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'asc'
                }
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var pars = directories.users.getParams();
            expect(pars.order).toEqual(params.order);
        });

        it('если параметр order в запросе НЕ указан, то в ответе order должен быть по-умолчанию', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {}

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var pars = directories.users.getParams();
            expect(pars.order).toEqual({
                order_field: 'id',
                order_direction: 'asc'
            });
        });

        it('pager - ограничивать количество элементов выборки заданным', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                pager: {
                    per_page: 10
                }
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var users = directories.users.getItems();
            expect(users.length).toBe(10);
        });

        it('если параметр per_page в запросе НЕ указан, то в ответе per_page должен быть 100', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                pager: {
                    page: 2
                }
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var pars = directories.users.getParams();
            expect(pars.pager.per_page).toEqual(100);
        });

        it('если параметр per_page в запросе указан больше 100, то в ответе per_page должен быть 100', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                pager: {
                    page: 2,
                    per_page: 10000
                }
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var pars = directories.users.getParams();
            expect(pars.pager.per_page).toEqual(100);
        });

        it('если параметр page в запросе НЕ указан, то в ответе page должен быть 1', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                pager: {
                    per_page: 10
                }
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var pars = directories.users.getParams();
            expect(pars.pager.page).toEqual(1);
        });

        it('fields - выбирать поля данных пользователей', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                fields: ['id', 'email', 'status']
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            expect(_.every(directories.users.getItems(), function(value) {
                return _.isEqual(_.keys(value), params.fields);
            })).toBeTruthy();
        });

        it('fields - выбирать поля данных пользователей во вложенных объектах', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                fields: ['id', 'email', 'dealer.companyName']
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var users = directories.users.getItems();

            expect(_.every(directories.users.getItems(), function(value) {
                return !_.isEqual(_.keys(value), ['id', 'email', 'dealer']) 
                    || _.isEqual(_.keys(value.dealer), ['companyName']);
            })).toBeTruthy();
        });

        it('если параметр fields в запросе указан, то в ответе fields должен быть таким же', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                fields: ['id', 'email', 'dealer.companyName']
            }

            usersLoader.loadItems(params).then(function(respond) {
                directories = respond;
            }, function(respond) {
                actualError = respond;
            });
            $httpBackend.flush();
            $rootScope.$digest();

            var pars = directories.users.getParams();

            expect(pars.fields).toEqual(params.fields);
        });

        it('если параметр fields в запросе НЕ указан, то в ответе fields должен быть пустым массивом', function() {
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

            var params = directories.users.getParams();
            expect(params.fields).toEqual([]);
        });
    });

    describe('Методы CRUD должны', function() {
        it('post - сохранять данные нового пользователя', function() {
            var data = {
                    email: 'new@maxposter.ru',
                    lastLogin: '2013-12-01',
                    status: 'active',
                    group: {id: 2},
                    dealer: {
                        companyName: 'Новая компания',
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
                        companyInfo: 'Здесь может быть произвольный текст...',
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
                    lastLogin: '2013-12-01',
                    status: 'active',
                    group: {id: 2},
                    dealer: {
                        companyName: 'Новая компания',
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
                        companyInfo: 'Здесь может быть произвольный текст...',
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
