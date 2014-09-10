'use strict';

describe('app-mocked', function() {
    var $httpBackend;
    var $q;
    var Construction;
    var usersLoader,
        UserStatus,
        userStatuses,
        Users,
        User,
        Group,
        Groups,
        Managers,
        Manager,
        Cities,
        City,
        Metros,
        Metro,
        Markets,
        Market,
        BillingCompanies,
        citiesLoader,
        marketsLoader,
        metrosLoader,
        groupsLoader,
        managersLoader,
        DealerPhoneHour,

        dealerSitesLoader,
        dealersLoader,
        sitesLoader, 
        DealerSite,
        DealerSites,
        Dealers,
        Sites,
        Site,
        dealerSiteLoginsLoader,
        DealerSiteLogin,
        DealerSiteLogins;

    var tariffsLoader;
    var Tariffs;
    var tariffRatesLoader;
    var TariffRates;
    var dealerTariffsLoader;
    var DealerTariffs;
    var salesLoader;
    var Sales;
    var Sale;
    var saleStatuses;
    var saleTypes;
    var SiteBalances;
    var siteBalancesLoader;
    var DealerBalances;
    var dealerBalancesLoader;

    var billingCreditsLoader;
    var BillingCredits;
    var BillingCredit;

    var billingUnionsLoader;
    var BillingUnions;
    var BillingUnion;

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

    function randomAmount(min, max) {
        return (Math.random() * (max - min) + min).ceil(2);
    }

    function randomInt(min, max) {
        return (Math.random() * (max - min) + min).ceil(0);
    }

    var regexpOrder = /^([+-]?)(\w+)$/;

    function sortByOrders(array, orders) {

        function convert(value) {
            if (_.isDate(value)) {
                return value.toISOString();
            } else if (_.isObject(value)) {
                return value.id;
            } else if (_.isString(value)) {
                return value.toLowerCase();
            } else if (value === undefined) {
                return -Infinity;
            } else {
                return value;
            }
        }

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

    beforeEach(function() {
        var modules = ['ng', 'max.dal.entities.user', 'max.dal.entities.collection', 
            'max.dal.entities.dealersite', 'max.dal.entities.dealersitelogin', 
            'max.dal.entities.tariff', 'max.dal.entities.tariffrate', 'max.dal.entities.dealertariff', 'max.dal.entities.sale',
            'max.dal.entities.sitebalance', 'max.dal.entities.dealerbalance',
            'max.dal.entities.billingcredit', 'max.dal.entities.billingunion'];
        if (ngMock) {
            modules.push('ngMock');
        }
        var injector = angular.injector(modules);
        $q = injector.get('$q');

        Construction = injector.get('Construction');
        UserStatus = injector.get('UserStatus');
        userStatuses = injector.get('userStatuses');
        usersLoader = injector.get('usersLoader');
        User = injector.get('User');
        Users = injector.get('Users');
        Group = injector.get('Group');
        Groups = injector.get('Groups');
        Managers = injector.get('Managers');
        Manager = injector.get('Manager');
        Cities = injector.get('Cities');
        City = injector.get('City');
        Metros = injector.get('Metros');
        Metro = injector.get('Metro');
        Markets = injector.get('Markets');
        Market = injector.get('Market');
        BillingCompanies = injector.get('BillingCompanies');
        citiesLoader = injector.get('citiesLoader');
        marketsLoader = injector.get('marketsLoader');
        metrosLoader = injector.get('metrosLoader');
        groupsLoader = injector.get('groupsLoader');
        managersLoader = injector.get('managersLoader');
        DealerPhoneHour = injector.get('DealerPhoneHour');

        dealerSitesLoader = injector.get('dealerSitesLoader');
        DealerSites = injector.get('DealerSites');
        DealerSite = injector.get('DealerSite');
        dealersLoader = injector.get('dealersLoader');
        Dealers = injector.get('Dealers');
        sitesLoader = injector.get('sitesLoader');
        Sites = injector.get('Sites');
        Site = injector.get('Site');
        dealerSiteLoginsLoader = injector.get('dealerSiteLoginsLoader');
        DealerSiteLogins = injector.get('DealerSiteLogins');
        DealerSiteLogin = injector.get('DealerSiteLogin');

        tariffsLoader = injector.get('tariffsLoader');
        Tariffs = injector.get('Tariffs');
        tariffRatesLoader = injector.get('tariffRatesLoader');
        TariffRates = injector.get('TariffRates');
        dealerTariffsLoader = injector.get('dealerTariffsLoader');
        DealerTariffs = injector.get('DealerTariffs');
        salesLoader = injector.get('salesLoader');
        Sales = injector.get('Sales');
        Sale = injector.get('Sale');
        saleStatuses = injector.get('saleStatuses');
        saleTypes = injector.get('saleTypes');
        SiteBalances = injector.get('SiteBalances');
        siteBalancesLoader = injector.get('siteBalancesLoader');
        DealerBalances = injector.get('DealerBalances');
        dealerBalancesLoader = injector.get('dealerBalancesLoader');

        billingCreditsLoader = injector.get('billingCreditsLoader');
        BillingCredits = injector.get('BillingCredits');
        BillingCredit = injector.get('BillingCredit');

        billingUnionsLoader = injector.get('billingUnionsLoader');
        BillingUnions = injector.get('BillingUnions');
        BillingUnion = injector.get('BillingUnion');

        if (ngMock) {
            $httpBackend = injector.get('$httpBackend');
            setHttpMock($httpBackend, 20, Construction,
                userStatuses, User, Users, Groups, Managers, Markets, Metros, Cities, BillingCompanies,
                Dealers, Sites, DealerSite, DealerSites, DealerSiteLogins, DealerSiteLogin,
                Tariffs, TariffRates, DealerTariffs, Sales, Sale, saleTypes, SiteBalances, DealerBalances,
                BillingCredits, BillingCredit, BillingUnions, BillingUnion);
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

    function runSyncS(scope, asyncFn) {
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
                _.assign(scope, actualSuccess);
                return true;
            } else if (actualError !== undefined) {
                _.assign(scope, actualError);
                return true;
            } else if (thrownErr !== undefined) {
                _.assign(scope, thrownErr);
                return true;
            }
            return false;
        });
    }

    function checkSorting(loader, orders, short) {
        var answer = {};

        runSync(answer, function() {
            return $q.all({
                collection1: loader.loadItems({
                    orders: orders,
                    pager: {
                        per_page: 10,
                        page: 1
                    }
                }),
                collection2: loader.loadItems({
                    orders: orders,
                    pager: {
                        per_page: 10,
                        page: 2
                    }
                })
            });
        });

        runs(function() {
            var array1 = answer.respond.collection1.getItems();
            expect(array1.length).toBeTruthy();
            var array2 = answer.respond.collection2.getItems();
            if (!short) {
                expect(array2.length).toBeTruthy();
            }
            var array = _.union(array1, array2);
            _.forEach(orders, function(order) {
                var field = order.replace(regexpOrder, '$2');
                expect(_.pluck(array1, field)).toEqual(_.pluck(sortByOrders(_.clone(array1), orders), field));
                expect(_.pluck(array2, field)).toEqual(_.pluck(sortByOrders(_.clone(array2), orders), field));
                expect(_.pluck(array, field)).toEqual(_.pluck(sortByOrders(_.clone(array), orders), field));
            });
        });
    }

    function checkFilterEqual(loader, fields) {
        var answer = {};
        var item;

        function serialize(value) {
            if (_.isDate(value)) {
                return value.toISOString().slice(0,10);
            } else if (_.isObject(value)) {
                return value.id;
            } else {
                return value;
            }
        }

        runSync(answer, function() {
            return loader.loadItems().then(function(collection) {
                item = collection.getItems()[0];
                return loader.loadItems({
                    filters: _.map(fields, function(field) {
                        return { fields: [field], type: 'equal', value: serialize(item[field]) };
                    })
                });
            });
        });

        runs(function() {
            var items = answer.respond.getItems();
            expect(items.length).toBeTruthy();
            _.forEach(fields, function(field) {
                var itemValue = serialize(item[field]);
                _.forEach(items, function(itemEqual) {
                    expect(serialize(itemEqual[field])).toEqual(itemValue);
                })
            });
        });
    }

    function checkFieldingId(loader) {
        var answer = {};

        runSync(answer, function() {
            return loader.loadItems({
                fields: ['id']
            });
        });

        runs(function() {
            _.forEach(answer.respond.getItems(), function(item) {
                expect(_.keys(item)).toEqual(['id']);
            })
        });
    }

    function checkFieldingAll(loader, params) {
        var s = {};

        runSync(s, function() {
            return loader.loadItems(_.assign({
                pager: {
                    per_page: 1
                }
            }, params));
        });

        runSync(s, function() {
            s.item = s.respond.getItems()[0];
            expect(s.item).toBeDefined();
            s.keys = _.keys(s.item);
            return loader.loadItems({
                fields: s.keys
            });
        });

        runs(function() {
            var items = s.respond.getItems();
            _.forEach(s.keys, function(key) {
                expect(_.pluck(items, key).length).toBeTruthy();
            });
        });
    }

describe('city', function() {

    describe('Метод query', function() {

        it('возвращать все значения', function() {
            var answer = {};

            runSync(answer, function() {
                return citiesLoader.loadItems();
            });

            runs(function() {
                _.forEach(answer.respond.getItems(), function(city) {
                    expect(city.name).toBeTruthy();
                })
            });
        });

        it('equal - фильтровать по равенству id заданному значению', function() {
            checkFilterEqual(citiesLoader, ['id']);
        });

        it('сортировать по id по возрастанию', function() {
            checkSorting(citiesLoader, ['+id']);
        });

        it('сортировать по id по убыванию', function() {
            checkSorting(citiesLoader, ['-id']);
        });

        it('fields - выдавать только id', function() {
            checkFieldingId(citiesLoader);
        });

        it('fields - выдавать все указанные поля', function() {
            checkFieldingAll(citiesLoader);
        });
    });
});

describe('market', function() {

    describe('Метод query', function() {

        it('возвращать все значения', function() {
            var answer = {};

            runSync(answer, function() {
                return marketsLoader.loadItems();
            });

            runs(function() {
                _.forEach(answer.respond.getItems(), function(market) {
                    expect(market.name).toBeTruthy();
                    expect(market.city).toBeReference();
                })
            });
        });

        it('equal - фильтровать по равенству id заданному значению', function() {
            checkFilterEqual(marketsLoader, ['id']);
        });

        it('fields - выдавать только id', function() {
            checkFieldingId(marketsLoader);
        });

        it('fields - выдавать все указанные поля', function() {
            checkFieldingAll(marketsLoader);
        });
    });
});

describe('metro', function() {

    describe('Метод query', function() {

        it('возвращать все значения', function() {
            var answer = {};

            runSync(answer, function() {
                return metrosLoader.loadItems();
            });

            runs(function() {
                _.forEach(answer.respond.getItems(), function(metro) {
                    expect(metro.name).toBeTruthy();
                    expect(metro.city).toBeReference();
                })
            });
        });

        it('equal - фильтровать по равенству id заданному значению', function() {
            checkFilterEqual(metrosLoader, ['id']);
        });

        it('сортировать по id по возрастанию', function() {
            checkSorting(metrosLoader, ['+id']);
        });

        it('сортировать по id по убыванию', function() {
            checkSorting(metrosLoader, ['-id']);
        });

        it('fields - выдавать только id', function() {
            checkFieldingId(metrosLoader);
        });

        it('fields - выдавать все указанные поля', function() {
            checkFieldingAll(metrosLoader);
        });
    });
});

describe('group', function() {

    describe('Метод query', function() {

        it('возвращать все значения', function() {
            var answer = {};

            runSync(answer, function() {
                return groupsLoader.loadItems();
            });

            runs(function() {
                _.forEach(answer.respond.getItems(), function(group) {
                    expect(group.name).toBeTruthy();
                    expect(group.description).toBeTruthy();
                })
            });
        });

        it('equal - фильтровать по равенству id заданному значению', function() {
            checkFilterEqual(groupsLoader, ['id']);
        });

        it('fields - выдавать только id', function() {
            checkFieldingId(groupsLoader);
        });

        it('fields - выдавать все указанные поля', function() {
            checkFieldingAll(groupsLoader);
        });
    });
});

describe('manager', function() {

    describe('Метод query', function() {

        it('возвращать все значения', function() {
            var answer = {};

            runSync(answer, function() {
                return managersLoader.loadItems();
            });

            runs(function() {
                _.forEach(answer.respond.getItems(), function(manager) {
                    expect(manager.name).toBeTruthy();
                })
            });
        });

        it('equal - фильтровать по равенству id заданному значению', function() {
            checkFilterEqual(managersLoader, ['id']);
        });

        it('fields - выдавать только id', function() {
            checkFieldingId(managersLoader);
        });

        it('fields - выдавать все указанные поля', function() {
            checkFieldingAll(managersLoader);
        });
    });
});

describe('billingunion', function() {

    describe('Метод get', function() {

        it('возвращать те же значения, что и query', function() {
            var answer = {};
            var billingUnion;

            runSync(answer, function() {
                return billingUnionsLoader.loadItems();
            });

            runSync(answer, function() {
                billingUnion = answer.respond.getItems()[0];
                return billingUnionsLoader.loadItems(billingUnion.id);
            });

            runs(function() {
                var billingUnionEqual = answer.respond;
                expect(billingUnionEqual).toMatch(billingUnion);
            });
        });
    });

    describe('Метод query', function() {

        it('возвращать все значения', function() {
            var answer = {};

            runSync(answer, function() {
                return billingUnionsLoader.loadItems();
            });

            runs(function() {
                _.forEach(answer.respond.getItems(), function(billingUnion) {
                    expect(billingUnion.id).toBeInteger();
                    expect(billingUnion.site).toBeReference();
                    expect(billingUnion.masterDealer).toBeReference();
                    expect(billingUnion.slaveDealer).toBeReference();
                })
            });
        });

        it('equal - фильтровать по равенству id заданному значению', function() {
            checkFilterEqual(billingUnionsLoader, ['id']);
        });

        it('equal - фильтровать по равенству site заданному значению', function() {
            checkFilterEqual(billingUnionsLoader, ['site']);
        });

        it('equal - фильтровать по равенству masterDealer заданному значению', function() {
            checkFilterEqual(billingUnionsLoader, ['masterDealer']);
        });

        it('equal - фильтровать по равенству slaveDealer заданному значению', function() {
            checkFilterEqual(billingUnionsLoader, ['slaveDealer']);
        });

        it('сортировать по id по возрастанию', function() {
            checkSorting(billingUnionsLoader, ['+id']);
        });

        it('сортировать по id по убыванию', function() {
            checkSorting(billingUnionsLoader, ['-id']);
        });

        it('сортировать по site по возрастанию', function() {
            checkSorting(billingUnionsLoader, ['+site']);
        });

        it('сортировать по site по убыванию', function() {
            checkSorting(billingUnionsLoader, ['-site']);
        });

        it('сортировать по masterDealer по возрастанию', function() {
            checkSorting(billingUnionsLoader, ['+masterDealer']);
        });

        it('сортировать по masterDealer по убыванию', function() {
            checkSorting(billingUnionsLoader, ['-masterDealer']);
        });

        it('сортировать по slaveDealer по возрастанию', function() {
            checkSorting(billingUnionsLoader, ['+slaveDealer']);
        });

        it('сортировать по slaveDealer по убыванию', function() {
            checkSorting(billingUnionsLoader, ['-slaveDealer']);
        });

        it('fields - выдавать только id', function() {
            checkFieldingId(billingUnionsLoader);
        });

        it('fields - выдавать все указанные поля', function() {
            checkFieldingAll(billingUnionsLoader);
        });
    });

    describe('Метод post', function() {

        it('сохранять данные новой группировки дилеров', function() {
            var answer = {};
            var billingUnionData;

            runSync(answer, function() {
                return dealersLoader.loadItems({
                    filters: [
                        { fields: ['isActive'], type: 'equal', value: true }
                    ],
                    order: ['+id'],
                    fields: ['companyName']
                }).then(function(dealers) {
                    var dealerIds = _.pluck(dealers.getItems(), 'id');
                    return $q.all({
                        masterUnions: billingUnionsLoader.loadItems({
                            filters: [
                                { fields: ['masterDealer'], type: 'in', value: dealerIds }
                            ]
                        }),
                        slaveUnions: billingUnionsLoader.loadItems({
                            filters: [
                                { fields: ['slaveDealer'], type: 'in', value: dealerIds }
                            ]
                        })
                    }).then(function(collections) {
                        var unionDealerIds = _.union(_.pluck(_.pluck(collections.masterUnions.getItems(), 'masterDealer'), 'id'),
                                                   _.pluck(_.pluck(collections.slaveUnions.getItems(), 'slaveDealer'), 'id'));
                        var freeDealerIds = _.difference(dealerIds, unionDealerIds);
                        return {
                            masterDealerId: freeDealerIds[0],
                            slaveDealerId: freeDealerIds[1],
                            site: collections.masterUnions.getItems()[0].site
                        }
                    });
                });
            });

            runSync(answer, function() {
                var masterDealerId = answer.respond.masterDealerId;
                var slaveDealerId = answer.respond.slaveDealerId;
                var site = answer.respond.site;
                billingUnionData = {
                    site: {id: site.id},
                    masterDealer: {id: masterDealerId},
                    slaveDealer: {id: slaveDealerId}
                };
                var newBillingUnion = new BillingUnion(billingUnionData);
                return newBillingUnion.save({
                    dealers: new Dealers([{id: masterDealerId}, {id: slaveDealerId}]),
                    sites: new Sites([{id: site.id}])
                });
            });

            runs(function() {
                var billingUnion = answer.respond;
                _.forEach(billingUnion.serialize(), function(value, key) {
                    if (!_.contains(['id'], key)) {
                        expect(value).toEqual(billingUnionData[key]);
                    }
                });
            });
        });
    });

    describe('Метод put', function() {

        it('изменять данные группировки дилеров', function() {
            var answer = {};

            runSync(answer, function() {
                return dealersLoader.loadItems({
                    filters: [
                        { fields: ['isActive'], type: 'equal', value: true }
                    ],
                    order: ['+id'],
                    fields: ['companyName']
                }).then(function(dealers) {
                    var dealerIds = _.pluck(dealers.getItems(), 'id');
                    return $q.all({
                        masterUnions: billingUnionsLoader.loadItems({
                            filters: [
                                { fields: ['masterDealer'], type: 'in', value: dealerIds }
                            ]
                        }),
                        slaveUnions: billingUnionsLoader.loadItems({
                            filters: [
                                { fields: ['slaveDealer'], type: 'in', value: dealerIds }
                            ]
                        })
                    }).then(function(collections) {
                        var unionDealerIds = _.union(_.pluck(_.pluck(collections.masterUnions.getItems(), 'masterDealer'), 'id'),
                                                   _.pluck(_.pluck(collections.slaveUnions.getItems(), 'slaveDealer'), 'id'));
                        var freeDealerIds = _.difference(dealerIds, unionDealerIds);
                        return {
                            masterDealer: dealers.get(freeDealerIds[0]),
                            slaveDealer: dealers.get(freeDealerIds[1]),
                            billingUnion: collections.masterUnions.getItems()[0]
                        }
                    });
                });
            });

            runSync(answer, function() {
                var masterDealer = answer.respond.masterDealer;
                var slaveDealer = answer.respond.slaveDealer;
                var billingUnion = answer.respond.billingUnion;
                billingUnion.masterDealer = masterDealer;
                billingUnion.slaveDealer = slaveDealer;
                return billingUnion.save({
                    dealers: new Dealers([{id: masterDealer.id}, {id: slaveDealer.id}]),
                    sites: new Sites([{id: billingUnion.site.id}])
                }).then(function(savedBillingUnion) {
                    return {
                        billingUnion: billingUnion,
                        savedBillingUnion: savedBillingUnion
                    };
                });
            });

            runs(function() {
                var billingUnionData = answer.respond.billingUnion.serialize();
                var savedBillingUnionData = answer.respond.savedBillingUnion.serialize();
                _.forEach(billingUnionData, function(value, key) {
                    expect(value).toEqual(savedBillingUnionData[key]);
                });
            });
        });
    });

    describe('Метод remove', function() {

        it('удалять группировку дилеров', function() {
            var answer = {};

            runSync(answer, function() {
                return billingUnionsLoader.loadItems({
                    orders: ['-id']
                }).then(function(billingUnions) {
                    return billingUnions.getItems()[0];
                });
            });

            runSync(answer, function() {
                var billingUnion = answer.respond;
                return billingUnion.remove().then(function(respond) {
                    expect(respond).toEqual(null);
                    return billingUnionsLoader.loadItem(billingUnion.id);
                });
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Группировка салонов не найдена.');
            });
        });
    });
});

describe('billingcredit', function() {

    describe('Метод get', function() {

        it('возвращать те же значения, что и query', function() {
            var answer = {};
            var billingCredit;

            runSync(answer, function() {
                return billingCreditsLoader.loadItems();
            });

            runSync(answer, function() {
                billingCredit = answer.respond.getItems()[0];
                return billingCreditsLoader.loadItems(billingCredit.id);
            });

            runs(function() {
                var billingCreditEqual = answer.respond;
                expect(billingCreditEqual).toMatch(billingCredit);
            });
        });
    });

    describe('Метод query', function() {

        it('возвращать все значения', function() {
            var answer = {};

            runSync(answer, function() {
                return billingCreditsLoader.loadItems();
            });

            runs(function() {
                _.forEach(answer.respond.getItems(), function(billingCredit) {
                    expect(billingCredit.id).toBeInteger();
                    expect(billingCredit.dealer).toBeReference();
                    expect(billingCredit.expiresAt).toBeDate();
                    expect(billingCredit.amount).toBeNumber();
                })
            });
        });

        it('equal - фильтровать по равенству id заданному значению', function() {
            checkFilterEqual(billingCreditsLoader, ['id']);
        });

        it('equal - фильтровать по равенству dealer заданному значению', function() {
            checkFilterEqual(billingCreditsLoader, ['dealer']);
        });

        it('equal - фильтровать по expiresAt равно заданному значению', function() {
            checkFilterEqual(billingCreditsLoader, ['expiresAt']);
        });

        it('сортировать по id по возрастанию', function() {
            checkSorting(billingCreditsLoader, ['+id']);
        });

        it('сортировать по id по убыванию', function() {
            checkSorting(billingCreditsLoader, ['-id']);
        });

        it('сортировать по dealer по возрастанию', function() {
            checkSorting(billingCreditsLoader, ['+dealer']);
        });

        it('сортировать по dealer по убыванию', function() {
            checkSorting(billingCreditsLoader, ['-dealer']);
        });

        it('сортировать по amount по возрастанию', function() {
            checkSorting(billingCreditsLoader, ['+amount']);
        });

        it('сортировать по amount по убыванию', function() {
            checkSorting(billingCreditsLoader, ['-amount']);
        });

        it('сортировать по expiresAt по возрастанию', function() {
            checkSorting(billingCreditsLoader, ['+expiresAt']);
        });

        it('сортировать по expiresAt по убыванию', function() {
            checkSorting(billingCreditsLoader, ['-expiresAt']);
        });

        it('fields - выдавать только id', function() {
            checkFieldingId(billingCreditsLoader);
        });

        it('fields - выдавать все указанные поля', function() {
            checkFieldingAll(billingCreditsLoader);
        });
    });

    describe('Метод post', function() {

        it('сохранять данные нового кредитного лимита', function() {
            var answer = {};
            var billingCreditData;

            runSync(answer, function() {
                return dealersLoader.loadItems({
                    filters: [
                        { fields: ['isActive'], type: 'equal', value: true }
                    ],
                    order: ['-id'],
                    fields: ['companyName']
                }).then(function(dealers) {
                    var dealerIds = _.pluck(dealers.getItems(), 'id');
                    return billingCreditsLoader.loadItems({
                        filters: [
                            { fields: ['dealer'], type: 'in', value: dealerIds }
                        ]
                    }).then(function(billingCredits) {
                        return _.difference(dealerIds, _.pluck(_.pluck(billingCredits.getItems(), 'dealer'), 'id'));
                    });
                });
            });

            runSync(answer, function() {
                var dealerId = answer.respond[0];
                var expiresAt = new Date;
                    expiresAt.setUTCHours(0, 0, 0, 0);
                billingCreditData = {
                    dealer: {id: dealerId},
                    amount: randomAmount(1000, 2000),
                    expiresAt: expiresAt.toISOString().slice(0, 10)
                };
                var newBillingCredit = new BillingCredit(billingCreditData);
                return newBillingCredit.save({
                    dealers: new Dealers([{id: dealerId}])
                });
            });

            runs(function() {
                var billingCredit = answer.respond;
                _.forEach(billingCredit.serialize(), function(value, key) {
                    if (!_.contains(['id'], key)) {
                        expect(value).toEqual(billingCreditData[key]);
                    }
                });
            });
        });
    });

    describe('Метод put', function() {

        it('изменять данные кредитного лимита', function() {
            var answer = {};

            runSync(answer, function() {
                return dealersLoader.loadItems({
                    order: ['-id'],
                    fields: ['companyName']
                }).then(function(dealers) {
                    return billingCreditsLoader.loadItems({
                        filters: [
                            { fields: ['dealer'], type: 'in', value: _.pluck(dealers.getItems(), 'id') }
                        ],
                        orders: ['-id']
                    }, {dealers: dealers}).then(function(billingCredits) {
                        return {
                            freeDealer: _.difference(dealers.getItems(), _.pluck(billingCredits.getItems(), 'dealer'))[0],
                            billingCredit: billingCredits.getItems()[0],
                            dealers: dealers
                        };
                    });
                });
            });

            runSync(answer, function() {
                var freeDealer = answer.respond.freeDealer;
                var billingCredit = answer.respond.billingCredit;
                var dealers = answer.respond.dealers;
                billingCredit.dealer = freeDealer;
                billingCredit.amount = randomAmount(1000, 2000);
                billingCredit.expiresAt = billingCredit.expiresAt.setDate()(billingCredit.expiresAt.getDate() + 1);
                return {
                    billingCredit: billingCredit,
                    savedBillingCredit: billingCredit.save({dealers: dealers})
                };
            });

            runs(function() {
                var billingCredit = answer.respond.billingCredit;
                var savedBillingCredit = answer.respond.savedBillingCredit;
                _.forEach(billingCredit, function(value, key) {
                    expect(value).toEqual(savedBillingCredit[key]);
                });
            });
        });
    });

    describe('Метод remove', function() {

        it('удалять кредитный лимит', function() {
            var answer = {};

            runSync(answer, function() {
                return billingCreditsLoader.loadItems({
                    orders: ['-id']
                }).then(function(billingCredits) {
                    return billingCredits.getItems()[0];
                });
            });

            runSync(answer, function() {
                var billingCredit = answer.respond;
                return billingCredit.remove().then(function(respond) {
                    expect(respond).toEqual(null);
                    return billingCreditsLoader.loadItem(billingCredit.id);
                });
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Кредитный лимит не найден.');
            });
        });
    });
});

describe('dealerbalance', function() {

    describe('Метод query', function() {

        it('возвращать все значения', function() {
            var answer = {};

            runSync(answer, function() {
                return dealerBalancesLoader.loadItems();
            });

            runs(function() {
                _.forEach(answer.respond.getItems(), function(dealerBalance) {
                    expect(dealerBalance.dealer).toBeReference();
                    expect(dealerBalance.balance).toBeNumber();
                })
            });
        });

        it('equal - фильтровать по равенству dealer заданному значению', function() {
            checkFilterEqual(dealerBalancesLoader, ['dealer']);
        });

        it('сортировать по dealer по возрастанию', function() {
            checkSorting(dealerBalancesLoader, ['+dealer']);
        });

        it('сортировать по dealer по убыванию', function() {
            checkSorting(dealerBalancesLoader, ['-dealer']);
        });
    });
});

describe('sitebalance', function() {

    describe('Метод query', function() {

        it('возвращать все значения', function() {
            var answer = {};

            runSync(answer, function() {
                return siteBalancesLoader.loadItems();
            });

            runs(function() {
                _.forEach(answer.respond.getItems(), function(siteBalance) {
                    expect(siteBalance.site).toBeReference();
                    expect(siteBalance.saleBalance).toBeNumber();
                    expect(siteBalance.purchaseBalance).toBeNumber();
                })
            });
        });

        it('equal - фильтровать по равенству site заданному значению', function() {
            checkFilterEqual(siteBalancesLoader, ['site']);
        });

        it('сортировать по site по возрастанию', function() {
            checkSorting(siteBalancesLoader, ['+site'], true);
        });

        it('сортировать по site по убыванию', function() {
            checkSorting(siteBalancesLoader, ['-site'], true);
        });
    });
});

describe('dealerTariff', function() {

    describe('Метод get', function() {

        it('возвращать те же значения, что и query', function() {
            var answer = {};
            var dealerTariff;

            runSync(answer, function() {
                return dealerTariffsLoader.loadItems();
            });

            runSync(answer, function() {
                dealerTariff = answer.respond.getItems()[0];
                return dealerTariffsLoader.loadItems(dealerTariff.id);
            });

            runs(function() {
                var dealerTariffEqual = answer.respond;
                expect(dealerTariffEqual).toMatch(dealerTariff);
            });
        });
    });

    describe('Метод query', function() {

        it('возвращать все значения', function() {
            var answer = {};

            runSync(answer, function() {
                return dealerTariffsLoader.loadItems();
            });

            runs(function() {
                _.forEach(answer.respond.getItems(), function(dealerTariff) {
                    expect(dealerTariff.id).toBeInteger();
                    expect(dealerTariff.dealer).toBeReference();
                    expect(dealerTariff.site).toBeReference();
                    expect(dealerTariff.tariff).toBeReference();
                })
            });
        });

        it('equal - фильтровать по равенству id заданному значению', function() {
            checkFilterEqual(dealerTariffsLoader, ['id']);
        });

        it('equal - фильтровать по равенству dealer заданному значению', function() {
            checkFilterEqual(dealerTariffsLoader, ['dealer']);
        });

        it('equal - фильтровать по равенству site заданному значению', function() {
            checkFilterEqual(dealerTariffsLoader, ['dealer']);
        });

        it('сортировать по id по возрастанию', function() {
            checkSorting(dealerTariffsLoader, ['+id'], true);
        });

        it('сортировать по id по убыванию', function() {
            checkSorting(dealerTariffsLoader, ['-id'], true);
        });

        it('сортировать по site по возрастанию', function() {
            checkSorting(dealerTariffsLoader, ['+site'], true);
        });

        it('сортировать по site по убыванию', function() {
            checkSorting(dealerTariffsLoader, ['-site'], true);
        });

        it('fields - выдавать только id', function() {
            checkFieldingId(dealerTariffsLoader);
        });

        it('fields - выдавать все указанные поля', function() {
            checkFieldingAll(dealerTariffsLoader);
        });
    });
});

describe('sale', function() {

    describe('Метод get', function() {

        it('возвращать те же значения, что и query', function() {
            var answer = {};
            var sale;

            runSync(answer, function() {
                return salesLoader.loadItems();
            });

            runSync(answer, function() {
                sale = answer.respond.getItems()[0];
                return salesLoader.loadItems(sale.id);
            });

            runs(function() {
                var saleEqual = answer.respond;
                expect(saleEqual).toMatch(sale);
            });
        });
    });

    describe('Метод query', function() {

        it('возвращать все значения', function() {
            var answer = {};

            runSync(answer, function() {
                return salesLoader.loadItems();
            });

            runs(function() {
                _.forEach(answer.respond.getItems(), function(sale) {
                    expect(sale.id).toBeInteger();
                    expect(sale.type.id).toBeMemberOf(['card', 'addcard', 'extra']);
                    if (sale.type === 'addcard') {
                        expect(sale.parentId).toBeInteger();
                        expect(sale.tariff).toBeReferenceOrNull();
                    }
                    if (sale.type === 'card') {
                        expect(sale.tariff).toBeReference();
                    }
                    if (sale.type.id === 'card' || sale.type.id === 'addcard') {
                        expect(sale.cardAmount).toBeNumber();
                        expect(sale.count).toBeIntegerOrNull();
                    }
                    expect(sale.cardId).toBeInteger();
                    expect(sale.dealer).toBeReference();
                    expect(sale.site).toBeReference();
                    expect(sale.date).toBeDate();
                    expect(sale.activeFrom).toBeDate();
                    expect(sale.activeTo).toBeDate();
                    expect(sale.amount).toBeNumber();
                    expect(sale.siteAmount).toBeNumber();
                    expect(sale.isActive.id).toBeBoolean();
                    expect(sale.info).toBeString();
                })
            });
        });

        it('equal - фильтровать по равенству id заданному значению', function() {
            checkFilterEqual(salesLoader, ['id']);
        });

        it('equal - фильтровать по равенству type заданному значению', function() {
            checkFilterEqual(salesLoader, ['type']);
        });

        it('equal - фильтровать по равенству parentId заданному значению', function() {
            var answer = {};
            var sale;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'addcard' }
                    ]
                });
            });

            runSync(answer, function() {
                sale = answer.respond.getItems()[0];
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['parentId'], type: 'equal', value: sale.parentId }
                    ]
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBe(1);
                expect(sales[0]).toEqual(sale);
            });
        });

        it('equal - фильтровать доплаты по равенству cardId заданному значению', function() {
            var answer = {};
            var sale;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'extra' }
                    ]
                });
            });

            runSync(answer, function() {
                sale = answer.respond.getItems()[0];
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'extra' },
                        { fields: ['cardId'], type: 'equal', value: sale.cardId }
                    ]
                });
            });

            runs(function() {
                var saleItems = answer.respond.getItems();
                expect(saleItems.length).toBeTruthy();
                _.forEach(saleItems, function(saleItem) {
                    expect(saleItem.cardId).toEqual(sale.cardId);
                })
            });
        });

        it('equal - фильтровать по равенству dealer заданному значению', function() {
            checkFilterEqual(salesLoader, ['dealer']);
        });

        it('equal - фильтровать по равенству site заданному значению', function() {
            checkFilterEqual(salesLoader, ['site']);
        });

        it('equal - фильтровать по activeTo больше или равно заданного значения', function() {
            var answer = {};
            var sale;

            runSync(answer, function() {
                return salesLoader.loadItems();
            });

            runSync(answer, function() {
                sale = answer.respond.getItems()[0];
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['activeTo'], type: 'greaterOrEqual', value: sale.activeTo.toISOString().slice(0, 10) }
                    ]
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sales, function(saleEqual) {
                    expect(saleEqual.activeTo).not.toBeLessThan(sale.activeTo);
                });
            });
        });

        it('equal - фильтровать по activeFrom меньше или равно заданного значения', function() {
            var answer = {};
            var sale;

            runSync(answer, function() {
                return salesLoader.loadItems();
            });

            runSync(answer, function() {
                sale = answer.respond.getItems()[0];
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['activeFrom'], type: 'lessOrEqual', value: sale.activeFrom.toISOString().slice(0, 10) }
                    ]
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sales, function(saleEqual) {
                    expect(saleEqual.activeFrom).not.toBeGreaterThan(sale.activeFrom);
                });
            });
        });

        it('equal - фильтровать по равенству isActive значению true', function() {
            var answer = {};

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['isActive'], type: 'equal', value: true }
                    ]
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sales, function(saleEqual) {
                    expect(saleEqual.isActive.id).toEqual(true);
                });
            });
        });

        it('equal - фильтровать по равенству isActive значению false', function() {
            var answer = {};

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['isActive'], type: 'equal', value: false }
                    ]
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sales, function(saleEqual) {
                    expect(saleEqual.isActive.id).toEqual(false);
                });
            });
        });

        it('сортировать по id по возрастанию', function() {
            checkSorting(salesLoader, ['+id']);
        });

        it('сортировать по id по убыванию', function() {
            checkSorting(salesLoader, ['-id']);
        });

        it('сортировать по date по возрастанию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['+date', '-id']);
        });

        it('сортировать по date по убыванию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['-date', '-id']);
        });

        it('сортировать по dealer по возрастанию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['+dealer', '-id']);
        });

        it('сортировать по dealer по убыванию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['-dealer', '-id']);
        });

        it('сортировать по site по возрастанию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['+site', '-id']);
        });

        it('сортировать по site по убыванию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['-site', '-id']);
        });

        it('сортировать по type по возрастанию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['+type', '-id']);
        });

        it('сортировать по type по убыванию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['-type', '-id']);
        });

        // it('сортировать по count по возрастанию, затем по id по убыванию', function() {
        //     checkSorting(salesLoader, ['+count', '-id']);
        // });

        it('сортировать по count по убыванию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['-count', '-id']);
        });

        it('сортировать по amount по возрастанию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['+amount', '-id']);
        });

        it('сортировать по amount по убыванию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['-amount', '-id']);
        });

        it('сортировать по siteAmount по возрастанию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['+siteAmount', '-id']);
        });

        it('сортировать по siteAmount по убыванию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['-siteAmount', '-id']);
        });

        it('сортировать по activeFrom по возрастанию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['+activeFrom', '-id']);
        });

        it('сортировать по activeFrom по убыванию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['-activeFrom', '-id']);
        });

        it('сортировать по activeTo по возрастанию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['+activeTo', '-id']);
        });

        it('сортировать по activeTo по убыванию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['-activeTo', '-id']);
        });

        it('сортировать по isActive по возрастанию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['+isActive', '-id']);
        });

        it('сортировать по isActive по убыванию, затем по id по убыванию', function() {
            checkSorting(salesLoader, ['-isActive', '-id']);
        });

        it('fields - выдавать только id', function() {
            checkFieldingId(salesLoader);
        });

        it('fields - выдавать все указанные поля', function() {
            checkFieldingAll(salesLoader, {
                filters: [
                    { fields: ['type'], type: 'equal', value: 'addcard' }
                ]
            });
        });
    });

    describe('Метод post', function() {

        it('сохранять данные новой карточки', function() {
            var answer = {};
            var saleData;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'in', value: ['card', 'addcard'] }
                    ],
                    orders: ['-activeTo']
                });
            });

            runSync(answer, function() {
                var sale = answer.respond.getItems()[0];
                var activeFrom = _.clone(sale.activeTo);
                    activeFrom.setDate(activeFrom.getDate() + 1);
                var activeTo = _.clone(activeFrom);
                    activeTo.setDate(activeTo.getDate() + Math.floor(Math.random() * 10));
                var date = new Date;
                    date.setUTCHours(0, 0, 0, 0);
                saleData = {
                    type: 'card',
                    cardId: null,
                    dealer: {id: sale.dealer.id},
                    site: {id: sale.site.id},
                    tariff: {id: sale.tariff.id},
                    cardAmount: randomAmount(1, 1000),
                    count: randomInt(1, 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: randomAmount(1000, 2000),
                    siteAmount: randomAmount(1, 1000),
                    info: 'Комментарий'
                };
                var newSale = new Sale(saleData);
                return newSale.save({
                    dealers: new Dealers([{id: sale.dealer.id}]),
                    sites: new Sites([{id: sale.site.id}]),
                    tariffs: new Tariffs([{id: sale.tariff.id}])
                });
            });

            runs(function() {
                var sale = answer.respond;
                _.forEach(sale.serialize(), function(value, key) {
                    if (!_.contains(['id', 'cardId'], key)) {
                        expect(value).toEqual(saleData[key]);
                    }
                });
            });
        });

        it('принимать неограниченное количество (null)', function() {
            var answer = {};
            var saleData;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'in', value: ['card', 'addcard'] }
                    ],
                    orders: ['-activeTo']
                });
            });

            runSync(answer, function() {
                var sale = answer.respond.getItems()[0];
                var activeFrom = _.clone(sale.activeTo);
                    activeFrom.setDate(activeFrom.getDate() + 1);
                var activeTo = _.clone(activeFrom);
                    activeTo.setDate(activeTo.getDate() + Math.floor(Math.random() * 10));
                var date = new Date;
                    date.setUTCHours(0, 0, 0, 0);
                saleData = {
                    type: 'card',
                    cardId: null,
                    dealer: {id: sale.dealer.id},
                    site: {id: sale.site.id},
                    tariff: {id: sale.tariff.id},
                    cardAmount: randomAmount(1, 1000),
                    count: null,
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: randomAmount(1000, 2000),
                    siteAmount: randomAmount(1, 1000),
                    info: 'Комментарий'
                };
                var newSale = new Sale(saleData);
                return newSale.save({
                    dealers: new Dealers([{id: sale.dealer.id}]),
                    sites: new Sites([{id: sale.site.id}]),
                    tariffs: new Tariffs([{id: sale.tariff.id}])
                });
            });

            runs(function() {
                var sale = answer.respond;
                _.forEach(sale.serialize(), function(value, key) {
                    if (!_.contains(['id', 'cardId'], key)) {
                        expect(value).toEqual(saleData[key]);
                    }
                });
            });
        });

        it('выдавать ошибки, если сайт неактивный или не совпадает с тарифом или тариф неактивный', function() {
            var answer = {};
            var saleData;

            runSync(answer, function() {
                return $q.all({
                    sales: salesLoader.loadItems({
                        orders: ['-activeTo']
                    }),
                    tariffs: tariffsLoader.loadItems({
                        filters: [
                            {fields: ['isActive'], type: 'equal', value: false}
                        ]
                    }),
                    sites: sitesLoader.loadItems()
                });
            });

            runSync(answer, function() {
                var site = _.find(answer.respond.sites.getItems(), {isActive: false});
                var tariff = _.find(answer.respond.tariffs.getItems(), function(tariff) {
                    return tariff.site.id !== site.id;
                });
                var sale = answer.respond.sales.getItems()[0];
                var activeFrom = _.clone(sale.activeTo);
                    activeFrom.setDate(activeFrom.getDate() + 1);
                var activeTo = _.clone(activeFrom);
                    activeTo.setDate(activeTo.getDate() + Math.floor(Math.random() * 10));
                var date = new Date;
                    date.setUTCHours(0, 0, 0, 0);
                saleData = {
                    type: 'card',
                    cardId: null,
                    dealer: {id: sale.dealer.id},
                    site: {id: site.id},
                    tariff: {id: tariff.id},
                    cardAmount: randomAmount(1, 1000),
                    count: randomInt(1, 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: randomAmount(1000, 2000),
                    siteAmount: randomAmount(1, 1000),
                    info: 'Комментарий'
                };
                var newSale = new Sale(saleData);
                return newSale.save({
                    dealers: new Dealers([{id: sale.dealer.id}]),
                    sites: new Sites([{id: sale.site.id}]),
                    tariffs: new Tariffs([{id: sale.tariff.id}])
                });
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.site.children.id.errors).toContain('Сайт ' + saleData.site.id +' не активен.');
                expect(errorResponse.errors.children.tariff.children.id.errors).toContain('Тариф ' + saleData.tariff.id +' не активен.');
                expect(errorResponse.errors.errors).toContain('Сайт у тарифа должен совпадать с указанным сайтом.');
            });
        });

        it('выдавать ошибку, если отрицательные числа', function() {
            var answer = {};
            var saleData;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: ['-activeTo']
                });
            });

            runSync(answer, function() {
                var sale = answer.respond.getItems()[0];
                var activeFrom = _.clone(sale.activeTo);
                    activeFrom.setDate(activeFrom.getDate() + 1);
                var activeTo = _.clone(activeFrom);
                    activeTo.setDate(activeTo.getDate() + Math.floor(Math.random() * 10));
                var date = new Date;
                    date.setUTCHours(0, 0, 0, 0);
                saleData = {
                    type: 'card',
                    cardId: null,
                    dealer: {id: sale.dealer.id},
                    site: {id: sale.site.id},
                    tariff: {id: sale.tariff.id},
                    cardAmount: -1,
                    count: -1,
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: -1,
                    siteAmount: -1,
                    info: 'Комментарий'
                };
                var newSale = new Sale(saleData);
                return newSale.save({
                    dealers: new Dealers([{id: sale.dealer.id}]),
                    sites: new Sites([{id: sale.site.id}]),
                    tariffs: new Tariffs([{id: sale.tariff.id}])
                });
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.count.errors).toContain('Значение должно быть больше чем 0.');
                expect(errorResponse.errors.children.cardAmount.errors).toContain('Значение должно быть больше или равно 0.');
                expect(errorResponse.errors.children.amount.errors).toContain('Значение должно быть больше или равно 0.');
                expect(errorResponse.errors.children.siteAmount.errors).toContain('Значение должно быть больше или равно 0.');
            });
        });

        it('выдавать ошибку, если суммы слишком большие', function() {
            var answer = {};
            var saleData;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: ['-activeTo']
                });
            });

            runSync(answer, function() {
                var sale = answer.respond.getItems()[0];
                var activeFrom = _.clone(sale.activeTo);
                    activeFrom.setDate(activeFrom.getDate() + 1);
                var activeTo = _.clone(activeFrom);
                    activeTo.setDate(activeTo.getDate() + Math.floor(Math.random() * 10));
                var date = new Date;
                    date.setUTCHours(0, 0, 0, 0);
                saleData = {
                    type: 'card',
                    cardId: null,
                    dealer: {id: sale.dealer.id},
                    site: {id: sale.site.id},
                    tariff: {id: sale.tariff.id},
                    cardAmount: 1000000,
                    count: 1,
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: 10000000,
                    siteAmount: 10000000,
                    info: 'Комментарий'
                };
                var newSale = new Sale(saleData);
                return newSale.save({
                    dealers: new Dealers([{id: sale.dealer.id}]),
                    sites: new Sites([{id: sale.site.id}]),
                    tariffs: new Tariffs([{id: sale.tariff.id}])
                });
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.cardAmount.errors).toContain('Значение должно быть меньше чем 1000000.');
                expect(errorResponse.errors.children.amount.errors).toContain('Значение должно быть меньше чем 10000000.');
                expect(errorResponse.errors.children.siteAmount.errors).toContain('Значение должно быть меньше чем 10000000.');
            });
        });

        it('выдавать ошибку, если дата начала > даты конца', function() {
            var answer = {};
            var saleData;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: ['-activeTo']
                });
            });

            runSync(answer, function() {
                var sale = answer.respond.getItems()[0];
                var activeTo = _.clone(sale.activeFrom);
                    activeTo.setDate(activeTo.getDate() + 1);
                var activeFrom = _.clone(activeTo);
                    activeFrom.setDate(activeFrom.getDate() + 1);
                var date = new Date;
                    date.setUTCHours(0, 0, 0, 0);
                saleData = {
                    type: 'card',
                    cardId: null,
                    dealer: {id: sale.dealer.id},
                    site: {id: sale.site.id},
                    tariff: {id: sale.tariff.id},
                    cardAmount: randomAmount(1, 1000),
                    count: randomInt(1, 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: randomAmount(1000, 2000),
                    siteAmount: randomAmount(1, 1000),
                    info: 'Комментарий'
                };
                var newSale = new Sale(saleData);
                return newSale.save({
                    dealers: new Dealers([{id: sale.dealer.id}]),
                    sites: new Sites([{id: sale.site.id}]),
                    tariffs: new Tariffs([{id: sale.tariff.id}])
                });
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.activeFrom.errors).toContain('Дата activeFrom должна быть меньше или равна дате activeTo.');
            });
        });

        it('выдавать ошибку, если интервал дат пересекается с другой карточкой', function() {
            var answer = {};
            var saleData;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'card' }
                    ],
                    orders: ['-activeTo']
                });
            });

            runSync(answer, function() {
                var sale = answer.respond.getItems()[0];
                var activeFrom = _.clone(sale.activeTo);
                var activeTo = _.clone(activeFrom);
                    activeTo.setDate(activeTo.getDate() + Math.floor(Math.random() * 10));
                var date = new Date;
                    date.setUTCHours(0, 0, 0, 0);
                saleData = {
                    type: 'card',
                    cardId: null,
                    dealer: {id: sale.dealer.id},
                    site: {id: sale.site.id},
                    tariff: {id: sale.tariff.id},
                    cardAmount: randomAmount(1, 1000),
                    count: randomInt(1, 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: randomAmount(1000, 2000),
                    siteAmount: randomAmount(1, 1000),
                    info: 'Комментарий'
                };
                var newSale = new Sale(saleData);
                return newSale.save({
                    dealers: new Dealers([{id: sale.dealer.id}]),
                    sites: new Sites([{id: sale.site.id}]),
                    tariffs: new Tariffs([{id: sale.tariff.id}])
                });
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.activeFrom.errors[0]).toMatch(new RegExp('^В диапазоне от ' + saleData.activeFrom
                    + ' до ' + saleData.activeTo + ' уже находятся продажи \\(\\d+\\)\\.$'));
            });
        });

        it('сохранять данные нового расширения', function() {
            var answer = {};
            var sale;
            var addSaleData;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'card' }
                    ],
                    orders: ['-amount']
                }).then(function(sales) {
                    return salesLoader.loadItems({
                        filters: [
                            { fields: ['type'], type: 'equal', value: 'addcard' },
                            { fields: ['parentId'], type: 'in', value: _.pluck(sales.getItems(), 'cardId') }
                        ]
                    }).then(function(addSales) {
                        var addSaleParentIds = _.pluck(addSales.getItems(), 'parentId');
                        _.remove(sales.getItems(), function(sale) {
                            return _.contains(addSaleParentIds, sale.cardId); 
                        });
                        return sales;
                    });
                });
            });

            runSync(answer, function() {
                sale = answer.respond.getItems()[0];
                var activeFrom = _.clone(sale.activeTo);
                var activeTo = _.clone(sale.activeTo);
                var date = new Date;
                date.setUTCHours(0, 0, 0, 0);
                addSaleData = {
                    type: 'addcard',
                    cardId: null,
                    dealer: {id: sale.dealer.id},
                    site: {id: sale.site.id},
                    tariff: {id: sale.tariff.id},
                    parentId: sale.cardId,
                    cardAmount: randomAmount(1, 1000),
                    count: randomInt(1, 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: randomAmount(1000, 2000),
                    siteAmount: randomAmount(1, 1000),
                    info: 'Комментарий'
                };
                var addSale = new Sale(addSaleData);
                return addSale.save({
                    dealers: new Dealers([{id: sale.dealer.id}]),
                    sites: new Sites([{id: sale.site.id}]),
                    tariffs: new Tariffs([{id: sale.tariff.id}])
                });
            });

            runs(function() {
                var addSale = answer.respond;
                _.forEach(addSale.serialize(), function(value, key) {
                    if (!_.contains(['id', 'cardId'], key)) {
                        expect(value).toEqual(addSaleData[key]);
                    }
                });
            });
        });

        it('сохранять данные нового расширения расширения', function() {
            var answer = {};
            var sale;
            var addSaleData;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'addcard' }
                    ],
                    orders: ['-id']
                }).then(function(sales) {
                    return salesLoader.loadItems({
                        filters: [
                            { fields: ['type'], type: 'equal', value: 'addcard' },
                            { fields: ['parentId'], type: 'in', value: _.pluck(sales.getItems(), 'cardId') }
                        ]
                    }).then(function(addSales) {
                        var addSaleParentIds = _.pluck(addSales.getItems(), 'parentId');
                        _.remove(sales.getItems(), function(sale) {
                            return _.contains(addSaleParentIds, sale.cardId); 
                        });
                        return sales;
                    });
                });
            });

            runSync(answer, function() {
                sale = answer.respond.getItems()[0];
                var activeFrom = _.clone(sale.activeTo);
                var activeTo = _.clone(sale.activeTo);
                var date = new Date;
                date.setUTCHours(0, 0, 0, 0);
                addSaleData = {
                    type: 'addcard',
                    cardId: null,
                    dealer: {id: sale.dealer.id},
                    site: {id: sale.site.id},
                    tariff: {id: sale.tariff.id},
                    parentId: sale.cardId,
                    cardAmount: randomAmount(1, 1000),
                    count: randomInt(1, 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: randomAmount(1000, 2000),
                    siteAmount: randomAmount(1, 1000),
                    info: 'Комментарий'
                };
                var addSale = new Sale(addSaleData);
                return addSale.save({
                    dealers: new Dealers([{id: sale.dealer.id}]),
                    sites: new Sites([{id: sale.site.id}]),
                    tariffs: new Tariffs([{id: sale.tariff.id}])
                });
            });

            runs(function() {
                var addSale = answer.respond;
                _.forEach(addSale.serialize(), function(value, key) {
                    if (!_.contains(['id', 'cardId'], key)) {
                        expect(value).toEqual(addSaleData[key]);
                    }
                });
            });
        });

        it('сохранять данные новой доплаты', function() {
            var answer = {};
            var sale;
            var extraSaleData;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'card' }
                    ],
                    orders: ['-id']
                });
            });

            runSync(answer, function() {
                sale = answer.respond.getItems()[0];
                var activeFrom = _.clone(sale.activeFrom);
                var activeTo = _.clone(sale.activeTo);
                var date = new Date;
                date.setUTCHours(0, 0, 0, 0);
                extraSaleData = {
                    type: 'extra',
                    cardId: sale.cardId,
                    dealer: {id: sale.dealer.id},
                    site: {id: sale.site.id},
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    date: date.toISOString().slice(0, 10),
                    amount: randomAmount(1000, 2000),
                    siteAmount: randomAmount(1, 1000),
                    isActive: sale.isActive.id,
                    info: 'Комментарий'
                };
                var extraSale = new Sale(extraSaleData);
                return extraSale.save({
                    dealers: new Dealers([{id: sale.dealer.id}]),
                    sites: new Sites([{id: sale.site.id}]),
                    tariffs: new Tariffs([{id: sale.tariff.id}])
                });
            });

            runs(function() {
                var extraSale = answer.respond;
                _.forEach(extraSale.serialize(), function(value, key) {
                    if (!_.contains(['id'], key)) {
                        expect(value).toEqual(extraSaleData[key]);
                    }
                });
            });
        });
    });

    describe('Метод put', function() {

        it('сохранять данные имеющейся нерасширенной карточки', function() {
            var answer = {};
            var saleData;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'card' }
                    ],
                    orders: ['-activeTo']
                }).then(function(sales) {
                    return salesLoader.loadItems({
                        filters: [
                            { fields: ['type'], type: 'equal', value: 'addcard' },
                            { fields: ['parentId'], type: 'in', value: _.pluck(sales.getItems(), 'cardId') }
                        ]
                    }).then(function(addSales) {
                        return {
                            sales: sales,
                            addSales: addSales
                        }
                    });
                });
            });

            runSync(answer, function() {
                var salesItems = answer.respond.sales.getItems();
                var addSalesItems = answer.respond.addSales.getItems();
                var addSaleParentIds = _.pluck(addSalesItems, 'parentId');
                var sale = _.find(salesItems, function(sale) {
                    return !_.contains(addSaleParentIds, sale.cardId);
                });
                var otherSale = _.find(salesItems, function(otherSale) {
                    return (otherSale.dealer.id !== sale.dealer.id) && (otherSale.site.id !== sale.site.id);
                });
                expect(otherSale).toBeDefined();

                var activeFrom = _.clone(otherSale.activeTo);
                    activeFrom.setDate(activeFrom.getDate() + 1);
                var activeTo = _.clone(activeFrom);
                    activeTo.setDate(activeTo.getDate() + randomInt(1, 10));
                var date = new Date;
                    date.setUTCHours(0, 0, 0, 0);

                saleData = {
                    id: sale.id,
                    type: 'card',
                    cardId: sale.cardId,
                    dealer: {id: otherSale.dealer.id},
                    site: {id: otherSale.site.id},
                    tariff: {id: otherSale.tariff.id},
                    cardAmount: randomAmount(1, 1000),
                    count: randomInt(1, 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: !sale.isActive,
                    date: date.toISOString().slice(0, 10),
                    amount: randomAmount(1000, 2000),
                    siteAmount: randomAmount(1, 1000),
                    info: sale.info + '1'
                };
                var newSale = new Sale(saleData);
                return newSale.save({
                    dealers: new Dealers([{id: otherSale.dealer.id}]),
                    sites: new Sites([{id: otherSale.site.id}]),
                    tariffs: new Tariffs([{id: otherSale.tariff.id}])
                });
            });

            runs(function() {
                var sale = answer.respond;
                _.forEach(sale.serialize(), function(value, key) {
                    expect(value).toEqual(saleData[key]);
                });
            });
        });

        it('деактивировать активированную нерасширенную карточку', function() {
            var answer = {};
            var sale;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'card' },
                        { fields: ['isActive'], type: 'equal', value: true }
                    ],
                    orders: ['-activeTo']
                }).then(function(sales) {
                    return salesLoader.loadItems({
                        filters: [
                            { fields: ['type'], type: 'equal', value: 'addcard' },
                            { fields: ['parentId'], type: 'in', value: _.pluck(sales.getItems(), 'cardId') }
                        ]
                    }).then(function(addSales) {
                        var addSaleParentIds = _.pluck(addSales.getItems(), 'parentId');
                        _.remove(sales.getItems(), function(sale) {
                            return _.contains(addSaleParentIds, sale.cardId); 
                        });
                        return sales;
                    });
                });
            });

            runSync(answer, function() {
                sale = answer.respond.getItems()[0];
                var construction = {
                    dealers: new Dealers([{id: sale.dealer.id}]),
                    sites: new Sites([{id: sale.site.id}]),
                    tariffs: new Tariffs([{id: sale.tariff.id}])
                };
                sale.resolveRefs(construction);
                sale.isActive = saleStatuses.get(false);
                return sale.save(construction);
            });

            runs(function() {
                var equalSale = answer.respond;
                _.forEach(sale, function(value, key) {
                    expect(value).toEqual(equalSale[key]);
                });
            });
        });

        it('исправлять activeTo в карточке и в расширении', function() {
            var answer = {};
            var sale;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'in', value: ['card', 'addcard'] }
                    ],
                    orders: ['-activeTo']
                });
            });

            runSync(answer, function() {
                sale = answer.respond.getItems()[0];
                var activeFrom = _.clone(sale.activeTo);
                    activeFrom.setDate(activeFrom.getDate() + 1);
                var activeTo = _.clone(activeFrom);
                    activeTo.setDate(activeTo.getDate() + Math.floor(Math.random() * 10));
                var date = new Date;
                    date.setUTCHours(0, 0, 0, 0);
                var saleData = {
                    type: 'card',
                    cardId: null,
                    dealer: {id: sale.dealer.id},
                    site: {id: sale.site.id},
                    tariff: {id: sale.tariff.id},
                    cardAmount: randomAmount(1, 1000),
                    count: randomInt(1, 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: randomAmount(1000, 2000),
                    siteAmount: randomAmount(1, 1000),
                    info: 'Комментарий'
                };
                var newSale = new Sale(saleData);
                return newSale.save({
                    dealers: new Dealers([{id: sale.dealer.id}]),
                    sites: new Sites([{id: sale.site.id}]),
                    tariffs: new Tariffs([{id: sale.tariff.id}])
                });
            });

            runSync(answer, function() {
                sale = answer.respond;
                var activeFrom = _.clone(sale.activeTo);
                var activeTo = _.clone(sale.activeTo);
                var date = new Date;
                date.setUTCHours(0, 0, 0, 0);
                var addSaleData = {
                    type: 'addcard',
                    cardId: null,
                    dealer: {id: sale.dealer.id},
                    site: {id: sale.site.id},
                    tariff: {id: sale.tariff.id},
                    parentId: sale.cardId,
                    cardAmount: randomAmount(1, 1000),
                    count: randomInt(1, 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: randomAmount(1000, 2000),
                    siteAmount: randomAmount(1, 1000),
                    info: 'Комментарий'
                };
                var addSale = new Sale(addSaleData);
                return addSale.save({
                    dealers: new Dealers([{id: sale.dealer.id}]),
                    sites: new Sites([{id: sale.site.id}]),
                    tariffs: new Tariffs([{id: sale.tariff.id}])
                });
            });

            runSync(answer, function() {
                var addSale = answer.respond;
                sale.activeTo.setDate(sale.activeTo.getDate() + 1);
                return sale.save({
                    dealers: new Dealers([{id: sale.dealer.id}]),
                    sites: new Sites([{id: sale.site.id}]),
                    tariffs: new Tariffs([{id: sale.tariff.id}])
                }).then(function() {
                    return salesLoader.loadItem(addSale.id);
                });
            });

            runs(function() {
                var addSale = answer.respond;
                expect(addSale.activeTo).toEqual(sale.activeTo);
            });
        });
    });

    describe('Метод remove', function() {

        it('удалять карточку, не имеющую расширений и доплат', function() {
            var answer = {};
            var saleData;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'card' }
                    ],
                    orders: ['-id']
                }).then(function(sales) {
                    var salesItems = sales.getItems();
                    return $q.all({
                        addSales: salesLoader.loadItems({
                            filters: [
                                { fields: ['type'], type: 'equal', value: 'addcard' },
                                { fields: ['parentId'], type: 'in', value: _.pluck(salesItems, 'cardId') }
                            ]
                        }),
                        extraSales: salesLoader.loadItems({
                            filters: [
                                { fields: ['type'], type: 'equal', value: 'extra' },
                                { fields: ['cardId'], type: 'in', value: _.pluck(salesItems, 'cardId') }
                            ]
                        })
                    }).then(function(collections) {
                        var addSaleParentIds = _.pluck(collections.addSales.getItems(), 'parentId');
                        _.remove(salesItems, function(sale) {
                            return _.contains(addSaleParentIds, sale.cardId); 
                        });
                        expect(collections.extraSales.getParams().pager.total).not.toBeGreaterThan(100);
                        var extraSaleCardIds = _.pluck(collections.extraSales.getItems(), 'cardId');
                        _.remove(salesItems, function(sale) {
                            return _.contains(extraSaleCardIds, sale.cardId); 
                        });
                        expect(salesItems.length).toBeTruthy();
                        return sales;
                    });
                });
            });

            runSync(answer, function() {
                var saleItems = answer.respond.getItems();
                var sale = saleItems[0];
                return sale.remove().then(function(respond) {
                    expect(respond).toEqual(null);
                    return salesLoader.loadItem(sale.id);
                });
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Продажа не найдена.');
            });
        });

        it('выдавать ошибку при удалении карточки, имеющей расширение', function() {
            var answer = {};

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'addcard' }
                    ],
                    orders: ['-id']
                }).then(function(addSales) {
                    var addSaleParentIds = _.pluck(addSales.getItems(), 'parentId');
                    return $q.all({
                        sales: salesLoader.loadItems({
                            filters: [
                                { fields: ['type'], type: 'equal', value: 'card' },
                                { fields: ['cardId'], type: 'in', value: addSaleParentIds }
                            ]
                        }),
                        extraSales: salesLoader.loadItems({
                            filters: [
                                { fields: ['type'], type: 'equal', value: 'extra' },
                                { fields: ['cardId'], type: 'in', value: addSaleParentIds }
                            ]
                        })
                    }).then(function(collections) {
                        var salesItems = collections.sales.getItems();
                        var extraSaleCardIds = _.pluck(collections.extraSales.getItems(), 'cardId');
                        _.remove(salesItems, function(sale) {
                            return _.contains(extraSaleCardIds, sale.cardId); 
                        });
                        var sale = salesItems[0];
                        expect(sale).toBeDefined();
                        console.log('Удаляемая карточка:', sale);
                        console.log('Расширение удаляемой карточки:', _.find(addSales.getItems(), {parentId: sale.cardId}));
                        return collections.sales;
                    });
                });
            });

            runSync(answer, function() {
                var sale = answer.respond.getItems()[0];
                return sale.remove();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Невозможно удалить продажу с расширением или доплатой.');
            });
        });

        it('выдавать ошибку при удалении карточки, имеющей доплату', function() {
            var answer = {};

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'extra' }
                    ],
                    orders: ['-id']
                }).then(function(extraSales) {
                    var extraSalesItems = extraSales.getItems();
                    return $q.all({
                        addSales: salesLoader.loadItems({
                            filters: [
                                { fields: ['type'], type: 'equal', value: 'addcard' },
                                { fields: ['parentId'], type: 'in', value: _.pluck(extraSalesItems, 'cardId') }
                            ]
                        }),
                        sales: salesLoader.loadItems({
                            filters: [
                                { fields: ['type'], type: 'equal', value: 'card' },
                                { fields: ['cardId'], type: 'in', value: _.pluck(extraSalesItems, 'cardId') }
                            ]
                        })
                    }).then(function(collections) {
                        var salesItems = collections.sales.getItems();
                        var addSaleParentIds = _.pluck(collections.addSales.getItems(), 'parentId');
                        _.remove(salesItems, function(sale) {
                            return _.contains(addSaleParentIds, sale.cardId); 
                        });
                        var sale = salesItems[0];
                        expect(sale).toBeDefined();
                        console.log('Удаляемая карточка:', sale);
                        console.log('Доплата удаляемой карточки:', _.find(extraSales.getItems(), {cardId: sale.cardId}));
                        return collections.sales;
                    });
                });
            });

            runSync(answer, function() {
                var sale = answer.respond.getItems()[0];
                return sale.remove();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Невозможно удалить продажу с расширением или доплатой.');
            });
        });

        it('выдавать ошибку при удалении расширения, имеющего расширение', function() {
            var answer = {};

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'addcard' }
                    ],
                    orders: ['-id']
                }).then(function(sales) {
                    var salesItems = sales.getItems();
                    return salesLoader.loadItems({
                        filters: [
                            { fields: ['type'], type: 'equal', value: 'addcard' },
                            { fields: ['parentId'], type: 'in', value: _.pluck(salesItems, 'cardId') }
                        ]
                    }).then(function(addSales) {
                        var addSaleParentIds = _.pluck(addSales.getItems(), 'parentId');
                        _.remove(salesItems, function(sale) {
                            return !_.contains(addSaleParentIds, sale.cardId); 
                        });
                        var sale = salesItems[0];
                        expect(sale).toBeDefined();
                        console.log('Удаляемое расширение:', sale);
                        console.log('Расширение удаляемого расширения:', _.find(addSales.getItems(), {parentId: sale.cardId}));
                        return sales;
                    });
                });
            });

            runSync(answer, function() {
                var saleItems = answer.respond.getItems();
                var sale = saleItems[0];
                return sale.remove();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Невозможно удалить продажу с расширением или доплатой.');
            });
        });

        it('удалять расширение, не имеющее расширений', function() {
            var answer = {};
            var saleData;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'addcard' }
                    ],
                    orders: ['-id']
                }).then(function(sales) {
                    var salesItems = sales.getItems();
                    return salesLoader.loadItems({
                        filters: [
                            { fields: ['type'], type: 'equal', value: 'addcard' },
                            { fields: ['parentId'], type: 'in', value: _.pluck(salesItems, 'cardId') }
                        ]
                    }).then(function(addSales) {
                        var addSaleParentIds = _.pluck(addSales.getItems(), 'parentId');
                        _.remove(salesItems, function(sale) {
                            return _.contains(addSaleParentIds, sale.cardId); 
                        });
                        expect(salesItems.length).toBeTruthy();
                        return sales;
                    });
                });
            });

            runSync(answer, function() {
                var saleItems = answer.respond.getItems();
                var sale = saleItems[0];
                return sale.remove().then(function(respond) {
                    expect(respond).toEqual(null);
                    return salesLoader.loadItem(sale.id);
                });
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Продажа не найдена.');
            });
        });

        it('удалять доплату', function() {
            var answer = {};
            var saleData;

            runSync(answer, function() {
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'extra' }
                    ],
                    orders: ['-id']
                });
            });

            runSync(answer, function() {
                var saleItems = answer.respond.getItems();
                var sale = saleItems[0];
                return sale.remove().then(function(respond) {
                    expect(respond).toEqual(null);
                    return salesLoader.loadItem(sale.id);
                });
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Продажа не найдена.');
            });
        });
    });
});

