'use strict';

describe('app-mocked', function() {
    var $httpBackend;
    var $q;
    var Construction;
    var usersLoader,
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

        dealerSitesLoader,
        dealersLoader,
        sitesLoader, 
        DealerSite,
        DealerSites,
        Dealers,
        Sites,
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
    var saleTypes;
    var SiteBalances;

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
            'max.dal.entities.tariff', 'max.dal.entities.tariffrate', 'max.dal.entities.dealertariff', 'max.dal.entities.sale', 'max.dal.entities.sitebalance'];
        if (ngMock) {
            modules.push('ngMock');
        }
        var injector = angular.injector(modules);
        $q = injector.get('$q');

        Construction = injector.get('Construction');
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

        dealerSitesLoader = injector.get('dealerSitesLoader');
        DealerSites = injector.get('DealerSites');
        DealerSite = injector.get('DealerSite');
        dealersLoader = injector.get('dealersLoader');
        Dealers = injector.get('Dealers');
        sitesLoader = injector.get('sitesLoader');
        Sites = injector.get('Sites');
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
        saleTypes = injector.get('saleTypes');
        SiteBalances = injector.get('SiteBalances');

        if (ngMock) {
            $httpBackend = injector.get('$httpBackend');
            setHttpMock($httpBackend, 3, Construction,
                User, Users, Groups, Managers, Markets, Metros, Cities, BillingCompanies,
                Dealers, Sites, DealerSite, DealerSites, DealerSiteLogins, DealerSiteLogin,
                Tariffs, TariffRates, DealerTariffs, Sales, Sale, saleTypes, SiteBalances);
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
                    }
                    if (sale.type.id === 'card' || sale.type.id === 'addcard') {
                        expect(sale.tariff).toBeReference();
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
            var answer = {};
            var sale;

            runSync(answer, function() {
                return salesLoader.loadItems();
            });

            runSync(answer, function() {
                sale = answer.respond.getItems()[0];
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['id'], type: 'equal', value: sale.id }
                    ]
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBe(1);
                expect(sales[0]).toEqual(sale);
            });
        });

        it('equal - фильтровать по равенству type заданному значению', function() {
            var answer = {};
            var sale;

            runSync(answer, function() {
                return salesLoader.loadItems();
            });

            runSync(answer, function() {
                sale = answer.respond.getItems()[0];
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: sale.type.id }
                    ]
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sales, function(saleEqual) {
                    expect(saleEqual.type).toEqual(sale.type);
                });
            });
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
            var answer = {};
            var sale;

            runSync(answer, function() {
                return salesLoader.loadItems();
            });

            runSync(answer, function() {
                sale = answer.respond.getItems()[0];
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['dealer'], type: 'equal', value: sale.dealer.id }
                    ]
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sales, function(saleEqual) {
                    expect(saleEqual.dealer).toEqual(sale.dealer);
                });
            });
        });

        it('equal - фильтровать по равенству site заданному значению', function() {
            var answer = {};
            var sale;

            runSync(answer, function() {
                return salesLoader.loadItems();
            });

            runSync(answer, function() {
                sale = answer.respond.getItems()[0];
                return salesLoader.loadItems({
                    filters: [
                        { fields: ['site'], type: 'equal', value: sale.site.id }
                    ]
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sales, function(saleEqual) {
                    expect(saleEqual.site).toEqual(sale.site);
                });
            });
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
            var answer = {};

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: ['+id']
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                expect(_.pluck(sales, 'id')).toBeSorted('AscendingNumbers');
            });
        });

        it('сортировать по id по убыванию', function() {
            var answer = {};

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: ['-id']
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                expect(_.pluck(sales, 'id')).toBeSorted('DescendingNumbers');
            });
        });

        it('сортировать по date по возрастанию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['+date', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.date, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по date по убыванию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['-date', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.date, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по dealer по возрастанию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['+dealer', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.dealer.id, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по dealer по убыванию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['-dealer', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.dealer.id, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по site по возрастанию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['+site', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.site.id, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по site по убыванию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['-site', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.site.id, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по count по возрастанию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['+count', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.count, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по count по убыванию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['-count', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.count, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по amount по возрастанию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['+amount', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.amount, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по amount по убыванию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['-amount', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.amount, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по siteAmount по возрастанию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['+siteAmount', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.siteAmount, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по siteAmount по убыванию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['-siteAmount', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.siteAmount, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по activeFrom по возрастанию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['+activeFrom', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.activeFrom, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по activeFrom по убыванию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['-activeFrom', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.activeFrom, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по activeTo по возрастанию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['+activeTo', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.activeTo, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по activeTo по убыванию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['-activeTo', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.activeTo, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по isActive по возрастанию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['+isActive', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.isActive, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });

        it('сортировать по isActive по убыванию, затем по id по убыванию', function() {
            var answer = {};
            var orders = ['-isActive', '-id'];

            runSync(answer, function() {
                return salesLoader.loadItems({
                    orders: orders
                });
            });

            runs(function() {
                var sales = answer.respond.getItems();
                expect(sales.length).toBeTruthy();
                _.forEach(sortByOrders(_.cloneDeep(sales), orders), function(sale, saleIdx) {
                    console.log(sale.isActive, sale.id);
                    expect(sale.id).toEqual(sales[saleIdx].id);
                });
            });
        });
    });

    describe('Метод post', function() {

        it('сохранять данные новой карточки', function() {
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
                    cardAmount: Math.floor(Math.random() * 100000) / 100,
                    count: Math.floor(Math.random() * 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: 1000 + Math.floor(Math.random() * 100000) / 100,
                    siteAmount: Math.floor(Math.random() * 100000) / 100,
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
                    cardAmount: Math.floor(Math.random() * 100000) / 100,
                    count: Math.floor(Math.random() * 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: 1000 + Math.floor(Math.random() * 100000) / 100,
                    siteAmount: Math.floor(Math.random() * 100000) / 100,
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
                    cardAmount: Math.floor(Math.random() * 100000) / 100,
                    count: Math.floor(Math.random() * 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: 1000 + Math.floor(Math.random() * 100000) / 100,
                    siteAmount: Math.floor(Math.random() * 100000) / 100,
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
                    cardAmount: Math.floor(Math.random() * 100000) / 100,
                    count: Math.floor(Math.random() * 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: 1000 + Math.floor(Math.random() * 100000) / 100,
                    siteAmount: Math.floor(Math.random() * 100000) / 100,
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

        iit('сохранять данные нового расширения расширения', function() {
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
                    cardAmount: Math.floor(Math.random() * 100000) / 100,
                    count: Math.floor(Math.random() * 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: false,
                    date: date.toISOString().slice(0, 10),
                    amount: 1000 + Math.floor(Math.random() * 100000) / 100,
                    siteAmount: Math.floor(Math.random() * 100000) / 100,
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
                    amount: Math.floor(Math.random() * 100000) / 100,
                    siteAmount: Math.floor(Math.random() * 100000) / 100,
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
                        var addSaleParentIds = _.pluck(addSales.getItems(), 'parentId');
                        _.remove(sales.getItems(), function(sale) {
                            return _.contains(addSaleParentIds, sale.cardId); 
                        });
                        return sales;
                    });
                });
            });

            runSync(answer, function() {
                var salesArray = answer.respond.getItems();
                var sale = salesArray[0];
                var otherSale = _.find(salesArray, function(otherSale) {
                    return (otherSale.dealer.id !== sale.dealer.id) && (otherSale.site.id !== sale.site.id);
                });
                expect(otherSale).toBeDefined();

                var activeFrom = _.clone(otherSale.activeTo);
                    activeFrom.setDate(activeFrom.getDate() + 1);
                var activeTo = _.clone(activeFrom);
                    activeTo.setDate(activeTo.getDate() + Math.floor(Math.random() * 10));
                var date = new Date;
                    date.setUTCHours(0, 0, 0, 0);

                saleData = {
                    id: sale.id,
                    type: 'card',
                    cardId: sale.cardId,
                    dealer: {id: otherSale.dealer.id},
                    site: {id: otherSale.site.id},
                    tariff: {id: otherSale.tariff.id},
                    cardAmount: Math.floor(Math.random() * 100000) / 100,
                    count: Math.floor(Math.random() * 100),
                    activeFrom: activeFrom.toISOString().slice(0, 10),
                    activeTo: activeTo.toISOString().slice(0, 10),
                    isActive: !sale.isActive,
                    date: date.toISOString().slice(0, 10),
                    amount: 1000 + Math.floor(Math.random() * 100000) / 100,
                    siteAmount: Math.floor(Math.random() * 100000) / 100,
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
                            return !_.contains(addSaleParentIds, sale.cardId); 
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
                return sale.remove();
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors).toEqual('Невозможно удалить продажу с расширением или доплатой.');
            });
        });

        it('выдавать ошибку при удалении карточки, имеющей доплату', function() {
            var answer = {};

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
                            return !_.contains(extraSaleCardIds, sale.cardId); 
                        });
                        expect(salesItems.length).toBeTruthy();
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
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors).toEqual('Невозможно удалить продажу с расширением или доплатой.');
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
                expect(errorResponse.message).toEqual('Not Found');
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
                        expect(salesItems.length).toBeTruthy();
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
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors).toEqual('Невозможно удалить продажу с расширением или доплатой.');
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
                expect(errorResponse.message).toEqual('Not Found');
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
            var answer = {};
            var tariffRate;

            runSync(answer, function() {
                return tariffRatesLoader.loadItems();
            });

            runSync(answer, function() {
                tariffRate = answer.respond.getItems()[0];
                return tariffRatesLoader.loadItems({
                    filters: [
                        { fields: ['id'], type: 'equal', value: tariffRate.id }
                    ]
                });
            });

            runs(function() {
                var tariffRates = answer.respond.getItems();
                expect(tariffRates.length).toBe(1);
                expect(tariffRates[0]).toEqual(tariffRate);
            });
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

        it('сортировать по id по возрастанию', function() {
            var answer = {};
            var tariffRate;

            runSync(answer, function() {
                return tariffRatesLoader.loadItems({
                    orders: ['+id']
                });
            });

            runs(function() {
                var tariffRates = answer.respond.getItems();
                expect(tariffRates.length).toBeTruthy();
                expect(_.pluck(tariffRates, 'id')).toBeSorted('AscendingNumbers');
            });
        });

        it('сортировать по id по убыванию', function() {
            var answer = {};
            var tariffRate;

            runSync(answer, function() {
                return tariffRatesLoader.loadItems({
                    orders: ['-id']
                });
            });

            runs(function() {
                var tariffRates = answer.respond.getItems();
                expect(tariffRates.length).toBeTruthy();
                expect(_.pluck(tariffRates, 'id')).toBeSorted('DescendingNumbers');
            });
        });

        it('сортировать по activeFrom по возрастанию', function() {
            var answer = {};
            var tariffRate;

            runSync(answer, function() {
                return tariffRatesLoader.loadItems({
                    orders: ['+activeFrom']
                });
            });

            runs(function() {
                var tariffRates = answer.respond.getItems();
                expect(tariffRates.length).toBeTruthy();
                expect(_.pluck(tariffRates, 'activeFrom')).toBeSorted('AscendingDates');
            });
        });

        it('сортировать по activeFrom по убыванию', function() {
            var answer = {};
            var tariffRate;

            runSync(answer, function() {
                return tariffRatesLoader.loadItems({
                    orders: ['-activeFrom']
                });
            });

            runs(function() {
                var tariffRates = answer.respond.getItems();
                expect(tariffRates.length).toBeTruthy();
                expect(_.pluck(tariffRates, 'activeFrom')).toBeSorted('DescendingDates');
            });
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
            var answer = {};
            var tariff;

            runSync(answer, function() {
                return tariffsLoader.loadItems();
            });

            runSync(answer, function() {
                tariff = answer.respond.getItems()[0];
                return tariffsLoader.loadItems({
                    filters: [
                        { fields: ['id'], type: 'equal', value: tariff.id }
                    ]
                });
            });

            runs(function() {
                var tariffs = answer.respond.getItems();
                expect(tariffs.length).toBe(1);
                expect(tariffs[0]).toEqual(tariff);
            });
        });

        it('equal - фильтровать по равенству site заданному значению', function() {
            var answer = {};
            var tariff;

            runSync(answer, function() {
                return tariffsLoader.loadItems();
            });

            runSync(answer, function() {
                tariff = answer.respond.getItems()[0];
                return tariffsLoader.loadItems({
                    filters: [
                        { fields: ['site'], type: 'equal', value: tariff.site.id }
                    ]
                });
            });

            runs(function() {
                var tariffs = answer.respond.getItems();
                expect(tariffs.length).toBeTruthy();
                _.forEach(tariffs, function(tariffEqual) {
                    expect(tariffEqual.site).toEqual(tariff.site);
                });
            });
        });

        it('equal - фильтровать по равенству type заданному значению', function() {
            var answer = {};
            var tariff;

            runSync(answer, function() {
                return tariffsLoader.loadItems();
            });

            runSync(answer, function() {
                tariff = answer.respond.getItems()[0];
                return tariffsLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: tariff.type }
                    ]
                });
            });

            runs(function() {
                var tariffs = answer.respond.getItems();
                expect(tariffs.length).toBeTruthy();
                _.forEach(tariffs, function(tariffEqual) {
                    expect(tariffEqual.type).toEqual(tariff.type);
                });
            });
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
            var answer = {};
            var tariff;

            runSync(answer, function() {
                return tariffsLoader.loadItems({
                    orders: ['+id']
                });
            });

            runs(function() {
                var tariffs = answer.respond.getItems();
                expect(tariffs.length).toBeTruthy();
                expect(_.pluck(tariffs, 'id')).toBeSorted('AscendingNumbers');
            });
        });

        it('сортировать по id по убыванию', function() {
            var answer = {};
            var tariff;

            runSync(answer, function() {
                return tariffsLoader.loadItems({
                    orders: ['-id']
                });
            });

            runs(function() {
                var tariffs = answer.respond.getItems();
                expect(tariffs.length).toBeTruthy();
                expect(_.pluck(tariffs, 'id')).toBeSorted('DescendingNumbers');
            });
        });

        it('сортировать по site по возрастанию', function() {
            var answer = {};
            var tariff;

            runSync(answer, function() {
                return tariffsLoader.loadItems({
                    orders: ['+site']
                });
            });

            runs(function() {
                var tariffs = answer.respond.getItems();
                expect(tariffs.length).toBeTruthy();
                expect(_.pluck(_.pluck(tariffs, 'site'), 'id')).toBeSorted('AscendingNumbers');
            });
        });

        it('сортировать по site по убыванию', function() {
            var answer = {};
            var tariff;

            runSync(answer, function() {
                return tariffsLoader.loadItems({
                    orders: ['-site']
                });
            });

            runs(function() {
                var tariffs = answer.respond.getItems();
                expect(tariffs.length).toBeTruthy();
                expect(_.pluck(_.pluck(tariffs, 'site'), 'id')).toBeSorted('DescendingNumbers');
            });
        });
    });
});

