'use strict';

angular.module('SaleApp', ['ngRoute', 'ui.bootstrap.pagination', 'ngInputDate',
        'max.dal.entities.sale',
        'max.dal.entities.dealertariff',
        'max.dal.entities.tariffrate'
    ])

.config(['$routeProvider', function($routeProvider) {

    $routeProvider
    .when('/salelist', {
        templateUrl: 'template/page/sale/list.html',
        controller: 'SaleListCtrl',
        reloadOnSearch: false,
        resolve: {
            data: function(saleStatusesLoader, saleTypesLoader, dealersLoader, sitesLoader, $location, $q) {
                var toResolve = {
                    saleTypes: saleTypesLoader.loadItems().then(function(respond) {
                        return respond.saleTypes;
                    }),
                    saleStatuses: saleStatusesLoader.loadItems().then(function(respond) {
                        return respond.saleStatuses;
                    })
                };
                var ls = $location.search();
                if (!_.isEmpty(ls.dealers)) {
                    var dealerQueryParams = {
                        filters: [
                            { fields: ['id'], type: 'in', value: ls.dealers.split(';') }
                        ],
                        fields: ['dealer_list_name']
                    };
                    toResolve.dealers = dealersLoader.loadItems(dealerQueryParams).then(function(respond) {
                        return respond.dealers;
                    });
                }
                if (!_.isEmpty(ls.sites)) {
                    var siteQueryParams = {
                        filters: [
                            { fields: ['id'], type: 'in', value: ls.sites.split(';') }
                        ]
                    };
                    toResolve.sites = sitesLoader.loadItems(siteQueryParams).then(function(respond) {
                        return respond.sites;
                    });
                }
                return $q.all(toResolve);
            }
        }
    })
    .when('/sales/:id/edit', {
        templateUrl: 'template/page/sale/edit.html',
        controller: 'SaleEditCtrl',
        resolve: {
            data: function(saleStatusesLoader, saleTypesLoader, salesLoader, $location, $q) {
                var toResolve = {
                    saleTypes: saleTypesLoader.loadItems().then(function(respond) {
                        return respond.saleTypes;
                    }),
                    saleStatuses: saleStatusesLoader.loadItems().then(function(respond) {
                        return respond.saleStatuses;
                    })
                };
                return $q.all(toResolve).then(function(directories) {
                    var id = parseInt($location.$$path.replace(/^\/sales\/(?:([^\/]+))\/edit$/,'$1'));
                    return salesLoader.loadItem(id, directories).then(function(directory) {
                        return _.assign(directories, directory);
                    });
                });
            }
        }
    });
}])