describe('tariffRate', function() {

    describe('Метод get', function() {

        it('возвращать те же значения, что и query', function() {
            var answer = {};
            var tariffRate;

            runSync(answer, function() {
                return tariffRatesLoader.loadItems();
            });

            runSync(answer, function() {
                tariffRate = answer.respond.getItems()[0];
                return tariffRatesLoader.loadItems(tariffRate.id);
            });

            runs(function() {
                var tariffRateEqual = answer.respond;
                expect(tariffRateEqual).toMatch(tariffRate);
            });
        });
    });

    describe('Метод query', function() {

        it('возвращать все значения', function() {
            var answer = {};

            runSync(answer, function() {
                return tariffRatesLoader.loadItems();
            });

            runs(function() {
                _.forEach(answer.respond.getItems(), function(tariffRate) {
                    expect(tariffRate.id).toBeInteger();
                    expect(tariffRate.tariff).toBeReference();
                    expect(tariffRate.city).toBeReferenceOrNull();
                    expect(tariffRate.activeFrom).toBeDate();
                    expect(tariffRate.rate).toBeNumber();
                    expect(tariffRate.siteRate).toBeNumber();
                    expect(tariffRate.info).toBeString();
                })
            });
        });

        it('equal - фильтровать по равенству id заданному значению', function() {
            checkFilterEqual(tariffRatesLoader, ['id']);
        });

        it('equal - фильтровать по равенству city заданному значению не null', function() {
            var answer = {};
            var tariffRate;

            runSync(answer, function() {
                return tariffRatesLoader.loadItems();
            });

            runSync(answer, function() {
                tariffRate = _.find(answer.respond.getItems(), function(tariffRate) {
                    return tariffRate.city !== null;
                });
                return tariffRatesLoader.loadItems({
                    filters: [
                        { fields: ['city'], type: 'equal', value: tariffRate.city.id }
                    ]
                });
            });

            runs(function() {
                var tariffRates = answer.respond.getItems();
                expect(tariffRates.length).toBeTruthy();
                _.forEach(tariffRates, function(tariffRateEqual) {
                    expect(tariffRateEqual.city).toEqual(tariffRate.city);
                });
            });
        });

        it('equal - фильтровать по city равно null', function() {
            var answer = {};

            runSync(answer, function() {
                return tariffRatesLoader.loadItems({
                    filters: [
                        { fields: ['city'], type: 'equal', value: null }
                    ]
                });
            });

            runs(function() {
                var tariffRates = answer.respond.getItems();
                expect(tariffRates.length).toBeTruthy();
                _.forEach(tariffRates, function(tariffRateEqual) {
                    expect(tariffRateEqual.city).toEqual(null);
                });
            });
        });

        it('equal - фильтровать по tariff равно заданному значению', function() {
            checkFilterEqual(tariffRatesLoader, ['tariff']);
        });

        it('in - фильтровать по city равно null', function() {
            var answer = {};

            runSync(answer, function() {
                return tariffRatesLoader.loadItems({
                    filters: [
                        { fields: ['city'], type: 'in', value: [null] }
                    ]
                });
            });

            runs(function() {
                var tariffRates = answer.respond.getItems();
                expect(tariffRates.length).toBeTruthy();
                _.forEach(tariffRates, function(tariffRateEqual) {
                    expect(tariffRateEqual.city).toEqual(null);
                });
            });
        });

        it('сортировать по id по возрастанию', function() {
            checkSorting(tariffRatesLoader, ['+id']);
        });

        it('сортировать по id по убыванию', function() {
            checkSorting(tariffRatesLoader, ['-id']);
        });

        it('сортировать по activeFrom по возрастанию', function() {
            checkSorting(tariffRatesLoader, ['+activeFrom']);
        });

        it('сортировать по activeFrom по убыванию', function() {
            checkSorting(tariffRatesLoader, ['-activeFrom']);
        });

        it('fields - выдавать только id', function() {
            checkFieldingId(tariffRatesLoader);
        });

        it('fields - выдавать все указанные поля', function() {
            checkFieldingAll(tariffRatesLoader);
        });
    });
});

