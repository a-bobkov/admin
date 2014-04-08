'use strict';

angular.module('DealerSiteApp', ['ngRoute', 'max.dal.entities.dealersite', 'ui.bootstrap.pagination', 'ui.multicombo'])

.config(['$routeProvider', function($routeProvider) {

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
            if (ls.dealers) {
                queryParams.filters.push({
                    type: 'in',
                    fields: ['dealer'],
                    value: ls.dealers.split(';')
                });
            }
            if (ls.sites) {
                queryParams.filters.push({
                    type: 'in',
                    fields: ['site'],
                    value: ls.sites.split(';')
                });
            }
            if (ls.status) {
                queryParams.filters.push({
                    type: 'equal',
                    fields: ['status'],
                    value: ls.status
                });
            }
            return queryParams;
        } else {
            return {
                order: {
                    order_field: 'id',
                    order_direction: 'desc'
                },
                pager: {
                    per_page: 25
                }
            }
        }
    }

    $routeProvider
    .when('/dealersitelist', {
        templateUrl: 'template/page/dealersite/list.html',
        controller: 'DealerSiteListCtrl',
        resolve: {
            data: function(dealerSitesLoader, $location, $rootScope) {
                if (!_.isEmpty($rootScope.savedDealerSiteListLocationSearch)) {
                    $location.search($rootScope.savedDealerSiteListLocationSearch);
                }
                return dealerSitesLoader.loadItems(makeQueryParams($rootScope.savedDealerSiteListLocationSearch));
            }
        }
    })
    .when('/dealersites/:id/edit', {
        templateUrl: 'template/page/dealersite/edit.html',
        controller: 'DealerSiteEditCtrl',
        resolve: {
            data: function(dealerSitesLoader, $location) {
                var id = parseInt($location.$$path.replace(/^\/dealersites\/(?:([^\/]+))\/edit$/,'$1'));
                return dealerSitesLoader.loadItem(id);
            }
        }
    })
    .otherwise({
        redirectTo: '/dealersitelist'
    });
}])

.controller('DealerSiteListCtrl', function($scope, $rootScope, $filter, $location, $window, $timeout, data, DealerSite, dealersLoader, sitesLoader) {
    _.forOwn(data, function(collection, key) {
        $scope[key] = collection.getItems();
    });
    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;

    if ($rootScope.savedDealerSiteListNotice) {
        $scope.savedDealerSiteListNotice = $rootScope.savedDealerSiteListNotice;
        delete $rootScope.savedDealerSiteListNotice;
    }

    var filteredDealerSites = [];

    $scope.clickNewDealerSite = function() {
        $location.path('/dealersitenew');
    }

    $scope.setPatternsDefault = function() {
        $scope.patterns = {
            dealers: [],
            sites: [],
            status: null
        };
    }

    $scope.onPatternChange = function (newValue, oldValue) {
        if (newValue !== oldValue) {
            onSortingChange();
        }
    };

    $scope.$watch('patterns', $scope.onPatternChange, true);

    $scope.sortableColumns = [
        {id: "id", name: "Код записи"},
        {id: "dealer.id", name: "Код салона"},
        {id: "dealer.name", name: "Название салона"},
        {id: "site.name", name: "Сайт"},
        {id: "external_id", name: "Код на сайте"},
        {id: "public_url", name: "Страница на сайте"},
        {id: "status.name", name: "Статус"}
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
        $rootScope.savedDealerSiteListSorting = $scope.sorting;
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
        $rootScope.savedDealerSiteListLocationSearch = toUrlSearch(searchParams);
        $location.path('/dealersitelist?');
    }

    function getFilterFieldsValue(filters, fields) {
        var filter = _.find(filters, {fields: fields});
        if (filter) {
            return filter.value;
        }
    }

    var params = data.dealerSites.getParams();
    $scope.patterns = {
        dealers: _.invoke(getFilterFieldsValue(params.filters, ['dealer']), function() {
                return _.find($scope.dealers, {id: _.parseInt(this)})
            }),
        sites: _.invoke(getFilterFieldsValue(params.filters, ['site']), function() {
                return _.find($scope.sites, {id: _.parseInt(this)})
            }),
        status: _.find($scope.dealerSiteStatuses, {id: getFilterFieldsValue(params.filters, ['status'])})
    };
    $scope.sorting = {
        column: params.order.field,
        reverse: (params.order.direction === 'desc')
    };
    $scope.paging = {
        currentPage: _.parseInt(params.pager.page),
        itemsPerPage: _.parseInt(params.pager.per_page)
    };
    $scope.totalItems = _.parseInt(params.pager.total);
    $scope.maxSizePaging = 9;

    function toUrlSearch(value) {
        if (_.isArray(value)) {
            return _.invoke(value, function() {
                return toUrlSearch(this);
            }).join(';');
        } else if (_.isObject(value)) {
            if (value.id !== undefined) {
                return value.id;
            } else {
                return _.mapValues(value, function(value) {
                    return toUrlSearch(value);
                });
            }
        } else {
            return value;
        }
    }

    $scope.$on('$routeChangeStart', function() {
        $rootScope.savedDealerSiteListFocus = document.activeElement.id;
    });

    $timeout(function() {   // ожидание построения DOM
        var top = document.getElementById('DealerSiteListAddDealerSiteUp').getBoundingClientRect().top;
        if (top < 0) {
            window.scrollBy(0, top);
        }
        if ($rootScope.savedDealerSiteListFocus) {
            document.getElementById($rootScope.savedDealerSiteListFocus).focus();
        }
    });

    $scope.toggleDealerSiteStatus = function(dealerSite) {
        var confirmMessage,
            noticeMessage,
            newStatus;

        if (dealerSite.status === 'active') {
            confirmMessage = 'Блокировать регистрацию';
            noticeMessage = 'Блокирована регистрация';
            newStatus = 'blocked';
        } else {
            confirmMessage = 'Разблокировать регистрацию';
            noticeMessage = 'Разблокирована регистрация';
            newStatus = 'active';
        }
        var dealerSiteInfo = ' салона "' + dealerSite.dealer.company_name + '" на сайте "' + dealerSite.site.name + '"';
        if (confirm(confirmMessage + dealerSiteInfo + '?')) {
            var dealerSiteEdited = new DealerSite;
            angular.extend(dealerSiteEdited, dealerSite);
            dealerSiteEdited.status = newStatus;
            dealerSiteEdited.save().then(function() {
                $scope.savedDealerSiteListNotice = noticeMessage + dealerSiteInfo;
            });
        }
    };

    $scope.removeDealerSite = function(dealerSite) {
        var confirmMessage,
            noticeMessage;

        confirmMessage = 'Удалить регистрацию';
        noticeMessage = 'Удалена регистрация';
        var dealerSiteInfo = ' салона "' + dealerSite.dealer.company_name + '" на сайте "' + dealerSite.site.name + '"';
        if (confirm(confirmMessage + dealerSiteInfo + '?')) {
            dealerSite.remove().then(function() {
                // dealerSites.getAll().then(function(dealerSitesArray) {
                //     $scope.dealerSites = dealerSitesArray;
                //     $scope.savedDealerSiteListNotice = noticeMessage + dealerSiteInfo;
                //     $scope.onPatternChange();
                // });
            });
        }
    };

    $scope.editDealerSite = function(dealerSite) {
        if (dealerSite.status === 'active') {
            $location.path('/dealersites/' + dealerSite.id + '/edit');
        }
    };
});