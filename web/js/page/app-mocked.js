
angular.module('RootApp-mocked', ['RootApp', 'ngMockE2E'])

.run(function($httpBackend, usersLoader, User, Users, 
    dealerSitesLoader, dealerSiteStatusesLoader, dealersLoader, sitesLoader, 
    DealerSite, DealerSites, Dealers, Sites, dealerSiteLoginsLoader, DealerSiteLogins, DealerSiteLogin,
    tariffsLoader, Tariffs, salesLoader, saleTypesLoader, saleStatusesLoader, Sales, Sale,
    dealerTariffsLoader, DealerTariffs, tariffRatesLoader, TariffRates) {

    $httpBackend.whenGET(/template\/.*/).passThrough();
    setHttpMock($httpBackend, usersLoader, User, Users, 10, 
        dealerSitesLoader, dealerSiteStatusesLoader, dealersLoader, sitesLoader, 
        DealerSite, DealerSites, Dealers, Sites, dealerSiteLoginsLoader, DealerSiteLogins, DealerSiteLogin,
        tariffsLoader, Tariffs, salesLoader, saleTypesLoader, saleStatusesLoader, Sales, Sale,
        dealerTariffsLoader, DealerTariffs, tariffRatesLoader, TariffRates);
});

/**
 * мини-сервер http для комплексных тестов
 */
