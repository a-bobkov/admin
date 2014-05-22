'use strict';

angular.module('SaleApp', ['ngRoute', 'max.dal.entities.sale', 'ui.bootstrap.pagination'])

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
        salesLoader.loadItems(makeQueryParams($rootScope.savedSaleListLocationSearch)).then(function(directories) {
            _.assign($scope, directories);
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
            return salesLoader.loadItems(addSaleQueryParams, directories).then(function(collection) {
                $scope.sales_add = collection.sales;
            });
        });
    };

    $scope.isAddable = function(sale) {
        return $scope.sales_add && !_.find($scope.sales_add.getItems(), {parentId: sale.cardId});
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
            isActive: $scope.saleStatuses.get(!!ls.isActive),
            type: $scope.saleTypes.get(ls.type),
            archive: ls.archive
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
        console.log(ls.isActive);
            if (ls.isActive === true || ls.isActive === false) {
                queryParams.filters.push({
                    fields: ['isActive'],
                    type: 'equal',
                    value: ls.isActive
                });
            }
        console.log(queryParams.filters);
            if (_.isEmpty(ls.type)) {
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
});