.controller('SaleListCtrl', function($scope, $rootScope, $filter, $location, $window, $timeout, data, 
    salesLoader, dealersLoader, sitesLoader) {

    _.assign($scope, data);
    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;

    if ($rootScope.savedSaleListNotice) {
        $scope.savedSaleListNotice = $rootScope.savedSaleListNotice;
        delete $rootScope.savedSaleListNotice;
    }

    $scope.clickNewSale = function() {
        $location.path('/salenew');
    }

    $scope.setPatternsDefault = function() {
        $scope.patterns = {
            dealers: [],
            sites: [],
            isActive: null,
            type: null,
            archive: false
        };
    }

    $scope.onPatternChange = function (newValue, oldValue) {
        onSortingChange();
    };

    $scope.$watch('patterns', $scope.onPatternChange, true);

    $scope.sortableColumns = [
        {id: "id", name: "Код", width: '7.5%'},
        {id: "type", name: "Тип", width: '5%'},
        {id: "date", name: "Дата", width: '7.5%'},
        {id: "dealer", name: "Салон", width: '20%'},
        {id: "site", name: "Сайт", width: '15%'},
        {id: "activeFrom", name: "С", width: '10%'},
        {id: "activeTo", name: "По", width: '10%'},
        {id: "isActive", name: "Статус", width: '10%'}
    ];

    $scope.sortingMark = function(column) {
        if (column === $scope.sorting.column) {
            return ($scope.sorting.reverse) ? ' ↑': ' ↓';
        }
        return '\u00A0\u00A0\u00A0';
    }

    $scope.changeSorting = function(column) {
        if (column === $scope.sorting.column) {
            $scope.sorting.reverse = !$scope.sorting.reverse;
        } else {
            $scope.sorting.column = column;
            $scope.sorting.reverse = false;
        }
        onSortingChange();
    }

    var onSortingChange = function() {
        $scope.onSelectPage(1);
    }

    $scope.onSelectPage = function(page) {
        $scope.paging.currentPage = page;

        var searchParams = _.pick(_.extend({}, $scope.patterns, $scope.sorting, $scope.paging), function(value) {
            return value;
        });
        $rootScope.savedSaleListLocationSearch = toLocationSearch(searchParams);
        $location.search($rootScope.savedSaleListLocationSearch);

        var queryParams = makeQueryParams($rootScope.savedSaleListLocationSearch);
        var staticDirectories = _.pick($scope, ['saleTypes', 'saleStatuses']);
        salesLoader.loadItems(queryParams, staticDirectories).then(function(newDirectories) {
            _.assign($scope, newDirectories);
            $scope.totalItems = $scope.sales.getParams().pager.total;
            var topSaleList = document.getElementById('SaleListAddSaleUp').getBoundingClientRect().top;
            if (topSaleList < 0) {
                window.scrollBy(0, topSaleList);
            }

            var cards = _.filter($scope.sales.getItems(), function(sale) {
                return sale.isCard();
            });
            var cardIds = _.pluck(cards, 'cardId');
            var addSaleQueryParams = {
                filters: [
                    { fields: ['type'], type: 'equal', value: 'addcard' },
                    { fields: ['parentId'], type: 'in', value: cardIds }
                ]
            };
            var directories = _.assign({}, staticDirectories, _.pick(newDirectories, ['dealers', 'sites']));
            return salesLoader.loadItems(addSaleQueryParams, directories).then(function(collection) {
                $scope.sales_add = collection.sales;
            });
        });
    };

    $scope.isAddable = function(sale) {
        return sale.isCard() && $scope.sales_add && !_.find($scope.sales_add.getItems(), {parentId: sale.cardId});
    }

    var ls = $location.search();
    if (_.isEmpty(ls)) {
        ls =  $rootScope.savedSaleListLocationSearch;
    }
    if (_.size(ls)) {
        $scope.patterns = {
            dealers: ls.dealers && _.invoke(ls.dealers.split(';'), function() {
                return $scope.dealers.get(_.parseInt(this));
            }),
            sites: ls.sites && _.invoke(ls.sites.split(';'), function() {
                return $scope.sites.get(_.parseInt(this));
            }),
            isActive: $scope.saleStatuses.get((ls.isActive === 'true') ? true : (ls.isActive === 'false') ? false : null),
            type: $scope.saleTypes.get(ls.type),
            archive: !!ls.archive
        };
        $scope.sorting = {
            column: ls.column,
            reverse: !!ls.reverse
        };
        $scope.paging = {
            currentPage: _.parseInt(ls.currentPage),
            itemsPerPage: _.parseInt(ls.itemsPerPage)
        };
    } else {
        $scope.setPatternsDefault();
        $scope.sorting = {
            column: 'id',
            reverse: false
        };
        $scope.paging = {
            itemsPerPage: 25
        };
    }
    $scope.maxSizePaging = 9;

    function makeQueryParams(ls) {
        if (_.size(ls)) {
            var queryParams = {
                filters: [],
                order: {
                    order_field: ls.column,
                    order_direction: ls.reverse ? 'desc': 'asc'
                },
                pager: {
                    page: ls.currentPage,
                    per_page: ls.itemsPerPage
                }
            };
            if (!_.isEmpty(ls.dealers)) {
                queryParams.filters.push({
                    fields: ['dealer'],
                    type: 'in',
                    value: ls.dealers.split(';')
                });
            }
            if (!_.isEmpty(ls.sites)) {
                queryParams.filters.push({
                    fields: ['site'],
                    type: 'in',
                    value: ls.sites.split(';')
                });
            }
            if (ls.isActive === 'true' || ls.isActive === 'false') {
                queryParams.filters.push({
                    fields: ['isActive'],
                    type: 'equal',
                    value: (ls.isActive === 'true') ? true : false
                });
            }
            if (!_.isEmpty(ls.type)) {
                queryParams.filters.push({
                    fields: ['type'],
                    type: 'equal',
                    value: ls.type
                });
            }
            if (!ls.archive) {
                queryParams.filters.push({
                    fields: ['activeTo'],
                    type: 'greaterOrEqual',
                    value: new Date().toISOString().slice(0, 10)
                });
            }
            return queryParams;
        } else {
            return {
                order: {
                    order_field: 'id'
                },
                pager: {
                    per_page: 25
                }
            }
        }
    }

    function toLocationSearch(value) {
        if (_.isArray(value)) {
            return _.invoke(value, function() {
                return toLocationSearch(this);
            }).join(';');
        } else if (_.isObject(value)) {
            if (value.id !== undefined) {
                return toLocationSearch(value.id);
            } else {
                return _.mapValues(value, function(value) {
                    return toLocationSearch(value);
                });
            }
        } else {
            return String(value);
        }
    }

    $scope.editSale = function(sale) {
        $location.search('');
        $location.path('/sales/' + sale.id + '/edit');
    };
})

