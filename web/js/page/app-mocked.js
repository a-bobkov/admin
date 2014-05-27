
angular.module('RootApp-mocked', ['RootApp', 'ngMockE2E'])

.run(function($httpBackend, usersLoader, User, Users, 
    dealerSitesLoader, dealerSiteStatusesLoader, dealersLoader, sitesLoader, 
    DealerSite, DealerSites, Dealers, Sites, dealerSiteLoginsLoader, DealerSiteLogins, DealerSiteLogin,
    tariffsLoader, Tariffs, salesLoader, saleTypesLoader, saleStatusesLoader, Sales, 
    dealerTariffsLoader, DealerTariffs, tariffRatesLoader, TariffRates) {

    $httpBackend.whenGET(/template\/.*/).passThrough();
    setHttpMock($httpBackend, usersLoader, User, Users, 100, 
        dealerSitesLoader, dealerSiteStatusesLoader, dealersLoader, sitesLoader, 
        DealerSite, DealerSites, Dealers, Sites, dealerSiteLoginsLoader, DealerSiteLogins, DealerSiteLogin,
        tariffsLoader, Tariffs, salesLoader, saleTypesLoader, saleStatusesLoader, Sales, 
        dealerTariffsLoader, DealerTariffs, tariffRatesLoader, TariffRates);
});

/**
 * мини-сервер http для комплексных тестов
 */
