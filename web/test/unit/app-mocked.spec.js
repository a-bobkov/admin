'use strict';

describe('app-mocked', function() {
    var $httpBackend,
        usersLoader,
        User,
        Users,
        UserStatus,
        Manager,
        City,
        Metro,
        Market,
        Group,
        dealerSitesLoader,
        dealerSiteStatusesLoader,
        dealersLoader,
        sitesLoader, 
        DealerSite,
        DealerSites,
        Dealers,
        Sites,
        dealerSiteLoginsLoader,
        DealerSiteLogin,
        DealerSiteLogins;

    try {
        var ngMock = angular.module('ngMock');
    } catch(err) {}

    function getDeepValue(item, field) {
        var value = item[field.shift()];
        if (field.length && value) {
            return getDeepValue(value, field);
        } else {
            return value;
        }
    }

    beforeEach(function() {
        var modules = ['ng', 'max.dal.entities.user', 'max.dal.entities.dealersite'];
        if (ngMock) {
            modules.push('ngMock');
        }
        var injector = angular.injector(modules);

        usersLoader = injector.get('usersLoader');
        User = injector.get('User');
        Users = injector.get('Users');
        UserStatus = injector.get('UserStatus');
        Group = injector.get('Group');
        Manager = injector.get('Manager');
        City = injector.get('City');
        Metro = injector.get('Metro');
        Market = injector.get('Market');
        dealerSitesLoader = injector.get('dealerSitesLoader');
        dealerSiteStatusesLoader = injector.get('dealerSiteStatusesLoader');
        dealersLoader = injector.get('dealersLoader');
        sitesLoader = injector.get('sitesLoader');
        DealerSite = injector.get('DealerSite');
        DealerSites = injector.get('DealerSites');
        Dealers = injector.get('Dealers');
        Sites = injector.get('Sites');
        dealerSiteLoginsLoader = injector.get('dealerSiteLoginsLoader');
        DealerSiteLogins = injector.get('DealerSiteLogins');
        DealerSiteLogin = injector.get('DealerSiteLogin');

        if (ngMock) {
            $httpBackend = injector.get('$httpBackend');
            setHttpMock($httpBackend, usersLoader, User, Users, null,
                dealerSitesLoader, dealerSiteStatusesLoader, dealersLoader, sitesLoader, 
                DealerSites, Dealers, Sites, dealerSiteLoginsLoader);
        } else {
            $httpBackend = {};
            $httpBackend.flush = function() {};
        }
    });

    function runSync(answer, asyncFn) {
        var actualSuccess;
        var actualError;
        var thrownErr;

        runs(function() {
            try {
                asyncFn().then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            } catch(err) {
                thrownErr = err;
            }
        });
        waitsFor(function() {
            if (actualSuccess !== undefined) {
                answer.respond = actualSuccess;
                return true;
            } else if (actualError !== undefined) {
                answer.respond = actualError;
                return true;
            } else if (thrownErr !== undefined) {
                answer.respond = thrownErr;
                return true;
            }
            return false;
        });
    }

    describe('Методы post должны проверять в user', function() {

        it('обязательность email', function() {
            var answer = {};
            var userData = {
                    password: '1',
                    group: {id: 1}
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.email.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('соответствие email формату', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@',
                    password: '1',
                    group: {id: 1}
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.email.errors).toEqual(['Значение адреса электронной почты недопустимо.']);
            });
        });

        it('уникальность email', function() {
            var answer = {};
            var userData = {
                    password: '1',
                    group: {id: 1}
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                user.email = directories.users.getItems()[0].email;
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.email.errors).toEqual(['Это значение уже используется.']);
            });
        });

        it('обязательность password', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    group: {id: 1}
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.password.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('размер значения password <= 128', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0',
                    group: {id: 1}
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.password.errors).toEqual(['Значение слишком длинное. Должно быть равно 128 символам или меньше.']);
            });
        });

        it('соответствие status перечню', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 1}
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                user.status = new UserStatus({id: 'unknown'});
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.status.errors).toEqual(['Выбранное Вами значение недопустимо.']);
            });
        });

        it('по-умолчанию status === inactive', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 1}
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var savedUser = answer.respond;
                expect(savedUser.status.id).toEqual('inactive');
            });
        });

        it('обязательность group', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1'
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Пользователю необходимо назначить группу');
            });
        });

        it('соответствие group справочнику', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1'
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                user.group = new Group({id: 9999});
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Пользователю необходимо назначить группу');
            });
        });

        it('обязательность dealer, если group === {id: 2}', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2}
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Значение поля dealer не должно быть пустым');
            });
        });

        it('обязательность site, если group === {id: 3}', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 3}
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Значение поля site не должно быть пустым');
            });
        });
    });

    describe('Методы post должны проверять в dealer', function() {

        it('обязательность значения manager', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        city: {
                            id: 1
                        }
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.manager.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('соответствие значения manager справочнику', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        city: {
                            id: 1
                        }
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                user.dealer.manager = new Manager({id: 9999});
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.manager.errors).toEqual(['Значение недопустимо.']);
            });
        });

        it('обязательность значения city', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1}
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.city.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('соответствие значения city справочнику', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1}
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                user.dealer.city = new City({id: 9999});
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.city.errors).toEqual(['Значение недопустимо.']);
            });
        });

        it('соответствие значения metro справочнику', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1}
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                user.dealer.metro = new Metro({id: 9999});
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.metro.errors).toEqual(['Значение недопустимо.']);
            });
        });

        it('соответствие значения metro значению city', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        city: {id: 1},
                        metro: {id: 174}
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.metro.errors).toEqual(['Значение недопустимо.']);
            });
        });

        it('соответствие значения market справочнику', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1}
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                user.dealer.market = new Market({id: 9999});
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.market.errors).toEqual(['Значение недопустимо.']);
            });
        });

        it('соответствие значения market значению city', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        city: {id: 1},
                        market: {id: 7}
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.market.errors).toEqual(['Значение недопустимо.']);
            });
        });

        it('обязательность значения companyName', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        city: {id: 1}
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.companyName.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('размер значения companyName <= 100', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        city: {id: 1},
                        companyName: '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.companyName.errors).toEqual(['Значение слишком длинное. Должно быть равно 100 символам или меньше.']);
            });
        });

        it('обязательность значения address', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1}
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.address.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('размер значения address <= 255', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        city: {id: 1},
                        address: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.address.errors).toEqual(['Значение слишком длинное. Должно быть равно 255 символам или меньше.']);
            });
        });

        it('соответствие значения fax формату', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 4},
                        city: {id: 1},
                        companyName: 'Новая компания',
                        address: '191040, Ленинский проспект, 150, оф.505',
                        fax: '+7-812-232-4123'
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.fax.errors).toEqual(['Неверный формат номера телефона.']);
            });
        });

        it('соответствие значения email формату', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 4},
                        city: {id: 1},
                        companyName: 'Новая компания',
                        address: '191040, Ленинский проспект, 150, оф.505',
                        email: 'jasmine@'
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.email.errors).toEqual(['Значение адреса электронной почты недопустимо.']);
            });
        });

        it('соответствие значения url формату', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 4},
                        city: {id: 1},
                        companyName: 'Новая компания',
                        address: '191040, Ленинский проспект, 150, оф.505',
                        phone: '+7(812)232-4123',
                        phoneFrom: 10,
                        phoneTo: 20,
                        url: 'www'
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.url.errors).toEqual(['Значение не является допустимым URL.']);
            });
        });

        it('обязательность значения phone', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1}
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('соответствие значения phone формату', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 4},
                        city: {id: 1},
                        companyName: 'Новая компания',
                        address: '191040, Ленинский проспект, 150, оф.505',
                        phone: '+7-812-232-4123',
                        phoneFrom: 10,
                        phoneTo: 20
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone.errors).toEqual(['Неверный формат номера телефона.']);
            });
        });

        it('обязательность значения phoneFrom при заполненном phone', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)123-34-43'
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phoneFrom перечню допустимых значений', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)-123-3443',
                        phoneFrom: 99
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phoneFrom.errors).toEqual(['Значение должно быть 23 или меньше.']);
            });
        });

        it('обязательность значения phoneTo при заполненном phone', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)123-34-43'
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phoneTo перечню допустимых значений', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)123-34-43',
                        phoneTo: 99
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phoneTo.errors).toEqual(['Значение должно быть 23 или меньше.']);
            });
        });

        it('значение phoneFrom строго меньше phoneTo', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)123-34-43',
                        phoneFrom: 23,
                        phoneTo: 23
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phone2 формату', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 4},
                        city: {id: 1},
                        companyName: 'Новая компания',
                        address: '191040, Ленинский проспект, 150, оф.505',
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7-812-232-4123',
                        phone2From: 10,
                        phone2To: 20
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone2.errors).toEqual(['Неверный формат номера телефона.']);
            });
        });

        it('обязательность значения phone2From при заполненном phone2', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)123-34-43'
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone2.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phone2From перечню допустимых значений', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)-123-3443',
                        phone2From: 99
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone2From.errors).toEqual(['Значение должно быть 23 или меньше.']);
            });
        });

        it('обязательность значения phone2To при заполненном phone2', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)123-34-43'
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone2.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phone2To перечню допустимых значений', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)123-34-43',
                        phone2To: 99
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone2To.errors).toEqual(['Значение должно быть 23 или меньше.']);
            });
        });

        it('значение phone2From строго меньше phone2To', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)123-34-43',
                        phone2From: 23,
                        phone2To: 23
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone2.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phone3 формату', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 4},
                        city: {id: 1},
                        companyName: 'Новая компания',
                        address: '191040, Ленинский проспект, 150, оф.505',
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)232-4123',
                        phone2From: 11,
                        phone2To: 21,
                        phone3: '+77777777',
                        phone3From: 12,
                        phone3To: 22
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone3.errors).toEqual(['Неверный формат номера телефона.']);
            });
        });

        it('обязательность значения phone3From при заполненном phone3', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)232-4123',
                        phone2From: 11,
                        phone2To: 21,
                        phone3: '+7(812)123-34-43'
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone3.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phone3From перечню допустимых значений', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)232-4123',
                        phone2From: 11,
                        phone2To: 21,
                        phone3: '+7(812)-123-3443',
                        phone3From: 99
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone3From.errors).toEqual(['Значение должно быть 23 или меньше.']);
            });
        });

        it('обязательность значения phone3To при заполненном phone3', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)232-4123',
                        phone2From: 11,
                        phone2To: 21,
                        phone3: '+7(812)123-34-43'
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone3.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phone3To перечню допустимых значений', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)232-4123',
                        phone2From: 11,
                        phone2To: 21,
                        phone3: '+7(812)123-34-43',
                        phone3To: 99
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone3To.errors).toEqual(['Значение должно быть 23 или меньше.']);
            });
        });

        it('значение phone3From строго меньше phone3To', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)232-4123',
                        phone2From: 11,
                        phone2To: 21,
                        phone3: '+7(812)123-34-43',
                        phone3From: 23,
                        phone3To: 23
                    }
                };

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone3.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });
    });

    describe('Методы post должны проверять в site', function() {

        it('обязательность значения id', function() {
            var answer = {};
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 3},
                    site: {}
                };

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.site.children.id.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });
    });

    describe('Методы query должны', function() {

        it('equal - фильтровать данные пользователей по равенству в одном поле', function() {
            var answer = {};
            var params = {
                filters: [
                    { type: 'equal', fields: ['status'], value: 'active' }
                ]
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                expect(_.every(users, function(value) {
                    var status = String(value.status.id);
                    return (status === 'active');
                })).toBeTruthy();
            });
        });

        it('equal - фильтровать данные пользователей по равенству в нескольких полях', function() {
            var answer = {};
            var params = {
                filters: [
                    { type: 'equal', fields: ['status', 'group'], value: '3' }
                ]
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                expect(_.every(users, function(value) {
                    var status = String(value.status.id);
                    var group = String(value.group.id);
                    return (status === '3' || group === '3');
                })).toBeTruthy();
            });
        });

        it('equal - фильтровать данные пользователей по равенству в полях во вложенных объектах', function() {
            var answer = {};
            var params = {
                filters: [
                    { type: 'equal', fields: ['dealer.companyName', 'group'], value: 'Auto' }
                ]
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                expect(_.every(users, function(value) {
                    var companyName = String(value.dealer.companyName).toLowerCase();
                    var group = String(value.group.id).toLowerCase();
                    return (companyName === 'auto' || group === 'auto');
                })).toBeTruthy();
            });
        });

        it('equal - значение фильтра может быть числом', function() {
            var answer = {};
            var params = {
                filters: [
                    { type: 'equal', fields: ['id'], value: 1 }
                ]
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                expect(_.every(users, function(value) {
                    var id = String(value.id);
                    return (id === '1');
                })).toBeTruthy();
            });
        });

        it('in - фильтровать данные пользователей по равенству в одном поле', function() {
            var answer = {};
            var params = {
                filters: [
                    { type: 'in', fields: ['status'], value: ['inactive', 'blocked'] }
                ]
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                expect(_.every(users, function(value) {
                    var status = String(value.status.id);
                    return (status === 'inactive' || status === 'blocked');
                })).toBeTruthy();
            });
        });

        it('in - фильтровать данные пользователей по равенству в нескольких поле', function() {
            var answer = {};
            var params = {
                filters: [
                    { type: 'in', fields: ['status', 'group'], value: ['blocked', '2'] }
                ]
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                expect(_.every(users, function(value) {
                    var status = String(value.status.id);
                    var group = String(value.group.id);
                    return (status === 'blocked' || status === '2' || group === 'blocked' || group === '2');
                })).toBeTruthy();
            });
        });

        it('in - фильтровать данные пользователей по равенству в полях во вложенных объектах', function() {
            var answer = {};
            var params = {
                filters: [
                    { type: 'in', fields: ['dealer.companyName', 'group'], value: ['Свет', '3'] }
                ]
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                expect(_.every(users, function(value) {
                    var companyName = value.dealer && String(value.dealer.companyName).toLowerCase();
                    var group = String(value.group.id).toLowerCase();
                    return (companyName === 'auto' || companyName === '3' || group === 'auto' || group === '3');
                })).toBeTruthy();
            });
        });

        it('in - значение фильтра может быть массивом чисел', function() {
            var answer = {};
            var params = {
                filters: [
                    { type: 'in', fields: ['id'], value: [1, 2] }
                ]
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                expect(_.every(users, function(value) {
                    var id = String(value.id);
                    return (id === '1' || id === '2');
                })).toBeTruthy();
            });
        });

        it('contain - фильтровать данные пользователей по подстроке в одном поле', function() {
            var answer = {};
            var params = {
                filters: [
                    { type: 'contain', fields: ['lastLogin'], value: ['2010'] }
                ]
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                expect(_.every(users, function(value) {
                    var lastLogin = String(value.lastLogin);
                    return (lastLogin.indexOf('2010') !== -1);
                })).toBeTruthy();
            });
        });

        it('contain - фильтровать данные пользователей по подстроке в нескольких полях', function() {
            var answer = {};
            var params = {
                filters: [
                    { type: 'contain', fields: ['email', 'status'], value: ['act'] }
                ]
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                expect(_.every(users, function(value) {
                    var email = String(value.email).toLowerCase();
                    var status = String(value.status.id);
                    return (email.indexOf('act') !== -1 || status.indexOf('act') !== -1);
                })).toBeTruthy();
            });
        });

        it('contain - фильтровать данные пользователей по подстроке в полях во вложенных объектах', function() {
            var answer = {};
            var params = {
                filters: [
                    { type: 'contain', fields: ['email', 'dealer.companyName'], value: ['компания'] }
                ]
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                expect(_.every(users, function(value) {
                    var email = String(value.email).toLowerCase();
                    var companyName = String(value.dealer.companyName).toLowerCase();
                    return (email.indexOf('компания') !== -1 || companyName.indexOf('компания') !== -1);
                })).toBeTruthy();
            });
        });

        it('contain - значение фильтра может быть числом', function() {
            var answer = {};
            var params = {
                filters: [
                    { type: 'contain', fields: ['lastLogin'], value: 2010 }
                ]
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                expect(_.every(users, function(value) {
                    var lastLogin = String(value.lastLogin);
                    return (lastLogin.indexOf('2010') !== -1);
                })).toBeTruthy();
            });
        });

        it('filters - комбинация трех разных фильтров', function() {
            var answer = {};
            var params = {
                filters: [
                    { type: 'contain', fields: ['id', 'email', 'dealer.companyName'], value: '1' },
                    { type: 'in', fields: ['status'], value: ['active'] },
                    { type: 'equal', fields: ['dealer.manager'], value: '2' }
                ]
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                expect(_.every(users, function(value) {
                    var id = String(value.id);
                    var email = String(value.email).toLowerCase();
                    var companyName = String(value.dealer.companyName).toLowerCase();
                    var status = String(value.status.id);
                    var manager = String(value.dealer.manager.id);
                    return ((id.indexOf('1') !== -1 || email.indexOf('1') !== -1 || companyName.indexOf('1') !== -1) 
                        && (status === 'active') && (manager === '2'));
                })).toBeTruthy();
            });
        });

        it('если параметр filters в запросе указан, то в ответе filters должен быть таким же', function() {
            var answer = {};
            var params = {
                filters: [
                    { type: 'equal', fields: ['status'], value: 'active' }
                ]
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var newParams = answer.respond.users.getParams();
                expect(newParams.filters).toEqual(params.filters);
            });
        });

        it('если параметр filters в запросе НЕ указан, то в ответе filters должен быть пустым массивом', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runs(function() {
                var params = answer.respond.users.getParams();
                expect(params.filters).toEqual([]);
            });
        });

        it('order - сортировать данные пользователей по возрастанию id', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'asc'
                }
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                var usersId = _.pluck(users, 'id');
                expect(usersId).toBeSorted('AscendingNumbers');
            });
        });

        it('order - сортировать данные пользователей по убыванию id', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                var usersId = _.pluck(users, 'id');
                expect(usersId).toBeSorted('DescendingNumbers');
            });
        });

        it('order - сортировать данные пользователей по возрастанию email', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'email',
                    order_direction: 'asc'
                }
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                var usersEmail = _.pluck(users, 'email');
                expect(usersEmail).toBeSorted('AscendingStrings');
            });
        });

        it('order - сортировать данные пользователей по убыванию email', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'email',
                    order_direction: 'desc'
                }
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                var usersEmail = _.pluck(users, 'email');
                expect(usersEmail).toBeSorted('DescendingStrings');
            });
        });

        it('order - сортировать данные пользователей по возрастанию даты', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'lastLogin',
                    order_direction: 'asc'
                }
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                var usersDates = _.pluck(users, 'lastLogin');
                expect(usersDates).toBeSorted('AscendingDates');
            });
        });

        it('order - сортировать данные пользователей по убыванию даты', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'lastLogin',
                    order_direction: 'desc'
                }
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBeTruthy();
                var usersDates = _.pluck(users, 'lastLogin');
                expect(usersDates).toBeSorted('DescendingDates');
            });
        });

        it('если параметр order в запросе указан, то в ответе order должен быть таким же, но без order', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'asc'
                }
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var newParams = answer.respond.users.getParams();
                expect(newParams.order).toEqual({
                    field: 'id',
                    direction: 'asc'
                });
            });
        });

        it('если параметр order в запросе НЕ указан, то в ответе order должен быть по-умолчанию', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runs(function() {
                var newParams = answer.respond.users.getParams();
                expect(newParams.order).toEqual({
                    field: 'id',
                    direction: 'asc'
                });
            });
        });

        it('pager - ограничивать количество элементов выборки заданным', function() {
            var answer = {};
            var params = {
                pager: {
                    per_page: 10
                }
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var users = answer.respond.users.getItems();
                expect(users.length).toBe(10);
            });
        });

        it('если параметр per_page в запросе НЕ указан, то в ответе per_page должен быть 100', function() {
            var answer = {};
            var params = {
                pager: {
                    page: 2
                }
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var newParams = answer.respond.users.getParams();
                expect(newParams.pager.per_page).toEqual(100);
            });
        });

        it('если параметр per_page в запросе указан больше 100, то в ответе per_page должен быть 100', function() {
            var answer = {};
            var params = {
                pager: {
                    page: 2,
                    per_page: 10000
                }
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var newParams = answer.respond.users.getParams();
                expect(newParams.pager.per_page).toEqual(100);
            });
        });

        it('если параметр page в запросе НЕ указан, то в ответе page должен быть 1', function() {
            var answer = {};
            var params = {
                pager: {
                    per_page: 10
                }
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var newParams = answer.respond.users.getParams();
                expect(newParams.pager.page).toEqual(1);
            });
        });
    });

    describe('Методы CRUD должны', function() {

        it('post - сохранять данные нового пользователя', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'new@maxposter.ru',
                    password: '1',
                    lastLogin: '2013-12-01',
                    status: 'active',
                    group: {id: 2},
                    dealer: {
                        companyName: 'Новая компания',
                        city: {id: 1},
                        market: {id: 4},
                        metro: {id: 10},
                        address: '191040, Ленинский проспект, 150, оф.505',
                        fax: '+7(812)232-4123',
                        email: 'demo@demo.ru',
                        url: 'http://www.w3schools.com',
                        contactName: 'Аверин Константин Петрович',
                        phone: '+7(812)232-4123',
                        phoneFrom: '10',
                        phoneTo: '20',
                        phone2: '+7(812)232-4124',
                        phone2From: '11',
                        phone2To: '21',
                        phone3: '+7(812)232-4125',
                        phone3From: '7',
                        phone3To: '15',
                        companyInfo: 'Здесь может быть произвольный текст...',
                        manager: {id: 4}
                    }
                };
            var answer = {};
            var savedUser;
            var len;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                len = directories.users.getParams().pager.total;
                var user = new User(userData, directories);
                return user.save(directories);
            });

            runSync(answer, function() {
                savedUser = answer.respond;
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var newUser = answer.respond.users.get(savedUser.id);
                var newLen = answer.respond.users.getParams().pager.total;
                expect(newUser).toEqual(savedUser);
                expect(newLen).toEqual(len+1);
            });
        });

        it('get - возвращать данные пользователя', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItem(5);
            });

            runs(function() {
                var user = answer.respond.user;
                expect(user.dealer.contactName).toBeDefined();
            });
        });

        it('get - возвращать ошибку, если пользователь не найден', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItem(9999);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Not Found');
            });
        });

        it('put - сохранять данные измененного пользователя', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            };
            var user;

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                user = directories.users.getItems()[0];
                user.email = String(Math.floor(Math.random() * 1000000)) + 'new@maxposter.ru';
                return user.save(directories);
            });

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var changedUser = answer.respond.users.get(user.id);
                expect(changedUser.email).toEqual(user.email);
            });
        });

        it('put - возвращать ошибку при попытке сохранения пользователя со ссылками на объекты, не существующие в БД', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = directories.users.getItems()[0];
                user.group = new Group({id: 99});
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Пользователю необходимо назначить группу');
            });
        });

        it('put - возвращать ошибку при попытке сохранения пользователя, не существующего в БД', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var userId = directories.users.getItems()[0].id;
                var user = new User({id: userId + 1});
                return user.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Not Found');
            });
        });

        it('remove - удалять пользователя', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }
            var len;

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var user = directories.users.getItems()[0];
                len = directories.users.getParams().pager.total;
                return user.remove();
            });

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var newLen = answer.respond.users.getParams().pager.total;
                expect(newLen).toBe(len-1);
            });
        });

        it('remove - возвращать ошибку, если пользователь не найден', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var userId = directories.users.getItems()[0].id;
                var user = new User({id: userId + 1});
                return user.remove();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Not Found');
            });
        });
    });
});