function setHttpMock($httpBackend, usersLoader, User, Users, multiplyCoef, 
    dealerSitesLoader, dealerSiteStatusesLoader, dealersLoader, sitesLoader, 
    DealerSite, DealerSites, Dealers, Sites, dealerSiteLoginsLoader, DealerSiteLogins, DealerSiteLogin,
    tariffsLoader, Tariffs, salesLoader, saleTypesLoader, saleStatusesLoader, Sales, Sale,
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
            {id: 1,  name: 'drom.ru'},
            {id: 2,  name: 'bibika.ru'},
            {id: 3,  name: 'autorambler.ru'},
            {id: 4,  name: 'auto.mail.ru'},
            {id: 5,  name: 'auto.ru'},
            {id: 6,  name: 'irr.ru'},
            {id: 7,  name: 'chance.ru'},
            {id: 8,  name: 'auto.yandex.ru'},
            {id: 9,  name: 'auto.dmir.ru'},
            {id: 10, name: 'auto-mos.ru'},
            {id: 11, name: 'cars.ru'},
            {id: 12, name: 'usedcars.ru'},
            {id: 13, name: 'quto.ru'},
            {id: 14, name: 'avito.ru'},
            {id: 15, name: 'fin-auto.ru'},
            {id: 16, name: 'auto.exist.ru'},
            {id: 17, name: 'am.ru'},
            {id: 18, name: 'mercedes-benz.ru'}
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
        {id: 2, email: 'a-bobkov@abb.com', lastLogin: '2011-03-11', status: 'active', group: {id: 3}, site: {id: 1}},
        {id: 3, email: 'a-bobkov@abc.com', lastLogin: '2012-05-31', status: 'inactive', group: {id: 2}, dealer: {
            id: 3, companyName: 'Другая компания', manager: {id: 1}}},
        {id: 4, email: 'a-bobkov@act.com', lastLogin: '2011-12-12', status: 'blocked', group: {id: 3}, site: {id: 5}},
        {id: 6, email: 'a-bobkov@abe.com', lastLogin: '2013-01-06', status: 'active', group: {id: 2}, dealer: {
            id: 6, companyName: 'Крутая компания', manager: {id: 2}}},
        {id: 7, email: 'a-bobkov@abf.com', lastLogin: '2010-01-12', status: 'inactive', group: {id: 2}, dealer: {
            id: 7, companyName: 'Auto', manager: {id: 2}}},
        {id: 8, email: 'a-bobkov@abg.com', lastLogin: '2010-08-07', status: 'active', group: {id: 1}},
        {id: 9, email: 'a-bobkov@abh.com', lastLogin: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            id: 9, companyName: 'Битые корыта', manager: {id: 1}}},
        {id: 10, email: 'a-bobkov@abi.com', lastLogin: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            id: 10, companyName: 'Два в одном', manager: {id: 2}}},
        {id: 11, email: 'a-bobkov@abj.com', lastLogin: '2012-01-01', status: 'blocked', group: {id: 3}, site: {id: 1}},
        {id: 12, email: 'a-bobkov@abk.com', lastLogin: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            id: 12, companyName: 'Авто-мото', manager: {id: 0}}},
        {id: 13, email: 'a-bobkov@abl.com', lastLogin: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            id: 13, companyName: 'Свет', manager: {id: 4}}},
        {id: 14, email: 'a-bobkov@abo.com', lastLogin: '2012-01-01', status: 'blocked', group: {id: 3}, site: {id: 6}},
        {id: 15, email: 'a-bobkov@abm.com', lastLogin: '2012-01-01', status: 'active', group: {id: 3}, site: {id: 1}}
    ], multiplyCoef), null, userDirectories);
    
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
            } else if (_.isDate(value)) {
                return value.toISOString().slice(0, 10);
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

    var processPost = function(data, collection, itemName, itemConstuctor, directories, processId) {
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
        if (processId) {
            processId.call(item);
        }
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
        {id: 3,   companyName: 'NevaMotors', city: {id: 1}},
        {id: 4,   companyName: 'Автобург', city: {id: 1}},
        {id: 5,   companyName: 'Демо-Кампания', city: {id: 1}},
        {id: 6,   companyName: 'AutoVitrina', city: {id: 1}},
        {id: 7,   companyName: 'Автосалон "АВТОИМПУЛЬС"', city: {id: 1}},
        {id: 14,  companyName: 'Сигма', city: {id: 1}},
        {id: 16,  companyName: 'АвтоВелоМото', city: {id: 1}},
        {id: 17,  companyName: 'СПб-Авто', city: {id: 2}},
        {id: 22,  companyName: 'ООО «Омега-Сервис»', city: {id: 1}},
        {id: 23,  companyName: 'Автосалон "ksmotors"', city: {id: 1}},
        {id: 24,  companyName: 'Автосалон "Автогалактика"', city: {id: 1}},
        {id: 25,  companyName: 'автосалон "РЕАЛ"', city: {id: 1}},
        {id: 28,  companyName: 'Кидалы', city: {id: 1}},
        {id: 30,  companyName: 'Автосалон "Первое Автомобильное Агентство"', city: {id: 1}},
        {id: 31,  companyName: 'Арсенал Моторс', city: {id: 1}},
        {id: 32,  companyName: 'ELIBRI залоговые автомобили', city: {id: 1}},
        {id: 35,  companyName: 'Aвтосалон "Меридиан"', city: {id: 1}},
        {id: 36,  companyName: 'Автосалон "Finemotors"', city: {id: 1}},
        {id: 37,  companyName: 'Автосалон "Авто-Трейдер"', city: {id: 1}},
        {id: 38,  companyName: 'ООО "Свид-Мобиль" офицальный дилер VOLVO', city: {id: 1}},
        {id: 45,  companyName: 'ЗАО «Евросиб Лахта» Официальный дилер BMW и MINI', city: {id: 1}},
        {id: 46,  companyName: 'ООО АВТОБРЕНД', city: {id: 1}},
        {id: 47,  companyName: 'С-Пб., м. Елизаровская,ул. Бабушкина д.21', city: {id: 2}},
        {id: 48,  companyName: 'Автосалон "Победа авто"', city: {id: 1}},
        {id: 50,  companyName: 'Автосалон "Берейт Авто"', city: {id: 1}},
        {id: 51,  companyName: 'АВТОПРЕМИУМ-СПб', city: {id: 2}},
        {id: 52,  companyName: 'Тойота Центр Пискаревский', city: {id: 2}},
        {id: 53,  companyName: 'Тойота Центр Пулково', city: {id: 2}},
        {id: 54,  companyName: 'Лексус центр Пулково', city: {id: 2}},
        {id: 56,  companyName: 'АвтоПремиум СПб', city: {id: 2}},
        {id: 57,  companyName: 'КОРАВТО-ПИТЕР', city: {id: 1}},
        {id: 58,  companyName: 'ООО "Eagle motors"', city: {id: 1}},
        {id: 59,  companyName: 'ООО«Автоцентр Лаура-Купчино» GM', city: {id: 2}},
        {id: 60,  companyName: 'Автоцентр К14', city: {id: 1}},
        {id: 61,  companyName: 'Автосалон "СЗ АВТО"', city: {id: 1}},
        {id: 63,  companyName: 'АВТОСАЛОН "ИНЕКС"', city: {id: 1}},
        {id: 64,  companyName: 'ООО “ТОРГ МАШ” - Автосалон автомобилей с пробегом.', city: {id: 1}},
        {id: 66,  companyName: 'ООО АВАНГАРД ОФИЦИАЛЬНЫЙ ДИЛЕР «МЕRCEDES-BENZ»', city: {id: 1}},
        {id: 67,  companyName: 'Атлант-М Лахта', city: {id: 1}},
        {id: 68,  companyName: 'Ауди Центр Петербург', city: {id: 2}},
        {id: 70,  companyName: 'Автосалон "Победа авто" Лиговский', city: {id: 2}},
        {id: 72,  companyName: 'АВТОВЕРНИСАЖ  магазин автомобилей', city: {id: 1}},
        {id: 74,  companyName: 'ООО «СТК Центр»', city: {id: 1}},
        {id: 77,  companyName: 'Группа Компаний "АВТОПРОДИКС"', city: {id: 1}},
        {id: 78,  companyName: 'ЗАО «Автобиография»', city: {id: 1}},
        {id: 79,  companyName: 'ЗАО «Аксель Моторс Север» Официальный дилер BMW', city: {id: 1}},
        {id: 80,  companyName: 'ЗАО «АКСЕЛЬ МОТОРС» ОФИЦИАЛЬНЫЙ ДИЛЕР BMW', city: {id: 1}},
        {id: 81,  companyName: 'AUTO SELECTION', city: {id: 1}},
        {id: 82,  companyName: '"Полюстрово Авто"', city: {id: 2}},
        {id: 83,  companyName: 'Автосалон "РИ-АВТО": Авто с пробегом', city: {id: 1}},
        {id: 84,  companyName: 'Автосалон "Агат-авто на Бабушкина"', city: {id: 1}},
        {id: 85,  companyName: 'ODService', city: {id: 1}},
        {id: 88,  companyName: 'Авто-мото салон <<ART-MOTERS>> Aвтомобили и мототехника с пробегом', city: {id: 1}},
        {id: 89,  companyName: 'Официальный дилер Volkswagen. ООО "Аксель-Сити"', city: {id: 1}},
        {id: 90,  companyName: 'ООО "Аксель-Сити Юг"', city: {id: 1}},
        {id: 92,  companyName: 'ООО "Нитро"', city: {id: 1}},
        {id: 95,  companyName: 'Автомобильное агентство "АвтоМиг"', city: {id: 1}},
        {id: 97,  companyName: 'Автосалон ', city: {id: 1}},
        {id: 98,  companyName: 'АтлантМ-Лахта Новые автомобили', city: {id: 1}},
        {id: 101, companyName: 'Автосалон "Express Auto"', city: {id: 1}},
        {id: 103, companyName: 'МОСАВТОТРЕЙД', city: {id: 1}},
        {id: 104, companyName: 'ЗАО Компания "Феникс Моторс"', city: {id: 1}},
        {id: 106, companyName: 'Карвилле', city: {id: 1}},
        {id: 107, companyName: 'Carville Южный порт', city: {id: 1}},
        {id: 108, companyName: 'Первая Автомобильная Компания', city: {id: 1}},
        {id: 110, companyName: '"Alex Cars" Автосалон', city: {id: 1}},
        {id: 111, companyName: 'Первая Автомобильная Компания', city: {id: 1}},
        {id: 112, companyName: '1ПАК', city: {id: 1}},
        {id: 113, companyName: 'Автосалон "Komfort-Auto"', city: {id: 1}},
        {id: 114, companyName: 'автосалон "WESTCARS"', city: {id: 1}},
        {id: 116, companyName: 'Автосалон "Автомобили для всех"', city: {id: 1}},
        {id: 117, companyName: 'Центр Автокредитов', city: {id: 1}},
        {id: 118, companyName: 'Автомобили с пробегом', city: {id: 1}},
        {id: 121, companyName: 'Автосалон "Авто Бутик"', city: {id: 1}},
        {id: 122, companyName: 'Автосалон "CAR-TRADING"', city: {id: 1}},
        {id: 126, companyName: 'ОГНИ МОСКВЫ', city: {id: 1}},
        {id: 127, companyName: 'Автосалон "AWD-AUTO"', city: {id: 1}},
        {id: 131, companyName: 'ООО "7 УРОВЕНЬ"', city: {id: 1}},
        {id: 133, companyName: 'Технический Центр "Кунцево" отдел Trade-in', city: {id: 1}},
        {id: 134, companyName: 'Автосалон "На Выборгской"', city: {id: 2}},
        {id: 135, companyName: 'Автосалон "АЛЬФА-МОТОРС"', city: {id: 1}},
        {id: 137, companyName: 'Автосалон "Формула Авто"', city: {id: 1}},
        {id: 140, companyName: 'Автосалон "Авто Лэнд"', city: {id: 1}},
        {id: 141, companyName: 'Автосалон "Мультиван Клуб"', city: {id: 1}},
        {id: 142, companyName: 'Автосалон "Виано Клуб"', city: {id: 1}},
        {id: 143, companyName: 'Автосалон "АЛЬЯНС-АВТО"', city: {id: 1}},
        {id: 145, companyName: 'АВТОСАЛОН "AC MOTORS"', city: {id: 1}},
        {id: 149, companyName: 'Агат-авто', city: {id: 1}},
        {id: 151, companyName: 'Автосалон "АвтоРитетофф"', city: {id: 1}},
        {id: 152, companyName: '"АвтоЦентр ГРЕНАДА"', city: {id: 1}},
        {id: 154, companyName: 'Автосалон "РЕАЛ"', city: {id: 1}},
        {id: 156, companyName: 'Автосалон "Super-Аuto"', city: {id: 1}},
        {id: 157, companyName: 'Автосалон "ТерраАвто"', city: {id: 1}},
        {id: 158, companyName: 'Автосалон "СТОКАВТО"', city: {id: 1}},
        {id: 159, companyName: 'Автосалон  "Браво"', city: {id: 1}},
        {id: 160, companyName: 'Автосалон "Экспресс Авто"', city: {id: 1}},
        {id: 161, companyName: 'Автомобильное Агентство ИМПЭКС', city: {id: 1}},
        {id: 162, companyName: 'Автосалон "Автополюс"', city: {id: 1}},
        {id: 163, companyName: 'Автосалон "РЕАЛ АВТО"', city: {id: 1}},
        {id: 164, companyName: 'ООО "Адмирал Моторс"', city: {id: 1}},
        {id: 165, companyName: '"Dream cars"', city: {id: 1}},
        {id: 166, companyName: 'Автосалон "EUROMOTORS"', city: {id: 1}},
        {id: 168, companyName: 'Автосалон "ИнтерАвто"', city: {id: 1}},
        {id: 169, companyName: 'Автосалон "Калужский"', city: {id: 1}},
        {id: 170, companyName: 'ООО "Ост Вест Авто"', city: {id: 1}},
        {id: 171, companyName: 'Авторезерв, официальный дилер SkodaAuto, отдел trade-in', city: {id: 1}},
        {id: 172, companyName: 'Автосалон "Мото.Точка"', city: {id: 1}},
        {id: 174, companyName: 'Автосалон "Аврора Авто"', city: {id: 1}},
        {id: 175, companyName: 'Автосалон "АврораАвто2"', city: {id: 1}},
        {id: 176, companyName: 'Автосалон "Авто Выкуп"', city: {id: 1}},
        {id: 177, companyName: 'Частное Автомобильное Бюро', city: {id: 1}},
        {id: 178, companyName: 'Аврора Авто Петербург', city: {id: 2}},
        {id: 179, companyName: 'АврораАвто', city: {id: 1}},
        {id: 180, companyName: 'Автомобильное агентство  "CarWill"', city: {id: 1}},
        {id: 181, companyName: 'Автосалон "AutoSort"', city: {id: 1}},
        {id: 183, companyName: 'Автосалон в Марьино', city: {id: 1}},
        {id: 186, companyName: 'Автосалон "Нью Моторс"', city: {id: 1}},
        {id: 187, companyName: 'Автосалон "Автобизнес"', city: {id: 1}},
        {id: 188, companyName: 'Автосалон "Дилижанс"', city: {id: 1}},
        {id: 189, companyName: 'Автосалон "Alex-Cars"', city: {id: 1}},
        {id: 190, companyName: 'Автомобильная компания "SKA"', city: {id: 1}},
        {id: 191, companyName: 'ПРЕСТИЖ МОТОРС', city: {id: 1}},
        {id: 192, companyName: 'ПРЕСТИЖ МОТОРС', city: {id: 1}},
        {id: 193, companyName: 'ПРЕСТИЖ МОТОРС', city: {id: 1}},
        {id: 194, companyName: 'Starex Spb', city: {id: 2}},
        {id: 195, companyName: 'ООО Альфа-Трейд', city: {id: 1}},
        {id: 196, companyName: 'ООО "ПРЕСТИЖ АВТО"', city: {id: 1}},
        {id: 197, companyName: 'АВТОБАВАРИЯ', city: {id: 1}},
        {id: 198, companyName: 'АВТОВИТРИНА', city: {id: 1}},
        {id: 199, companyName: 'МиниБас.рф', city: {id: 1}},
        {id: 200, companyName: 'ООО "Альянс-ДВ"', city: {id: 1}},
        {id: 201, companyName: 'Автосалон "АвтоЛига"', city: {id: 1}},
        {id: 202, companyName: 'АвтоСитиМоторс', city: {id: 1}},
        {id: 204, companyName: 'АВМ-плюс', city: {id: 1}},
        {id: 205, companyName: 'Автосалон "Каширка 39"', city: {id: 1}},
        {id: 206, companyName: 'Автосалон', city: {id: 1}},
        {id: 208, companyName: 'Автосалон "ARTMAXX-AUTO"', city: {id: 1}},
        {id: 209, companyName: 'Автоцентр Кутузовский', city: {id: 1}},
        {id: 210, companyName: 'Автосалон "AutoCityHall"', city: {id: 1}},
        {id: 211, companyName: 'Автосалон "MR.MOTORS"', city: {id: 1}},
        {id: 212, companyName: 'Автосалон "Next-Car"', city: {id: 1}},
        {id: 213, companyName: 'Эльгида-Моторс', city: {id: 1}},
        {id: 215, companyName: 'Автосалон "L.S.Auto"', city: {id: 1}},
        {id: 216, companyName: 'Автосалон "SMotorS"', city: {id: 1}},
        {id: 217, companyName: '"SVS MOTORS"', city: {id: 1}},
        {id: 219, companyName: '777-AUTO', city: {id: 1}},
        {id: 220, companyName: 'У Сервис+ ', city: {id: 1}},
        {id: 221, companyName: 'Автосалон "Престиж Авто"', city: {id: 1}},
        {id: 222, companyName: 'Автоволна', city: {id: 1}},
        {id: 223, companyName: 'Автосалон "Эльва Моторс" официальный дилер SsangYong и FIAT', city: {id: 1}},
        {id: 413, companyName: 'Смольнинский Автоцентр - официальный дилер VOLVO', city: {id: 1}},
        {id: 553, companyName: 'Официальный дилер FORD компания ЗАО «ЕВРО-МОТОРС».', city: {id: 1}}
    ], null, {cities: userDirectories.cities});

    var sites = sitesLoader.makeCollection([
        {id: 1,  name: 'drom.ru'},
        {id: 2,  name: 'bibika.ru'},
        {id: 3,  name: 'autorambler.ru'},
        {id: 4,  name: 'auto.mail.ru'},
        {id: 5,  name: 'auto.ru'},
        {id: 6,  name: 'irr.ru'},
        {id: 7,  name: 'chance.ru'},
        {id: 8,  name: 'auto.yandex.ru'},
        {id: 9,  name: 'auto.dmir.ru'},
        {id: 10, name: 'auto-mos.ru'},
        {id: 11, name: 'cars.ru'},
        {id: 12, name: 'usedcars.ru'},
        {id: 13, name: 'quto.ru'},
        {id: 14, name: 'avito.ru'},
        {id: 15, name: 'fin-auto.ru'},
        {id: 16, name: 'auto.exist.ru'},
        {id: 17, name: 'am.ru'},
        {id: 18, name: 'mercedes-benz.ru'}
    ]);

    var dealerSiteStatuses = dealerSiteStatusesLoader.makeCollection([
        { 'id': true, 'name': 'Акт' },
        { 'id': false, 'name': 'Бло' }
    ]);

    var dealerSites = dealerSitesLoader.makeCollection(multiplyArr([
        {
            id: 1,
            dealer: {id: 7},
            site: {id: 1},
            publicUrl: 'http://www.drom.ru/1.html',
            isActive: true
        },
        {
            id: 2,
            dealer: {id: 7},
            site: {id: 5},
            externalId: '1109238',
            publicUrl: 'http://www.auto.mail.ru/1109238.html',
            isActive: true
        },
        {
            id: 3,
            dealer: {id: 7},
            site: {id: 13},
            externalId: '1109',
            isActive: false
        },
        {
            id: 4,
            dealer: {id: 7},
            site: {id: 14},
            isActive: true
        },
        {
            id: 5,
            dealer: {id: 17},
            site: {id: 1},
            publicUrl: 'http://www.drom.ru/2.html',
            isActive: true
        },
        {
            id: 6,
            dealer: {id: 17},
            site: {id: 5},
            externalId: '11983248',
            publicUrl: 'http://www.auto.mail.ru/11983248.html',
            isActive: false
        },
        {
            id: 7,
            dealer: {id: 17},
            site: {id: 13},
            externalId: '1110',
            isActive: true
        },
        {
            id: 8,
            dealer: {id: 17},
            site: {id: 14},
            isActive: false
        },
        {
            id: 9,
            dealer: {id: 7},
            site: {id: 6},
            externalId: '119832',
            publicUrl: 'http://www.irr.ru/pages/119832.html',
            isActive: true
        }
    ], multiplyCoef), null, {dealerSiteStatuses: dealerSiteStatuses, dealers: dealers, sites: sites});

    var dealerSiteLogins = dealerSiteLoginsLoader.makeCollection([
        {
            id: 1,
            dealer: {id: 7},
            site: {id: 5},
            type: 'site',
            login: 'priv1108',
            password: 'abyrabyr',
            loginError: true
        },
        {
            id: 2,
            dealer: {id: 7},
            site: {id: 14},
            type: 'site',
            login: 'priv1108',
            password: 'abyr1010',
            loginError: false
        },
        {
            id: 3,
            dealer: {id: 17},
            site: {id: 5},
            type: 'site',
            login: 'pri29834',
            password: 'asdfghj',
            loginError: false
        },
        {
            id: 4,
            dealer: {id: 17},
            site: {id: 14},
            type: 'site',
            login: 'pri29834',
            password: 'abyr1110',
            loginError: false
        },
        {
            id: 5,
            dealer: {id: 7},
            site: {id: 6},
            type: 'site',
            login: 'as119832',
            password: 'ab1110as',
            loginError: false
        },
        {
            id: 6,
            dealer: {id: 7},
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
            site: {id: 17},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 25,
            isActive: true,
            delay: 3,
            groupName: 'Стандарт (середина выдачи)'
        },
        {
            id: 2,
            site: {id: 17},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 50,
            isActive: true,
            delay: 3,
            groupName: 'Стандарт (середина выдачи)'
        },
        {
            id: 3,
            site: {id: 17},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 25,
            isActive: true,
            delay: 3,
            groupName: 'PRO (объявления сверху)'
        },
        {
            id: 4,
            site: {id: 17},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 50,
            isActive: true,
            delay: 3,
            groupName: 'PRO (объявления сверху)'
        },
        {
            id: 5,
            site: {id: 9},
            type: 'daily',
            period: 1,
            periodUnit: 'day',
            count: 1,
            isActive: true,
            delay: 3,
            groupName: 'Поштучный'
        },
        {
            id: 6,
            site: {id: 9},
            type: 'periodical',
            period: 30,
            periodUnit: 'day',
            count: null,
            isActive: true,
            delay: 3,
            groupName: 'Помесячный'
        },
        {
            id: 7,
            site: {id: 5},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 10,
            isActive: true,
            delay: 3,
            groupName: 'Нет'
        },
        {
            id: 8,
            site: {id: 5},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 25,
            isActive: true,
            delay: 3,
            groupName: 'Нет'
        },
        {
            id: 9,
            site: {id: 5},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 50,
            isActive: true,
            delay: 3,
            groupName: 'Нет'
        },
        {
            id: 10,
            site: {id: 2},
            type: 'daily',
            period: 1,
            periodUnit: 'day',
            count: null,
            isActive: true,
            delay: 3,
            groupName: 'Поштучный'
        },
        {
            id: 11,
            site: {id: 2},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 100,
            isActive: true,
            delay: 3,
            groupName: 'Помесячный'
        },
        {
            id: 12,
            site: {id: 2},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 200,
            isActive: true,
            delay: 3,
            groupName: 'Помесячный'
        },
        {
            id: 13,
            site: {id: 11},
            type: 'daily',
            period: 1,
            periodUnit: 'day',
            count: null,
            isActive: true,
            delay: 3,
            groupName: 'Поштучный'
        },
        {
            id: 14,
            site: {id: 11},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: null,
            isActive: true,
            delay: 3,
            groupName: 'Помесячный'
        },
        {
            id: 15,
            site: {id: 1},
            type: 'daily',
            period: 1,
            periodUnit: 'day',
            count: null,
            isActive: true,
            delay: 3,
            groupName: 'Поштучный'
        },
        {
            id: 16,
            site: {id: 1},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 10,
            isActive: true,
            delay: 3,
            groupName: 'Помесячный'
        },
        {
            id: 17,
            site: {id: 1},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 25,
            isActive: true,
            delay: 3,
            groupName: 'Помесячный'
        },
        {
            id: 18,
            site: {id: 1},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 50,
            isActive: true,
            delay: 3,
            groupName: 'Помесячный'
        },
        {
            id: 19,
            site: {id: 6},
            type: 'periodical',
            period: 30,
            periodUnit: 'day',
            count: 30,
            isActive: true,
            delay: 3,
            groupName: 'Помесячный'
        },
        {
            id: 20,
            site: {id: 6},
            type: 'periodical',
            period: 30,
            periodUnit: 'day',
            count: 50,
            isActive: true,
            delay: 3,
            groupName: 'Помесячный'
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

    var tariffRates = tariffRatesLoader.makeCollection([
        {
            id: 1,
            tariff: {id: 1},
            city: null,
            activeFrom: '2014-01-01',
            rate: 2500,
            siteRate: 2000,
            info: 'Общий'
        },
        {
            id: 2,
            tariff: {id: 2},
            city: null,
            activeFrom: '2014-01-01',
            rate: 4000,
            siteRate: 3000,
            info: 'Общий'
        },
        {
            id: 3,
            tariff: {id: 3},
            city: null,
            activeFrom: '2014-01-01',
            rate: 5000,
            siteRate: 4000,
            info: 'Общий'
        },
        {
            id: 4,
            tariff: {id: 4},
            city: null,
            activeFrom: '2014-01-01',
            rate: 8000,
            siteRate: 6500,
            info: 'Общий'
        },
        {
            id: 5,
            tariff: {id: 5},
            city: null,
            activeFrom: '2014-01-01',
            rate: 2,
            siteRate: 1.50,
            info: 'Общий'
        },
        {
            id: 6,
            tariff: {id: 6},
            city: null,
            activeFrom: '2014-01-01',
            rate: 4950,
            siteRate: 4000,
            info: 'Общий'
        },
        {
            id: 7,
            tariff: {id: 7},
            city: null,
            activeFrom: '2014-01-01',
            rate: 2714,
            siteRate: 2000,
            info: 'Общий'
        },
        {
            id: 8,
            tariff: {id: 8},
            city: null,
            activeFrom: '2014-01-01',
            rate: 5428,
            siteRate: 4000,
            info: 'Общий'
        },
        {
            id: 9,
            tariff: {id: 9},
            city: null,
            activeFrom: '2014-01-01',
            rate: 10856,
            siteRate: 8000,
            info: 'Общий'
        },
        {
            id: 10,
            tariff: {id: 10},
            city: null,
            activeFrom: '2014-01-01',
            rate: 2,
            siteRate: 1.5,
            info: 'Общий'
        },
        {
            id: 11,
            tariff: {id: 11},
            city: null,
            activeFrom: '2014-01-01',
            rate: 3000,
            siteRate: 2000,
            info: 'Общий'
        },
        {
            id: 12,
            tariff: {id: 12},
            city: null,
            activeFrom: '2014-01-01',
            rate: 4500,
            siteRate: 3000,
            info: 'Общий'
        },
        {
            id: 13,
            tariff: {id: 13},
            city: null,
            activeFrom: '2014-01-01',
            rate: 3.20,
            siteRate: 2.00,
            info: 'Общий'
        },
        {
            id: 14,
            tariff: {id: 14},
            city: null,
            activeFrom: '2014-01-01',
            rate: 4720,
            siteRate: 4000,
            info: 'Общий'
        },
        {
            id: 15,
            tariff: {id: 15},
            city: null,
            activeFrom: '2014-01-01',
            rate: 4,
            siteRate: 3,
            info: 'Общий'
        },
        {
            id: 16,
            tariff: {id: 16},
            city: null,
            activeFrom: '2014-01-01',
            rate: 1080,
            siteRate: 700,
            info: 'Общий'
        },
        {
            id: 17,
            tariff: {id: 17},
            city: null,
            activeFrom: '2014-01-01',
            rate: 2550,
            siteRate: 2000,
            info: 'Общий'
        },
        {
            id: 18,
            tariff: {id: 18},
            city: null,
            activeFrom: '2014-01-01',
            rate: 4500,
            siteRate: 4000,
            info: 'Общий'
        },
        {
            id: 19,
            tariff: {id: 19},
            city: null,
            activeFrom: '2014-01-01',
            rate: 2230.20,
            siteRate: 1700,
            info: 'Общий'
        },
        {
            id: 20,
            tariff: {id: 20},
            city: null,
            activeFrom: '2014-01-01',
            rate: 2690.40,
            siteRate: 2000,
            info: 'Общий'
        },
        {
            id: 21,
            tariff: {id: 20},
            city: {id: 2},
            activeFrom: '2014-01-01',
            rate: 3000,
            siteRate: 2500,
            info: 'Питер'
        },
        {
            id: 22,
            tariff: {id: 20},
            city: {id: 1},
            activeFrom: '2014-01-01',
            rate: 4000,
            siteRate: 3000,
            info: 'Москва'
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

    var dealerTariffs = dealerTariffsLoader.makeCollection([
        {
            id: 1,
            dealer: {id: 3},
            site: {id: 2},
            tariff: {id: 11},
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

    var saleTypes = saleTypesLoader.makeCollection([
        { id: 'card', name: 'Осн' },
        { id: 'addcard', name: 'Расш' },
        { id: 'extra', name: 'Доп' }
    ]);

    var saleStatuses = saleStatusesLoader.makeCollection([
        { id: true, name: 'Акт' },
        { id: false, name: 'Бло' }
    ]);

    var sales = salesLoader.makeCollection(multiplyArrFn([
        {
            id: 1,
            type: 'card',
            cardId: 1,
            dealer: {id: 3},
            site: {id: 17},
            tariff: {id: 1},
            cardAmount: 2500,
            count: 25,
            activeFrom: '2014-04-01',
            activeTo: '2014-04-30',
            isActive: true,
            date: '2014-03-25',
            amount: 2500,
            siteAmount: 2000,
            info: 'Основная карточка на am.ru'
        },
        {
            id: 2,
            type: 'card',
            cardId: 2,
            dealer: {id: 3},
            site: {id: 9},
            tariff: {id: 6},
            cardAmount: 4950,
            count: null,
            activeFrom: '2014-04-15',
            activeTo: '2014-05-14',
            isActive: true,
            date: '2014-04-10',
            amount: 4950,
            siteAmount: 4000,
            info: 'Основная карточка на auto.dmir.ru'
        },
        {
            id: 3,
            type: 'card',
            cardId: 3,
            dealer: {id: 3},
            site: {id: 5},
            tariff: {id: 8},
            cardAmount: 5428,
            count: 25,
            activeFrom: '2014-05-01',
            activeTo: '2014-05-31',
            isActive: true,
            date: '2014-04-25',
            amount: 5428,
            siteAmount: 4000,
            info: 'Основная карточка на auto.ru'
        },
        {
            id: 4,
            type: 'card',
            cardId: 4,
            dealer: {id: 3},
            site: {id: 2},
            tariff: {id: 11},
            cardAmount: 3000,
            count: 100,
            activeFrom: '2014-05-01',
            activeTo: '2014-05-31',
            isActive: false,
            date: '2014-04-25',
            amount: 3000,
            siteAmount: 2000,
            info: 'Основная карточка на bibika.ru'
        },
        {
            id: 5,
            type: 'card',
            cardId: 5,
            dealer: {id: 3},
            site: {id: 11},
            tariff: {id: 14},
            cardAmount: 4720,
            count: null,
            activeFrom: '2014-05-01',
            activeTo: '2014-05-31',
            isActive: true,
            date: '2014-04-25',
            amount: 4720,
            siteAmount: 4000,
            info: 'Основная карточка на cars.ru'
        },
        {
            id: 6,
            type: 'card',
            cardId: 6,
            dealer: {id: 3},
            site: {id: 1},
            tariff: {id: 17},
            cardAmount: 2550,
            count: 25,
            activeFrom: '2014-05-01',
            activeTo: '2014-05-31',
            isActive: true,
            date: '2014-04-25',
            amount: 2550,
            siteAmount: 2000,
            info: 'Основная карточка на drom.ru'
        },
        {
            id: 7,
            type: 'card',
            cardId: 7,
            dealer: {id: 3},
            site: {id: 6},
            tariff: {id: 19},
            cardAmount: 2230.20,
            count: 30,
            activeFrom: '2014-05-01',
            activeTo: '2014-05-30',
            isActive: true,
            date: '2014-04-25',
            amount: 2230.20,
            siteAmount: 1700,
            info: 'Основная карточка на irr.ru'
        },
        {
            id: 8,
            type: 'addcard',
            cardId: 8,
            parentId: 6,
            dealer: {id: 3},
            site: {id: 1},
            tariff: {id: 18},
            cardAmount: 1000,
            count: 25,
            activeFrom: '2014-05-16',
            activeTo: '2014-05-31',
            isActive: true,
            date: '2014-05-15',
            amount: 1000,
            siteAmount: 500,
            info: 'Расширение на drom.ru'
        },
        {
            id: 9,
            type: 'addcard',
            cardId: 9,
            parentId: 7,
            dealer: {id: 3},
            site: {id: 6},
            tariff: {id: 20},
            cardAmount: 200,
            count: 20,
            activeFrom: '2014-05-16',
            activeTo: '2014-05-30',
            isActive: false,
            date: '2014-05-15',
            amount: 200,
            siteAmount: 100,
            info: 'Расширение на irr.ru'
        },
        {
            id: 10,
            type: 'extra',
            cardId: 7,
            dealer: {id: 3},
            site: {id: 6},
            activeFrom: '2014-05-01',
            activeTo: '2014-05-30',
            date: '2014-04-20',
            amount: 300.00,
            siteAmount: 200.00,
            info: 'Выделение рамкой'
        }
    ], multiplyCoef, function(i, len) {
        this.cardId = this.cardId + i * len;
        this.dealer = { id: dealers.getItems()[i].id };
        if (this.parentId) {
            this.parentId = this.parentId + i * len;
        }
    }), null, {dealers: dealers, sites: sites, tariffs: tariffs, saleTypes: saleTypes, saleStatuses: saleStatuses});

    function multiplyArrFn(arr, coef, fn) {
        coef = coef || 5;
        var multiplyArray = [];

        for (var i = 0; i < coef; i++) {
            _.forEach(angular.copy(arr), function(value) {
                value.id = value.id + i * arr.length;
                fn.call(value, i, arr.length);
                multiplyArray.push(value);
            });
        }
        return multiplyArray;
    }

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
        }, function processId() {
            if (this.type.id === 'card' || this.type.id === 'addcard') {
                this.cardId = this.id;
            }
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
};
