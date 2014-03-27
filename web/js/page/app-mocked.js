
angular.module('RootApp-mocked', ['RootApp', 'ngMockE2E'])

.run(function($httpBackend, usersLoader, User) {
    $httpBackend.whenGET(/template\/.*/).passThrough();
    setHttpMock($httpBackend, usersLoader, User, Users, 100);
});

/**
 * мини-сервер http для комплексных тестов
 */
function setHttpMock($httpBackend, usersLoader, User, Users, multiplyUsersCoef) {
    var userDirectories = usersLoader.makeDirectories({
        groups: [
            {id: 3, name: 'Автосайт'},
            {id: 2, name: 'Автосалон'},
            {id: 1, name: 'Администратор'}
        ],
        managers: [
            {id: 1, name: 'Катя'},
            {id: 2, name: 'Инна'},
            {id: 4, name: 'Потеряшки'},
            {id: 0, name: ''}
        ],
        cities: [
            {id: 5, name: 'Питер'},
            {id: 6, name: 'Москва'}
        ],
        markets: [
            {id: 6, name: 'Рынок один в москве', city: {id: 6}},
            {id: 7, name: 'Рынок два в москве', city: {id: 6}},
            {id: 8, name: 'Рынок один в питере', city: {id: 5}},
            {id: 9, name: 'Рынок два в питере', city: {id: 5}}
        ],
        metros: [
            {id: 8, name: 'Метро один в москве', city: {id: 6}},
            {id: 9, name: 'Метро два в москве', city: {id: 6}},
            {id: 10, name: 'Метро один в питере', city: {id: 5}},
            {id: 11, name: 'Метро два в питере', city: {id: 5}}
        ],
        sites: [
            {id: 11, name: 'Сайт один'},
            {id: 12, name: 'Сайт два'}
        ]
    });

    var users = usersLoader.makeCollection(multiplyArr([
        {
            id: 5,
            email: 'demo@maxposter.ru',
            last_login: '2013-12-01',
            status: 'active',
            group: {id: 2},
            dealer: {
                company_name: 'Демокомпания',
                city: {id: 5},
                market: {id: 8},
                metro: {id: 10},
                adress: '191040, Лиговский проспект, 150, оф.505',
                fax: '+7(812)232-4123',
                dealer_email: 'demo@demo.ru',
                site: 'http://www.w3schools.com',
                contact_name: 'Аверин Константин Петрович',
                phone: '+7(812)232-4123',
                phone_from: 10,
                phone_to: 20,
                phone2: '+7(812)232-4124',
                phone2_from: 11,
                phone2_to: 21,
                phone3: '+7(812)232-4125',
                phone3_from: 7,
                phone3_to: 15,
                company_info: 'Здесь может быть произвольный текст...',
                manager: {id: 1}
            }
        },
        {id: 1, email: 'a-bobkov@ab.com', last_login: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            company_name: 'Ещё одна компания', manager: {id: 2}}},
        {id: 2, email: 'a-bobkov@abb.com', last_login: '2011-03-11', status: 'active', group: {id: 3}, site: {id: 11}},
        {id: 3, email: 'a-bobkov@abc.com', last_login: '2012-05-31', status: 'inactive', group: {id: 2}, dealer: {
            company_name: 'Другая компания', manager: {id: 1}}},
        {id: 4, email: 'a-bobkov@abd.com', last_login: '2011-12-12', status: 'blocked', group: {id: 3}, site: {id: 12}},
        {id: 6, email: 'a-bobkov@abe.com', last_login: '2013-01-06', status: 'active', group: {id: 2}, dealer: {
            company_name: 'Крутая компания', manager: {id: 2}}},
        {id: 7, email: 'a-bobkov@abf.com', last_login: '2000-01-12', status: 'inactive', group: {id: 2}, dealer: {
            company_name: 'Супер-салон', manager: {id: 2}}},
        {id: 8, email: 'a-bobkov@abg.com', last_login: '2000-08-07', status: 'active', group: {id: 1}},
        {id: 9, email: 'a-bobkov@abh.com', last_login: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            company_name: 'Битые корыта', manager: {id: 1}}},
        {id: 10, email: 'a-bobkov@abi.com', last_login: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            company_name: 'Два в одном', manager: {id: 2}}},
        {id: 11, email: 'a-bobkov@abj.com', last_login: '2012-01-01', status: 'blocked', group: {id: 3}, site: {id: 11}},
        {id: 12, email: 'a-bobkov@abk.com', last_login: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            company_name: 'Авто-мото', manager: {id: 0}}},
        {id: 13, email: 'a-bobkov@abl.com', last_login: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            company_name: 'Свет', manager: {id: 4}}},
        {id: 14, email: 'a-bobkov@abo.com', last_login: '2012-01-01', status: 'blocked', group: {id: 3}, site: {id: 12}},
        {id: 15, email: 'a-bobkov@abm.com', last_login: '2012-01-01', status: 'active', group: {id: 3}, site: {id: 11}}
    ], multiplyUsersCoef), null, userDirectories);
    
    function multiplyArr(arr, coef) {
        coef = coef || 1;
        var multiplyArray = [];

        var cloneArr = function(arr, num) {
            return _.forEach(angular.copy(arr), function(value) {
                var id = value.id + num * arr.length;
                value.id = id;
                value.email = num + value.email;
                multiplyArray.push(value);
            });
        }
        for (var i = 0; i < coef; i++) {
            multiplyArray = _.union(multiplyArray, cloneArr(arr, i));
        }
        return multiplyArray;
    }

    var regexUserQuery = /^\/api2\/users(?:\?([\w_=&]*))?$/;

    var processUserQueryUrl = function(url, arr) {

        var search = url.replace(regexUserQuery, '$1');
        var pairs = search.split('&');
        var params = {};
        _.forEach(pairs, function(value) {
            var param = value.split('=');
            params[param[0]] = param[1];
        })

        var order_field = params.order_field || 'id';
        var order_direction = params.order_direction || 'asc';
        var per_page = params.per_page || 100;
        var page = params.page || 1;

        var sorted_arr = _.sortBy(arr, function(item) { return item[order_field]; });
        if (order_direction === 'desc') {
            sorted_arr.reverse();
        }
        var paged_arr = sorted_arr.slice(page * per_page - per_page, page * per_page);

        return [200, {
            status: 'success',
            data: {
                params: {
                    filters: null,
                    order: {
                        field: order_field,
                        direction: order_direction
                    },
                    pager: {
                        per_page:   per_page,
                        page:       page,
                        total:      arr.length
                    },
                    fields: null
                },
                users: (new Users (paged_arr)).serialize()
            }
        }];
    }

    $httpBackend.whenGET(regexUserQuery).respond(function(method, url, data) {
        return processUserQueryUrl(url, users.getItems());
    });

    $httpBackend.whenPOST(regexUserQuery).respond(function(method, url, data) {

        var filterItem = function(item, filter) {
            var itemValues = [];
            _.forOwn(item, function(value, key) {
                if (filter.fields.indexOf(key) !== -1) {
                    if (_.isObject(value)) {
                        itemValues.push(String(value.id));
                    } else {
                        itemValues.push(String(value));
                    }
                }
            });

            if (filter.type === 'equal') {
                return (itemValues.indexOf(filter.value) !== -1);
            } else if (filter.type === 'in') {
                return (filter.value.indexOf(String(itemValue)) !== -1)
            } else if (filter.type === 'contain') {
                return (String(itemValue).indexOf(filter.value) !== -1)
            }
            return true;
        }

        var filterArr = function(arr, filters) {
            return _.filter(arr, function(item) {
                return _.every(filters, function(filter) {
                    return filterItem(item, filter);
                });
            })
        }

        var arr = users.getItems();
        var filters = angular.fromJson(data).filters;
        var filtered_arr = filterArr(arr, filters);

        var respond = processUserQueryUrl(url, filtered_arr);
        respond[1].data.params.filters = filters;
        return respond;
    });

    var regexGet = /^\/api2\/users\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexGet).respond(function(method, url, data) {
        var id = parseInt(url.replace(regexGet,'$1'));
        var user = users.get(id);
        if (user) {
            return [200, {
                status: 'success',
                data: {
                    user: user.serialize()
                }
            }];
        } else {
            return [404, {
                status: 'error',
                message: 'Ошибка при получении',
                errors: 'Не найден пользователь с id: ' + id
            }];
        }
    });

    var regexDirectories = /^\/api2\/combined\/users$/;
    $httpBackend.whenGET(regexDirectories).respond(function(method, url, data) {
        return [200, {
            status: 'success',
            data: _.mapValues(userDirectories, function(directory) {
               return directory.serialize();
            })
        }];
    });

    var regexPost = /^\/api2\/users\/new$/;
    $httpBackend.whenPOST(regexPost).respond(function(method, url, data) {
        var items = users.getItems();
        try {
            var user = new User(angular.fromJson(data), userDirectories);
            // todo: проверять данные в соответствии с форматом полей таблиц и требованиями ссылочной целостности
        } catch (err) {
            return [400, {
                status: 'error',
                message: 'Ошибка при создании',
                errors: err.message
            }];
        }

        user.id = 1 + _.max(items, function(item) {
            return item.id;
        }).id;
        items.push(user);
        return [200, {
            status: 'success',
            data: {
                user: user.serialize()
            }
        }];
    });

    var regexPut = /^\/api2\/users\/(?:([^\/]+))$/;
    $httpBackend.whenPUT(regexPut).respond(function(method, url, data) {
        var id = parseInt(url.replace(regexPut,'$1'));
        var items = users.getItems();
        var idx = _.findIndex(items, {id: id});
        if (idx !== -1) {
            try {
                var user = new User(angular.fromJson(data), userDirectories);
                // todo: проверять данные в соответствии с форматом полей таблиц и требованиями ссылочной целостности
            } catch (err) {
                return [400, {
                    status: 'error',
                    message: 'Ошибка при обновлении',
                    errors: err.message
                }];
            }

            items[idx] = user;
            return [200, {
                status: 'success',
                data: {
                    user: user.serialize()
                }
            }];
        } else {
            return [404, {
                status: 'error',
                message: 'Ошибка при обновлении',
                errors: 'Не найден пользователь с id: ' + id
            }];
        }
    });

    var regexDelete = /^\/api2\/users\/(?:([^\/]+))$/;
    $httpBackend.whenDELETE(regexDelete).respond(function(method, url, data) {
        var id = parseInt(url.replace(regexDelete,'$1'));
        var items = users.getItems();
        var idx = _.findIndex(items, {id: id});
        if (idx !== -1) {
            items.splice(idx, 1);
            return [200, {
                status: 'success',
                data: null
            }];
        } else {
            return [404, {
                status: 'error',
                message: 'Ошибка при удалении',
                errors: 'Не найден пользователь с id: ' + id
            }];
        }
    });
};
