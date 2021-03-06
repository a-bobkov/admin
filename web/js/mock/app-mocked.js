
angular.module('RootApp-mocked', ['RootApp', 'ngMockE2E'])

.run(function($httpBackend, Construction,
    userStatuses, User, Users, Groups, Managers, Markets, Metros, Cities, BillingCompanies, Brands,
    Dealers, Sites, DealerSite, DealerSites, DealerSiteLogins, DealerSiteLogin,
    Tariffs, TariffRates, DealerTariffs, Sales, Sale, saleTypes, SiteBalances, DealerBalances,
    BillingCredits, BillingCredit, BillingUnions, BillingUnion) {

    $httpBackend.whenGET(/template\/.*/).passThrough();
    setHttpMock($httpBackend, 100, Construction,
        userStatuses, User, Users, Groups, Managers, Markets, Metros, Cities, BillingCompanies, Brands,
        Dealers, Sites, DealerSite, DealerSites, DealerSiteLogins, DealerSiteLogin,
        Tariffs, TariffRates, DealerTariffs, Sales, Sale, saleTypes, SiteBalances, DealerBalances,
        BillingCredits, BillingCredit, BillingUnions, BillingUnion);
});

/**
 * мини-сервер http для комплексных тестов
 */
function setHttpMock($httpBackend, multiplyCoef, Construction,
    userStatuses, User, Users, Groups, Managers, Markets, Metros, Cities, BillingCompanies, Brands,
    Dealers, Sites, DealerSite, DealerSites, DealerSiteLogins, DealerSiteLogin,
    Tariffs, TariffRates, DealerTariffs, Sales, Sale, saleTypes, SiteBalances, DealerBalances,
    BillingCredits, BillingCredit, BillingUnions, BillingUnion) {

    var regexpUrl = /^(http|https):\/\/([\-\S]+\.)+([\-\S]{2,})/;
    var regexpEmail = /.+\@.+\..+/;
    var regexpPhoneNumber = /^\+7[ ]?(?:(?:\(\d{3}\)[ ]?\d{3})|(?:\(\d{4}\)[ ]?\d{2})|(?:\(\d{5}\)[ ]?\d{1}))-?\d{2}-?\d{2}$/;

    function multiplyArrFn(arr, coef, fn) {
        coef = coef || 1;
        var multiplyArray = [];

        for (var i = 0; i < coef; i++) {
            _.forEach(_.cloneDeep(arr), function(value) {
                value.id = value.id + i * arr.length;
                if (fn) {
                    fn.call(value, i, arr.length);
                }
                multiplyArray.push(value);
            });
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
        } else if (filter.type === 'lessOrEqual') {
            return _.any(itemValues, function(value) {
                return (value <= filter.value);
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

    function fieldArr(arr, fields) {
        return _.map(arr, function(value) {
            return _.pick(value, fields);
        });
    }

    var processQueryUrlSort = function(url, regex, arr, collectionName, collectionConstructor, fields) {

        var search = url.replace(regex, '$1');
        var pairs = search.split('&');
        var params = {};
        _.forEach(pairs, function(value) {
            var param = value.split('=');
            params[param[0]] = param[1];
        })

        var per_page = Math.min(params.per_page || 100, 100);
        var page = params.page || 1;

        var paged_arr = arr.slice(per_page * (page - 1), per_page * page);

        var respond = [200, {
            status: 'success',
            data: {
                params: {
                    filters: [],
                    orders: [],
                    pager: {
                        per_page:   per_page,
                        page:       page,
                        total:      arr.length
                    },
                    fields: []
                }
            }
        }];
        var serArr = _.invoke(paged_arr, 'serialize');
        if (!_.isEmpty(fields)) {
            serArr = fieldArr(serArr, fields);
        }
        
        respond[1].data[collectionName] = serArr;
        return respond;
    }

    function sortByOrders(array, orders) {

        function convert(value) {
            if (_.isDate(value)) {
                return value.toISOString();
            } else if (_.isObject(value)) {
                return value.id;
            } else if (value === undefined) {
                return -Infinity;
            } else {
                return value;
            }
        }

        var regexpOrder = /^([+-]?)(\w+)$/;

        function compareByOrders(a, b, ordersIndex) {
            ordersIndex = ordersIndex || 0;
            var order = orders[ordersIndex];
            if (!order) {
                return 0;
            }
            var dir = order.replace(regexpOrder, '$1') || '+';
            var field = order.replace(regexpOrder, '$2');
            var conva = convert(a[field]);
            var convb = convert(b[field]);
            // console.log(conva, convb, conva > convb);
            if (dir === '+') {
                if (conva > convb) {
                    return 1;
                } else if (conva < convb) {
                    return -1;
                } else {
                    return compareByOrders(a, b, ordersIndex + 1);
                }
            } else {
                if (conva < convb) {
                    return 1;
                } else if (conva > convb) {
                    return -1;
                } else {
                    return compareByOrders(a, b, ordersIndex + 1);
                }
            }
        }
        return array.sort(compareByOrders);
    }

    var processPostQuerySort = function(url, regex, data, collection, collectionName, collectionConstructor) {
        var filters = angular.fromJson(data).filters;
        var filtered_arr = filterArr(collection.getItems(), filters);
        var orders = angular.fromJson(data).orders || ['+id'];
        var ordered_arr = sortByOrders(filtered_arr, orders);
        var fields = angular.fromJson(data).fields || [];
        if (fields.length && fields.indexOf('id') === -1) {
            fields.push('id');
        }

        var respond = processQueryUrlSort(url, regex, ordered_arr, collectionName, collectionConstructor, fields);
        respond[1].data.params.filters = filters;
        respond[1].data.params.orders = orders;
        respond[1].data.params.fields = fields;
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
                message: collection.notFoundMessage || 'Not Found',
                errors: 'Не найден ' + itemName + ' с id: ' + id
            }];
        }
    }

    function validationPost(validate, item, items) {
        function cloneObj(obj) {
            return _.isObject(obj) ? {children: _.mapValues(obj, cloneObj)} : {};
        }
        function pushDeepError(item, path, value) {
            if (path && path.length) {
                var prop = path.shift();
                if (!item.children) {
                    item.children = {};
                }
                if (!item.children[prop]) {
                    item.children[prop] = {};
                }
                pushDeepError(item.children[prop], path, value);
            } else {
                if (!item.errors) {
                    item.errors = [];
                }
                item.errors.push(value);
            }
        }
        function pushError(errorField, errorText) {
            hasErrors = true;
            pushDeepError(errorObj, errorField && errorField.split('.'), errorText);
        }
        var hasErrors;
        var errorObj = cloneObj(item);
        validate(pushError, item, items);
        return (hasErrors) ? errorObj : null;
    }

    var processPost = function(data, collection, itemName, itemConstuctor, directories, process, validate) {
        var itemData = (angular.fromJson(data))[itemName];
        var items = collection.getItems();

        var validationErrors = validate && validationPost(validate, itemData, items);
        if (validationErrors) {
            return [400, {
                status: 'error',
                message: 'Validation Failed',
                errors: validationErrors
            }];
        }

        try {
            var item = (new itemConstuctor(itemData)).resolveRefs(directories);
        } catch (err) {     // ошибка ссылочной целостности, не определенная валидатором
            return [400, {
                status: 'error',
                message: 'Ошибка при создании',
                errors: err.message
            }];
        }

        item.id = 1 + _.max(items, function(item) {
            return item.id;
        }).id;
        if (process) {
            process(item, items);
        }

        items.push(item);
        var respond = [200, {
            status: 'success',
            data: {}
        }];
        respond[1].data[itemName] = item.serialize();
        return respond;
    };

    function validationPut(validate, item, items, idx) {
        function cloneObj(obj) {
            return _.isObject(obj) ? {children: _.mapValues(obj, cloneObj)} : [];
        }
        function pushDeepError(item, path, value) {
            if (path && path.length) {
                var prop = path.shift();
                if (!item.children) {
                    item.children = {};
                }
                if (!item.children[prop]) {
                    item.children[prop] = [];
                }
                pushDeepError(item.children[prop], path, value);
            } else {
                if (!item.errors) {
                    item.errors = [];
                }
                item.errors.push(value);
            }
        }
        function pushError(errorField, errorText) {
            hasErrors = true;
            pushDeepError(errorObj, errorField && errorField.split('.'), errorText)
        }
        var hasErrors;
        var errorObj = cloneObj(item);
        validate(pushError, item, items, idx);
        return (hasErrors) ? errorObj : null;
    }

    var processPut = function(url, regex, data, collection, itemName, itemConstuctor, directories, process, validate) {
        var itemData = (angular.fromJson(data))[itemName];
        var items = collection.getItems();

        var id = parseInt(url.replace(regex,'$1'));
        var idx = _.findIndex(items, {id: id});
        if (idx === -1) {
            return [404, {
                status: 'error',
                message: collection.notFoundMessage || 'Not Found',
                errors: 'Не найден элемент с id: ' + id
            }];
        }

        var validationErrors = validate && validationPut(validate, itemData, items, idx);
        if (validationErrors) {
            return [400, {
                status: 'error',
                message: 'Validation Failed',
                errors: validationErrors
            }];
        }

        try {
            var item = (new itemConstuctor(itemData)).resolveRefs(directories);
        } catch (err) {     // ошибка ссылочной целостности, не определенная валидатором
            return [400, {
                status: 'error',
                message: 'Ошибка при обновлении',
                errors: err.message
            }];
        }

        if (process) {
            process(item, items, idx);
        }

        items[idx] = item;
        var respond = [200, {
            status: 'success',
            data: {}
        }];
        respond[1].data[itemName] = item.serialize();
        return respond;
    };

    var processDelete = function(url, regex, collection, validation) {
        var id = parseInt(url.replace(regex,'$1'));
        var items = collection.getItems();
        var idx = _.findIndex(items, {id: id});
        if (idx === -1) {
            return [404, {
                status: 'error',
                message: collection.notFoundMessage || 'Not Found',
                errors: 'Не найден элемент с id: ' + id
            }];
        }
        var validationError = validation && validation(items[idx]);
        if (validationError) {
            return [400, {
                status: 'error',
                message: validationError
            }];
        } else {
            items.splice(idx, 1);
            return [200, {
                status: 'success',
                data: null
            }];
        }
    };

    var groups = new Groups([
        {id: 1, name: 'admin', description: 'Администратор'},
        {id: 2, name: 'dealer', description: 'Автосалон'},
        {id: 3, name: 'site', description: 'Автосайт'}
    ]);

    var regexGroupsQuery = /^\/api2\/groups(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexGroupsQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexGroupsQuery, groups.getItems(), 'groups', Groups);
    });
    $httpBackend.whenPOST(regexGroupsQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexGroupsQuery, data, groups, 'groups', Groups);
    });

    var managers = new Managers([
        {id: 1, name: 'Катя'},
        {id: 2, name: 'Света'},
        {id: 4, name: 'Потеряшки'}
    ]);

    var regexManagersQuery = /^\/api2\/managers(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexManagersQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexManagersQuery, managers.getItems(), 'managers', Managers);
    });
    $httpBackend.whenPOST(regexManagersQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexManagersQuery, data, managers, 'managers', Managers);
    });

    var cities = new Cities([
        {id: 1, name: 'Москва'},
        {id: 2, name: 'Санкт-Петербург'},
        {id: 3, name: 'Томск'},
        {id: 4, name: 'Новосибирск'},
        {id: 6, name: 'Екатеринбург'},
        {id: 7, name: 'Петрозаводск'},
        {id: 8, name: 'Сочи'},
        {id: 9, name: 'Чебоксары'},
        {id: 10, name: 'Котлас'},
        {id: 11, name: 'Мурманск'},
        {id: 12, name: 'Волгоград'},
        {id: 13, name: 'Коломна'}
    ]);

    var regexCitiesQuery = /^\/api2\/cities(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexCitiesQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexCitiesQuery, cities.getItems(), 'cities', Cities);
    });
    $httpBackend.whenPOST(regexCitiesQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexCitiesQuery, data, cities, 'cities', Cities);
    });

    var markets = new Markets([
        {id: 4, name: 'Рынок один в москве', city: {id: 1}},
        {id: 7, name: 'Рынок два в москве', city: {id: 1}},
        {id: 8, name: 'Рынок один в питере', city: {id: 2}},
        {id: 9, name: 'Рынок два в питере', city: {id: 2}}
    ]).resolveRefs({cities: cities});

    var regexMarketsQuery = /^\/api2\/markets(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexMarketsQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexMarketsQuery, markets.getItems(), 'markets', Markets);
    });
    $httpBackend.whenPOST(regexMarketsQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexMarketsQuery, data, markets, 'markets', Markets);
    });

    var metros = new Metros([
        {id: 8, name: 'Метро один в москве', city: {id: 1}},
        {id: 9, name: 'Метро два в москве', city: {id: 1}},
        {id: 18, name: 'Метро три в москве', city: {id: 1}},
        {id: 19, name: 'Метро четыре в москве', city: {id: 1}},
        {id: 28, name: 'Метро пять в москве', city: {id: 1}},
        {id: 29, name: 'Метро шесть в москве', city: {id: 1}},
        {id: 10, name: 'Метро один в питере', city: {id: 2}},
        {id: 11, name: 'Метро два в питере', city: {id: 2}},
        {id: 20, name: 'Метро три в питере', city: {id: 2}},
        {id: 21, name: 'Метро четыре в питере', city: {id: 2}},
        {id: 30, name: 'Метро пять в питере', city: {id: 2}},
        {id: 31, name: 'Метро шесть в питере', city: {id: 2}},
        {id: 174, name: 'Метро шесть в питере', city: {id: 2}}
    ]).resolveRefs({cities: cities});

    var regexMetrosQuery = /^\/api2\/metros(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexMetrosQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexMetrosQuery, metros.getItems(), 'metros', Metros);
    });
    $httpBackend.whenPOST(regexMetrosQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexMetrosQuery, data, metros, 'metros', Metros);
    });

    var dealers = new Dealers([
        {id: 3,   companyName: 'NevaMotors', city: {id: 1}, isActive: true},
        {id: 4,   companyName: 'Автобург', city: {id: 1}, isActive: true},
        {id: 5,   companyName: 'Демо-Кампания', city: {id: 1}, isActive: true},
        {id: 6,   companyName: 'AutoVitrina', city: {id: 1}, isActive: true},
        {id: 7,   companyName: 'Автосалон "АВТОИМПУЛЬС"', city: {id: 1}, isActive: true},
        {id: 14,  companyName: 'Сигма', city: {id: 1}, isActive: true},
        {id: 16,  companyName: 'АвтоВелоМото', city: {id: 1}, isActive: true},
        {id: 17,  companyName: 'СПб-Авто', city: {id: 2}, isActive: true},
        {id: 22,  companyName: 'ООО «Омега-Сервис»', city: {id: 1}, isActive: true},
        {id: 23,  companyName: 'Автосалон "ksmotors"', city: {id: 1}, isActive: true},
        {id: 24,  companyName: 'Автосалон "Автогалактика"', city: {id: 1}, isActive: true},
        {id: 25,  companyName: 'автосалон "РЕАЛ"', city: {id: 1}, isActive: true},
        {id: 28,  companyName: 'Кидалы', city: {id: 1}, isActive: true},
        {id: 30,  companyName: 'Автосалон "Первое Автомобильное Агентство"', city: {id: 1}, isActive: true},
        {id: 31,  companyName: 'Арсенал Моторс', city: {id: 1}, isActive: true},
        {id: 32,  companyName: 'ELIBRI залоговые автомобили', city: {id: 1}, isActive: true},
        {id: 35,  companyName: 'Aвтосалон "Меридиан"', city: {id: 1}, isActive: true},
        {id: 36,  companyName: 'Автосалон "Finemotors"', city: {id: 1}, isActive: true},
        {id: 37,  companyName: 'Автосалон "Авто-Трейдер"', city: {id: 1}, isActive: true},
        {id: 38,  companyName: 'ООО "Свид-Мобиль" офицальный дилер VOLVO', city: {id: 1}, isActive: true},
        {id: 45,  companyName: 'ЗАО «Евросиб Лахта» Официальный дилер BMW и MINI', city: {id: 1}, isActive: true},
        {id: 46,  companyName: 'ООО АВТОБРЕНД', city: {id: 1}, isActive: true},
        {id: 47,  companyName: 'С-Пб., м. Елизаровская,ул. Бабушкина д.21', city: {id: 2}, isActive: true},
        {id: 48,  companyName: 'Автосалон "Победа авто"', city: {id: 1}, isActive: true},
        {id: 50,  companyName: 'Автосалон "Берейт Авто"', city: {id: 1}, isActive: true},
        {id: 51,  companyName: 'АВТОПРЕМИУМ-СПб', city: {id: 2}, isActive: true},
        {id: 52,  companyName: 'Тойота Центр Пискаревский', city: {id: 2}, isActive: true},
        {id: 53,  companyName: 'Тойота Центр Пулково', city: {id: 2}, isActive: true},
        {id: 54,  companyName: 'Лексус центр Пулково', city: {id: 2}, isActive: true},
        {id: 56,  companyName: 'АвтоПремиум СПб', city: {id: 2}, isActive: true},
        {id: 57,  companyName: 'КОРАВТО-ПИТЕР', city: {id: 1}, isActive: true},
        {id: 58,  companyName: 'ООО "Eagle motors"', city: {id: 1}, isActive: true},
        {id: 59,  companyName: 'ООО«Автоцентр Лаура-Купчино» GM', city: {id: 2}, isActive: true},
        {id: 60,  companyName: 'Автоцентр К14', city: {id: 1}, isActive: true},
        {id: 61,  companyName: 'Автосалон "СЗ АВТО"', city: {id: 1}, isActive: true},
        {id: 63,  companyName: 'АВТОСАЛОН "ИНЕКС"', city: {id: 1}, isActive: true},
        {id: 64,  companyName: 'ООО “ТОРГ МАШ” - Автосалон автомобилей с пробегом.', city: {id: 1}, isActive: true},
        {id: 66,  companyName: 'ООО АВАНГАРД ОФИЦИАЛЬНЫЙ ДИЛЕР «МЕRCEDES-BENZ»', city: {id: 1}, isActive: true},
        {id: 67,  companyName: 'Атлант-М Лахта', city: {id: 1}, isActive: true},
        {id: 68,  companyName: 'Ауди Центр Петербург', city: {id: 2}, isActive: true},
        {id: 70,  companyName: 'Автосалон "Победа авто" Лиговский', city: {id: 2}, isActive: true},
        {id: 72,  companyName: 'АВТОВЕРНИСАЖ  магазин автомобилей', city: {id: 1}, isActive: true},
        {id: 74,  companyName: 'ООО «СТК Центр»', city: {id: 1}, isActive: true},
        {id: 77,  companyName: 'Группа Компаний "АВТОПРОДИКС"', city: {id: 1}, isActive: true},
        {id: 78,  companyName: 'ЗАО «Автобиография»', city: {id: 1}, isActive: true},
        {id: 79,  companyName: 'ЗАО «Аксель Моторс Север» Официальный дилер BMW', city: {id: 1}, isActive: true},
        {id: 80,  companyName: 'ЗАО «АКСЕЛЬ МОТОРС» ОФИЦИАЛЬНЫЙ ДИЛЕР BMW', city: {id: 1}, isActive: true},
        {id: 81,  companyName: 'AUTO SELECTION', city: {id: 1}, isActive: true},
        {id: 82,  companyName: '"Полюстрово Авто"', city: {id: 2}, isActive: true},
        {id: 83,  companyName: 'Автосалон "РИ-АВТО": Авто с пробегом', city: {id: 1}, isActive: true},
        {id: 84,  companyName: 'Автосалон "Агат-авто на Бабушкина"', city: {id: 1}, isActive: true},
        {id: 85,  companyName: 'ODService', city: {id: 1}, isActive: true},
        {id: 88,  companyName: 'Авто-мото салон <<ART-MOTERS>> Aвтомобили и мототехника с пробегом', city: {id: 1}, isActive: true},
        {id: 89,  companyName: 'Официальный дилер Volkswagen. ООО "Аксель-Сити"', city: {id: 1}, isActive: true},
        {id: 90,  companyName: 'ООО "Аксель-Сити Юг"', city: {id: 1}, isActive: true},
        {id: 92,  companyName: 'ООО "Нитро"', city: {id: 1}, isActive: true},
        {id: 95,  companyName: 'Автомобильное агентство "АвтоМиг"', city: {id: 1}, isActive: true},
        {id: 97,  companyName: 'Автосалон ', city: {id: 1}, isActive: true},
        {id: 98,  companyName: 'АтлантМ-Лахта Новые автомобили', city: {id: 1}, isActive: true},
        {id: 101, companyName: 'Автосалон "Express Auto"', city: {id: 1}, isActive: false},
        {id: 103, companyName: 'МОСАВТОТРЕЙД', city: {id: 1}, isActive: true},
        {id: 104, companyName: 'ЗАО Компания "Феникс Моторс"', city: {id: 1}, isActive: true},
        {id: 106, companyName: 'Карвилле', city: {id: 1}, isActive: true},
        {id: 107, companyName: 'Carville Южный порт', city: {id: 1}, isActive: true},
        {id: 108, companyName: 'Первая Автомобильная Компания', city: {id: 1}, isActive: true},
        {id: 110, companyName: '"Alex Cars" Автосалон', city: {id: 1}, isActive: true},
        {id: 111, companyName: 'Первая Автомобильная Компания', city: {id: 1}, isActive: true},
        {id: 112, companyName: '1ПАК', city: {id: 1}, isActive: true},
        {id: 113, companyName: 'Автосалон "Komfort-Auto"', city: {id: 1}, isActive: true},
        {id: 114, companyName: 'автосалон "WESTCARS"', city: {id: 1}, isActive: true},
        {id: 116, companyName: 'Автосалон "Автомобили для всех"', city: {id: 1}, isActive: true},
        {id: 117, companyName: 'Центр Автокредитов', city: {id: 1}, isActive: true},
        {id: 118, companyName: 'Автомобили с пробегом', city: {id: 1}, isActive: true},
        {id: 121, companyName: 'Автосалон "Авто Бутик"', city: {id: 1}, isActive: true},
        {id: 122, companyName: 'Автосалон "CAR-TRADING"', city: {id: 1}, isActive: true},
        {id: 126, companyName: 'ОГНИ МОСКВЫ', city: {id: 1}, isActive: true},
        {id: 127, companyName: 'Автосалон "AWD-AUTO"', city: {id: 1}, isActive: true},
        {id: 131, companyName: 'ООО "7 УРОВЕНЬ"', city: {id: 1}, isActive: true},
        {id: 133, companyName: 'Технический Центр "Кунцево" отдел Trade-in', city: {id: 1}, isActive: true},
        {id: 134, companyName: 'Автосалон "На Выборгской"', city: {id: 2}, isActive: true},
        {id: 135, companyName: 'Автосалон "АЛЬФА-МОТОРС"', city: {id: 1}, isActive: true},
        {id: 137, companyName: 'Автосалон "Формула Авто"', city: {id: 1}, isActive: true},
        {id: 140, companyName: 'Автосалон "Авто Лэнд"', city: {id: 1}, isActive: true},
        {id: 141, companyName: 'Автосалон "Мультиван Клуб"', city: {id: 1}, isActive: true},
        {id: 142, companyName: 'Автосалон "Виано Клуб"', city: {id: 1}, isActive: true},
        {id: 143, companyName: 'Автосалон "АЛЬЯНС-АВТО"', city: {id: 1}, isActive: true},
        {id: 145, companyName: 'АВТОСАЛОН "AC MOTORS"', city: {id: 1}, isActive: true},
        {id: 149, companyName: 'Агат-авто', city: {id: 1}, isActive: true},
        {id: 151, companyName: 'Автосалон "АвтоРитетофф"', city: {id: 1}, isActive: true},
        {id: 152, companyName: '"АвтоЦентр ГРЕНАДА"', city: {id: 1}, isActive: true},
        {id: 154, companyName: 'Автосалон "РЕАЛ"', city: {id: 1}, isActive: true},
        {id: 156, companyName: 'Автосалон "Super-Аuto"', city: {id: 1}, isActive: true},
        {id: 157, companyName: 'Автосалон "ТерраАвто"', city: {id: 1}, isActive: true},
        {id: 158, companyName: 'Автосалон "СТОКАВТО"', city: {id: 1}, isActive: true},
        {id: 159, companyName: 'Автосалон  "Браво"', city: {id: 1}, isActive: true},
        {id: 160, companyName: 'Автосалон "Экспресс Авто"', city: {id: 1}, isActive: true},
        {id: 161, companyName: 'Автомобильное Агентство ИМПЭКС', city: {id: 1}, isActive: true},
        {id: 162, companyName: 'Автосалон "Автополюс"', city: {id: 1}, isActive: true},
        {id: 163, companyName: 'Автосалон "РЕАЛ АВТО"', city: {id: 1}, isActive: true},
        {id: 164, companyName: 'ООО "Адмирал Моторс"', city: {id: 1}, isActive: true},
        {id: 165, companyName: '"Dream cars"', city: {id: 1}, isActive: true},
        {id: 166, companyName: 'Автосалон "EUROMOTORS"', city: {id: 1}, isActive: true},
        {id: 168, companyName: 'Автосалон "ИнтерАвто"', city: {id: 1}, isActive: true},
        {id: 169, companyName: 'Автосалон "Калужский"', city: {id: 1}, isActive: true},
        {id: 170, companyName: 'ООО "Ост Вест Авто"', city: {id: 1}, isActive: true},
        {id: 171, companyName: 'Авторезерв, официальный дилер SkodaAuto, отдел trade-in', city: {id: 1}, isActive: true},
        {id: 172, companyName: 'Автосалон "Мото.Точка"', city: {id: 1}, isActive: true},
        {id: 174, companyName: 'Автосалон "Аврора Авто"', city: {id: 1}, isActive: true},
        {id: 175, companyName: 'Автосалон "АврораАвто2"', city: {id: 1}, isActive: true},
        {id: 176, companyName: 'Автосалон "Авто Выкуп"', city: {id: 1}, isActive: true},
        {id: 177, companyName: 'Частное Автомобильное Бюро', city: {id: 1}, isActive: true},
        {id: 178, companyName: 'Аврора Авто Петербург', city: {id: 2}, isActive: true},
        {id: 179, companyName: 'АврораАвто', city: {id: 1}, isActive: true},
        {id: 180, companyName: 'Автомобильное агентство  "CarWill"', city: {id: 1}, isActive: true},
        {id: 181, companyName: 'Автосалон "AutoSort"', city: {id: 1}, isActive: true},
        {id: 183, companyName: 'Автосалон в Марьино', city: {id: 1}, isActive: true},
        {id: 186, companyName: 'Автосалон "Нью Моторс"', city: {id: 1}, isActive: true},
        {id: 187, companyName: 'Автосалон "Автобизнес"', city: {id: 1}, isActive: true},
        {id: 188, companyName: 'Автосалон "Дилижанс"', city: {id: 1}, isActive: true},
        {id: 189, companyName: 'Автосалон "Alex-Cars"', city: {id: 1}, isActive: true},
        {id: 190, companyName: 'Автомобильная компания "SKA"', city: {id: 1}, isActive: true},
        {id: 191, companyName: 'ПРЕСТИЖ МОТОРС', city: {id: 1}, isActive: true},
        {id: 192, companyName: 'ПРЕСТИЖ МОТОРС', city: {id: 1}, isActive: true},
        {id: 193, companyName: 'ПРЕСТИЖ МОТОРС', city: {id: 1}, isActive: true},
        {id: 194, companyName: 'Starex Spb', city: {id: 2}, isActive: true},
        {id: 195, companyName: 'ООО Альфа-Трейд', city: {id: 1}, isActive: true},
        {id: 196, companyName: 'ООО "ПРЕСТИЖ АВТО"', city: {id: 1}, isActive: true},
        {id: 197, companyName: 'АВТОБАВАРИЯ', city: {id: 1}, isActive: true},
        {id: 198, companyName: 'АВТОВИТРИНА', city: {id: 1}, isActive: true},
        {id: 199, companyName: 'МиниБас.рф', city: {id: 1}, isActive: true},
        {id: 200, companyName: 'ООО "Альянс-ДВ"', city: {id: 1}, isActive: true},
        {id: 201, companyName: 'Автосалон "АвтоЛига"', city: {id: 1}, isActive: true},
        {id: 202, companyName: 'АвтоСитиМоторс', city: {id: 1}, isActive: false},
        {id: 204, companyName: 'АВМ-плюс', city: {id: 1}, isActive: true},
        {id: 205, companyName: 'Автосалон "Каширка 39"', city: {id: 1}, isActive: true},
        {id: 206, companyName: 'Автосалон', city: {id: 1}, isActive: true},
        {id: 208, companyName: 'Автосалон "ARTMAXX-AUTO"', city: {id: 1}, isActive: true},
        {id: 209, companyName: 'Автоцентр Кутузовский', city: {id: 1}, isActive: true},
        {id: 210, companyName: 'Автосалон "AutoCityHall"', city: {id: 1}, isActive: true},
        {id: 211, companyName: 'Автосалон "MR.MOTORS"', city: {id: 1}, isActive: true},
        {id: 212, companyName: 'Автосалон "Next-Car"', city: {id: 1}, isActive: true},
        {id: 213, companyName: 'Эльгида-Моторс', city: {id: 1}, isActive: true},
        {id: 215, companyName: 'Автосалон "L.S.Auto"', city: {id: 1}, isActive: true},
        {id: 216, companyName: 'Автосалон "SMotorS"', city: {id: 1}, isActive: true},
        {id: 217, companyName: '"SVS MOTORS"', city: {id: 1}, isActive: true},
        {id: 219, companyName: '777-AUTO', city: {id: 1}, isActive: true},
        {id: 220, companyName: 'У Сервис+ ', city: {id: 1}, isActive: true},
        {id: 221, companyName: 'Автосалон "Престиж Авто"', city: {id: 1}, isActive: true},
        {id: 222, companyName: 'Автоволна', city: {id: 1}, isActive: true},
        {id: 223, companyName: 'Автосалон "Эльва Моторс" официальный дилер SsangYong и FIAT', city: {id: 1}, isActive: true},
        {id: 413, companyName: 'Смольнинский Автоцентр - официальный дилер VOLVO', city: {id: 1}, isActive: true},
        {id: 553, companyName: 'Официальный дилер FORD компания ЗАО «ЕВРО-МОТОРС».', city: {id: 1}, isActive: true}
    ]).resolveRefs({cities: cities});

    var regexDealersQuery = /^\/api2\/dealers(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexDealersQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexDealersQuery, dealers.getItems(), 'dealers', Dealers);
    });
    $httpBackend.whenPOST(regexDealersQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexDealersQuery, data, dealers, 'dealers', Dealers);
    });

    var sites = new Sites([
        {id: 0,  name: 'maxposter.ru', isActive: true},
        {id: 1,  name: 'drom.ru', isActive: true},
        {id: 2,  name: 'bibika.ru', isActive: true},
        {id: 3,  name: 'autorambler.ru', isActive: true},
        {id: 4,  name: 'auto.mail.ru', isActive: true},
        {id: 5,  name: 'auto.ru', isActive: true},
        {id: 6,  name: 'irr.ru', isActive: true},
        {id: 7,  name: 'chance.ru', isActive: true},
        {id: 8,  name: 'auto.yandex.ru', isActive: true},
        {id: 9,  name: 'auto.dmir.ru', isActive: true},
        {id: 10, name: 'auto-mos.ru', isActive: true},
        {id: 11, name: 'cars.ru', isActive: true},
        {id: 12, name: 'usedcars.ru', isActive: false},
        {id: 13, name: 'quto.ru', isActive: true},
        {id: 14, name: 'avito.ru', isActive: true},
        {id: 15, name: 'fin-auto.ru', isActive: false},
        {id: 16, name: 'auto.exist.ru', isActive: true},
        {id: 17, name: 'am.ru', isActive: true},
        {id: 18, name: 'mercedes-benz.ru', isActive: true},
        {id: 19, name: 'carsguru.ru', isActive: true}
    ]);

    var regexSitesQuery = /^\/api2\/sites(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexSitesQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexSitesQuery, sites.getItems(), 'sites', Sites);
    });
    $httpBackend.whenPOST(regexSitesQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexSitesQuery, data, sites, 'sites', Sites);
    });

    var brands = new Brands([
        {id: 1, name: 'AC'},
        {id: 2, name: 'Acura'},
        {id: 3, name: 'Alfa Romeo'},
        {id: 4, name: 'BMW Alpina'},
        {id: 5, name: 'Alpine'},
        {id: 6, name: 'Aro'},
        {id: 7, name: 'Asia'},
        {id: 8, name: 'Aston Martin'},
        {id: 9, name: 'Audi'},
        {id: 10, name: 'Austin'},
        {id: 11, name: 'Beijing'},
        {id: 12, name: 'Bentley'},
        {id: 13, name: 'Bertone'}
    ]);

    var regexBrandsQuery = /^\/api2\/brands(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexBrandsQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexBrandsQuery, brands.getItems(), 'brands', Brands);
    });
    $httpBackend.whenPOST(regexBrandsQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexBrandsQuery, data, brands, 'brands', Brands);
    });

    var userDirectories = new Construction({
        groups: groups,
        managers: managers,
        cities: cities,
        markets: markets,
        metros: metros,
        sites: sites,
        brands: brands,
        billingCompanies: new BillingCompanies([
            {id: 1, name: 'Макспостер, ООО'},
            {id: 2, name: 'Харитонов, ИП'}
        ])
    });

    var users = new Users(multiplyArrFn([
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
                billingCompany: {id: 1},
                manager: {id: 1},
                brand: [
                    {id: 1},
                    {id: 10}
                ]
            }
        },
        {id: 1, email: 'a-bobkov@ab.com', lastLogin: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            id: 1,
            companyName: 'Ещё одна компания',
            manager: {id: 2},
            phone: '+7(812)232-4123',
            phoneFrom: null,
            phoneTo: null
        }},
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
            id: 12, companyName: 'Авто-мото', manager: {id: 4}}},
        {id: 13, email: 'a-bobkov@abl.com', lastLogin: '2012-01-01', status: 'active', group: {id: 2}, dealer: {
            id: 13, companyName: 'Свет', manager: {id: 4}}},
        {id: 14, email: 'a-bobkov@abo.com', lastLogin: '2012-01-01', status: 'blocked', group: {id: 3}, site: {id: 6}},
        {id: 15, email: 'a-bobkov@abm.com', lastLogin: '2012-01-01', status: 'active', group: {id: 3}, site: {id: 1}}
    ], multiplyCoef, function(i, len) {
        function randomCoordinate(min, max) {
            return (Math.random() * (max - min) + min).ceil(8);
        }
        function randomLatitude() {
            return randomCoordinate(40, 90);
        }
        function randomLongitude() {
            return randomCoordinate(20, 180);
        }
        this.email = i + this.email;
        if (this.dealer) {
            if (this.id) {
                this.dealer.id = this.id;
            }
            this.dealer.latitude = randomLatitude();
            this.dealer.longitude = randomLongitude();
        }
    })).resolveRefs(userDirectories);
    users.notFoundMessage = 'Пользователь не найден.';
    
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
        return processQueryUrlSort(url, regexUserQuery, users.getItems(), 'users', Users);
    });
    $httpBackend.whenPOST(regexUserQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexUserQuery, data, users, 'users', Users);
    });

    var regexUserGet = /^\/api2\/users\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexUserGet).respond(function(method, url, data) {
        return processGet(url, regexUserGet, users, 'user');
    });

    var regexUserPost = /^\/api2\/users\/new$/;
    $httpBackend.whenPOST(regexUserPost).respond(function(method, url, data) {
        return processPost(data, users, 'user', User, userDirectories,
            function process(item, items) {
                if (!item.status) {
                    item.status = userStatuses.get('inactive');
                }
            }, function validate(pushError, itemData, items) {
                if (!itemData.group) {
                    pushError('group', 'Пользователю необходимо назначить группу.');
                } else if (!groups.get(itemData.group.id)) {
                    pushError('group', 'Пользователю необходимо назначить группу.');
                } else 
                if (itemData.group && itemData.group.id === 2 && !itemData.dealer) {
                    pushError('dealer', 'Значение поля dealer не должно быть пустым.');
                }
                if (itemData.group && itemData.group.id === 3) {
                    if (!itemData.site) {
                        pushError('site', 'Значение поля site не должно быть пустым.');
                    } else if (!_.isNumber(itemData.site.id)) {
                        pushError('site.id', 'Значение не должно быть пустым.');
                    } else if (!sites.get(itemData.site.id)) {
                        pushError('site.id', 'Сайт ' + itemData.site.id + ' не найден.');
                    }
                }
                if (itemData.status && !userStatuses.get(itemData.status)) {
                    pushError('status', 'Выбранное Вами значение недопустимо.');
                }
                if (!itemData.email) {
                    pushError('email', 'Значение не должно быть пустым.');
                } else if (!itemData.email.match(regexpEmail)) {
                    pushError('email', 'Значение не верно.');
                } else if (_.find(items, {email: itemData.email})) {
                    pushError('email', 'Значение уже используется.');
                }
                if (!itemData.password) {
                    pushError('password', 'Значение не должно быть пустым.');
                } else if (itemData.password.length > 128) {
                    pushError('password', 'Превышена допустимая длина в 128 символов.');
                }
                if (itemData.dealer) {
                    if (!itemData.dealer.manager) {
                        pushError('dealer.manager', 'Значение не должно быть пустым.');
                    } else if (!managers.get(itemData.dealer.manager.id)) {
                        pushError(null, 'Менеджер ' + itemData.dealer.manager.id + ' не найден.');
                    }
                    if (!itemData.dealer.city) {
                        pushError('dealer.city', 'Значение не должно быть пустым.');
                    } else if (!cities.get(itemData.dealer.city.id)) {
                        pushError(null, 'Город ' + itemData.dealer.city.id + ' не найден.');
                    }
                    if (itemData.dealer.metro) {
                        if (!metros.get(itemData.dealer.metro.id)) {
                            pushError(null, 'Станция метро ' + itemData.dealer.metro.id + ' не найдена.');
                        } else if (metros.get(itemData.dealer.metro.id).city.id !== itemData.dealer.city.id) {
                            pushError('dealer.metro.id', 'Станция метро должна находиться в выбранном городе.');
                        }
                    }
                    if (itemData.dealer.market) {
                        if (!markets.get(itemData.dealer.market.id)) {
                            pushError(null, 'Рынок ' + itemData.dealer.market.id + ' не найден.');
                        } else if (markets.get(itemData.dealer.market.id).city.id !== itemData.dealer.city.id) {
                            pushError('dealer.market.id', 'Рынок должен находиться в выбранном городе.');
                        }
                    }
                    if (!itemData.dealer.companyName) {
                        pushError('dealer.companyName', 'Значение не должно быть пустым.');
                    } else if (itemData.dealer.companyName.length > 100) {
                        pushError('dealer.companyName', 'Значение слишком длинное. Должно быть равно 100 символам или меньше.');
                    }
                    if (!itemData.dealer.address) {
                        pushError('dealer.address', 'Значение не должно быть пустым.');
                    } else if (itemData.dealer.address.length > 255) {
                        pushError('dealer.address', 'Значение слишком длинное. Должно быть равно 255 символам или меньше.');
                    }
                    if (itemData.dealer.fax && !itemData.dealer.fax.match(regexpPhoneNumber)) {
                        pushError('dealer.fax', 'Неверный формат номера телефона.');
                    }
                    if (itemData.dealer.email && !itemData.dealer.email.match(regexpEmail)) {
                        pushError('dealer.email', 'Значение адреса электронной почты недопустимо.');
                    }
                    if (itemData.dealer.url && !itemData.dealer.url.match(regexpUrl)) {
                        pushError('dealer.url', 'Не верное значение ссылки: \'' + itemData.dealer.url + '\'.');
                    }
                    if (!itemData.dealer.phone) {
                        pushError('dealer.phone', 'Значение не должно быть пустым.');
                    }
                    function validatePhone(prop) {
                        if (itemData.dealer[prop]) {
                            if (!itemData.dealer[prop].match(regexpPhoneNumber)) {
                                pushError('dealer.' + prop, 'Неверный формат номера телефона.');
                            }
                            if (!_.isNumber(itemData.dealer[prop + 'From'])) {
                                pushError('dealer.' + prop, 'Неверно указано время для звонка на телефон.');
                            } else if (itemData.dealer[prop + 'From'] < 0 || itemData.dealer[prop + 'From'] > 24) {
                                pushError('dealer.' + prop + 'From', 'Значение должно быть 24 или меньше.');
                            }
                            if (!_.isNumber(itemData.dealer[prop + 'To'])) {
                                pushError('dealer.' + prop, 'Неверно указано время для звонка на телефон.');
                            } else if (itemData.dealer[prop + 'To'] < 0 || itemData.dealer[prop + 'To'] > 24) {
                                pushError('dealer.' + prop + 'To', 'Значение должно быть 24 или меньше.');
                            }
                            if (itemData.dealer[prop + 'From'] && itemData.dealer[prop + 'To']
                                && itemData.dealer[prop + 'From'] >= itemData.dealer[prop + 'To']) {
                                pushError('dealer.' + prop, 'Неверно указано время для звонка на телефон.');
                            }
                        }
                    }
                    validatePhone('phone');
                    validatePhone('phone2');
                    validatePhone('phone3');
                }
            }
        );
    });

    var regexUserPut = /^\/api2\/users\/(?:([^\/]+))$/;
    $httpBackend.whenPUT(regexUserPut).respond(function(method, url, data) {
        return processPut(url, regexUserPut, data, users, 'user', User, userDirectories,
            function process(item, items, idx) {
            }, function validate(pushError, itemData, items, idx) {
                if (itemData.group && itemData.group.id === 3) {
                    if (!itemData.site) {
                        pushError('site', 'Значение поля site не должно быть пустым.');
                    } else if (!_.isNumber(itemData.site.id)) {
                        pushError('site.id', 'Значение не должно быть пустым.');
                    } else if (!sites.get(itemData.site.id)) {
                        pushError('site.id', 'Сайт ' + itemData.site.id + ' не найден.');
                    }
                }
            }
        );
    });

    var regexUserDelete = /^\/api2\/users\/(?:([^\/]+))$/;
    $httpBackend.whenDELETE(regexUserDelete).respond(function(method, url, data) {
        return processDelete(url, regexUserDelete, users);
    });

    var dealerSites = new DealerSites(multiplyArrFn([
        {
            id: 1,
            dealer: {id: 3},
            site: {id: 1},
            publicUrl: 'http://www.drom.ru/1.html',
            isActive: true
        },
        {
            id: 2,
            dealer: {id: 3},
            site: {id: 2},
            publicUrl: 'http://www.bibika.ru/1109238.html',
            isActive: true
        },
        {
            id: 3,
            dealer: {id: 3},
            site: {id: 4},
            externalId: '1109',
            publicUrl: 'http://www.autorambler.ru/1109238.html',
            isActive: false
        },
        {
            id: 4,
            dealer: {id: 3},
            site: {id: 5},
            externalId: '1109',
            publicUrl: 'http://www.auto.ru/1109238.html',
            isActive: true
        },
        {
            id: 5,
            dealer: {id: 3},
            site: {id: 6},
            externalId: '1109111',
            publicUrl: 'http://www.irr.ru/29090.html',
            isActive: true
        },
        {
            id: 6,
            dealer: {id: 3},
            site: {id: 7},
            publicUrl: 'http://www.chance.ru/11983248.html',
            isActive: false
        },
        {
            id: 7,
            dealer: {id: 3},
            site: {id: 9},
            publicUrl: 'http://www.auto.yandex.ru/119040.html',
            isActive: true
        },
        {
            id: 8,
            dealer: {id: 3},
            site: {id: 11},
            publicUrl: 'http://www.cars.ru/119abc.html',
            isActive: true
        },
        {
            id: 9,
            dealer: {id: 3},
            site: {id: 13},
            externalId: '119832',
            isActive: true
        },
        {
            id: 10,
            dealer: {id: 3},
            site: {id: 14},
            isActive: true
        },
        {
            id: 11,
            dealer: {id: 3},
            site: {id: 16},
            publicUrl: 'http://www.auto.exist.ru/10110111.html',
            isActive: true
        }
    ], multiplyCoef, function(i, len) {
        this.dealer = { id: dealers.getItems()[i].id };
    })).resolveRefs({dealers: dealers, sites: sites});
    dealerSites.notFoundMessage = 'Регистрация на сайте не найдена.';

    var regexDealerSitesQuery = /^\/api2\/dealersites(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexDealerSitesQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexDealerSitesQuery, dealerSites.getItems(), 'dealerSites', DealerSites);
    });
    $httpBackend.whenPOST(regexDealerSitesQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexDealerSitesQuery, data, dealerSites, 'dealerSites', DealerSites);
    });
    var regexDealerSitesGet = /^\/api2\/dealersites\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexDealerSitesGet).respond(function(method, url, data) {
        return processGet(url, regexDealerSitesGet, dealerSites, 'dealerSite');
    });
    var regexDealerSitesPost = /^\/api2\/dealersites\/new$/;
    $httpBackend.whenPOST(regexDealerSitesPost).respond(function(method, url, data) {
        return processPost(data, dealerSites, 'dealerSite', DealerSite, {
            dealers: dealers,
            sites: sites
        }, function process(item, items) {
        }, function validate(pushError, itemData, items) {
            if (!itemData.dealer) {
                pushError('dealer', 'Значение не должно быть пустым.');
            }
            if (!itemData.site) {
                pushError('site', 'Значение не должно быть пустым.');
            }
            if (_.find(items, function(item) {
                return (item.dealer.id === itemData.dealer.id)
                    && (item.site.id === itemData.site.id);
                })) {
                pushError(null, 'Регистрация салона по указанному сайту уже существует.');
            }
        });
    });
    var regexDealerSitesPut = /^\/api2\/dealersites\/(?:([^\/]+))$/;
    $httpBackend.whenPUT(regexDealerSitesPut).respond(function(method, url, data) {
        return processPut(url, regexDealerSitesPut, data, dealerSites, 'dealerSite', DealerSite, {
            dealers: dealers,
            sites: sites
        }, function process(item, items, idx) {
        }, function validate(pushError, itemData, items, idx) {
            if (!itemData.dealer) {
                pushError('dealer', 'Значение не должно быть пустым.');
            }
            if (!itemData.site) {
                pushError('site', 'Значение не должно быть пустым.');
            }
            if (_.find(items, function(item) {
                return item.id !== itemData.id
                    && item.dealer.id === itemData.dealer.id
                    && item.site.id === itemData.site.id;
            })) {
                pushError(null, 'Регистрация салона по указанному сайту уже существует.');
            }
            if (itemData.publicUrl && !itemData.publicUrl.match(regexpUrl)) {
                pushError('publicUrl', 'Не верное значение ссылки: \'' + itemData.publicUrl + '\'.');
            }
            if (itemData.publicUrl && itemData.publicUrl.length > 255) {
                pushError('publicUrl', 'Значение слишком длинное. Должно быть равно 255 символам или меньше.');
            }
            if (itemData.externalId && itemData.externalId.length > 10) {
                pushError('externalId', 'Значение слишком длинное. Должно быть равно 10 символам или меньше.');
            }
        });
    });
    var regexDealerSitesDelete = /^\/api2\/dealersites\/(?:([^\/]+))$/;
    $httpBackend.whenDELETE(regexDealerSitesDelete).respond(function(method, url, data) {
        return processDelete(url, regexDealerSitesDelete, dealerSites);
    });

    var dealerSiteLogins = new DealerSiteLogins(multiplyArrFn([
        {
            id: 1,
            dealer: {id: 3},
            site: {id: 2},
            type: 'site',
            login: 'priv1108',
            password: 'abyrabyr',
            loginError: true
        },
        {
            id: 2,
            dealer: {id: 3},
            site: {id: 5},
            type: 'site',
            login: 'priv1108',
            password: 'abyr1010',
            loginError: false
        },
        {
            id: 3,
            dealer: {id: 3},
            site: {id: 6},
            type: 'site',
            login: 'pri29834',
            password: 'asdfghj',
            loginError: false
        },
        {
            id: 4,
            dealer: {id: 3},
            site: {id: 6},
            type: 'ftp',
            login: 'pri298',
            password: 'asdfg',
            loginError: false
        },
        {
            id: 5,
            dealer: {id: 3},
            site: {id: 14},
            type: 'site',
            login: 'as119832',
            password: 'ab1110as',
            loginError: false
        }
    ], multiplyCoef, function(i, len) {
        this.dealer = { id: dealers.getItems()[i].id };
    })).resolveRefs({dealers: dealers, sites: sites});
    dealerSiteLogins.notFoundMessage = 'Логин салона на сайте не найден.';

    var regexDealerSiteLoginsQuery = /^\/api2\/dealersitelogins(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexDealerSiteLoginsQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexDealerSiteLoginsQuery, dealerSiteLogins.getItems(), 'dealerSiteLogins', DealerSiteLogins);
    });
    $httpBackend.whenPOST(regexDealerSiteLoginsQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexDealerSiteLoginsQuery, data, dealerSiteLogins, 'dealerSiteLogins', DealerSiteLogins);
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
        }, function process(item, items) {
        }, function validate(pushError, itemData, items) {
            if (!itemData.dealer) {
                pushError('dealer', 'Значение не должно быть пустым.');
            }
            if (!itemData.site) {
                pushError('site', 'Значение не должно быть пустым.');
            }
            if (_.find(items, function(item) {
                return (item.type.id === itemData.type)
                    && (item.dealer.id === itemData.dealer.id)
                    && (item.site.id === itemData.site.id);
                })) {
                pushError(null, 'Логин салона по указанному сайту уже существует.');
            }
        });
    });
    var regexDealerSiteLoginsPut = /^\/api2\/dealersitelogins\/(?:([^\/]+))$/;
    $httpBackend.whenPUT(regexDealerSiteLoginsPut).respond(function(method, url, data) {
        return processPut(url, regexDealerSiteLoginsPut, data, dealerSiteLogins, 'dealerSiteLogin', DealerSiteLogin, {
            dealers: dealers,
            sites: sites
        }, function process(item, items, idx) {
        }, function validate(pushError, itemData, items, idx) {
            if (!itemData.dealer) {
                pushError('dealer.id', 'Значение не должно быть пустым.');
            }
            if (!itemData.site) {
                pushError('site.id', 'Значение не должно быть пустым.');
            }
            if (!itemData.type) {
                pushError('type', 'Значение не должно быть пустым.');
            }
            if (!itemData.login) {
                pushError('login', 'Значение не должно быть пустым.');
            } else if (itemData.login.length > 100){
                pushError('login', 'Значение слишком длинное. Должно быть равно 100 символам или меньше.');
            }
            if (!itemData.password) {
                pushError('password', 'Значение не должно быть пустым.');
            } else if (itemData.password.length > 100){
                pushError('password', 'Значение слишком длинное. Должно быть равно 100 символам или меньше.');
            }
        });
    });
    var regexDealerSiteLoginsDelete = /^\/api2\/dealersitelogins\/(?:([^\/]+))$/;
    $httpBackend.whenDELETE(regexDealerSiteLoginsDelete).respond(function(method, url, data) {
        return processDelete(url, regexDealerSiteLoginsDelete, dealerSiteLogins);
    });

    var tariffs = new Tariffs([
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
            period: null,
            periodUnit: null,
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
            period: null,
            periodUnit: null,
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
            period: null,
            periodUnit: null,
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
            period: null,
            periodUnit: null,
            count: null,
            isActive: false,
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
        },
        {
            id: 21,
            site: {id: 6},
            type: 'periodical',
            period: 30,
            periodUnit: 'day',
            count: 100,
            isActive: true,
            delay: 3,
            groupName: 'Помесячный'
        },
        {
            id: 22,
            site: {id: 2},
            type: 'periodical',
            period: 1,
            periodUnit: 'month',
            count: 400,
            isActive: true,
            delay: 3,
            groupName: 'Помесячный'
        },
        {
            id: 23,
            site: {id: 9},
            type: 'periodical',
            period: 30,
            periodUnit: 'day',
            count: 100,
            isActive: true,
            delay: 3,
            groupName: 'Помесячный'
        }
    ]).resolveRefs({sites: sites});

    var regexTariffsQuery = /^\/api2\/tariffs(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexTariffsQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexTariffsQuery, tariffs.getItems(), 'tariffs', Tariffs);
    });
    $httpBackend.whenPOST(regexTariffsQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexTariffsQuery, data, tariffs, 'tariffs', Tariffs);
    });
    var regexTariffsGet = /^\/api2\/tariffs\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexTariffsGet).respond(function(method, url, data) {
        return processGet(url, regexTariffsGet, tariffs, 'tariff');
    });

    var tariffRates = new TariffRates([
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
            siteRate: 2100,
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
        },
        {
            id: 23,
            tariff: {id: 21},
            city: null,
            activeFrom: '2014-01-01',
            rate: 3150.60,
            siteRate: 2500,
            info: 'Общий'
        },
        {
            id: 24,
            tariff: {id: 22},
            city: null,
            activeFrom: '2014-01-01',
            rate: 6000,
            siteRate: 4500,
            info: 'Общий'
        },
        {
            id: 25,
            tariff: {id: 23},
            city: null,
            activeFrom: '2014-01-01',
            rate: 3333,
            siteRate: 2222,
            info: 'Общий'
        }
    ]).resolveRefs({tariffs: tariffs, cities: userDirectories.cities});

    var regexTariffRatesQuery = /^\/api2\/tariffrates(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexTariffRatesQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexTariffRatesQuery, tariffRates.getItems(), 'tariffRates', TariffRates);
    });
    $httpBackend.whenPOST(regexTariffRatesQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexTariffRatesQuery, data, tariffRates, 'tariffRates', TariffRates);
    });
    var regexTariffRatesGet = /^\/api2\/tariffrates\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexTariffRatesGet).respond(function(method, url, data) {
        return processGet(url, regexTariffRatesGet, tariffRates, 'tariffRate');
    });

    var dealerTariffs = new DealerTariffs([
        {
            id: 1,
            dealer: {id: 3},
            site: {id: 2},
            tariff: {id: 22},
            autoProlong: true,
            renew: '0'
        },
        {
            id: 2,
            dealer: {id: 3},
            site: {id: 17},
            tariff: {id: 1},
            autoProlong: true,
            renew: '0'
        },
        {
            id: 3,
            dealer: {id: 3},
            site: {id: 9},
            tariff: {id: 6},
            autoProlong: true,
            renew: '0'
        },
        {
            id: 3,
            dealer: {id: 3},
            site: {id: 5},
            tariff: {id: 9},
            autoProlong: true,
            renew: '0'
        }
    ]).resolveRefs({dealers: dealers, sites: sites, tariffs: tariffs});

    var regexDealerTariffsQuery = /^\/api2\/dealertariffs(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexDealerTariffsQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexDealerTariffsQuery, dealerTariffs.getItems(), 'dealerTariffs', DealerTariffs);
    });
    $httpBackend.whenPOST(regexDealerTariffsQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexDealerTariffsQuery, data, dealerTariffs, 'dealerTariffs', DealerTariffs);
    });
    var regexDealerTariffsGet = /^\/api2\/dealertariffs\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexDealerTariffsGet).respond(function(method, url, data) {
        return processGet(url, regexDealerTariffsGet, dealerTariffs, 'dealerTariff');
    });

    var sales = new Sales(multiplyArrFn([
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
            tariff: {id: 23},
            cardAmount: 3333,
            count: null,
            activeFrom: '2014-07-15',
            activeTo: '2014-08-14',
            isActive: true,
            date: '2014-04-10',
            amount: 3333,
            siteAmount: 2222,
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
            activeFrom: '2014-01-01',
            activeTo: '2014-12-31',
            isActive: true,
            date: '2013-12-30',
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
            isActive: false,
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
            tariff: null,
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
            isActive: true,
            info: 'Доплата на сайте irr.ru за выделение рамкой'
        },
        {
            id: 11,
            type: 'addcard',
            cardId: 10,
            parentId: 9,
            dealer: {id: 3},
            site: {id: 6},
            tariff: {id: 21},
            cardAmount: 300,
            count: 50,
            activeFrom: '2014-05-20',
            activeTo: '2014-05-30',
            isActive: false,
            date: '2014-05-19',
            amount: 250,
            siteAmount: 120,
            info: 'Второе расширение на irr.ru'
        },
        {
            id: 12,
            type: 'addcard',
            cardId: 11,
            parentId: 4,
            dealer: {id: 3},
            site: {id: 2},
            tariff: {id: 12},
            cardAmount: 300,
            count: 100,
            activeFrom: '2014-05-20',
            activeTo: '2014-05-31',
            isActive: false,
            date: '2014-05-19',
            amount: 250,
            siteAmount: 120,
            info: 'Расширение на bibika.ru'
        },
        {
            id: 13,
            type: 'extra',
            cardId: 5,
            dealer: {id: 3},
            site: {id: 11},
            activeFrom: '2014-05-01',
            activeTo: '2014-05-31',
            date: '2014-04-25',
            amount: 1000,
            siteAmount: 500,
            isActive: false,
            info: 'Доплата на сайте cars.ru за промоушн'
        }
    ], multiplyCoef, function(i, len) {
        this.cardId = this.cardId + i * len;
        this.dealer = { id: dealers.getItems()[i].id };
        if (this.parentId) {
            this.parentId = this.parentId + i * len;
        }
    })).resolveRefs({dealers: dealers, sites: sites, tariffs: tariffs});
    sales.notFoundMessage = 'Продажа не найдена.';

    var regexSalesQuery = /^\/api2\/sales(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexSalesQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexSalesQuery, sales.getItems(), 'sales', Sales);
    });
    $httpBackend.whenPOST(regexSalesQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexSalesQuery, data, sales, 'sales', Sales);
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
            tariffs: tariffs
        }, function process(item, items) {
            if (item.type.id === 'card' || item.type.id === 'addcard') {
                item.cardId = item.id;
            }
            if (item.type.id === 'extra') {
                var card = _.find(items, {cardId: item.cardId});
                item.activeFrom = _.clone(card.activeFrom);
                item.activeTo = _.clone(card.activeTo);
                item.isActive = card.isActive;
            }
        }, function validate(pushError, itemData, items) {
            if (!itemData.site) {
                pushError('site.id', 'Значение не должно быть пустым.');
            } else if (!sites.get(itemData.site.id).isActive) {
                pushError('site.id', 'Сайт ' + itemData.site.id +' не активен.');
            }
            if (itemData.amount < 0) {
                pushError('amount', 'Значение должно быть больше или равно 0.');
            } else if (itemData.amount >= 10000000 ) {
                pushError('amount', 'Значение должно быть меньше чем 10000000.');
            }
            if (itemData.siteAmount < 0) {
                pushError('siteAmount', 'Значение должно быть больше или равно 0.');
            } else if (itemData.siteAmount >= 10000000 ) {
                pushError('siteAmount', 'Значение должно быть меньше чем 10000000.');
            }
            if (_.contains(['card', 'addcard'], itemData.type)) {
                if (!itemData.tariff) {
                    pushError('tariff.id', 'Значение не должно быть пустым.');
                } else if (!tariffs.get(itemData.tariff.id).isActive) {
                    pushError('tariff.id', 'Тариф ' + itemData.tariff.id +' не активен.');
                }
                if (itemData.tariff && itemData.site) {
                    if (tariffs.get(itemData.tariff.id).site.id !== itemData.site.id) {
                        pushError(null, 'Сайт у тарифа должен совпадать с указанным сайтом.');
                    }
                }
                if (itemData.count < 0) {
                    pushError('count', 'Значение должно быть больше чем 0.');
                }
                if (itemData.cardAmount < 0) {
                    pushError('cardAmount', 'Значение должно быть больше или равно 0.');
                } else if (itemData.cardAmount >= 1000000 ) {
                    pushError('cardAmount', 'Значение должно быть меньше чем 1000000.');
                }
                if (itemData.activeFrom > itemData.activeTo) {
                    pushError('activeFrom', 'Дата activeFrom должна быть меньше или равна дате activeTo.');
                }
                if (itemData.cardAmount > itemData.amount) {
                    pushError('cardAmount', 'Стоимость продажи не должна быть меньше цены карточки.');
                }
                if (itemData.siteAmount > itemData.amount) {
                    pushError('siteAmount', 'Стоимость продажи не должна быть меньше себестоимости.');
                }
            }
            if (itemData.type === 'card') {
                var crossSales = _.filter(items, function(item) {
                    return (item.type.id === 'card')
                        && (item.dealer.id === itemData.dealer.id)
                        && (item.site.id === itemData.site.id)
                        && (item.activeTo.toISOString().slice(0, 10) >= itemData.activeFrom)
                        && (item.activeFrom.toISOString().slice(0, 10) <= itemData.activeTo);
                });
                if (crossSales.length) {
                    pushError('activeFrom', 'В диапазоне от ' + itemData.activeFrom + ' до ' + itemData.activeTo
                        + ' уже находятся продажи (' + crossSales.length + ').');
                }
            }
        });
    });
    var regexSalesPut = /^\/api2\/sales\/(?:([^\/]+))$/;
    $httpBackend.whenPUT(regexSalesPut).respond(function(method, url, data) {
        return processPut(url, regexSalesPut, data, sales, 'sale', Sale, {
            dealers: dealers,
            sites: sites,
            tariffs: tariffs
        }, function process(item, items, idx) {
            function updateAddsales(parentSale) {
                var addSale = _.find(items, {
                    type: saleTypes.get('addcard'),
                    parentId: parentSale.cardId
                });
                if (!addSale) {
                    return [];
                } else {
                    addSale.activeTo = _.clone(parentSale.activeTo);
                    return updateAddsales(addSale).concat(addSale);
                }
            }

            if (item.type.id === 'card' && item.activeTo !== items[idx].activeTo) {
                updateAddsales(item);
            }
            if (item.type.id === 'card') {
                _.forEach(sales.getItems(), function(sale) {
                    if (sale.type.id === 'extra' && sale.cardId === item.cardId) {
                        if (item.activeFrom !== items[idx].activeFrom) {
                            sale.activeFrom = _.clone(item.activeFrom);
                        }
                        if (item.activeTo !== items[idx].activeTo) {
                            sale.activeTo = _.clone(item.activeTo);
                        }
                        if (item.isActive !== items[idx].isActive) {
                            sale.isActive = item.isActive;
                        }
                    }
                })
            }
            if (item.type.id === 'extra') {
                var card = _.find(sales.getItems(), {cardId: item.cardId});
                item.activeFrom = _.clone(card.activeFrom);
                item.activeTo = _.clone(card.activeTo);
                item.isActive = card.isActive;
            }
        });
    });
    var regexSalesDelete = /^\/api2\/sales\/(?:([^\/]+))$/;
    $httpBackend.whenDELETE(regexSalesDelete).respond(function(method, url, data) {
        return processDelete(url, regexSalesDelete, sales, function validation(item) {
            if (item.type.id === 'card' && _.find(sales.getItems(), {type: saleTypes.get('addcard'), parentId: item.cardId})) {
                return 'Невозможно удалить продажу с расширением или доплатой.';
            } else if (item.type.id === 'card' && _.find(sales.getItems(), {type: saleTypes.get('extra'), cardId: item.cardId})) {
                return 'Невозможно удалить продажу с расширением или доплатой.';
            } else if (item.type.id === 'addcard' && _.find(sales.getItems(), {type: saleTypes.get('addcard'), parentId: item.cardId})) {
                return 'Невозможно удалить продажу с расширением или доплатой.';
            } else {
                return null;
            }
        });
    });

    var siteBalances = new SiteBalances([
        {
            site: {id: 5},
            saleBalance: 12345678.99,
            purchaseBalance: -87654321.09
        },
        {
            site: {id: 6},
            saleBalance: -87654321.09,
            purchaseBalance: 12345678.99
        }
    ]).resolveRefs({sites: sites});

    var regexSiteBalancesQuery = /^\/api2\/report\/sitebalances(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexSiteBalancesQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexSiteBalancesQuery, siteBalances.getItems(), 'siteBalances', SiteBalances);
    });
    $httpBackend.whenPOST(regexSiteBalancesQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexSiteBalancesQuery, data, siteBalances, 'siteBalances', SiteBalances);
    });

    var dealerBalances = new DealerBalances(multiplyArrFn([
        {
            dealer: {id: 3},
            balance: 100000
        }
    ], multiplyCoef, function(i, len) {
        this.dealer = { id: dealers.getItems()[i].id };
    })).resolveRefs({dealers: dealers});

    var regexDealerBalancesQuery = /^\/api2\/report\/dealerbalances(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexDealerBalancesQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexDealerBalancesQuery, dealerBalances.getItems(), 'dealerBalances', DealerBalances);
    });
    $httpBackend.whenPOST(regexDealerBalancesQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexDealerBalancesQuery, data, dealerBalances, 'dealerBalances', DealerBalances);
    });

    var billingCredits = new BillingCredits(multiplyArrFn([
        {
            id: 1,
            dealer: {id: 3},
            amount: 2500,
            expiresAt: '2014-12-31'
        }
    ], multiplyCoef, function(i, len) {
        this.dealer = { id: dealers.getItems()[i].id };
    })).resolveRefs({dealers: dealers});
    billingCredits.notFoundMessage = 'Кредитный лимит не найден.';

    var regexBillingCreditsQuery = /^\/api2\/billingcredits(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexBillingCreditsQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexBillingCreditsQuery, billingCredits.getItems(), 'billingCredits', BillingCredits);
    });
    $httpBackend.whenPOST(regexBillingCreditsQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexBillingCreditsQuery, data, billingCredits, 'billingCredits', BillingCredits);
    });
    var regexBillingCreditsGet = /^\/api2\/billingcredits\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexBillingCreditsGet).respond(function(method, url, data) {
        return processGet(url, regexBillingCreditsGet, billingCredits, 'billingCredit');
    });
    var regexBillingCreditsPost = /^\/api2\/billingcredits\/new$/;
    $httpBackend.whenPOST(regexBillingCreditsPost).respond(function(method, url, data) {
        return processPost(data, billingCredits, 'billingCredit', BillingCredit, {
            dealers: dealers
        });
    });
    var regexBillingCreditsPut = /^\/api2\/billingcredits\/(?:([^\/]+))$/;
    $httpBackend.whenPUT(regexBillingCreditsPut).respond(function(method, url, data) {
        return processPut(url, regexBillingCreditsPut, data, billingCredits, 'billingCredit', BillingCredit, {
            dealers: dealers
        });
    });
    var regexBillingCreditsDelete = /^\/api2\/billingcredits\/(?:([^\/]+))$/;
    $httpBackend.whenDELETE(regexBillingCreditsDelete).respond(function(method, url, data) {
        return processDelete(url, regexBillingCreditsDelete, billingCredits);
    });

    var billingUnions = new BillingUnions(multiplyArrFn([
        {
            id: 1,
            site: {id: 1},
            masterDealer: {id: 3},
            slaveDealer: {id: 4}
        },
        {
            id: 2,
            site: {id: 2},
            masterDealer: {id: 4},
            slaveDealer: {id: 5}
        }
    ], multiplyCoef, function(i, len) {
        this.slaveDealer = { id: dealers.getItems()[i+2].id };
    })).resolveRefs({sites: sites, dealers: dealers});
    billingUnions.notFoundMessage = 'Группировка салонов не найдена.';

    var regexBillingUnionsQuery = /^\/api2\/billingunions(?:\?([\w_=&.]*))?$/;
    $httpBackend.whenGET(regexBillingUnionsQuery).respond(function(method, url, data) {
        return processQueryUrlSort(url, regexBillingUnionsQuery, billingUnions.getItems(), 'billingUnions', BillingUnions);
    });
    $httpBackend.whenPOST(regexBillingUnionsQuery).respond(function(method, url, data) {
        return processPostQuerySort(url, regexBillingUnionsQuery, data, billingUnions, 'billingUnions', BillingUnions);
    });
    var regexBillingUnionsGet = /^\/api2\/billingunions\/(?:([^\/]+))$/;
    $httpBackend.whenGET(regexBillingUnionsGet).respond(function(method, url, data) {
        return processGet(url, regexBillingUnionsGet, billingUnions, 'billingUnion');
    });
    var regexBillingUnionsPost = /^\/api2\/billingunions\/new$/;
    $httpBackend.whenPOST(regexBillingUnionsPost).respond(function(method, url, data) {
        return processPost(data, billingUnions, 'billingUnion', BillingUnion, {
            sites: sites,
            dealers: dealers
        });
    });
    var regexBillingUnionsPut = /^\/api2\/billingunions\/(?:([^\/]+))$/;
    $httpBackend.whenPUT(regexBillingUnionsPut).respond(function(method, url, data) {
        return processPut(url, regexBillingUnionsPut, data, billingUnions, 'billingUnion', BillingUnion, {
            sites: sites,
            dealers: dealers
        });
    });
    var regexBillingUnionsDelete = /^\/api2\/billingunions\/(?:([^\/]+))$/;
    $httpBackend.whenDELETE(regexBillingUnionsDelete).respond(function(method, url, data) {
        return processDelete(url, regexBillingUnionsDelete, billingUnions);
    });
};
