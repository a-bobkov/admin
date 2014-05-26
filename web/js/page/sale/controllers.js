'use strict';

angular.module('SaleApp', ['ngRoute', 'max.dal.entities.sale', 'max.dal.entities.dealertariff', 'ui.bootstrap.pagination'])

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
                    value: $filter('date')(new Date(), 'yyyy-MM-dd')
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

.controller('SaleEditCtrl', function($scope, $rootScope, $location, $window, data, Sale,
    dealersLoader, sitesLoader, tariffsLoader, dealerTariffsLoader) {

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
                            $scope.saleEdited.tariff = newDirectories.dealerTariffs.getItems()[0].tariff;
                        } else {
                            $scope.saleEdited.tariff = null;
                        }
                    });
                });
            } else {
                $scope.saleEdited.tariff = null;
            }
        }
    };

    $scope.$watch('[saleEdited.dealer, saleEdited.site]', $scope.onSiteChange, true);
})
;