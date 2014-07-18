'use strict';

angular.module('DealerSiteApp', ['ngRoute', 'ui.bootstrap.pagination', 'ui.multicombo',
    'max.dal.entities.dealersite', 
    'max.dal.entities.dealersitelogin' 
])

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
                    fields: ['dealer'],
                    type: 'in',
                    value: ls.dealers.split(';')
                });
            }
            if (ls.sites) {
                queryParams.filters.push({
                    fields: ['site'],
                    type: 'in',
                    value: ls.sites.split(';')
                });
            }
            if (ls.isActive !== undefined) {
                queryParams.filters.push({
                    fields: ['isActive'],
                    type: 'equal',
                    value: ls.isActive
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

    function getFilterFieldsValue(filters, fields) {
        var filter = _.find(filters, {fields: fields});
        if (filter) {
            return filter.value;
        }
    }

    $routeProvider
    .when('/dealersitelist', {
        templateUrl: 'template/page/dealersite/list.html',
        controller: 'DealerSiteListCtrl',
        resolve: {
            data: function(dealerSitesLoader, dealersLoader, sitesLoader, Construction, $q, $location, $rootScope) {
                if (!_.isEmpty($rootScope.savedDealerSiteListLocationSearch)) {
                    $location.search($rootScope.savedDealerSiteListLocationSearch);
                }
                return dealerSitesLoader.loadItems(makeQueryParams($rootScope.savedDealerSiteListLocationSearch)).then(function(dealerSites) {
                    var construction = new Construction({dealerSites: dealerSites});

                    var queryParams = dealerSites.getParams();
                    var dealerIds = getFilterFieldsValue(queryParams && queryParams.filters, ['dealer']);
                    if (_.isEmpty(dealerIds)) {
                        dealerIds = _.pluck(_.pluck(dealerSites.getItems(), 'dealer'), 'id');
                    }
                    var dealerQueryParams = {
                        filters: [
                            { type: 'in', fields: ['id'], value: dealerIds }    // user.id
                        ],
                        fields: [ 'dealer_list_name' ]
                    };

                    var siteIds = getFilterFieldsValue(queryParams && queryParams.filters, ['site']);
                    if (_.isEmpty(siteIds)) {
                        siteIds = _.pluck(_.pluck(dealerSites.getItems(), 'site'), 'id');
                    }
                    var siteQueryParams = {
                        filters: [
                            { type: 'in', fields: ['id'], value: siteIds }
                        ]
                    };

                    return $q.all({
                        dealers: dealersLoader.loadItems(dealerQueryParams),
                        sites: sitesLoader.loadItems(siteQueryParams)
                    }).then(function(directories) {
                        _.assign(construction, directories);
                        return construction.resolveRefs();
                    });
                });
            }
        }
    })
    .when('/dealersites/:id/edit', {
        templateUrl: 'template/page/dealersite/edit.html',
        controller: 'DealerSiteEditCtrl',
        resolve: {
            data: function(dealerSitesLoader, dealersLoader, sitesLoader, Construction, $location, $q) {
                var id = parseInt($location.$$path.replace(/^\/dealersites\/(?:([^\/]+))\/edit$/,'$1'));
                return dealerSitesLoader.loadItem(id).then(function(dealerSite) {
                    var construction = new Construction({dealerSite: dealerSite});
                    return $q.all({
                        dealers: dealersLoader.loadItems({
                            filters: [
                                { type: 'equal', fields: ['id'], value: dealerSite.dealer.id }  // user.id
                            ],
                            fields: [ 'dealer_list_name' ]
                        }),
                        sites: sitesLoader.loadItems({
                            filters: [
                                { type: 'equal', fields: ['id'], value: dealerSite.site.id }
                            ]
                        })
                    }).then(function(directories) {
                        _.assign(construction, directories);
                        return construction.resolveRefs();
                    });
                });
            }
        }
    })
    .when('/dealersitenew', {
        templateUrl: 'template/page/dealersite/edit.html',
        controller: 'DealerSiteEditCtrl',
        resolve: {
            data: function($q) {
                return $q.when();
            }
        }
    })
    .otherwise({
        redirectTo: '/dealersitelist'
    });
}])