describe('tariff', function() {

    describe('Метод get', function() {

        it('возвращать те же значения, что и query', function() {
            var answer = {};
            var tariff;

            runSync(answer, function() {
                return tariffsLoader.loadItems();
            });

            runSync(answer, function() {
                tariff = answer.respond.getItems()[0];
                return tariffLoader.loadItems(tariff.id);
            });

            runs(function() {
                var tariffEqual = answer.respond;
                expect(tariffEqual).toMatch(tariff);
            });
        });
    });

    describe('Метод query', function() {

        it('возвращать все значения', function() {
            var answer = {};

            runSync(answer, function() {
                return tariffsLoader.loadItems();
            });

            runs(function() {
                _.forEach(answer.respond.getItems(), function(tariff) {
                    expect(tariff.id).toBeInteger();
                    expect(tariff.site).toBeReference();
                    expect(tariff.type).toBeMemberOf(['daily', 'periodical']);
                    if (tariff.type === 'daily') {
                        expect(tariff.period).toBe(null);
                        expect(tariff.periodUnit).toBe(null);
                    } else {
                        expect(tariff.period).toBeInteger();
                        expect(tariff.periodUnit.id).toBeMemberOf(['day', 'month']);
                    }
                    expect(tariff.count).toBeIntegerOrNull();
                    expect(tariff.isActive).toBeMemberOf([true, false]);
                    expect(tariff.delay).toBeInteger();
                    expect(tariff.groupName).toBeStringOrNull();
                })
            });
        });

        it('equal - фильтровать по равенству id заданному значению', function() {
            checkFilterEqual(tariffsLoader, ['id']);
        });

        it('equal - фильтровать по равенству site заданному значению', function() {
            checkFilterEqual(tariffsLoader, ['site']);
        });

        it('equal - фильтровать по равенству type заданному значению', function() {
            checkFilterEqual(tariffsLoader, ['type']);
        });

        it('equal - фильтровать по равенству isActive значению true', function() {
            var answer = {};

            runSync(answer, function() {
                return tariffsLoader.loadItems({
                    filters: [
                        { fields: ['isActive'], type: 'equal', value: true }
                    ]
                });
            });

            runs(function() {
                var tariffs = answer.respond.getItems();
                expect(tariffs.length).toBeTruthy();
                _.forEach(tariffs, function(tariffEqual) {
                    expect(tariffEqual.isActive).toEqual(true);
                });
            });
        });

        it('equal - фильтровать по равенству isActive значению false', function() {
            var answer = {};

            runSync(answer, function() {
                return tariffsLoader.loadItems({
                    filters: [
                        { fields: ['isActive'], type: 'equal', value: false }
                    ]
                });
            });

            runs(function() {
                var tariffs = answer.respond.getItems();
                expect(tariffs.length).toBeTruthy();
                _.forEach(tariffs, function(tariffEqual) {
                    expect(tariffEqual.isActive).toEqual(false);
                });
            });
        });

        it('сортировать по id по возрастанию', function() {
            checkSorting(tariffsLoader, ['+id']);
        });

        it('сортировать по id по убыванию', function() {
            checkSorting(tariffsLoader, ['-id']);
        });

        it('сортировать по site по возрастанию', function() {
            checkSorting(tariffsLoader, ['+site']);
        });

        it('сортировать по site по убыванию', function() {
            checkSorting(tariffsLoader, ['-site']);
        });

        it('fields - выдавать только id', function() {
            checkFieldingId(tariffsLoader);
        });

        it('fields - выдавать все указанные поля', function() {
            checkFieldingAll(tariffsLoader);
        });
    });
});

