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
        Group;

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
        var modules = ['ng', 'max.dal.entities.user'];
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

        if (ngMock) {
            $httpBackend = injector.get('$httpBackend');
            setHttpMock($httpBackend, usersLoader, User, Users);
        } else {
            $httpBackend = {};
            $httpBackend.flush = function() {};
        }
    });

        it('post - выбрасывать ошибку валидации пользователя при неправильном значении в поле fax', function() {
            var data = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'new@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: 'Новая компания',
                        city: {id: 1},
                        address: '191040, Ленинский проспект, 150, оф.505',
                        fax: '+7-812-232-4123',
                        manager: {id: 4}
                    }
                },
                actualSuccess,
                actualError,
                thrownErr;
            var directories;
            var savedUser;
            var len;

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems().then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                try {
                    var user = new User(data, directories);
                    actualSuccess = actualError = thrownErr = undefined;
                    user.save(directories).then(function(respond) {
                        actualSuccess = respond;
                    }, function(respond){
                        actualError = respond;
                    });
                    $httpBackend.flush();
                } catch(err) {
                    console.log(err);
                    thrownErr = err;
                }
            });

            waitsFor(function() {
                return actualSuccess || actualError || thrownErr;
            });

            runs(function() {
                console.log(actualSuccess);
                console.log(actualError);
                console.log(thrownErr);
                expect(thrownErr.message).toEqual('Validation Failed');
            });
        });

    describe('Методы post должны проверять в user', function() {

        it('обязательность email', function() {
            var userData = {
                    password: '1',
                    group: {id: 1}
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.email.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('соответствие email формату', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@',
                    password: '1',
                    group: {id: 1}
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.email.errors).toEqual(['Значение адреса электронной почты недопустимо.']);
            });
        });

        it('уникальность email', function() {
            var userData = {
                    password: '1',
                    group: {id: 1}
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                user.email = directories.users.getItems()[0].email;
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.email.errors).toEqual(['Это значение уже используется.']);
            });
        });

        it('обязательность password', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    group: {id: 1}
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.password.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('размер значения password <= 128', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0',
                    group: {id: 1}
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.password.errors).toEqual(['Значение слишком длинное. Должно быть равно 128 символам или меньше.']);
            });
        });

        it('соответствие status перечню', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 1}
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                user.status = new UserStatus({id: 'unknown'});

                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.status.errors).toEqual(['Значение должно соответствовать перечню.']);
            });
        });

        it('по-умолчанию status === inactive', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 1}
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var savedUser = actualSuccess;
                expect(savedUser).toBeDefined();
                expect(savedUser.status.id).toEqual('inactive');
            });
        });

        it('обязательность group', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1'
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.group.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('соответствие group справочнику', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1'
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                user.group = new Group({id: 9999});
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Пользователю необходимо назначить группу');
            });
        });

        it('обязательность dealer, если group === {id: 2}', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2}
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('обязательность site, если group === {id: 3}', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 3}
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.site.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });
    });

    describe('Методы post должны проверять в dealer', function() {

        it('обязательность значения manager', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        city: {
                            id: 1
                        }
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.manager.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('соответствие значения manager справочнику', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        city: {
                            id: 1
                        }
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                user.dealer.manager = new Manager({id: 9999});
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.manager.errors).toEqual(['Значение недопустимо.']);
            });
        });

        it('обязательность значения city', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1}
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.city.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('соответствие значения city справочнику', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1}
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                user.dealer.city = new City({id: 9999});
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.city.errors).toEqual(['Значение недопустимо.']);
            });
        });

        it('соответствие значения metro справочнику', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1}
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                user.dealer.metro = new Metro({id: 9999});
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.metro.errors).toEqual(['Значение недопустимо.']);
            });
        });

        it('соответствие значения metro значению city', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        city: {id: 1},
                        metro: {id: 174}
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.metro.errors).toEqual(['Значение недопустимо.']);
            });
        });

        it('соответствие значения market справочнику', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1}
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                user.dealer.market = new Market({id: 9999});
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.market.errors).toEqual(['Значение недопустимо.']);
            });
        });

        it('соответствие значения market значению city', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        city: {id: 1},
                        market: {id: 7}
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.market.errors).toEqual(['Значение недопустимо.']);
            });
        });

        it('обязательность значения companyName', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        city: {id: 1}
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.companyName.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('размер значения companyName <= 100', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        city: {id: 1},
                        companyName: '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.companyName.errors).toEqual(['Значение слишком длинное. Должно быть равно 100 символам или меньше.']);
            });
        });

        it('обязательность значения address', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1}
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.address.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('размер значения address <= 255', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        city: {id: 1},
                        address: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.address.errors).toEqual(['Значение слишком длинное. Должно быть равно 255 символам или меньше.']);
            });
        });

        it('соответствие значения fax формату', function() {
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
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.fax.errors).toEqual(['Неверный формат номера телефона.']);
            });
        });

        it('соответствие значения email формату', function() {
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
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.email.errors).toEqual(['Значение адреса электронной почты недопустимо.']);
            });
        });

        it('соответствие значения url формату', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 4},
                        city: {id: 1},
                        companyName: 'Новая компания',
                        address: '191040, Ленинский проспект, 150, оф.505',
                        url: 'www'
                    }
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.url.errors).toEqual(['Значение не является допустимым URL.']);
            });
        });

        it('обязательность значения phone', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1}
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('соответствие значения phone формату', function() {
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
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone.errors).toEqual(['Неверный формат номера телефона.']);
            });
        });

        it('обязательность значения phoneFrom при заполненном phone', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)123-34-43'
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phoneFrom перечню допустимых значений', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)-123-3443',
                        phoneFrom: 99
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phoneFrom.errors).toEqual(['Значение должно быть 23 или меньше.']);
            });
        });

        it('обязательность значения phoneTo при заполненном phone', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)123-34-43'
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phoneTo перечню допустимых значений', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        manager: {id: 1},
                        phone: '+7(812)123-34-43',
                        phoneTo: 99
                    }
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phoneTo.errors).toEqual(['Значение должно быть 23 или меньше.']);
            });
        });

        it('значение phoneFrom строго меньше phoneTo', function() {
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
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phone2 формату', function() {
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
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone2.errors).toEqual(['Неверный формат номера телефона.']);
            });
        });

        it('обязательность значения phone2From при заполненном phone2', function() {
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
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone2.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phone2From перечню допустимых значений', function() {
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
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone2From.errors).toEqual(['Значение должно быть 23 или меньше.']);
            });
        });

        it('обязательность значения phone2To при заполненном phone2', function() {
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
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone2.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phone2To перечню допустимых значений', function() {
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
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone2To.errors).toEqual(['Значение должно быть 23 или меньше.']);
            });
        });

        it('значение phone2From строго меньше phone2To', function() {
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
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone2.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phone3 формату', function() {
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
                },
                actualSuccess,
                actualError,
                directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone3.errors).toEqual(['Неверный формат номера телефона.']);
            });
        });

        it('обязательность значения phone3From при заполненном phone3', function() {
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
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone3.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phone3From перечню допустимых значений', function() {
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
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone3From.errors).toEqual(['Значение должно быть 23 или меньше.']);
            });
        });

        it('обязательность значения phone3To при заполненном phone3', function() {
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
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone3.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });

        it('соответствие значения phone3To перечню допустимых значений', function() {
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
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone3To.errors).toEqual(['Значение должно быть 23 или меньше.']);
            });
        });

        it('значение phone3From строго меньше phone3To', function() {
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
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.dealer.children.phone3.errors).toEqual(['Неверно указано время для звонка на телефон.']);
            });
        });
    });

    describe('Методы post должны проверять в site', function() {

        it('обязательность значения id', function() {
            var userData = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 3},
                    site: {}
                },
                actualSuccess,
                actualError;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                actualSuccess = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                var directories = actualSuccess;
                var user = new User(userData, directories);
                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError).toBeDefined();
                expect(actualError.response.data.message).toEqual('Validation Failed');
                expect(actualError.response.data.errors.children.site.children.id.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(_.every(directories.users.getItems(), function(value) {
                    var status = String(value.status.id);
                    return (status === 'active');
                })).toBeTruthy();
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(_.every(directories.users.getItems(), function(value) {
                    var status = String(value.status.id);
                    var group = String(value.group.id);
                    return (status === '3' || group === '3');
                })).toBeTruthy();
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(_.every(directories.users.getItems(), function(value) {
                    var companyName = String(value.dealer.companyName).toLowerCase();
                    var group = String(value.group.id);
                    return (companyName === 'демокомпания' || group === 'Демокомпания');
                })).toBeTruthy();
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(_.every(directories.users.getItems(), function(value) {
                    var id = String(value.id);
                    return (id === '1');
                })).toBeTruthy();
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(_.every(directories.users.getItems(), function(value) {
                    var status = String(value.status.id);
                    return (status === 'inactive' || status === 'blocked');
                })).toBeTruthy();
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(_.every(directories.users.getItems(), function(value) {
                    var status = String(value.status.id);
                    var group = String(value.group.id);
                    return (status === 'blocked' || status === '2' || group === 'blocked' || group === '2');
                })).toBeTruthy();
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(_.every(directories.users.getItems(), function(value) {
                    var companyName = value.dealer && String(value.dealer.companyName).toLowerCase();
                    var group = String(value.group.id);
                    return (companyName === 'свет' || companyName === '3' || group === 'Свет' || group === '3');
                })).toBeTruthy();
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(_.every(directories.users.getItems(), function(value) {
                    var id = String(value.id);
                    return (id === '1' || id === '2');
                })).toBeTruthy();
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(_.every(directories.users.getItems(), function(value) {
                    var lastLogin = String(value.lastLogin);
                    return (lastLogin.indexOf('2000') !== -1);
                })).toBeTruthy();
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(_.every(directories.users.getItems(), function(value) {
                    var email = String(value.email).toLowerCase();
                    var status = String(value.status.id);
                    return (email.indexOf('act') !== -1 || status.indexOf('act') !== -1);
                })).toBeTruthy();
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(_.every(directories.users.getItems(), function(value) {
                    var email = String(value.email).toLowerCase();
                    var companyName = String(value.dealer.companyName).toLowerCase();
                    return (email.indexOf('компания') !== -1 || companyName.indexOf('компания') !== -1);
                })).toBeTruthy();
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(_.every(directories.users.getItems(), function(value) {
                    var lastLogin = String(value.lastLogin);
                    return (lastLogin.indexOf('2000') !== -1);
                })).toBeTruthy();
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(_.every(directories.users.getItems(), function(value) {
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
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                filters: [
                    { type: 'equal', fields: ['status'], value: 'active' }
                ]
            }

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var pars = directories.users.getParams();
                expect(pars.filters).toEqual(params.filters);
            });
        });

        it('если параметр filters в запросе НЕ указан, то в ответе filters должен быть пустым массивом', function() {
            var actualSuccess,
                actualError;
            var directories,
                params;

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                params = directories.users.getParams();
                expect(params.filters).toEqual([]);
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var usersId = _.pluck(directories.users.getItems(), 'id');
                expect(usersId).toBeSorted('AscendingNumbers');
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var usersId = _.pluck(directories.users.getItems(), 'id');
                expect(usersId).toBeSorted('DescendingNumbers');
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var usersEmail = _.pluck(directories.users.getItems(), 'email');
                expect(usersEmail).toBeSorted('AscendingStrings');
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var usersEmail = _.pluck(directories.users.getItems(), 'email');
                expect(usersEmail).toBeSorted('DescendingStrings');
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var usersDates = _.pluck(directories.users.getItems(), 'lastLogin');
                expect(usersDates).toBeSorted('AscendingDates');
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var usersDates = _.pluck(directories.users.getItems(), 'lastLogin');
                expect(usersDates).toBeSorted('DescendingDates');
            });
        });

        it('если параметр order в запросе указан, то в ответе order должен быть таким же, но без order', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'asc'
                }
            }

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var pars = directories.users.getParams();
                expect(pars.order).toEqual({
                    field: 'id',
                    direction: 'asc'
                });
            });
        });

        it('если параметр order в запросе НЕ указан, то в ответе order должен быть по-умолчанию', function() {
            var actualSuccess,
                actualError;
            var directories;

            var params = {}

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var pars = directories.users.getParams();
                expect(pars.order).toEqual({
                    field: 'id',
                    direction: 'asc'
                });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var users = directories.users.getItems();
                expect(users.length).toBe(10);
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var pars = directories.users.getParams();
                expect(pars.pager.per_page).toEqual(100);
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var pars = directories.users.getParams();
                expect(pars.pager.per_page).toEqual(100);
            });
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

            runs(function() {
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var pars = directories.users.getParams();
                expect(pars.pager.page).toEqual(1);
            });
        });
    });

    xdescribe('Методы CRUD должны', function() {

        it('post - сохранять данные нового пользователя', function() {
            var data = {
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
                },
                actualSuccess,
                actualError;
            var directories;
            var savedUser;
            var len;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                actualSuccess = actualError = undefined;
                len = directories.users.getParams().pager.total;
                var user = new User(data, directories);
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                savedUser = actualSuccess;
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var newUser = directories.users.get(savedUser.id);
                var newLen = directories.users.getParams().pager.total;
                expect(newUser).toEqual(savedUser);
                expect(newLen).toEqual(len+1);
            });
        });

        it('post - выбрасывать ошибку валидации пользователя при неправильном значении в поле fax', function() {
            var data = {
                    email: String(Math.floor(Math.random() * 1000000)) + 'new@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: 'Новая компания',
                        city: {id: 1},
                        address: '191040, Ленинский проспект, 150, оф.505',
                        fax: '+7-812-232-4123',
                        manager: {id: 4}
                    }
                },
                actualSuccess,
                actualError,
                thrownErr;
            var directories;
            var savedUser;
            var len;

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems().then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                try {
                    var user = new User(data, directories);
                    actualSuccess = actualError = thrownErr = undefined;
                    user.save(directories).then(function(respond) {
                        actualSuccess = respond;
                    }, function(respond){
                        actualError = respond;
                    });
                    $httpBackend.flush();
                } catch(err) {
                    thrownErr = err;
                }
            });

            waitsFor(function() {
                return actualSuccess || actualError || thrownErr;
            });

            runs(function() {
                expect(thrownErr.message).toEqual('Validation Failed');
            });
        });

        it('post - возвращать ошибку при попытке сохранения пользователя со ссылками на объекты, не существующие в БД', function() {
            var dataUser = {
                    email: 'new@maxposter.ru',
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
                },
                dataGroup = {
                    id: 99, name: 'Новая'
                },
                actualSuccess,
                actualError;
            var directories;

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems().then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var newUser = new User(dataUser, directories);
                var newGroup = new Group(dataGroup);
                newUser.group = newGroup;

                actualSuccess = actualError = undefined;
                newUser.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError.data).toEqualData({
                    status: 'error',
                    message: 'Ошибка при создании',
                    errors: 'Не найден элемент по ссылке group: {"id":99}'
                });
            });
        });

        it('get - возвращать данные пользователя', function() {
            var actualSuccess,
                actualError;
            var directories;

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItem(5).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = directories.user;
                expect(user.dealer.contactName).toBeDefined();
            });
        });

        it('get - возвращать ошибку, если пользователь не найден', function() {
            var actualSuccess,
                actualError;
            var directories;

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItem(9999).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(actualError.data.message).toEqual('Not Found');
            });
        });

        it('put - сохранять данные измененного пользователя', function() {
            var actualSuccess,
                actualError;

            var directories;
            var user;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                user = directories.users.getItems()[0];
                user.email = String(Math.floor(Math.random() * 1000000)) + 'new@maxposter.ru';

                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var changedUser = directories.users.get(user.id);
                expect(changedUser.email).toEqual(user.email);
            });
        });

        it('put - возвращать ошибку при попытке сохранения пользователя со ссылками на объекты, не существующие в БД', function() {
            var dataGroup = {
                    id: 99, name: 'Новая'
                },
                actualSuccess,
                actualError;
            var directories;

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems().then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var user = directories.users.get(1);
                var newGroup = new Group(dataGroup);
                user.group = newGroup;

                actualSuccess = actualError = undefined;
                user.save(directories).then(function(respond) {
                    actualSuccess = respond;
                }, function(respond){
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess || actualError;
            });

            runs(function() {
                expect(actualError.data).toEqualData({
                    status: 'error',
                    message: 'Ошибка при обновлении',
                    errors: 'Не найден элемент по ссылке group: {"id":99}'
                });
            });
        });

        it('put - возвращать ошибку при попытке сохранения несуществующего пользователя', function() {
            var actualSuccess,
                actualError;
            var directories;

            runs(function() {
                var user = new User({id: 9999});
                directories = actualError = undefined;
                user.save().then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(actualError.data.message).toEqual('Not Found');
            });
        });

        it('remove - удалять пользователя', function() {
            var actualSuccess,
                actualError;
            var directories;
            var len;

            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            }

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var item = directories.users.getItems()[0];
                len = directories.users.getParams().pager.total;

                actualSuccess = actualError = undefined;
                item.remove().then(function(respond) {
                    actualSuccess = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return actualSuccess !== undefined || actualError;
            });

            runs(function() {
                directories = actualError = undefined;
                usersLoader.loadItems(params).then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                var newLen = directories.users.getParams().pager.total;
                expect(newLen).toBe(len-1);
            });
        });

        it('remove - возвращать ошибку, если пользователь не найден', function() {
            var actualSuccess,
                actualError;
            var directories;

            runs(function() {
                var user = new User({id: 9999});
                directories = actualError = undefined;
                user.remove().then(function(respond) {
                    directories = respond;
                }, function(respond) {
                    actualError = respond;
                });
                $httpBackend.flush();
            });
            waitsFor(function() {
                return directories || actualError;
            });

            runs(function() {
                expect(actualError.data.message).toEqual('Not Found');
            });
        });
    });
});