describe('sales, tariffs', function() {
    
    it('загружать значения тарифов, затем нужных сайтов', function() {
        var answer = {};

        runSync(answer, function() {
            return tariffsLoader.loadItems().then(function(tariffs) {
                return sitesLoader.loadItems({
                    filters: [
                        { fields: ['id'], type: 'in', value: _.pluck(tariffs.getItems(), 'id') }
                    ]
                }).then(function(sites) {
                    tariffs.resolveRefs({sites: sites});
                    return {
                        tariffs: tariffs,
                        sites: sites
                    }
                });
            });
        });

        runs(function() {
            var directories = answer.respond;
            var tariffItems = directories.tariffs.getItems();
            var siteItems = directories.sites.getItems();
            expect(tariffItems.length).toBeTruthy();
            expect(siteItems.length).toBeTruthy();
        });
    });

    it('загружать значения всех сайтов, затем тарифов', function() {
        var answer = {};

        runSync(answer, function() {
            return sitesLoader.loadItems().then(function(sites) {
                return tariffsLoader.loadItems(null, {sites: sites}).then(function(tariffs) {
                    return {
                        sites: sites,
                        tariffs: tariffs
                    };
                });
            });
        });

        runs(function() {
            var directories = answer.respond;
            var tariffItems = directories.tariffs.getItems();
            var siteItems = directories.sites.getItems();
            expect(tariffItems.length).toBeTruthy();
            expect(siteItems.length).toBeTruthy();
        });
    });

    it('загружать значения всех сайтов, затем тарифов, затем первого тарифа', function() {
        var answer = {};

        runSync(answer, function() {
            return sitesLoader.loadItems().then(function(sites) {
                return tariffsLoader.loadItems(null, {sites: sites}).then(function(tariffs) {
                    // return tariffsLoader.loadItem(tariffs.getItems()[0].id, {sites: sites}).then(function(tariff) {
                        return {
                            sites: sites,
                            tariffs: tariffs
                            // ,
                            // tariff: tariff
                        }
                    // });
                });
            });
        });

        runs(function() {
            var directories = answer.respond;
            var siteItems = directories.sites.getItems();
            var tariffItems = directories.tariffs.getItems();
            var tariff = directories.tariff;
            expect(siteItems.length).toBeTruthy();
            expect(tariffItems.length).toBeTruthy();
            // expect(tariff.constructor.name).toBe('Tariff');
        });
    });

    it('загружать сразу значения тарифов и всех сайтов', function() {
        var answer = {};

        runSync(answer, function() {
            return $q.all({
                tariffs: tariffsLoader.loadItems(),
                sites: sitesLoader.loadItems()
            }).then(function(directories) {
                return _.invoke(directories, 'resolveRefs', directories);
            });
        });

        runSync(answer, function() {
            var directories = answer.respond;
            var tariffItems = directories.tariffs.getItems();
            var siteItems = directories.sites.getItems();
            expect(tariffItems.length).toBeTruthy();
            expect(siteItems.length).toBeTruthy();
            return tariffsLoader.loadItem(tariffItems[0].id, directories);
        });


        runs(function() {
            var tariff = answer.respond;
            expect(tariff).toBeTruthy();
        });
    });
});

