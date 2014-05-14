
angular.module('RootApp-mocked', ['RootApp', 'ngMockE2E'])

.run(function($httpBackend, usersLoader, User, Users) {
    $httpBackend.whenGET(/template\/.*/).passThrough();
    setHttpMock($httpBackend, usersLoader, User, Users, 100);
});

/**
 * мини-сервер http для комплексных тестов
 */
function setHttpMock($httpBackend, usersLoader, User, Users, multiplyUsersCoef) {
    var userDirectories = usersLoader.makeDirectories({
        groups: [
            {id: 1, name: 'admin', description: 'Администратор'},
            {id: 2, name: 'dealer', description: 'Автосалон'},
            {id: 3, name: 'site', description: 'Автосайт'}
        ],
        managers: [
            {id: 1, name: 'Катя'},
            {id: 2, name: 'Инна'},
            {id: 4, name: 'Потеряшки'},
            {id: 0, name: ''}
        ],
        cities: [
            {id: 1, name: 'Москва'},
            {id: 2, name: 'Питер'},
            {id: 6, name: 'Екатеринбург'}
        ],
        markets: [
            {id: 4, name: 'Рынок один в москве', city: {id: 1}},
            {id: 7, name: 'Рынок два в москве', city: {id: 1}},
            {id: 8, name: 'Рынок один в питере', city: {id: 2}},
            {id: 9, name: 'Рынок два в питере', city: {id: 2}}
        ],
        metros: [
            {id: 8, name: 'Метро один в москве', city: {id: 1}},
            {id: 9, name: 'Метро два в москве', city: {id: 1}},
            {id: 10, name: 'Метро один в питере', city: {id: 2}},
            {id: 11, name: 'Метро два в питере', city: {id: 2}}
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
            lastLogin: '2013-12-01',
            status: 'active',
            group: {id: 2},
            dealer: {
                id: 5,
                companyName: 'Демокомпания',
                city: {id: 2},
                market: {id: 8},
                metro: {id: 10},
                address: '191040, Лиговский проспект, 150, оф.505',
                fax: '+7(812)232-4123',
                email: 'demo@demo.ru',
                url: 'http://www.w3schools.com',
                contactName: 'Аверин Константин Петрович',
                phone: '+7(812)232-4123',
                phoneFrom: 10,
                phoneTo: 20,
                phone2: '+7(812)232-4124',
                phone2From: 11,
                phone2To: 21,
                phone3: '+7(812)232-4125',
                phone3From: 7,
                phone3To: 15,
                companyInfo: 'Здесь может быть произвольный текст...',
                manager: {id: 1}
            }
        },
        {id: 1, email: 'a-bobkov@ab.com', lastLogin: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            id: 1, companyName: 'Ещё одна компания', manager: {id: 2}}},
        {id: 2, email: 'a-bobkov@abb.com', lastLogin: '2011-03-11', status: 'active', group: {id: 3}, site: {id: 11}},
        {id: 3, email: 'a-bobkov@abc.com', lastLogin: '2012-05-31', status: 'inactive', group: {id: 2}, dealer: {
            id: 3, companyName: 'Другая компания', manager: {id: 1}}},
        {id: 4, email: 'a-bobkov@act.com', lastLogin: '2011-12-12', status: 'blocked', group: {id: 3}, site: {id: 12}},
        {id: 6, email: 'a-bobkov@abe.com', lastLogin: '2013-01-06', status: 'active', group: {id: 2}, dealer: {
            id: 6, companyName: 'Крутая компания', manager: {id: 2}}},
        {id: 7, email: 'a-bobkov@abf.com', lastLogin: '2010-01-12', status: 'inactive', group: {id: 2}, dealer: {
            id: 7, companyName: 'Auto', manager: {id: 2}}},
        {id: 8, email: 'a-bobkov@abg.com', lastLogin: '2010-08-07', status: 'active', group: {id: 1}},
        {id: 9, email: 'a-bobkov@abh.com', lastLogin: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            id: 9, companyName: 'Битые корыта', manager: {id: 1}}},
        {id: 10, email: 'a-bobkov@abi.com', lastLogin: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            id: 10, companyName: 'Два в одном', manager: {id: 2}}},
        {id: 11, email: 'a-bobkov@abj.com', lastLogin: '2012-01-01', status: 'blocked', group: {id: 3}, site: {id: 11}},
        {id: 12, email: 'a-bobkov@abk.com', lastLogin: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            id: 12, companyName: 'Авто-мото', manager: {id: 0}}},
        {id: 13, email: 'a-bobkov@abl.com', lastLogin: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            id: 13, companyName: 'Свет', manager: {id: 4}}},
        {id: 14, email: 'a-bobkov@abo.com', lastLogin: '2012-01-01', status: 'blocked', group: {id: 3}, site: {id: 12}},
        {id: 15, email: 'a-bobkov@abm.com', lastLogin: '2012-01-01', status: 'active', group: {id: 3}, site: {id: 11}}
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

    function getDeepValue(item, field) {
        var value = item[field.shift()];
        if (field.length && value) {
            return getDeepValue(value, field);
        } else {
            return value;
        }
    }

    function filterItem(item, filter) {

        if (!filter.value) {
            return true;
        }

        var itemValues = _.invoke(filter.fields, function() {
            var value = getDeepValue(item, this.split('.'));
            if (_.isObject(value) && value.id) {
                return String(value.id);
            } else {
                return String(value);
            }
        })

        if (filter.type === 'equal') {
            return _.contains(itemValues, String(filter.value));
        } else if (filter.type === 'in') {
            return _.any(filter.value, function(value) {
                return _.contains(itemValues, String(value));
            });
        } else if (filter.type === 'contain') {
            return _.any(itemValues, function(value) {
                return (value.indexOf(String(filter.value)) !== -1);
            });
        }

        return true;
    }

    function filterArr(arr, filters) {
        return _.filter(arr, function(item) {
            return _.every(filters, function(filter) {
                return filterItem(item, filter);
            });
        })
    }

    var processQueryUrl = function(url, regex, arr, collectionName, collectionConstructor) {

        var search = url.replace(regex, '$1');
        var pairs = search.split('&');
        var params = {};
        _.forEach(pairs, function(value) {
            var param = value.split('=');
            params[param[0]] = param[1];
        })

        var order_field = params.order_field || 'id';
        var order_direction = params.order_direction || 'asc';
        var per_page = Math.min(params.per_page || 100, 100);
        var page = params.page || 1;

        var sorted_arr = _.sortBy(arr, function(item) {
            return getDeepValue(item, order_field.split('.'));
        });

        if (order_direction === 'desc') {
            sorted_arr.reverse();
        }
        var paged_arr = sorted_arr.slice(per_page * (page - 1), per_page * page);

        var respond = [200, {
            status: 'success',
            data: {
                params: {
                    filters: [],
                    order: {
                        field: order_field,
                        direction: order_direction
                    },
                    pager: {
                        per_page:   per_page,
                        page:       page,
                        total:      arr.length
                    },
                    fields: []
                }
            }
        }];
        respond[1].data[collectionName] = (new collectionConstructor(paged_arr)).serialize();

        return respond;
    }

    var processPostQuery = function(url, regex, data, collection, collectionName, collectionConstructor) {
        var filters = angular.fromJson(data).filters;
        var filtered_arr = filterArr(collection.getItems(), filters);
        var respond = processQueryUrl(url, regex, filtered_arr, collectionName, collectionConstructor);
        respond[1].data.params.filters = filters;
        return respond;
    }

    var processGet = function(url, regex, collection, itemName) {
        var id = parseInt(url.replace(regex,'$1'));
        var item = collection.get(id);
        if (item) {
            var respond = [200, {
                status: 'success',
                data: {}
            }];
            respond[1].data[itemName] = item.serialize();
            return respond;
        } else {
            return [404, {
                status: 'error',
                message: 'Not Found',
                errors: 'Не найден ' + itemName + ' с id: ' + id
            }];
        }
    }

    var processPost = function(data, collection, itemName, itemConstuctor, directories) {
        var items = collection.getItems();
        try {
            var item = new itemConstuctor((angular.fromJson(data))[itemName], directories);
        } catch (err) {     // ошибка ссылочной целостности
            return [400, {
                status: 'error',
                message: 'Ошибка при создании',
                errors: err.message
            }];
        }

        if (!item.isValid()) {
            return [400, {
                status: 'error',
                message: 'Validation Failed'
            }];
        }

        item.id = 1 + _.max(items, function(item) {
            return item.id;
        }).id;
        items.push(item);
        var respond = [200, {
            status: 'success',
            data: {}
        }];
        respond[1].data[itemName] = item.serialize();
        return respond;
    };

    var processPut = function(url, regex, data, collection, itemName, itemConstuctor, directories) {
        var id = parseInt(url.replace(regex,'$1'));
        var items = collection.getItems();
        var idx = _.findIndex(items, {id: id});
        if (idx === -1) {
            return [404, {
                status: 'error',
                message: 'Not Found',
                errors: 'Не найден элемент с id: ' + id
            }];
        }

        try {
            var item = new itemConstuctor((angular.fromJson(data))[itemName], directories);
        } catch (err) {     // ошибка ссылочной целостности
            return [400, {
                status: 'error',
                message: 'Ошибка при обновлении',
                errors: err.message
            }];
        }

        if (!item.isValid()) {
            return [400, {
                status: 'error',
                message: 'Validation Failed'
            }];
        }

        items[idx] = item;
        var respond = [200, {
            status: 'success',
            data: {}
        }];
        respond[1].data[itemName] = item.serialize();
        return respond;
    };

    var processDelete = function(url, regex, collection) {
        var id = parseInt(url.replace(regex,'$1'));
        var items = collection.getItems();
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
                message: 'Not Found',
                errors: 'Не найден элемент с id: ' + id
            }];
        }
    };

    var regexUserDirectories = /^\/api2\/combined\/users$/;
    $httpBackend.whenGET(regexUserDirectories).respond(function(method, url, data) {
        try {
            var directories = _.mapValues(userDirectories, function(directory) {
               return directory.serialize();
            });
        } catch (err) {
            return [400, {
                status: 'error',
                message: 'Ошибка при загрузке справочников',
                errors: err.message
            }];
        }
        return [200, {
            status: 'success',
            data: directories
        }];
    });

    var regexUserQuery = /^\/api2\/users(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexUserQuery).respond(function(method, url, data) {
        return processQueryUrl(url, regexUserQuery, users.getItems(), 'users', Users);
    });
    $httpBackend.whenPOST(regexUserQuery).respond(function(method, url, data) {
        return processPostQuery (url, regexUserQuery, data, users, 'users', Users);
    });

    var regexUserGet = /^\/api2\/users\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexUserGet).respond(function(method, url, data) {
        return processGet(url, regexUserGet, users, 'user');
    });

    var regexUserPost = /^\/api2\/users\/new$/;
    $httpBackend.whenPOST(regexUserPost).respond(function(method, url, data) {
        return processPost(data, users, 'user', User, userDirectories);
    });

    var regexUserPut = /^\/api2\/users\/(?:([^\/]+))$/;
    $httpBackend.whenPUT(regexUserPut).respond(function(method, url, data) {
        return processPut(url, regexUserPut, data, users, 'user', User, userDirectories);
    });

    var regexUserDelete = /^\/api2\/users\/(?:([^\/]+))$/;
    $httpBackend.whenDELETE(regexUserDelete).respond(function(method, url, data) {
        return processDelete(url, regexUserDelete, users);
    });
};