describe('dealersitelogin', function() {

    it('equal - по равенству dealer и site заданным значениям', function() {
        checkFilterEqual(dealerSiteLoginsLoader, ['dealer', 'site']);
    });

    it('fields - выдавать только id', function() {
        checkFieldingId(dealerSiteLoginsLoader);
    });

    it('fields - выдавать все указанные поля', function() {
        checkFieldingAll(dealerSiteLoginsLoader);
    });

    it('post - сохранять новый dealersitelogin', function() {
        var answer = {};
        var directories = {};
        var siteId;
        var freeDealerId;

        runSync(answer, function() {
            return $q.all({
                sites: sitesLoader.loadItems(),
                dealers: dealersLoader.loadItems({
                    orders: ['-id'],
                    fields: ['companyName']
                })
            });
        });

        runSync(answer, function() {
            _.assign(directories, answer.respond);
            siteId = directories.sites.getItems()[1].id;
            var dealerIds = _.pluck(directories.dealers.getItems(), 'id');
            return dealerSiteLoginsLoader.loadItems({
                filters: [
                    { fields: ['site'], type: 'equal', value: siteId },
                    { fields: ['dealer'], type: 'in', value: dealerIds }
                ]
            }, directories).then(function(dealerSiteLogins) {
                var dealerSiteLoginsDealerIds = _.pluck(_.pluck(dealerSiteLogins.getItems(), 'dealer'), 'id');
                return _.difference(dealerIds, dealerSiteLoginsDealerIds);
            });
        });

        runSync(answer, function() {
            freeDealerId = answer.respond[0];
            var newDealerSiteLogin = new DealerSiteLogin({
                dealer: {id: freeDealerId},
                site: {id: siteId},
                type: 'site',
                login: 'a11111',
                password: 'p22222'
            });
            return newDealerSiteLogin.save(directories);
        });

        runSync(answer, function() {
            var newDealerSiteLogin = answer.respond;
            return dealerSiteLoginsLoader.loadItem(newDealerSiteLogin.id);
        });

        runs(function() {
            var newDealerSiteLogin = answer.respond;
            expect(newDealerSiteLogin.dealer.id).toEqual(freeDealerId);
            expect(newDealerSiteLogin.site.id).toEqual(siteId);
            expect(newDealerSiteLogin.type.id).toEqual('site');
            expect(newDealerSiteLogin.login).toEqual('a11111');
            expect(newDealerSiteLogin.password).toEqual('p22222');
        });
    });

    it('post - выдавать ошибку, если такая комбинация dealer, site, type уже есть', function() {
        var answer = {};

        runSync(answer, function() {
            return dealerSiteLoginsLoader.loadItems({
                orders: ['-id']
            });
        });

        runSync(answer, function() {
            var dealerSiteLogin = answer.respond.getItems()[0];
            var dealerSiteLoginCopy = new DealerSiteLogin({
                dealer: {id: dealerSiteLogin.dealer.id},
                site: {id: dealerSiteLogin.site.id},
                type: dealerSiteLogin.type.id
            });
            return dealerSiteLoginCopy.save();
        });

        runs(function() {
            var errorResponse = answer.respond.response.data;
            expect(errorResponse.message).toEqual('Validation Failed');
            expect(errorResponse.errors.errors).toEqual(['Логин салона по указанному сайту уже существует.']);
        });
    });

    it('put - сохранять изменения атрибутов dealersitelogin', function() {
        var answer = {};
        var dealerSiteLogin;

        runSync(answer, function() {
            return dealerSiteLoginsLoader.loadItems({
                orders: ['-id']
            });
        });

        runSync(answer, function() {
            dealerSiteLogin = answer.respond.getItems()[0];
            dealerSiteLogin.login = String(Math.floor(Math.random() * 1000000));
            dealerSiteLogin.password = String(Math.floor(Math.random() * 1000000));
            return dealerSiteLogin.save({
                dealers: new Dealers([{id: dealerSiteLogin.dealer.id}]),
                sites: new Sites([{id: dealerSiteLogin.site.id}])
            });
        });

        runSync(answer, function() {
            var savedDealerSiteLogin = answer.respond;
            return dealerSiteLoginsLoader.loadItem(savedDealerSiteLogin.id);
        });

        runs(function() {
            var savedDealerSiteLogin = answer.respond;
            expect(savedDealerSiteLogin.login).toEqual(dealerSiteLogin.login);
            expect(savedDealerSiteLogin.password).toEqual(dealerSiteLogin.password);
        });
    });

    it('put - выдавать ошибку если нет значения в поле dealer', function() {
        var answer = {};
        var dealerSiteLogin;

        runSync(answer, function() {
            return dealerSiteLoginsLoader.loadItems({
                orders: ['-id']
            });
        });

        runSync(answer, function() {
            dealerSiteLogin = answer.respond.getItems()[0];
            dealerSiteLogin.dealer = null;
            return dealerSiteLogin.save();
        });

        runs(function() {
            var errorResponse = answer.respond.response.data;
            expect(errorResponse.message).toEqual('Validation Failed');
            expect(errorResponse.errors.children.dealer.children.id.errors).toContain('Значение не должно быть пустым.');
        });
    });

    it('put - выдавать ошибку если нет значения в поле site', function() {
        var answer = {};
        var dealerSiteLogin;

        runSync(answer, function() {
            return dealerSiteLoginsLoader.loadItems({
                orders: ['-id']
            });
        });

        runSync(answer, function() {
            dealerSiteLogin = answer.respond.getItems()[0];
            dealerSiteLogin.site = null;
            return dealerSiteLogin.save();
        });

        runs(function() {
            var errorResponse = answer.respond.response.data;
            expect(errorResponse.message).toEqual('Validation Failed');
            expect(errorResponse.errors.children.site.children.id.errors).toEqual(['Значение не должно быть пустым.']);
        });
    });

    it('put - выдавать ошибку если нет значения в поле type', function() {
        var answer = {};
        var dealerSiteLogin;

        runSync(answer, function() {
            return dealerSiteLoginsLoader.loadItems({
                orders: ['-id']
            });
        });

        runSync(answer, function() {
            dealerSiteLogin = answer.respond.getItems()[0];
            dealerSiteLogin.type = null;
            return dealerSiteLogin.save();
        });

        runs(function() {
            var errorResponse = answer.respond.response.data;
            expect(errorResponse.message).toEqual('Validation Failed');
            expect(errorResponse.errors.children.type.errors).toEqual(['Значение не должно быть пустым.']);
        });
    });

    it('put - выдавать ошибку если нет значения в поле login', function() {
        var answer = {};
        var dealerSiteLogin;

        runSync(answer, function() {
            return dealerSiteLoginsLoader.loadItems({
                orders: ['-id']
            });
        });

        runSync(answer, function() {
            dealerSiteLogin = answer.respond.getItems()[0];
            dealerSiteLogin.login = null;
            dealerSiteLogin.password = String(Math.floor(Math.random() * 1000000));
            return dealerSiteLogin.save();
        });

        runs(function() {
            var errorResponse = answer.respond.response.data;
            expect(errorResponse.message).toEqual('Validation Failed');
            expect(errorResponse.errors.children.login.errors).toEqual(['Значение не должно быть пустым.']);
        });
    });

    it('put - выдавать ошибку при длине значения login больше 100', function() {
        var answer = {};
        var dealerSiteLogin;

        runSync(answer, function() {
            return dealerSiteLoginsLoader.loadItems({
                orders: ['-id']
            });
        });

        runSync(answer, function() {
            dealerSiteLogin = answer.respond.getItems()[0];
            dealerSiteLogin.login = '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901';
            dealerSiteLogin.password = String(Math.floor(Math.random() * 1000000));
            return dealerSiteLogin.save();
        });

        runs(function() {
            var errorResponse = answer.respond.response.data;
            expect(errorResponse.message).toEqual('Validation Failed');
            expect(errorResponse.errors.children.login.errors).toEqual(['Значение слишком длинное. Должно быть равно 100 символам или меньше.']);
        });
    });

    it('put - выдавать ошибку если нет значения в поле password', function() {
        var answer = {};
        var dealerSiteLogin;

        runSync(answer, function() {
            return dealerSiteLoginsLoader.loadItems({
                orders: ['-id']
            });
        });

        runSync(answer, function() {
            dealerSiteLogin = answer.respond.getItems()[0];
            dealerSiteLogin.login = String(Math.floor(Math.random() * 1000000));
            dealerSiteLogin.password = null;
            return dealerSiteLogin.save();
        });

        runs(function() {
            var errorResponse = answer.respond.response.data;
            expect(errorResponse.message).toEqual('Validation Failed');
            expect(errorResponse.errors.children.password.errors).toEqual(['Значение не должно быть пустым.']);
        });
    });

    it('put - выдавать ошибку при длине значения password больше 100', function() {
        var answer = {};
        var dealerSiteLogin;

        runSync(answer, function() {
            return dealerSiteLoginsLoader.loadItems({
                orders: ['-id']
            });
        });

        runSync(answer, function() {
            dealerSiteLogin = answer.respond.getItems()[0];
            dealerSiteLogin.login = String(Math.floor(Math.random() * 1000000));
            dealerSiteLogin.password = '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901';
            return dealerSiteLogin.save();
        });

        runs(function() {
            var errorResponse = answer.respond.response.data;
            expect(errorResponse.message).toEqual('Validation Failed');
            expect(errorResponse.errors.children.password.errors).toEqual(['Значение слишком длинное. Должно быть равно 100 символам или меньше.']);
        });
    });

    it('remove - удалять dealersitelogin', function() {
        var answer = {};
        var dealerSiteLogin;

        runSync(answer, function() {
            return dealerSiteLoginsLoader.loadItems({
                orders: ['-id']
            });
        });

        runSync(answer, function() {
            dealerSiteLogin = answer.respond.getItems()[0];
            return dealerSiteLogin.remove();
        });

        runs(function() {
            expect(answer.respond).toEqual(null);
        });

        runSync(answer, function() {
            var savedDealerSiteLogin = answer.respond;
            return dealerSiteLoginsLoader.loadItem(dealerSiteLogin.id);
        });

        runs(function() {
            var errorResponse = answer.respond.response.data;
            expect(errorResponse.message).toEqual('Логин салона на сайте не найден.');
        });
    });
});