describe('dealersite, dealersitelogin', function() {

    describe('dealersitelogin', function() {

        it('equal - по равенству dealer и site заданным значениям', function() {
            var answer = {};
            var dealerId;
            var siteId;

            runSync(answer, function() {
                return dealerSiteLoginsLoader.loadItems().then(function(dealerSiteLogins) {
                    var dealerSiteLogin = dealerSiteLogins.getItems()[0];
                    dealerId = String(dealerSiteLogin.dealer.id);
                    siteId = String(dealerSiteLogin.site.id);
                    return dealerSiteLoginsLoader.loadItems({
                        filters: [
                            { fields: ['dealer'], type: 'equal', value: dealerId },
                            { fields: ['site'], type: 'equal', value: siteId }
                        ]
                    });
                });
            });

            runs(function() {
                var dealerSiteLoginsArray = answer.respond.getItems();
                expect(dealerSiteLoginsArray.length).toBeTruthy();
                _.forEach(dealerSiteLoginsArray, function(value) {
                    var valueDealerId = String(value.dealer.id);
                    var valueSiteId = String(value.site.id);
                    expect(valueDealerId).toBe(dealerId);
                    expect(valueSiteId).toBe(siteId);
                });
            });
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
                        order: {
                            order_field: 'id',
                            order_direction: 'desc'
                        },
                        fields: ['dealer_list_name']
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
            var directories = {};
            var dealerSiteLogin;

            runSync(answer, function() {
                return dealerSiteLoginsLoader.loadItems({
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                });
            });

            runSync(answer, function() {
                directories.dealerSiteLogins = answer.respond;
                dealerSiteLogin = directories.dealerSiteLogins.getItems()[0];
                return $q.all({
                    sites: sitesLoader.loadItems({
                        filters: [
                            { fields: ['id'], type: 'equal', value: dealerSiteLogin.site.id }
                        ]
                    }),
                    dealers: dealersLoader.loadItems({
                        filters: [
                            { fields: ['id'], type: 'equal', value: dealerSiteLogin.dealer.id }
                        ],
                        fields: ['dealer_list_name']
                    })
                });
            });

            runSync(answer, function() {
                _.assign(directories, answer.respond);
                var dealerSiteLoginCopy = new DealerSiteLogin({
                    dealer: {id: dealerSiteLogin.dealer.id},
                    site: {id: dealerSiteLogin.site.id},
                    type: dealerSiteLogin.type.id
                }, directories);
                return dealerSiteLoginCopy.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.site.errors).toEqual(['Это значение уже используется.']);
            });
        });

        it('put - сохранять изменения атрибутов dealersitelogin', function() {
            var answer = {};
            var dealerSiteLogin;

            runSync(answer, function() {
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSiteLoginsLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                dealerSiteLogin = directories.dealerSiteLogins.getItems()[0];
                dealerSiteLogin.login = String(Math.floor(Math.random() * 1000000));
                dealerSiteLogin.password = String(Math.floor(Math.random() * 1000000));
                return dealerSiteLogin.save(directories);
            });

            runSync(answer, function() {
                var savedDealerSiteLogin = answer.respond;
                return dealerSiteLoginsLoader.loadItem(savedDealerSiteLogin.id);
            });

            runs(function() {
                var savedDealerSiteLogin = answer.respond.dealerSiteLogin;
                expect(savedDealerSiteLogin.login).toEqual(dealerSiteLogin.login);
                expect(savedDealerSiteLogin.password).toEqual(dealerSiteLogin.password);
            });
        });

        it('put - выдавать ошибку если нет значения в поле dealer', function() {
            var answer = {};
            var dealerSiteLogin;

            runSync(answer, function() {
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSiteLoginsLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                dealerSiteLogin = directories.dealerSiteLogins.getItems()[0];
                dealerSiteLogin.dealer = null;
                return dealerSiteLogin.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.dealer.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('put - выдавать ошибку если нет значения в поле site', function() {
            var answer = {};
            var dealerSiteLogin;

            runSync(answer, function() {
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSiteLoginsLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                dealerSiteLogin = directories.dealerSiteLogins.getItems()[0];
                dealerSiteLogin.site = null;
                return dealerSiteLogin.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.site.errors).toEqual(['Значение не должно быть пустым.']);
            });
        });

        it('put - выдавать ошибку если нет значения в поле type', function() {
            var answer = {};
            var dealerSiteLogin;

            runSync(answer, function() {
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSiteLoginsLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                dealerSiteLogin = directories.dealerSiteLogins.getItems()[0];
                dealerSiteLogin.type = null;
                return dealerSiteLogin.save(directories);
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
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSiteLoginsLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                dealerSiteLogin = directories.dealerSiteLogins.getItems()[0];
                dealerSiteLogin.login = null;
                dealerSiteLogin.password = String(Math.floor(Math.random() * 1000000));
                return dealerSiteLogin.save(directories);
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
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSiteLoginsLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                dealerSiteLogin = directories.dealerSiteLogins.getItems()[0];
                dealerSiteLogin.login = '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901';
                dealerSiteLogin.password = String(Math.floor(Math.random() * 1000000));
                return dealerSiteLogin.save(directories);
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
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSiteLoginsLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                dealerSiteLogin = directories.dealerSiteLogins.getItems()[0];
                dealerSiteLogin.login = String(Math.floor(Math.random() * 1000000));
                dealerSiteLogin.password = null;
                return dealerSiteLogin.save(directories);
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
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSiteLoginsLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                dealerSiteLogin = directories.dealerSiteLogins.getItems()[0];
                dealerSiteLogin.login = String(Math.floor(Math.random() * 1000000));
                dealerSiteLogin.password = '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901';
                return dealerSiteLogin.save(directories);
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
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSiteLoginsLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                dealerSiteLogin = directories.dealerSiteLogins.getItems()[0];
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
                expect(errorResponse.message).toEqual('Not Found');
            });
        });
    });

    describe('Методы query должны фильтровать dealersite', function() {

        it('equal - по равенству dealer заданному значению', function() {
            var answer = {};
            var dealer;

            runSync(answer, function() {
                return dealerSitesLoader.loadItems();
            });

            runSync(answer, function() {
                dealer = answer.respond.dealerSites.getItems()[0].dealer;
                var params = {
                    filters: [
                        { fields: ['dealer'], type: 'equal', value: dealer.id }
                    ]
                };
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                expect(_.every(dealerSites, function(value) {
                    var dealerId = String(value.dealer.id);
                    return (dealerId === String(dealer.id));
                })).toBeTruthy();
            });
        });

        it('in - по равенству dealer одному из заданных значений', function() {
            var answer = {};
            var dealersId;

            runSync(answer, function() {
                return dealerSitesLoader.loadItems();
            });

            runSync(answer, function() {
                var dealers = _.uniq(_.pluck(answer.respond.dealerSites.getItems(), 'dealer')).slice(0, 3);
                dealersId = _.pluck(dealers, 'id');
                var params = {
                    filters: [
                        { fields: ['dealer'], type: 'in', value: dealersId }
                    ]
                };
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                expect(_.every(dealerSites, function(value) {
                    var dealerId = value.dealer.id;
                    return (dealersId.indexOf(dealerId) !== -1);
                })).toBeTruthy();
            });
        });

        it('equal - по равенству site заданному значению', function() {
            var answer = {};
            var site;

            runSync(answer, function() {
                return dealerSitesLoader.loadItems();
            });

            runSync(answer, function() {
                site = answer.respond.dealerSites.getItems()[0].site;
                var params = {
                    filters: [
                        { fields: ['site'], type: 'equal', value: site.id }
                    ]
                };
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                expect(_.every(dealerSites, function(value) {
                    var siteId = String(value.site.id);
                    return (siteId === String(site.id));
                })).toBeTruthy();
            });
        });

        it('in - по равенству site одному из заданных значений', function() {
            var answer = {};
            var sitesId;

            runSync(answer, function() {
                return dealerSitesLoader.loadItems();
            });

            runSync(answer, function() {
                var sites = _.uniq(_.pluck(answer.respond.dealerSites.getItems(), 'site')).slice(0, 3);
                sitesId = _.pluck(sites, 'id');
                var params = {
                    filters: [
                        { fields: ['site'], type: 'in', value: sitesId }
                    ]
                };
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
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
                var params = {
                    filters: [
                        { type: 'equal', fields: ['isActive'], value: true }
                    ]
                };
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                expect(_.every(dealerSites, function(value) {
                    return (value.isActive.id === true);
                })).toBeTruthy();
            });
        });

        it('equal - по равенству isActive = false', function() {
            var answer = {};

            runSync(answer, function() {
                var params = {
                    filters: [
                        { type: 'equal', fields: ['isActive'], value: false }
                    ]
                };
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                expect(_.every(dealerSites, function(value) {
                    return (value.isActive.id === false);
                })).toBeTruthy();
            });
        });
    });

    describe('Методы query должны сортировать dealersite', function() {

        it('по возрастанию id', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'asc'
                }
            };

            runSync(answer, function() {
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                var dealerSitesId = _.pluck(dealerSites, 'id');
                expect(dealerSitesId).toBeSorted('AscendingNumbers');
            });
        });

        it('по убыванию id', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                }
            };

            runSync(answer, function() {
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                var dealerSitesId = _.pluck(dealerSites, 'id');
                expect(dealerSitesId).toBeSorted('DescendingNumbers');
            });
        });

        it('по возрастанию dealer', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'dealer',
                    order_direction: 'asc'
                }
            };

            runSync(answer, function() {
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                var dealerSitesDealerId = _.pluck(_.pluck(dealerSites, 'dealer'), 'id');
                expect(dealerSitesDealerId).toBeSorted('AscendingNumbers');
            });
        });

        it('по убыванию dealer', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'dealer',
                    order_direction: 'desc'
                }
            };

            runSync(answer, function() {
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                var dealerSitesDealerId = _.pluck(_.pluck(dealerSites, 'dealer'), 'id');
                expect(dealerSitesDealerId).toBeSorted('DescendingNumbers');
            });
        });

        it('по возрастанию site', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'site',
                    order_direction: 'asc'
                }
            };

            runSync(answer, function() {
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                var dealerSitesSiteId = _.pluck(_.pluck(dealerSites, 'site'), 'id');
                expect(dealerSitesSiteId).toBeSorted('AscendingNumbers');
            });
        });

        it('по убыванию site', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'site',
                    order_direction: 'desc'
                }
            };

            runSync(answer, function() {
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                var dealerSitesSiteId = _.pluck(_.pluck(dealerSites, 'site'), 'id');
                expect(dealerSitesSiteId).toBeSorted('DescendingNumbers');
            });
        });

        it('по возрастанию externalId', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'externalId',
                    order_direction: 'asc'
                }
            };

            runSync(answer, function() {
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                var dealerSitesExternalId = _.pluck(dealerSites, 'externalId');
                expect(dealerSitesExternalId).toBeSorted('AscendingStrings');
            });
        });

        it('по убыванию externalId', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'externalId',
                    order_direction: 'desc'
                }
            };

            runSync(answer, function() {
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                var dealerSitesExternalId = _.pluck(dealerSites, 'externalId');
                expect(dealerSitesExternalId).toBeSorted('DescendingStrings');
            });
        });

        it('по возрастанию publicUrl', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'publicUrl',
                    order_direction: 'asc'
                }
            };

            runSync(answer, function() {
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                var dealerSitesPublicUrl = _.pluck(dealerSites, 'publicUrl');
                expect(dealerSitesPublicUrl).toBeSorted('AscendingStrings');
            });
        });

        it('по убыванию publicUrl', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'publicUrl',
                    order_direction: 'desc'
                }
            };

            runSync(answer, function() {
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                var dealerSitesPublicUrl = _.pluck(dealerSites, 'publicUrl');
                expect(dealerSitesPublicUrl).toBeSorted('DescendingStrings');
            });
        });

        it('по возрастанию isActive', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'isActive',
                    order_direction: 'asc'
                }
            };

            runSync(answer, function() {
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                var dealerSitesIsActive = _.pluck(dealerSites, 'isActive');
                expect(dealerSitesIsActive).toBeSorted('AscendingBooleans');
            });
        });

        it('по убыванию isActive', function() {
            var answer = {};
            var params = {
                order: {
                    order_field: 'isActive',
                    order_direction: 'desc'
                }
            };

            runSync(answer, function() {
                return dealerSitesLoader.loadItems(params);
            });

            runs(function() {
                var dealerSites = answer.respond.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                var dealerSitesIsActive = _.pluck(dealerSites, 'isActive');
                expect(dealerSitesIsActive).toBeSorted('DescendingBooleans');
            });
        });
    });

    describe('Методы CRUD должны', function() {

        it('post - сохранять новый dealersite', function() {
            var answer = {};
            var directories = {};
            var sites;
            var dealers;
            var freeDealerId;

            runSync(answer, function() {
                return dealerSiteStatusesLoader.loadItems();
            });

            runSync(answer, function() {
                _.assign(directories, answer.respond); 
                return sitesLoader.loadItems();
            });

            runSync(answer, function() {
                _.assign(directories, answer.respond); 
                sites = answer.respond.sites.getItems();
                var dealerQueryParams = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    },
                    fields: ['dealer_list_name']
                };
                return dealersLoader.loadItems(dealerQueryParams);
            });

            runSync(answer, function() {
                _.assign(directories, answer.respond);
                dealers = answer.respond.dealers.getItems();
                var dealersId = _.pluck(dealers, 'id');
                var params = {
                    filters: [
                        { fields: ['site'], type: 'equal', value: sites[1].id },
                        { fields: ['dealer'], type: 'in', value: dealersId }
                    ]
                };
                return dealerSitesLoader.loadItems(params).then(function(directory) {
                    var dealerSites = directory.dealerSites.getItems();
                    var dealerSitesDealersId = _.pluck(_.pluck(dealerSites, 'dealer'), 'id');
                    return _.difference(dealersId, dealerSitesDealersId);
                });
            });

            runSync(answer, function() {
                freeDealerId = answer.respond;
                var newDealerSite = new DealerSite({
                        dealer: {id: freeDealerId[0]},
                        site: {id: sites[1].id},
                        externalId: '1109238',
                        publicUrl: 'http://www.auto.mail.ru/1109238.html',
                        isActive: true
                    }, directories);
                return newDealerSite.save(directories);
            });

            runSync(answer, function() {
                var newDealerSite = answer.respond;
                return dealerSitesLoader.loadItem(newDealerSite.id);
            });

            runs(function() {
                var newDealerSite = answer.respond.dealerSite;
                expect(newDealerSite.dealer.id).toEqual(freeDealerId[0]);
                expect(newDealerSite.site).toEqual(sites[1]);
                expect(newDealerSite.externalId).toEqual('1109238');
                expect(newDealerSite.publicUrl).toEqual('http://www.auto.mail.ru/1109238.html');
                expect(newDealerSite.isActive.id).toEqual(true);
            });
        });

        it('post - выдавать ошибку, если такая комбинация dealer, site уже есть', function() {
            var answer = {};

            runSync(answer, function() {
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSitesLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var dealerSites = directories.dealerSites.getItems();
                var dealerSite = dealerSites[0];
                var dealerSiteCopy = new DealerSite({
                    dealer: dealerSite.dealer,
                    site: dealerSite.site
                }, directories);
                return dealerSiteCopy.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.site.errors).toEqual(['Это значение уже используется.']);
            });
        });

        it('put - сохранять изменения атрибутов dealersite', function() {
            var answer = {};
            var dealerSite;

            runSync(answer, function() {
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSitesLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var dealerSites = directories.dealerSites.getItems();
                dealerSite = dealerSites[0];
                dealerSite.externalId = String(Math.floor(Math.random() * 1000000));
                dealerSite.publicUrl = 'http://www.jasmine.ru/' + String(Math.floor(Math.random() * 1000000));
                return dealerSite.save(directories);
            });

            runSync(answer, function() {
                var savedDealerSite = answer.respond;
                return dealerSitesLoader.loadItem(savedDealerSite.id);
            });

            runs(function() {
                var savedDealerSite = answer.respond.dealerSite;
                expect(savedDealerSite.externalId).toEqual(dealerSite.externalId);
                expect(savedDealerSite.publicUrl).toEqual(dealerSite.publicUrl);
            });
        });

        it('put - выдавать ошибку при неправильном формате publicUrl', function() {
            var answer = {};
            var dealerSite;

            runSync(answer, function() {
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSitesLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var dealerSites = directories.dealerSites.getItems();
                dealerSite = dealerSites[0];
                dealerSite.externalId = String(Math.floor(Math.random() * 1000000));
                dealerSite.publicUrl = '22222';
                return dealerSite.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.publicUrl.errors).toEqual(['Значение не является допустимым URL.']);
            });
        });

        it('put - выдавать ошибку при длине значения externalId больше 10', function() {
            var answer = {};
            var dealerSite;

            runSync(answer, function() {
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSitesLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var dealerSites = directories.dealerSites.getItems();
                dealerSite = dealerSites[0];
                dealerSite.externalId = '01234567890';
                return dealerSite.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.externalId.errors).toEqual(['Значение слишком длинное. Должно быть равно 10 символам или меньше.']);
            });
        });

        it('put - выдавать ошибку при длине значения publicUrl больше 255', function() {
            var answer = {};
            var dealerSite;

            runSync(answer, function() {
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSitesLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var dealerSites = directories.dealerSites.getItems();
                dealerSite = dealerSites[0];
                dealerSite.publicUrl = 'http://www.www.ru/34567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1';
                return dealerSite.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.publicUrl.errors).toEqual(['Значение слишком длинное. Должно быть равно 255 символам или меньше.']);
            });
        });

        it('put - сохранять изменение атрибута dealersite.isActive с true на false', function() {
            var answer = {};
            var dealerSite;

            runSync(answer, function() {
                var params = {
                    filters: [
                        { fields: ['isActive'], type: 'equal', value: true }
                    ],
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSitesLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var dealerSites = directories.dealerSites.getItems();
                expect(dealerSites.length).toBeTruthy();
                dealerSite = dealerSites[0];
                expect(dealerSite.isActive.id).toBe(true);
                dealerSite.isActive = false;
                return dealerSite.save(directories);
            });

            runSync(answer, function() {
                var savedDealerSite = answer.respond;
                return dealerSitesLoader.loadItem(savedDealerSite.id);
            });

            runs(function() {
                var savedDealerSite = answer.respond.dealerSite;
                expect(savedDealerSite.isActive.id).toEqual(dealerSite.isActive);
            });
        });

        it('put - изменять dealer, если нет записи с такой комбинацией dealer, site', function() {
            var answer = {};
            var directories = {};
            var sites;
            var dealers;
            var dealerSite;
            var freeDealerId;

            runSync(answer, function() {
                return dealerSiteStatusesLoader.loadItems();
            });

            runSync(answer, function() {
                _.assign(directories, answer.respond); 
                return sitesLoader.loadItems();
            });

            runSync(answer, function() {
                _.assign(directories, answer.respond); 
                sites = answer.respond.sites.getItems();
                var dealerQueryParams = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    },
                    fields: ['dealer_list_name']
                };
                return dealersLoader.loadItems(dealerQueryParams);
            });

            runSync(answer, function() {
                _.assign(directories, answer.respond);
                dealers = answer.respond.dealers.getItems();
                var dealersId = _.pluck(dealers, 'id');
                var params = {
                    filters: [
                        { fields: ['site'], type: 'equal', value: sites[1].id },
                        { fields: ['dealer'], type: 'in', value: dealersId }
                    ]
                };
                return dealerSitesLoader.loadItems(params).then(function(directory) {
                    var dealerSites = directory.dealerSites.getItems();
                    dealerSite = dealerSites[0];
                    var dealerSitesDealersId = _.pluck(_.pluck(dealerSites, 'dealer'), 'id');
                    return _.difference(dealersId, dealerSitesDealersId);
                });
            });

            runSync(answer, function() {
                freeDealerId = answer.respond;
                dealerSite.dealer = _.find(dealers, {id: freeDealerId[0]});
                return dealerSite.save(directories);
            });

            runSync(answer, function() {
                var savedDealerSite = answer.respond;
                return dealerSitesLoader.loadItem(savedDealerSite.id);
            });

            runs(function() {
                var savedDealerSite = answer.respond.dealerSite;
                expect(savedDealerSite.dealer.id).toEqual(freeDealerId[0]);
            });
        });

        it('put - выдавать ошибку, если такая комбинация dealer, site уже есть', function() {
            var answer = {};

            runSync(answer, function() {
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSitesLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var dealerSites = directories.dealerSites.getItems();
                var dealerSite = dealerSites[0];
                var dealerSiteCopy = dealerSites[1];
                dealerSiteCopy.dealer = dealerSite.dealer;
                dealerSiteCopy.site = dealerSite.site;
                return dealerSiteCopy.save(directories);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Validation Failed');
                expect(errorResponse.errors.children.site.errors).toEqual(['Это значение уже используется.']);
            });
        });

        it('remove - удалять dealersite', function() {
            var answer = {};
            var dealerSite;

            runSync(answer, function() {
                var params = {
                    order: {
                        order_field: 'id',
                        order_direction: 'desc'
                    }
                };
                return dealerSitesLoader.loadItems(params);
            });

            runSync(answer, function() {
                var directories = answer.respond;
                var dealerSites = directories.dealerSites.getItems();
                dealerSite = dealerSites[0];
                return dealerSite.remove();
            });

            runs(function() {
                expect(answer.respond).toEqual(null);
            });

            runSync(answer, function() {
                var savedDealerSite = answer.respond;
                return dealerSitesLoader.loadItem(dealerSite.id);
            });

            runs(function() {
                var errorResponse = answer.respond.response.data;
                expect(errorResponse.message).toEqual('Not Found');
            });
        });
    });
});

describe('user, dealer', function() {
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
});