.controller('SaleEditCtrl', function($scope, $rootScope, $location, $window, $filter, data, Sale,
    dealersLoader, sitesLoader, salesLoader, tariffsLoader, usersLoader, dealerTariffsLoader, tariffRatesLoader) {

    _.assign($scope, data);
    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;

    if ($scope.sale) {
        makeSaleCopy();
    } else {
        makeSaleNew();
    }

    $window.scrollTo(0,0);

    function makeSaleCopy() {
        $scope.actionName = "Изменение";
        $scope.saleEdited = new Sale;
        angular.extend($scope.saleEdited, $scope.sale);
    }

    $scope.onSiteChange = function (newValue, oldValue) {
        if (newValue !== oldValue) {
            if ($scope.saleEdited.dealer && $scope.saleEdited.site) {
                var tariffQueryParams = {
                    filters: [
                        { fields: ['site'], type: 'equal', value: $scope.saleEdited.site.id }
                    ]
                };
                var oldDirectories = _.pick($scope, 'sites');
                tariffsLoader.loadItems(tariffQueryParams, oldDirectories).then(function(newDirectories) {
                    _.assign($scope, newDirectories);
                    var dealerTariffsQueryParams = {
                        filters: [
                            { fields: ['dealer'], type: 'equal', value: $scope.saleEdited.dealer.id },
                            { fields: ['site'], type: 'equal', value: $scope.saleEdited.site.id }
                        ]
                    };
                    var directories = _.pick($scope, ['dealers', 'sites', 'tariffs']);
                    dealerTariffsLoader.loadItems(dealerTariffsQueryParams, directories).then(function(newDirectories) {
                        var dealerTariffs = newDirectories.dealerTariffs.getItems();
                        if (dealerTariffs.length) {
                            $scope.saleEdited.tariff = dealerTariffs[0].tariff;
                            $scope.saleEditTariffWarningNoDefaultTariff = false;
                        } else {
                            $scope.saleEdited.tariff = null;
                            $scope.saleEditTariffWarningNoDefaultTariff = true;
                        }
                    });
                });
            } else {
                $scope.saleEdited.tariff = null;
            }
        }
    };

    $scope.$watch('[saleEdited.dealer, saleEdited.site]', $scope.onSiteChange, true);

    function getLastActiveCard(dealer, site) {
        var queryParams = {
            filters: [
                { fields: ['dealer'], type: 'equal', value: dealer },
                { fields: ['site'], type: 'equal', value: site },
                { fields: ['type'], type: 'in', value: ['card', 'addcard'] },
                { fields: ['activeTo'], type: 'greaterOrEqual', value: $filter('date')(new Date(), 'yyyy-MM-dd') }
            ],
            order: {
                order_field: 'activeTo',
                order_direction: 'desc'
            }
        };
        var oldDirectories = _.pick($scope, ['saleTypes', 'saleStatuses', 'dealers', 'sites', 'tariffs']);
        return salesLoader.loadItems(queryParams, oldDirectories).then(function(newDirectories) {
            return newDirectories.sales.getItems()[0];
        });
    }

    function getLastDealerTariffRate(dealer, tariff) {
        return usersLoader.loadDirectories().then(function(userDirectories) {
            var queryParams = {
                filters: [
                    { fields: ['id'], type: 'equal', value: dealer.id }
                ]
            };
            return dealersLoader.loadItems(queryParams, userDirectories).then(function(dealerDirectories) {
                var dealer = dealerDirectories.dealers.getItems()[0];
                var tariffRateQueryParams = {
                    filters: [
                        { fields: ['tariff'], type: 'equal', value: tariff.id },
                        { fields: ['city'], type: 'in', value: [dealer.city.id, null] }
                    ],
                    order: {
                        order_field: 'city',
                        order_direction: 'desc'
                    }
                };
                var directories = _.pick($scope, ['tariffs']);
                _.assign(directories, userDirectories);
                return tariffRatesLoader.loadItems(tariffRateQueryParams, directories).then(function(tariffRateDirectories) {
                    var tariffRates = tariffRateDirectories.tariffRates.getItems();
                    if (tariffRates[0].city) {      // если есть тарифы для конкретного города, то учитываем только их
                        tariffRates = _.filter(tariffRates, {city: tariffRates[0].city.id});
                    }
                    tariffRates = _.sortBy(tariffRates, 'activeFrom');
                    return tariffRates[tariffRates.length - 1];    // используем тариф с позднейшей датой начала действия
                });
            });
        });
    }

    $scope.onTariffChange = function (newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if (!$scope.saleEdited.tariff) {
            return;
        }
        $scope.saleEdited.count = $scope.saleEdited.tariff.count;
        $scope.saleEdited.info = 'Оплата на сайте ' + $scope.saleEdited.site.name + ' размещения ' + $scope.saleEdited.count + ' объявлений в течение ' + $scope.saleEdited.tariff.period + ' ' + $scope.saleEdited.tariff.periodUnit;
        getLastActiveCard($scope.saleEdited.dealer, $scope.saleEdited.site).then(function(sale) {
            if (sale) {
                $scope.saleEdited.activeFrom = sale.activeTo;
            } else {
                $scope.saleEdited.activeFrom = new Date();
            }
            $scope.saleEdited.activeTo = angular.copy($scope.saleEdited.activeFrom);
            $scope.saleEdited.activeFrom.setDate($scope.saleEdited.activeFrom.getDate() + 1);
            if ($scope.saleEdited.tariff.periodUnit === 'day') {
                $scope.saleEdited.activeTo.setDate($scope.saleEdited.activeTo.getDate() + $scope.saleEdited.tariff.period);
            } else if ($scope.saleEdited.tariff.periodUnit === 'month') {
                $scope.saleEdited.activeTo.setMonth($scope.saleEdited.activeTo.getMonth() + $scope.saleEdited.tariff.period);
            }
        });
        getLastDealerTariffRate($scope.saleEdited.dealer, $scope.saleEdited.tariff).then(function(tariffRate) {
            if (tariffRate) {
                $scope.saleEdited.cardAmount = tariffRate.rate;
                $scope.saleEdited.amount = tariffRate.rate;
                $scope.saleEdited.siteAmount = tariffRate.siteRate;
            } else {
                $scope.saleEdited.cardAmount = 0;
                $scope.saleEdited.amount = 0;
                $scope.saleEdited.siteAmount = 0;
            }
        });
    };

    $scope.$watch('[saleEdited.tariff, saleEdited.dealer]', $scope.onTariffChange, true);

    $scope.saveSaleEdited = function() {
        $scope.saleEdited.save($scope).then(function(sale) {
            $rootScope.savedSaleListNotice = 'Сохранена карточка с идентификатором ' + sale.id;
            $location.path('/salelist');
        });
    };
})

.directive('uiGreater', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            _oneValue: '=ngModel',
            _otherValue: '=uiGreater'
        },
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch('[_oneValue, _otherValue]', function() {
                ctrl.$setValidity('greater', scope._oneValue > scope._otherValue);
            }, true);
        }
    };
})
;