describe('dealersite', function() {

    describe('Методы query должны фильтровать', function() {

        it('equal - по равенству dealer заданному значению', function() {
            checkFilterEqual(dealerSitesLoader, ['dealer']);
        });

        it('in - по равенству dealer одному из заданных значений', function() {
            var answer = {};
            var dealersId;

            runSync(answer, function() {
                return dealerSitesLoader.loadItems();
            });

            runSync(answer, function() {
                var dealers = _.uniq(_.pluck(answer.respond.getItems(), 'dealer')).slice(0, 3);
                dealersId = _.pluck(dealers, 'id');
                return dealerSitesLoader.loadItems({
                    filters: [
                        { fields: ['dealer'], type: 'in', value: dealersId }
                    ]
                });
            });

            runs(function() {
                var dealerSites = answer.respond.getItems();
                expect(dealerSites.length).toBeTruthy();
                expect(_.every(dealerSites, function(value) {
                    var dealerId = value.dealer.id;
                    return (dealersId.indexOf(dealerId) !== -1);
                })).toBeTruthy();
            });
        });

        it('equal - по равенству site заданному значению', function() {
            checkFilterEqual(dealerSitesLoader, ['site']);
        });

        it('in - по равенству site одному из заданных значений', function() {
            var answer = {};
            var sitesId;

            runSync(answer, function() {
                return dealerSitesLoader.loadItems();
            });

            runSync(answer, function() {
                var sites = _.uniq(_.pluck(answer.respond.getItems(), 'site')).slice(0, 3);
                sitesId = _.pluck(sites, 'id');
                return dealerSitesLoader.loadItems({
                    filters: [
                        { fields: ['site'], type: 'in', value: sitesId }
                    ]
                });
            });

            runs(function() {
                var dealerSites = answer.respond.getItems();
                expect(dealerSites.length).toBeTruthy();
                expect(_.every(dealerSites, function(value) {
                    var siteId = value.site.id;
                    return (sitesId.indexOf(siteId) !== -1);
                })).toBeTruthy();
            });
        });

        it('equal - по равенству isActive = true', function() {
            var answer = {};

            runSync(answer, function() {
                return dealerSitesLoader.loadItems({
                    filters: [
                        { type: 'equal', fields: ['isActive'], value: true }
                    ]
                });
            });

            runs(function() {
                var dealerSites = answer.respond.getItems();
                expect(dealerSites.length).toBeTruthy();
                expect(_.every(dealerSites, function(value) {
                    return (value.isActive.id === true);
                })).toBeTruthy();
            });
        });

        it('equal - по равенству isActive = false', function() {
            var answer = {};

            runSync(answer, function() {
                return dealerSitesLoader.loadItems({
                    filters: [
                        { type: 'equal', fields: ['isActive'], value: false }
                    ]
                });
            });

            runs(function() {
                var dealerSites = answer.respond.getItems();
                expect(dealerSites.length).toBeTruthy();
                expect(_.every(dealerSites, function(value) {
                    return (value.isActive.id === false);
                })).toBeTruthy();
            });
        });

        it('fields - выдавать только id', function() {
            checkFieldingId(dealerSitesLoader);
        });

        it('fields - выдавать все указанные поля', function() {
            checkFieldingAll(dealerSitesLoader);
        });
    });

    describe('Методы query должны сортировать', function() {

        it('по возрастанию id', function() {
            checkSorting(dealerSitesLoader, ['+id']);
        });

        it('по убыванию id', function() {
            checkSorting(dealerSitesLoader, ['-id']);
        });

        it('по возрастанию dealer', function() {
            checkSorting(dealerSitesLoader, ['+dealer']);
        });

        it('по убыванию dealer', function() {
            checkSorting(dealerSitesLoader, ['-dealer']);
        });

        it('по возрастанию site', function() {
            checkSorting(dealerSitesLoader, ['+site']);
        });

        it('по убыванию site', function() {
            checkSorting(dealerSitesLoader, ['-site']);
        });

        it('по возрастанию externalId', function() {
            checkSorting(dealerSitesLoader, ['+externalId']);
        });

        it('по убыванию externalId', function() {
            checkSorting(dealerSitesLoader, ['-externalId']);
        });

        it('по возрастанию publicUrl', function() {
            checkSorting(dealerSitesLoader, ['+publicUrl']);
        });

        it('по убыванию publicUrl', function() {
            checkSorting(dealerSitesLoader, ['-publicUrl']);
        });

        it('по возрастанию isActive', function() {
            checkSorting(dealerSitesLoader, ['+isActive']);
        });

        it('по убыванию isActive', function() {
            checkSorting(dealerSitesLoader, ['-isActive']);
        });
    });

    describe('Методы CRUD должны', function() {

        it('post - сохранять новый dealersite', function() {
            var answer = {};
            var directories = {};

            runSync(answer, function() {
                return $q.all({
                    dealers: dealersLoader.loadItems({
                        orders: ['-id'],
                        fields: ['companyName']
                    }),
                    sites: sitesLoader.loadItems()
                });
            });

            runSync(answer, function() {
                _.assign(directories, answer.respond);
                var dealerIds = _.pluck(directories.dealers.getItems(), 'id');
                return dealerSitesLoader.loadItems({
                    filters: [
                        { fields: ['site'], type: 'equal', value: directories.sites.getItems()[1].id },
                        { fields: ['dealer'], type: 'in', value: dealerIds }
                    ]
                }).then(function(dealerSites) {
                    var dealerSiteDealerIds = _.pluck(_.pluck(dealerSites.getItems(), 'dealer'), 'id');
                    return _.difference(dealerIds, dealerSiteDealerIds);
                });
            });

            runSync(answer, function() {
                freeDealerIds = answer.respond;
                var newDealerSite = new DealerSite({
                    dealer: {id: freeDealerIds[0]},
                    site: {id: directories.sites.getItems()[1].id},
                    externalId: '1109238',
                    publicUrl: 'http://www.auto.mail.ru/1109238.html',
                    isActive: true
                }, directories);
                return {
                    dealerSite: newDealerSite,
                    savedDealerSite: newDealerSite.save(directories)
                }
            });

            runSync(answer, function() {
                var dealerSite = answer.respond.dealerSite;
                var savedDealerSite = answer.respond.savedDealerSite;
                _.forEach(dealerSite, function(value, key) {
                    expect(value).toEqual(savedDealerSite[key]);
                });
                return {
                    savedDealerSite: savedDealerSite,
                    loadedDealerSite: dealerSitesLoader.loadItem(savedDealerSite.id, directories)
                }
            });

            runs(function() {
                var savedDealerSite = answer.respond.savedDealerSite;
                var loadedDealerSite = answer.respond.loadedDealerSite;
                _.forEach(savedDealerSite, function(value, key) {
                    expect(value).toEqual(loadedDealerSite[key]);
                });
            });
        });

        it('post - выдавать ошибку, если такая комбинация dealer, site уже есть', function() {
            var answer = {};

            runSync(answer, function() {
                return dealerSitesLoader.loadItems({
                    orders: ['-id']
                });
            });

            runSync(answer, function() {
                var dealerSite = answer.respond.getItems()[0];
                var dealerSiteCopy = new DealerSite({
                    dealer: {id: dealerSite.dealer.id},
                    site: {id: dealerSite.site.id}
                });
                return dealerSiteCopy.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.errors).toContain('Регистрация салона по указанному сайту уже существует.');
            });
        });

        it('put - сохранять изменения атрибутов dealersite', function() {
            var answer = {};
            var dealerSite;
            var directories;

            runSync(answer, function() {
                return dealerSitesLoader.loadItems({
                    orders: ['-id']
                });
            });

            runSync(answer, function() {
                var dealerSite = answer.respond.getItems()[0];
                directories = {
                    dealers: new Dealers([{id: dealerSite.dealer.id}]),
                    sites: new Sites([{id: dealerSite.site.id}])
                };
                dealerSite.externalId = String(Math.floor(Math.random() * 1000000));
                dealerSite.publicUrl = 'http://www.jasmine.ru/' + String(Math.floor(Math.random() * 1000000));
                return {
                    dealerSite: dealerSite,
                    savedDealerSite: dealerSite.save(directories)
                };
            });

            runSync(answer, function() {
                var dealerSite = answer.respond.dealerSite;
                var savedDealerSite = answer.respond.savedDealerSite;
                _.forEach(dealerSite, function(value, key) {
                    expect(value).toEqual(savedDealerSite[key]);
                });
                return {
                    savedDealerSite: savedDealerSite,
                    loadedDealerSite: dealerSitesLoader.loadItem(savedDealerSite.id, directories)
                }
            });

            runs(function() {
                var savedDealerSite = answer.respond.savedDealerSite;
                var loadedDealerSite = answer.respond.loadedDealerSite;
                _.forEach(savedDealerSite, function(value, key) {
                    expect(value).toEqual(loadedDealerSite[key]);
                });
            });
        });

        it('put - выдавать ошибку при неправильном формате publicUrl', function() {
            var answer = {};
            var dealerSite;

            runSync(answer, function() {
                return dealerSitesLoader.loadItems();
            });

            runSync(answer, function() {
                dealerSite = answer.respond.getItems()[0];
                dealerSite.externalId = String(Math.floor(Math.random() * 1000000));
                dealerSite.publicUrl = '22222';
                return dealerSite.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.publicUrl.errors).toContain('Не верное значение ссылки: \'' + dealerSite.publicUrl + '\'.');
            });
        });

        it('put - выдавать ошибку при длине значения externalId больше 10', function() {
            var answer = {};

            runSync(answer, function() {
                return dealerSitesLoader.loadItems();
            });

            runSync(answer, function() {
                var dealerSite = answer.respond.getItems()[0];
                dealerSite.externalId = '01234567890';
                return dealerSite.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.externalId.errors).toEqual(['Значение слишком длинное. Должно быть равно 10 символам или меньше.']);
            });
        });

        it('put - выдавать ошибку при длине значения publicUrl больше 255', function() {
            var answer = {};

            runSync(answer, function() {
                return dealerSitesLoader.loadItems();
            });

            runSync(answer, function() {
                var dealerSite = answer.respond.getItems()[0];
                dealerSite.publicUrl = 'http://www.www.ru/34567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1';
                return dealerSite.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.publicUrl.errors).toEqual(['Значение слишком длинное. Должно быть равно 255 символам или меньше.']);
            });
        });

        it('put - сохранять изменение атрибута dealersite.isActive с true на false', function() {
            var answer = {};

            runSync(answer, function() {
                return dealerSitesLoader.loadItems({
                    filters: [
                        { fields: ['isActive'], type: 'equal', value: true }
                    ],
                    orders: ['-id']
                });
            });

            runSync(answer, function() {
                var dealerSite = answer.respond.getItems()[0];
                expect(dealerSite).toBeTruthy();
                directories = {
                    dealers: new Dealers([{id: dealerSite.dealer.id}]),
                    sites: new Sites([{id: dealerSite.site.id}])
                };
                dealerSite.isActive = false;
                return {
                    dealerSite: dealerSite,
                    savedDealerSite: dealerSite.save(directories)
                };
            });

            runSync(answer, function() {
                var dealerSite = answer.respond.dealerSite;
                var savedDealerSite = answer.respond.savedDealerSite;
                _.forEach(dealerSite, function(value, key) {
                    expect(value).toEqual(savedDealerSite[key]);
                });
                return {
                    savedDealerSite: savedDealerSite,
                    loadedDealerSite: dealerSitesLoader.loadItem(savedDealerSite.id, directories)
                }
            });

            runs(function() {
                var savedDealerSite = answer.respond.savedDealerSite;
                var loadedDealerSite = answer.respond.loadedDealerSite;
                _.forEach(savedDealerSite, function(value, key) {
                    expect(value).toEqual(loadedDealerSite[key]);
                });
            });
        });

        it('put - изменять dealer, если нет записи с такой комбинацией dealer, site', function() {
            var answer = {};
            var directories = {};

            runSync(answer, function() {
                return $q.all({
                    dealers: dealersLoader.loadItems({
                        orders: ['-id'],
                        fields: ['companyName']
                    }),
                    sites: sitesLoader.loadItems()
                });
            });

            runSync(answer, function() {
                _.assign(directories, answer.respond);
                var dealerIds = _.pluck(directories.dealers.getItems(), 'id');
                return dealerSitesLoader.loadItems({
                    filters: [
                        { fields: ['site'], type: 'equal', value: directories.sites.getItems()[1].id },
                        { fields: ['dealer'], type: 'in', value: dealerIds }
                    ]
                }).then(function(dealerSites) {
                    var dealerSiteDealerIds = _.pluck(_.pluck(dealerSites.getItems(), 'dealer'), 'id');
                    return {
                        dealerSite: dealerSites.getItems()[0],
                        freeDealerIds: _.difference(dealerIds, dealerSiteDealerIds)
                    }
                });
            });

            runSync(answer, function() {
                var dealerSite = answer.respond.dealerSite;
                var freeDealer = directories.dealers.get(answer.respond.freeDealerIds[0]);
                dealerSite.dealer = freeDealer;
                return {
                    dealerSite: dealerSite,
                    savedDealerSite: dealerSite.save(directories)
                };
            });

            runSync(answer, function() {
                var dealerSite = answer.respond.dealerSite;
                var savedDealerSite = answer.respond.savedDealerSite;
                _.forEach(dealerSite, function(value, key) {
                    expect(value).toEqual(savedDealerSite[key]);
                });
                return {
                    savedDealerSite: savedDealerSite,
                    loadedDealerSite: dealerSitesLoader.loadItem(savedDealerSite.id, directories)
                }
            });

            runs(function() {
                var savedDealerSite = answer.respond.savedDealerSite;
                var loadedDealerSite = answer.respond.loadedDealerSite;
                _.forEach(savedDealerSite, function(value, key) {
                    expect(value).toEqual(loadedDealerSite[key]);
                });
            });
        });

        it('put - выдавать ошибку, если такая комбинация dealer, site уже есть', function() {
            var answer = {};

            runSync(answer, function() {
                return dealerSitesLoader.loadItems();
            });

            runSync(answer, function() {
                var dealerSite = answer.respond.getItems()[0];
                var dealerSiteCopy = answer.respond.getItems()[1];
                dealerSiteCopy.dealer = dealerSite.dealer;
                dealerSiteCopy.site = dealerSite.site;
                return dealerSiteCopy.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.errors).toContain('Регистрация салона по указанному сайту уже существует.');
            });
        });

        it('remove - удалять dealersite', function() {
            var answer = {};

            runSync(answer, function() {
                return dealerSitesLoader.loadItems();
            });

            runSync(answer, function() {
                var dealerSite = answer.respond.getItems()[0];
                return dealerSite.remove().then(function(respond) {
                    expect(respond).toEqual(null);
                    return dealerSite;
                });
            });

            runSync(answer, function() {
                var dealerSite = answer.respond;
                return dealerSitesLoader.loadItem(dealerSite.id);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Регистрация на сайте не найдена.');
            });
        });
    });
});