function setHttpMock($httpBackend, usersLoader, User, Users, multiplyUsersCoef, 
    dealerSitesLoader, dealerSiteStatusesLoader, dealersLoader, sitesLoader, 
    DealerSite, DealerSites, Dealers, Sites, dealerSiteLoginsLoader, DealerSiteLogins, DealerSiteLogin,
    tariffsLoader, Tariffs, salesLoader, saleTypesLoader, saleStatusesLoader, Sales, 
    dealerTariffsLoader, DealerTariffs, tariffRatesLoader, TariffRates) {

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
        } else if (_.isObject(value) && value.id !== undefined) {
            return value.id;
        } else {
            return value;
        }
    }

    function filterItem(item, filter) {

        if (filter.value === undefined) {
            return true;
        }

        var itemValues = _.invoke(filter.fields, function() {
            var value = getDeepValue(item, this.split('.'));
            if (_.isObject(value) && (value.id !== undefined)) {
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
                return (value.toLowerCase().indexOf(String(filter.value).toLowerCase()) !== -1);
            });
        } else if (filter.type === 'greaterOrEqual') {
            return _.any(itemValues, function(value) {
                return (value >= filter.value);
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

    var dealers = dealersLoader.makeCollection([
        {id: 1, companyName: 'Дилер-авто', city: {id: 1}},
        {id: 2, companyName: 'Дилер-мото', city: {id: 2}},
        {id: 3, companyName: 'Региональный', city: {id: 6}}
    ], null, {cities: userDirectories.cities});

    var sites = sitesLoader.makeCollection([
        {id: 1, name: 'Дром'},
        {id: 5, name: 'Ауто'},
        {id: 6, name: 'ИРР'},
        {id: 13, name: 'Кьюто'},
        {id: 14, name: 'Авито'},
        {id: 21, name: 'Дром'},
        {id: 25, name: 'Ауто'},
        {id: 26, name: 'ИРР'},
        {id: 33, name: 'Кьюто'},
        {id: 34, name: 'Авито'},
        {id: 41, name: 'Дром'},
        {id: 45, name: 'Ауто'},
        {id: 46, name: 'ИРР'},
        {id: 53, name: 'Кьюто'},
        {id: 54, name: 'Авито'}
    ]);

    var dealerSiteStatuses = dealerSiteStatusesLoader.makeCollection([
        { 'id': true, 'name': 'Акт' },
        { 'id': false, 'name': 'Бло' }
    ]);

    var dealerSites = dealerSitesLoader.makeCollection(multiplyArr([
        {
            id: 1,
            dealer: {id: 1},
            site: {id: 1},
            publicUrl: 'http://www.drom.ru/1.html',
            isActive: true
        },
        {
            id: 2,
            dealer: {id: 1},
            site: {id: 5},
            externalId: '1109238',
            publicUrl: 'http://www.auto.mail.ru/1109238.html',
            isActive: true
        },
        {
            id: 3,
            dealer: {id: 1},
            site: {id: 13},
            externalId: '1109',
            isActive: false
        },
        {
            id: 4,
            dealer: {id: 1},
            site: {id: 14},
            isActive: true
        },
        {
            id: 5,
            dealer: {id: 2},
            site: {id: 1},
            publicUrl: 'http://www.drom.ru/2.html',
            isActive: true
        },
        {
            id: 6,
            dealer: {id: 2},
            site: {id: 5},
            externalId: '11983248',
            publicUrl: 'http://www.auto.mail.ru/11983248.html',
            isActive: false
        },
        {
            id: 7,
            dealer: {id: 2},
            site: {id: 13},
            externalId: '1110',
            isActive: true
        },
        {
            id: 8,
            dealer: {id: 2},
            site: {id: 14},
            isActive: false
        },
        {
            id: 9,
            dealer: {id: 1},
            site: {id: 6},
            externalId: '119832',
            publicUrl: 'http://www.irr.ru/pages/119832.html',
            isActive: true
        }
    ], multiplyUsersCoef), null, {dealerSiteStatuses: dealerSiteStatuses, dealers: dealers, sites: sites});

    var dealerSiteLogins = dealerSiteLoginsLoader.makeCollection([
        {
            id: 1,
            dealer: {id: 1},
            site: {id: 5},
            type: 'site',
            login: 'priv1108',
            password: 'abyrabyr',
            loginError: true
        },
        {
            id: 2,
            dealer: {id: 1},
            site: {id: 14},
            type: 'site',
            login: 'priv1108',
            password: 'abyr1010',
            loginError: false
        },
        {
            id: 3,
            dealer: {id: 2},
            site: {id: 5},
            type: 'site',
            login: 'pri29834',
            password: 'asdfghj',
            loginError: false
        },
        {
            id: 4,
            dealer: {id: 2},
            site: {id: 14},
            type: 'site',
            login: 'pri29834',
            password: 'abyr1110',
            loginError: false
        },
        {
            id: 5,
            dealer: {id: 1},
            site: {id: 6},
            type: 'site',
            login: 'as119832',
            password: 'ab1110as',
            loginError: false
        },
        {
            id: 6,
            dealer: {id: 1},
            site: {id: 6},
            type: 'ftp',
            login: 'pr119832',
            password: 'abyr1110',
            loginError: true
        }
    ], null, {dealers: dealers, sites: sites});

    var regexDealerSitesQuery = /^\/api2\/dealersites(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexDealerSitesQuery).respond(function(method, url, data) {
        return processQueryUrl(url, regexDealerSitesQuery, dealerSites.getItems(), 'dealerSites', DealerSites);
    });
    $httpBackend.whenPOST(regexDealerSitesQuery).respond(function(method, url, data) {
        return processPostQuery(url, regexDealerSitesQuery, data, dealerSites, 'dealerSites', DealerSites);
    });
    var regexDealerSitesGet = /^\/api2\/dealersites\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexDealerSitesGet).respond(function(method, url, data) {
        return processGet(url, regexDealerSitesGet, dealerSites, 'dealerSite');
    });
    var regexDealerSitesPost = /^\/api2\/dealersites\/new$/;
    $httpBackend.whenPOST(regexDealerSitesPost).respond(function(method, url, data) {
        return processPost(data, dealerSites, 'dealerSite', DealerSite, {
            dealers: dealers,
            sites: sites,
            dealerSiteStatuses: dealerSiteStatuses
        });
    });
    var regexDealerSitesPut = /^\/api2\/dealersites\/(?:([^\/]+))$/;
    $httpBackend.whenPUT(regexDealerSitesPut).respond(function(method, url, data) {
        return processPut(url, regexDealerSitesPut, data, dealerSites, 'dealerSite', DealerSite, {
            dealers: dealers,
            sites: sites,
            dealerSiteStatuses: dealerSiteStatuses
        });
    });
    var regexDealerSitesDelete = /^\/api2\/dealersites\/(?:([^\/]+))$/;
    $httpBackend.whenDELETE(regexDealerSitesDelete).respond(function(method, url, data) {
        return processDelete(url, regexDealerSitesDelete, dealerSites);
    });

    var regexDealerSiteLoginsQuery = /^\/api2\/dealersitelogins(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexDealerSiteLoginsQuery).respond(function(method, url, data) {
        return processQueryUrl(url, regexDealerSiteLoginsQuery, dealerSiteLogins.getItems(), 'dealerSiteLogins', DealerSiteLogins);
    });
    $httpBackend.whenPOST(regexDealerSiteLoginsQuery).respond(function(method, url, data) {
        return processPostQuery(url, regexDealerSiteLoginsQuery, data, dealerSiteLogins, 'dealerSiteLogins', DealerSiteLogins);
    });
    var regexDealerSiteLoginsGet = /^\/api2\/dealersitelogins\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexDealerSiteLoginsGet).respond(function(method, url, data) {
        return processGet(url, regexDealerSiteLoginsGet, dealerSiteLogins, 'dealerSiteLogin');
    });
    var regexDealerSiteLoginsPost = /^\/api2\/dealersitelogins\/new$/;
    $httpBackend.whenPOST(regexDealerSiteLoginsPost).respond(function(method, url, data) {
        return processPost(data, dealerSiteLogins, 'dealerSiteLogin', DealerSiteLogin, {
            dealers: dealers,
            sites: sites
        });
    });
    var regexDealerSiteLoginsPut = /^\/api2\/dealersitelogins\/(?:([^\/]+))$/;
    $httpBackend.whenPUT(regexDealerSiteLoginsPut).respond(function(method, url, data) {
        return processPut(url, regexDealerSiteLoginsPut, data, dealerSiteLogins, 'dealerSiteLogin', DealerSiteLogin, {
            dealers: dealers,
            sites: sites
        });
    });
    var regexDealerSiteLoginsDelete = /^\/api2\/dealersitelogins\/(?:([^\/]+))$/;
    $httpBackend.whenDELETE(regexDealerSiteLoginsDelete).respond(function(method, url, data) {
        return processDelete(url, regexDealerSiteLoginsDelete, dealerSiteLogins);
    });

    var regexDealersQuery = /^\/api2\/dealers(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexDealersQuery).respond(function(method, url, data) {
        return processQueryUrl(url, regexDealersQuery, dealers.getItems(), 'dealers', Dealers);
    });
    $httpBackend.whenPOST(regexDealersQuery).respond(function(method, url, data) {

        var applyFields = function(arr, fields) {
            return _.map(arr, function(item) {
                var newItem = {};
                _.forEach(fields, function(group) {
                    if (group === 'dealer_list_name') {
                        newItem.id = item.id;
                        if (item.companyName) {
                            newItem.companyName = item.companyName;
                        }
                    }
                });
                return newItem;
            });
        }

        var knownFields = function(fields) {
            return _.filter(fields, function(group) {
                return (group === 'dealer_list_name');
            });
        }

        var respond = processPostQuery(url, regexDealersQuery, data, dealers, 'dealers', Dealers);
        var fields = angular.fromJson(data).fields;
        if (_.size(fields)) {
            respond[1].data.dealers = applyFields(respond[1].data.dealers, fields);
            respond[1].data.params.fields = knownFields(fields);
        }
        return respond;
    });

    var regexSitesQuery = /^\/api2\/sites(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexSitesQuery).respond(function(method, url, data) {
        return processQueryUrl(url, regexSitesQuery, sites.getItems(), 'sites', Sites);
    });
    $httpBackend.whenPOST(regexSitesQuery).respond(function(method, url, data) {
        return processPostQuery(url, regexSitesQuery, data, sites, 'sites', Sites);
    });

    var tariffs = tariffsLoader.makeCollection([
        {
            id: 1,
            site: {id: 1},
            type: 'periodical',
            period: 10,
            periodUnit: 'day',
            count: 50,
            isActive: true,
            delay: 3,
            groupName: 'Текущие'
        },
        {
            id: 2,
            site: {id: 1},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 75,
            isActive: true,
            delay: 3,
            groupName: 'Текущие'
        },
        {
            id: 3,
            site: {id: 5},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 50,
            isActive: true,
            delay: 3,
            groupName: 'Текущие'
        },
        {
            id: 4,
            site: {id: 6},
            type: 'periodical',
            period: 3,
            periodUnit: 'month',
            count: 75,
            isActive: false,
            delay: 3,
            groupName: 'Текущие'
        }
    ], null, {sites: sites});

    var regexTariffsQuery = /^\/api2\/tariffs(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexTariffsQuery).respond(function(method, url, data) {
        return processQueryUrl(url, regexTariffsQuery, tariffs.getItems(), 'tariffs', Tariffs);
    });
    $httpBackend.whenPOST(regexTariffsQuery).respond(function(method, url, data) {
        return processPostQuery(url, regexTariffsQuery, data, tariffs, 'tariffs', Tariffs);
    });
    var regexTariffsGet = /^\/api2\/tariffs\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexTariffsGet).respond(function(method, url, data) {
        return processGet(url, regexTariffsGet, tariffs, 'tariff');
    });

    var saleTypes = saleTypesLoader.makeCollection([
        { id: 'card', name: 'Осн' },
        { id: 'addcard', name: 'Расш' },
        { id: 'extra', name: 'Доп' }
    ]);

    var saleStatuses = saleStatusesLoader.makeCollection([
        { id: true, name: 'Акт' },
        { id: false, name: 'Бло' }
    ]);

    var sales = salesLoader.makeCollection([
        {
            id: 1,
            type: 'card',
            cardId: 1,
            dealer: {id: 1},
            site: {id: 1},
            tariff: {id: 1},
            cardAmount: 19999.95,
            count: 50,
            activeFrom: '2014-04-01',
            activeTo: '2014-04-30',
            isActive: true,
            date: '2014-03-25',
            amount: 19999.97,
            siteAmount: 14999.97,
            info: 'Основная карточка'
        },
        {
            id: 2,
            type: 'addcard',
            cardId: 2,
            dealer: {id: 1},
            site: {id: 1},
            tariff: {id: 2},
            parentId: 1,
            cardAmount: 29999.95,
            count: 75,
            activeFrom: '2014-04-01',
            activeTo: '2014-04-30',
            isActive: true,
            date: '2014-04-10',
            amount: 29999.97,
            siteAmount: 24999.97,
            info: 'Расширение до 75 объявлений'
        },
        {
            id: 3,
            type: 'extra',
            cardId: 1,
            dealer: {id: 1},
            site: {id: 1},
            activeFrom: '2014-04-01',
            activeTo: '2015-04-30',
            isActive: true,
            date: '2014-04-10',
            amount: 3000.00,
            siteAmount: 2000.00,
            info: 'Выделение рамкой'
        },
        {
            id: 4,
            type: 'card',
            cardId: 3,
            dealer: {id: 2},
            site: {id: 6},
            tariff: {id: 4},
            cardAmount: 19999.95,
            count: 50,
            activeFrom: '2014-04-01',
            activeTo: '2014-04-30',
            isActive: false,
            date: '2014-03-25',
            amount: 19999.97,
            siteAmount: 14999.97,
            info: 'Основная карточка'
        },
    ], null, {dealers: dealers, sites: sites, tariffs: tariffs, saleTypes: saleTypes, saleStatuses: saleStatuses});

    var regexSalesQuery = /^\/api2\/sales(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexSalesQuery).respond(function(method, url, data) {
        return processQueryUrl(url, regexSalesQuery, sales.getItems(), 'sales', Sales);
    });
    $httpBackend.whenPOST(regexSalesQuery).respond(function(method, url, data) {
        return processPostQuery(url, regexSalesQuery, data, sales, 'sales', Sales);
    });
    var regexSalesGet = /^\/api2\/sales\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexSalesGet).respond(function(method, url, data) {
        return processGet(url, regexSalesGet, sales, 'sale');
    });
    var regexSalesPost = /^\/api2\/sales\/new$/;
    $httpBackend.whenPOST(regexSalesPost).respond(function(method, url, data) {
        return processPost(data, sales, 'sale', Sale, {
            dealers: dealers,
            sites: sites,
            tariffs: tariffs,
            saleStatuses: saleStatuses,
            saleTypes: saleTypes
        });
    });
    var regexSalesPut = /^\/api2\/sales\/(?:([^\/]+))$/;
    $httpBackend.whenPUT(regexSalesPut).respond(function(method, url, data) {
        return processPut(url, regexSalesPut, data, sales, 'sale', Sale, {
            dealers: dealers,
            sites: sites,
            tariffs: tariffs,
            saleStatuses: saleStatuses,
            saleTypes: saleTypes
        });
    });
    var regexSalesDelete = /^\/api2\/sales\/(?:([^\/]+))$/;
    $httpBackend.whenDELETE(regexSalesDelete).respond(function(method, url, data) {
        return processDelete(url, regexSalesDelete, sales);
    });

    var dealerTariffs = dealerTariffsLoader.makeCollection([
        {
            id: 1,
            dealer: {id: 1},
            site: {id: 1},
            tariff: {id: 1},
            autoProlong: true,
            renew: '0'
        },
        {
            id: 1,
            dealer: {id: 2},
            site: {id: 1},
            tariff: {id: 2},
            autoProlong: true,
            renew: '0'
        },
        {
            id: 1,
            dealer: {id: 1},
            site: {id: 5},
            tariff: {id: 3},
            autoProlong: true,
            renew: '0'
        }
    ], null, {dealers: dealers, sites: sites, tariffs: tariffs});

    var regexDealerTariffsQuery = /^\/api2\/dealertariffs(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexDealerTariffsQuery).respond(function(method, url, data) {
        return processQueryUrl(url, regexDealerTariffsQuery, dealerTariffs.getItems(), 'dealerTariffs', DealerTariffs);
    });
    $httpBackend.whenPOST(regexDealerTariffsQuery).respond(function(method, url, data) {
        return processPostQuery(url, regexDealerTariffsQuery, data, dealerTariffs, 'dealerTariffs', DealerTariffs);
    });
    var regexDealerTariffsGet = /^\/api2\/dealertariffs\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexDealerTariffsGet).respond(function(method, url, data) {
        return processGet(url, regexDealerTariffsGet, dealerTariffs, 'dealerTariff');
    });

    var tariffRates = tariffRatesLoader.makeCollection([
        {
            id: 1,
            tariff: {id: 1},
            city: {id: 1},
            activeFrom: '2014-01-01',
            rate: 10000,
            siteRate: 7000,
            info: 'Помесячный за 50 в Москве'
        },
        {
            id: 2,
            tariff: {id: 1},
            city: {id: 1},
            activeFrom: '2014-01-01',
            rate: 7000,
            siteRate: 5000,
            info: 'Помесячный за 50 в Питере'
        },
        {
            id: 3,
            tariff: {id: 1},
            city: null,
            activeFrom: '2014-01-01',
            rate: 5000,
            siteRate: 3000,
            info: 'Помесячный за 50 общий'
        },
        {
            id: 4,
            tariff: {id: 2},
            city: {id: 1},
            activeFrom: '2014-01-01',
            rate: 15000,
            siteRate: 10000,
            info: 'Помесячный за 75 в Москве'
        },
        {
            id: 5,
            tariff: {id: 2},
            city: {id: 1},
            activeFrom: '2014-01-01',
            rate: 10000,
            siteRate: 7500,
            info: 'Помесячный за 75 в Питере'
        },
        {
            id: 6,
            tariff: {id: 2},
            city: null,
            activeFrom: '2014-01-01',
            rate: 7000,
            siteRate: 5000,
            info: 'Помесячный за 75 общий'
        },
        {
            id: 7,
            tariff: {id: 3},
            city: null,
            activeFrom: '2014-06-30',
            rate: 7000,
            siteRate: 5000,
            info: 'Только общая'
        }
    ], null, {tariffs: tariffs, cities: userDirectories.cities});

    var regexTariffRatesQuery = /^\/api2\/tariffrates(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexTariffRatesQuery).respond(function(method, url, data) {
        return processQueryUrl(url, regexTariffRatesQuery, tariffRates.getItems(), 'tariffRates', TariffRates);
    });
    $httpBackend.whenPOST(regexTariffRatesQuery).respond(function(method, url, data) {
        return processPostQuery(url, regexTariffRatesQuery, data, tariffRates, 'tariffRates', TariffRates);
    });
    var regexTariffRatesGet = /^\/api2\/tariffrates\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexTariffRatesGet).respond(function(method, url, data) {
        return processGet(url, regexTariffRatesGet, tariffRates, 'tariffRate');
    });
};