.controller('DealerSiteListCtrl', function($scope, $rootScope, $filter, $location, $window, $timeout, data, 
    DealerSite, dealerSiteStatuses, dealersLoader, sitesLoader) {

    _.assign($scope, data);
    $scope.dealerSiteStatuses = dealerSiteStatuses;
    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;

    if ($rootScope.savedDealerSiteListNotice) {
        $scope.savedDealerSiteListNotice = $rootScope.savedDealerSiteListNotice;
        delete $rootScope.savedDealerSiteListNotice;
    }

    $scope.clickNewDealerSite = function() {
        $location.path('/dealersitenew');
    }

    $scope.setPatternsDefault = function() {
        $scope.patterns = {
            dealers: [],
            sites: [],
            isActive: null
        };
    }

    $scope.onPatternChange = function (newValue, oldValue) {
        if (newValue !== oldValue) {
            onSortingChange();
        }
    };

    $scope.$watch('patterns', $scope.onPatternChange, true);

    $scope.sortableColumns = [
        {id: "dealer", name: "Салон", width: '30%'},
        {id: "site", name: "Сайт", width: '20%'},
        {id: "externalId", name: "Код на сайте", width: '10%'},
        {id: "publicUrl", name: "Страница на сайте", width: '12.5%'},
        {id: "isActive", name: "Статус", width: '12.5%'}
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

    var params = $scope.dealerSites.getParams();
    $scope.patterns = {
        dealers: _.invoke(getFilterFieldsValue(params.filters, ['dealer']), function() {
                return $scope.dealers.get(_.parseInt(this));
            }),
        sites: _.invoke(getFilterFieldsValue(params.filters, ['site']), function() {
                return $scope.sites.get(_.parseInt(this));
            }),
        isActive: dealerSiteStatuses.get(getFilterFieldsValue(params.filters, ['isActive']))
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
    });

    $scope.toggleDealerSiteStatus = function(dealerSite) {
        var confirmMessage,
            noticeMessage,
            newStatus;

        if (dealerSite.isActive.id === true) {
            confirmMessage = 'Блокировать регистрацию ';
            noticeMessage = 'Блокирована регистрация ';
            newStatus = dealerSiteStatuses.get(false);
        } else {
            confirmMessage = 'Разблокировать регистрацию ';
            noticeMessage = 'Разблокирована регистрация ';
            newStatus = dealerSiteStatuses.get(true);
        }
        if (confirm(confirmMessage + dealerSite.name() + '?')) {
            var dealerSiteEdited = new DealerSite;
            angular.extend(dealerSiteEdited, dealerSite);
            dealerSiteEdited.isActive = newStatus;
            dealerSiteEdited.save(data).then(function() {
                $rootScope.savedDealerSiteListNotice = noticeMessage + dealerSite.name();
                $location.path('/dealersitelist?');
            });
        }
    };

    $scope.removeDealerSite = function(dealerSite) {
        var confirmMessage,
            noticeMessage;

        confirmMessage = 'Вы действительно хотите отменить экспорт ';
        noticeMessage = 'Удалена регистрация ';
        if (confirm(confirmMessage + dealerSite.name() + '?')) {
            dealerSite.remove().then(function() {
                $rootScope.savedDealerSiteListNotice = noticeMessage + dealerSite.name();
                $location.path('/dealersitelist?');
            });
        }
    };
    
    $scope.publicUrlText = function(dealerSite) {
        if (dealerSite.publicUrl) {
            return 'Ссылка';
        }
    }

    $scope.editDealerSite = function(dealerSite) {
        if (dealerSite.isActive.id === true) {
            $location.path('/dealersites/' + dealerSite.id + '/edit');
        }
    };
})