describe('user, dealer', function() {
    describe('Методы post должны проверять в user', function() {

        it('обязательность email', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    password: '1',
                    group: {id: 1}
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.email.errors).toContain('Значение не должно быть пустым.');
            });
        });

        it('соответствие email формату', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@',
                    password: '1',
                    group: {id: 1}
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.email.errors).toContain('Значение не верно.');
            });
        });

        it('уникальность email', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runSync(answer, function() {
                var users = answer.respond;
                var user = new User({
                    password: '1',
                    group: {id: 1},
                    email: users.getItems()[0].email
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.email.errors).toContain('Значение уже используется.');
            });
        });

        it('обязательность password', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    group: {id: 1}
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.password.errors).toContain('Значение не должно быть пустым.');
            });
        });

        it('размер значения password <= 128', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0',
                    group: {id: 1}
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.password.errors).toContain('Превышена допустимая длина в 128 символов.');
            });
        });

        it('соответствие status перечню', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 1}
                });
                user.status = new UserStatus({id: 'unknown'});
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.status.errors).toContain('Выбранное Вами значение недопустимо.');
            });
        });

        it('по-умолчанию status === inactive', function() {
            var answer = {};
            var directories = {};

            runSync(answer, function() {
                return groupsLoader.loadItems();
            });

            runSync(answer, function() {
                directories.groups = answer.respond;
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 1}
                }, directories);
                return user.save(directories);
            });

            runs(function() {
                var savedUser = answer.respond;
                expect(savedUser.status.id).toEqual('inactive');
            });
        });
    });

    describe('Методы post должны проверять в user.dealer', function() {

        it('соответствие значения manager справочнику', function() {
            var answer = {};
            var user;

            runSync(answer, function() {
                user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        city: { id: 1 },
                        manager: { id: 9999 },
                        billingCompany: {id: 1},
                        companyName: '1',
                        address: '1',
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.errors).toContain('Менеджер ' + user.dealer.manager.id + ' не найден.');
            });
        });

        it('соответствие значения city справочнику', function() {
            var answer = {};
            var user;

            runSync(answer, function() {
                user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        city: {id: 9999}
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.errors).toContain('Город ' + user.dealer.city.id + ' не найден.');
            });
        });

        it('соответствие значения metro справочнику', function() {
            var answer = {};
            var user;

            runSync(answer, function() {
                user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        metro: {id: 9999}
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.errors).toContain('Станция метро ' + user.dealer.metro.id + ' не найдена.');
            });
        });

        it('соответствие значения metro значению city', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        city: {id: 1},
                        metro: {id: 174}
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.metro.children.id.errors).toContain('Станция метро должна находиться в выбранном городе.');
            });
        });

        it('соответствие значения market справочнику', function() {
            var answer = {};
            var user;

            runSync(answer, function() {
                user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        market: {id: 9999}
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.errors).toContain('Рынок ' + user.dealer.market.id + ' не найден.');
            });
        });

        it('соответствие значения market значению city', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        city: {id: 1},
                        market: {id: 8}
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.market.children.id.errors).toContain('Рынок должен находиться в выбранном городе.');
            });
        });

        it('обязательность значения companyName', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        city: {id: 1}
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.companyName.errors).toContain('Значение не должно быть пустым.');
            });
        });

        it('размер значения companyName <= 100', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        city: {id: 1},
                        companyName: '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.companyName.errors).toContain('Значение слишком длинное. Должно быть равно 100 символам или меньше.');
            });
        });

        it('обязательность значения address', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1}
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.address.errors).toContain('Значение не должно быть пустым.');
            });
        });

        it('размер значения address <= 255', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        city: {id: 1},
                        address: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.address.errors).toEqual(['Значение слишком длинное. Должно быть равно 255 символам или меньше.']);
            });
        });

        it('соответствие значения fax формату', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 4},
                        city: {id: 1},
                        fax: '+7-812-232-4123'
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.fax.errors).toContain('Неверный формат номера телефона.');
            });
        });

        it('соответствие значения email формату', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 4},
                        city: {id: 1},
                        email: 'jasmine@'
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.email.errors).toContain('Значение адреса электронной почты недопустимо.');
            });
        });

        it('соответствие значения url формату', function() {
            var answer = {};
            var user;

            runSync(answer, function() {
                user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 4},
                        city: {id: 1},
                        phone: '+7(812)232-4123',
                        phoneFrom: 10,
                        phoneTo: 20,
                        url: 'www'
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.url.errors).toContain('Не верное значение ссылки: \'' + user.dealer.url + '\'.');
            });
        });

        it('соответствие значения phone формату', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 4},
                        city: {id: 1},
                        phone: '+7-812-232-4123',
                        phoneFrom: 10,
                        phoneTo: 20
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone.errors).toContain('Неверный формат номера телефона.');
            });
        });

        it('обязательность значения phoneFrom при заполненном phone', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        phone: '+7(812)123-34-43'
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone.errors).toContain('Неверно указано время для звонка на телефон.');
            });
        });

        it('соответствие значения phoneFrom перечню допустимых значений', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        phone: '+7(812)-123-3443'
                    }
                });
                user.dealer.phoneFrom = new DealerPhoneHour({id: 99});
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phoneFrom.errors).toContain('Значение должно быть 24 или меньше.');
            });
        });

        it('обязательность значения phoneTo при заполненном phone', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        phone: '+7(812)123-34-43'
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone.errors).toContain('Неверно указано время для звонка на телефон.');
            });
        });

        it('соответствие значения phoneTo перечню допустимых значений', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        phone: '+7(812)123-34-43'
                    }
                });
                user.dealer.phoneTo = new DealerPhoneHour({id: 99});
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phoneTo.errors).toContain('Значение должно быть 24 или меньше.');
            });
        });

        it('значение phoneFrom строго меньше phoneTo', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        phone: '+7(812)123-34-43',
                        phoneFrom: 23,
                        phoneTo: 23
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone.errors).toContain('Неверно указано время для звонка на телефон.');
            });
        });

        it('соответствие значения phone2 формату', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 4},
                        city: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7-812-232-4123',
                        phone2From: 10,
                        phone2To: 20
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone2.errors).toContain('Неверный формат номера телефона.');
            });
        });

        it('обязательность значения phone2From при заполненном phone2', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)123-34-43'
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone2.errors).toContain('Неверно указано время для звонка на телефон.');
            });
        });

        it('соответствие значения phone2From перечню допустимых значений', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)-123-3443'
                    }
                });
                user.dealer.phone2From = new DealerPhoneHour({id: 99});
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone2From.errors).toContain('Значение должно быть 24 или меньше.');
            });
        });

        it('обязательность значения phone2To при заполненном phone2', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)123-34-43'
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone2.errors).toContain('Неверно указано время для звонка на телефон.');
            });
        });

        it('соответствие значения phone2To перечню допустимых значений', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)123-34-43'
                    }
                });
                user.dealer.phone2To = new DealerPhoneHour({id: 99});
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone2To.errors).toContain('Значение должно быть 24 или меньше.');
            });
        });

        it('значение phone2From строго меньше phone2To', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)123-34-43',
                        phone2From: 23,
                        phone2To: 23
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone2.errors).toContain('Неверно указано время для звонка на телефон.');
            });
        });

        it('соответствие значения phone3 формату', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 4},
                        city: {id: 1},
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
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone3.errors).toContain('Неверный формат номера телефона.');
            });
        });

        it('обязательность значения phone3From при заполненном phone3', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)232-4123',
                        phone2From: 11,
                        phone2To: 21,
                        phone3: '+7(812)123-34-43'
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone3.errors).toContain('Неверно указано время для звонка на телефон.');
            });
        });

        it('соответствие значения phone3From перечню допустимых значений', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)232-4123',
                        phone2From: 11,
                        phone2To: 21,
                        phone3: '+7(812)-123-3443'
                    }
                });
                user.dealer.phone3From = new DealerPhoneHour({id: 99});
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone3From.errors).toContain('Значение должно быть 24 или меньше.');
            });
        });

        it('обязательность значения phone3To при заполненном phone3', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)232-4123',
                        phone2From: 11,
                        phone2To: 21,
                        phone3: '+7(812)123-34-43'
                    }
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone3.errors).toContain('Неверно указано время для звонка на телефон.');
            });
        });

        it('соответствие значения phone3To перечню допустимых значений', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
                        manager: {id: 1},
                        phone: '+7(812)232-4124',
                        phoneFrom: 10,
                        phoneTo: 20,
                        phone2: '+7(812)232-4123',
                        phone2From: 11,
                        phone2To: 21,
                        phone3: '+7(812)123-34-43'
                    }
                });
                user.dealer.phone3To = new DealerPhoneHour({id: 99});
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone3To.errors).toContain('Значение должно быть 24 или меньше.');
            });
        });

        it('значение phone3From строго меньше phone3To', function() {
            var answer = {};

            runSync(answer, function() {
                var user = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'jasmine@maxposter.ru',
                    password: '1',
                    group: {id: 2},
                    dealer: {
                        companyName: '1',
                        address: '1',
                        billingCompany: {id: 1},
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
                });
                return user.save();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.children.phone3.errors).toContain('Неверно указано время для звонка на телефон.');
            });
        });
    });

    describe('Методы query должны', function() {

        it('equal - фильтровать данные пользователей по равенству в одном поле', function() {
            checkFilterEqual(usersLoader, ['status']);
        });

        it('equal - фильтровать данные пользователей по равенству в полях во вложенных объектах', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems({
                    filters: [
                        { type: 'equal', fields: ['status', 'dealer.manager'], value: '2' }
                    ]
                });
            });

            runs(function() {
                var users = answer.respond.getItems();
                expect(users.length).toBeTruthy();
                _.forEach(users, function(user) {
                    var status = String(user.status.id);
                    var manager = String(user.dealer.manager.id);
                    expect(status === '2' || manager === '2').toBeTruthy();
                });
            });
        });

        it('equal - значение фильтра может быть числом', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems({
                    filters: [
                        { type: 'equal', fields: ['id'], value: 1 }
                    ]
                });
            });

            runs(function() {
                var users = answer.respond.getItems();
                expect(users.length).toBeTruthy();
                _.forEach(users, function(user) {
                    var id = String(user.id);
                    expect(id === '1').toBeTruthy();
                });
            });
        });

        it('in - фильтровать данные пользователей по равенству в одном поле', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems({
                    filters: [
                        { type: 'in', fields: ['status'], value: ['inactive', 'blocked'] }
                    ]
                });
            });

            runs(function() {
                var users = answer.respond.getItems();
                expect(users.length).toBeTruthy();
                _.forEach(users, function(user) {
                    var status = String(user.status.id);
                    expect(status === 'inactive' || status === 'blocked').toBeTruthy();
                });
            });
        });

        it('in - фильтровать данные пользователей по равенству в нескольких поле', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems({
                    filters: [
                        { type: 'in', fields: ['status', 'dealer.manager'], value: ['1', '2'] }
                    ]
                });
            });

            runs(function() {
                var users = answer.respond.getItems();
                expect(users.length).toBeTruthy();
                _.forEach(users, function(user) {
                    var status = String(user.status.id);
                    var manager = String(user.dealer.manager.id);
                    expect(status === '1' || manager === '1' || status === '2' || manager === '2').toBeTruthy();
                });
            });
        });

        it('in - значение фильтра может быть массивом чисел', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems({
                    filters: [
                        { type: 'in', fields: ['id'], value: [1, 2] }
                    ]
                });
            });

            runs(function() {
                var users = answer.respond.getItems();
                expect(users.length).toBeTruthy();
                _.forEach(users, function(user) {
                    var id = String(user.id);
                    expect(id === '1' || id === '2').toBeTruthy();
                });
            });
        });

        it('contain - фильтровать данные пользователей по подстроке в одном поле', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems({
                    filters: [
                        { type: 'contain', fields: ['id'], value: ['3'] }
                    ]
                });
            });

            runs(function() {
                var users = answer.respond.getItems();
                expect(users.length).toBeTruthy();
                _.forEach(users, function(user) {
                    var id = String(user.id);
                    expect(id.indexOf('3') !== -1).toBeTruthy();
                });
            });
        });

        it('contain - фильтровать данные пользователей по подстроке в нескольких полях', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems({
                    filters: [
                        { type: 'contain', fields: ['email', 'dealer.companyName'], value: ['ac'] }
                    ]
                });
            });

            runs(function() {
                var users = answer.respond.getItems();
                expect(users.length).toBeTruthy();
                _.forEach(users, function(user) {
                    var email = user.email.toLowerCase();
                    var companyName = user.dealer && user.dealer.companyName && user.dealer.companyName.toLowerCase();
                    expect(email.indexOf('ac') !== -1 || companyName.indexOf('ac') !== -1).toBeTruthy();
                });
            });
        });

        it('contain - значение фильтра может быть числом', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems({
                    filters: [
                        { type: 'contain', fields: ['email'], value: 3 }
                    ]
                });
            });

            runs(function() {
                var users = answer.respond.getItems();
                expect(users.length).toBeTruthy();
                _.forEach(users, function(user) {
                    var email = String(user.email);
                    expect(email.indexOf('3') !== -1).toBeTruthy();
                });
            });
        });

        it('filters - комбинация трех разных фильтров', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems({
                    filters: [
                        { type: 'contain', fields: ['id', 'email', 'dealer.companyName'], value: '1' },
                        { type: 'in', fields: ['status'], value: ['active'] },
                        { type: 'equal', fields: ['dealer.manager'], value: '2' }
                    ]
                });
            });

            runs(function() {
                var users = answer.respond.getItems();
                expect(users.length).toBeTruthy();
                _.forEach(users, function(user) {
                    var id = String(user.id);
                    var email = String(user.email).toLowerCase();
                    var companyName = String(user.dealer.companyName).toLowerCase();
                    var status = String(user.status.id);
                    var manager = String(user.dealer.manager.id);
                    expect((id.indexOf('1') !== -1 || email.indexOf('1') !== -1 || companyName.indexOf('1') !== -1) 
                        && (status === 'active') && (manager === '2')).toBeTruthy();
                });
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
                var newParams = answer.respond.getParams();
                expect(newParams.filters).toEqual(params.filters);
            });
        });

        it('если параметр filters в запросе НЕ указан, то в ответе filters должен быть пустым массивом', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runs(function() {
                var params = answer.respond.getParams();
                expect(params.filters).toEqual([]);
            });
        });

        it('order - сортировать данные пользователей по возрастанию id', function() {
            checkSorting(usersLoader, ['+id']);
        });

        it('order - сортировать данные пользователей по убыванию id', function() {
            checkSorting(usersLoader, ['-id']);
        });

        it('order - сортировать данные пользователей по возрастанию email', function() {
            checkSorting(usersLoader, ['+email']);
        });

        it('order - сортировать данные пользователей по убыванию email', function() {
            checkSorting(usersLoader, ['-email']);
        });

        it('order - сортировать данные пользователей по возрастанию даты', function() {
            checkSorting(usersLoader, ['+lastLogin']);
        });

        it('order - сортировать данные пользователей по убыванию даты', function() {
            checkSorting(usersLoader, ['-lastLogin']);
        });

        it('если параметр orders в запросе указан, то в ответе order должен быть таким же', function() {
            var answer = {};
            var params = {
                orders: ['-id']
            };

            runSync(answer, function() {
                return usersLoader.loadItems(params);
            });

            runs(function() {
                var newParams = answer.respond.getParams();
                expect(newParams.orders).toEqual(params.orders);
            });
        });

        it('если параметр orders в запросе НЕ указан, то в ответе orders должен быть []', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems();
            });

            runs(function() {
                var newParams = answer.respond.getParams();
                expect(newParams.orders).toEqual([]);
            });
        });

        it('pager - ограничивать количество элементов выборки заданным', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems({
                    pager: {
                        per_page: 10
                    }
                });
            });

            runs(function() {
                var users = answer.respond.getItems();
                expect(users.length).toBe(10);
            });
        });

        it('если параметр pager.per_page в запросе НЕ указан, то в ответе он должен быть 100', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems({
                    pager: {
                        page: 2
                    }
                });
            });

            runs(function() {
                var newParams = answer.respond.getParams();
                expect(newParams.pager.per_page).toEqual(100);
            });
        });

        it('если параметр pager.page в запросе НЕ указан, то в ответе он должен быть 1', function() {
            var answer = {};

            runSync(answer, function() {
                return usersLoader.loadItems({
                    pager: {
                        per_page: 10
                    }
                });
            });

            runs(function() {
                var newParams = answer.respond.getParams();
                expect(newParams.pager.page).toEqual(1);
            });
        });
    });

    describe('Методы CRUD должны', function() {

        it('post - сохранять данные нового пользователя', function() {
            var s = {};

            var params = {
                fields: ['id'],
                pager: {
                    per_page: 1
                }
            }   

            runSyncS(s, function() {
                return $q.all({
                    directories: usersLoader.loadDirectories(),
                    users: usersLoader.loadItems(params)
                });
            });

            runSyncS(s, function() {
                var newUser = new User({
                    email: String(Math.floor(Math.random() * 1000000)) + 'new@maxposter.ru',
                    password: '1',
                    status: 'active',
                    group: {id: 2},
                    dealer: {
                        companyName: 'Новая компания',
                        billingCompany: {id: 1},
                        city: {id: 1},
                        market: {id: 4},
                        metro: {id: 8},
                        address: '191040, Ленинский проспект, 150, оф.505',
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
                        manager: {id: 4},
                        latitude: 40.09,
                        longitude: 50.91
                    }
                });
                return $q.all({
                    newUser: newUser,
                    savedUser: newUser.save(s.directories)
                });
            });

            runSyncS(s, function() {
                var savedUserSerialized = s.savedUser.serialize();
                _.forEach(s.newUser.serialize(), function(value, key) {
                    if (!_.contains(['id', 'dealer', 'password'], key)) {
                        expect(value).toEqual(savedUserSerialized[key]);
                    }
                });
                _.forEach(s.newUser.serialize().dealer, function(value, key) {
                    if (!_.contains(['id'], key)) {
                        expect(value).toEqual(savedUserSerialized.dealer[key]);
                    }
                });
                return $q.all({
                    loadedUser: usersLoader.loadItem(s.savedUser.id, s.directories),
                    loadedUsers: usersLoader.loadItems(params)
                });
            });

            runs(function() {
                expect(s.loadedUsers.getParams().pager.total).toBe(s.users.getParams().pager.total + 1);
                _.forEach(s.savedUser, function(value, key) {
                    expect(value).toEqual(s.loadedUser[key]);
                });
            });
        });

        it('get - возвращать данные пользователя', function() {
            var s = {};

            runSyncS(s, function() {
                return $q.all({
                    user: usersLoader.loadItem(5)
                });
            });

            runs(function() {
                expect(s.user.dealer.contactName).toBeDefined();
            });
        });

        it('get - возвращать ошибку, если пользователь не найден', function() {
            var s = {};

            runSyncS(s, function() {
                return $q.all({
                    user: usersLoader.loadItem(9999)
                });
            });

            runs(function() {
                var errorResponse = s.response.data;
                expect(errorResponse.message).toEqual('Пользователь не найден.');
            });
        });

        it('put - сохранять данные измененного пользователя', function() {
            var s = {};

            runSyncS(s, function() {
                return $q.all({
                    directories: usersLoader.loadDirectories(),
                    users: usersLoader.loadItems({
                        orders: ['-id']
                    })
                });
            });

            runSyncS(s, function() {
                s.user = s.users.getItems()[0];
                expect(s.user).toBeDefined();
                s.user.email = String(Math.floor(Math.random() * 1000000)) + 'new@maxposter.ru';
                return $q.all({
                    savedUser: s.user.save(s.directories)
                });
            });

            runSyncS(s, function() {
                expect(s.savedUser.email).toEqual(s.user.email);
                return $q.all({
                    loadedUser: usersLoader.loadItem(s.savedUser.id, s.directories)
                });
            });

            runs(function() {
                expect(s.loadedUser.email).toEqual(s.savedUser.email);
            });
        });

        it('put - возвращать ошибку при попытке сохранения пользователя со ссылками на объекты, не существующие в БД', function() {
            var s = {};
            var user;

            runSyncS(s, function() {
                return $q.all({
                    users: usersLoader.loadItems()
                });
            });

            runSyncS(s, function() {
                user = _.find(s.users.getItems(), function(user) {
                    return user.group.id === 3;
                });
                user.site = new Site({id: 99});
                return user.save();
            });

            runs(function() {
                var errorResponse = s.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.site.children.id.errors).toContain('Сайт ' + user.site.id + ' не найден.');
            });
        });

        it('remove - удалять пользователя', function() {
            var s = {};
            var params = {
                orders: ['-id'],
                pager: {per_page: 1}
            }

            runSyncS(s, function() {
                return $q.all({
                    users: usersLoader.loadItems(params)
                })
            });

            runSyncS(s, function() {
                var user = s.users.getItems()[0];
                return user.remove();
            });

            runSyncS(s, function() {
                return $q.all({
                    newUsers: usersLoader.loadItems(params)
                })
            });

            runs(function() {
                expect(s.newUsers.getParams().pager.total).toBe(s.users.getParams().pager.total - 1);
            });
        });
    });
});
});