.controller('DealerSiteEditCtrl', function($scope, $rootScope, $location, $window, $q, data, 
    DealerSite, dealerSiteStatuses, dealersLoader, sitesLoader, DealerSiteLogin, dealerSiteLoginTypes, dealerSiteLoginsLoader) {

    _.assign($scope, data);
    $scope.dealerSiteStatuses = dealerSiteStatuses;
    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;

    $scope.requiredFields = {
        1:  {                   publicUrl: true },
        2:  {                   publicUrl: true, site: true },
        4:  { externalId: true },
        5:  { externalId: true, publicUrl: true, site: true },
        6:  { externalId: true, publicUrl: true, site: true, ftp: true },
        7:  {                   publicUrl: true },
        9:  {                   publicUrl: true },
        11: {                   publicUrl: true },
        13: { externalId: true },
        14: {                                    site: true },
        16: {                   publicUrl: true },
        17: {                   publicUrl: true }
    };

    if ($scope.dealerSite) {
        makeDealerSiteCopy();
    } else {
        makeDealerSiteNew();
    }

    $window.scrollTo(0,0);

    function makeDealerSiteCopy() {
        $scope.actionName = "Изменение";
        $scope.dealerSiteEdited = new DealerSite;
        _.assign($scope.dealerSiteEdited, $scope.dealerSite);
    }

    function makeDealerSiteLoginsCopy() {
        _.assign($scope.dealerSiteLoginsEdited.site, {
            dealer: $scope.dealerSiteEdited.dealer,
            site: $scope.dealerSiteEdited.site
        });
        _.assign($scope.dealerSiteLoginsEdited.ftp, {
            dealer: $scope.dealerSiteEdited.dealer,
            site: $scope.dealerSiteEdited.site
        });
        _.forEach($scope.dealerSiteLogins.getItems(), function(dealerSiteLogin) {
            if (dealerSiteLogin.type.id === 'site') {
                _.assign($scope.dealerSiteLoginsEdited.site, dealerSiteLogin);
            } else if (dealerSiteLogin.type.id === 'ftp') {
                _.assign($scope.dealerSiteLoginsEdited.ftp, dealerSiteLogin);
            }
        });
    }

    function onDealerSiteChange() {
        $scope.dealerSiteLoginsEdited = {
            site: new DealerSiteLogin({type: 'site'}),
            ftp: new DealerSiteLogin({type: 'ftp'})
        };
        if ($scope.dealerSiteEdited.dealer && $scope.dealerSiteEdited.site) {
            dealerSiteLoginsLoader.loadItems({
                filters: [
                    { type: 'equal', fields: ['dealer'], value: $scope.dealerSiteEdited.dealer.id },
                    { type: 'equal', fields: ['site'], value: $scope.dealerSiteEdited.site.id }
                ]
            }, $scope).then(function(dealerSiteLogins) {
                $scope.dealerSiteLogins = dealerSiteLogins;
                makeDealerSiteLoginsCopy();
            });
        }
    }

    function makeDealerSiteNew() {
        $scope.actionName = "Создание";
        $scope.dealerSiteEdited = new DealerSite;
        $scope.dealerSiteEdited.isActive = dealerSiteStatuses.get(true);
    }

    $scope.$watch('[dealerSiteEdited.dealer, dealerSiteEdited.site]', onDealerSiteChange, true);

    function saveDealerSiteEdited() {
        return $scope.dealerSiteEdited.save($scope).then(function(dealerSite) {
            $rootScope.savedDealerSiteListNotice = 'Сохранена регистрация ' + dealerSite.name();
        });
    }

    function saveRemoveDealerSiteLogin(dealerSiteLogin) {
        if (dealerSiteLogin.login) {
            dealerSiteLogin.loginError = false;
            return dealerSiteLogin.save($scope).then(function(dealerSiteLogin) {
                // $rootScope.savedDealerSiteListNotice += '.\nСохранён доступ ' + dealerSiteLogin.name();
            });
        } else if (dealerSiteLogin.id) {
            return dealerSiteLogin.remove($scope).then(function() {
                // $rootScope.savedDealerSiteListNotice += '.\nУдалён доступ ' + dealerSiteLogin.name();
            });
        }
    }

    $scope.saveDealerSiteEditedWithLogins = function() {
        $q.all([
            saveDealerSiteEdited(),
            saveRemoveDealerSiteLogin($scope.dealerSiteLoginsEdited.site),
            saveRemoveDealerSiteLogin($scope.dealerSiteLoginsEdited.ftp)
        ]).then(function() {
            $location.path('/dealersitelist');
        });
    };
})

.directive('uiDealerSiteUnique', function(dealerSitesLoader){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {

            function validateDealerSiteUnique(newValue) {
                if (newValue.dealer && newValue.site) {
                    dealerSitesLoader.loadItems({
                        filters: [
                            { type: 'equal', fields: ['dealer'], value: newValue.dealer.id },
                            { type: 'equal', fields: ['site'], value: newValue.site.id }
                        ]
                    }).then(function(dealerSites) {
                        var doubleItem = _.find(dealerSites.getItems(), function(dealerSite) {
                            return (dealerSite.id !== newValue.id);
                        });
                        ctrl.$setValidity('unique', doubleItem === undefined);
                    });
                } else {
                    ctrl.$setValidity('unique', true);
                }
            }

            scope.$watch(attrs.uiDealerSiteUnique + '.dealer', function () {
                validateDealerSiteUnique(scope.$eval(attrs.uiDealerSiteUnique));
            });

            scope.$watch(attrs.uiDealerSiteUnique +'.site', function () {
                validateDealerSiteUnique(scope.$eval(attrs.uiDealerSiteUnique));
            });
        }
    };
});