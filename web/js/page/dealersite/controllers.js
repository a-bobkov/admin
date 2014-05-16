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
            if (ls.isActive !== undefined) {
                queryParams.filters.push({
                    type: 'equal',
                    fields: ['isActive'],
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
    .when('/dealersitenew', {
        templateUrl: 'template/page/dealersite/edit.html',
        controller: 'DealerSiteEditCtrl',
        resolve: {
            data: function(dealerSiteStatusesLoader) {
                return dealerSiteStatusesLoader.loadItems();
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
        {id: "id", name: "Код"},
        {id: "dealer", name: "Салон"},
        {id: "site", name: "Сайт"},
        {id: "externalId", name: "Код на сайте"},
        {id: "publicUrl", name: "Страница на сайте"},
        {id: "isActive", name: "Статус"}
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
        isActive: _.find($scope.dealerSiteStatuses, {id: getFilterFieldsValue(params.filters, ['isActive'])})
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

        if (dealerSite.isActive.id === true) {
            confirmMessage = 'Блокировать регистрацию';
            noticeMessage = 'Блокирована регистрация';
            newStatus = _.find($scope.dealerSiteStatuses, {id: false});
        } else {
            confirmMessage = 'Разблокировать регистрацию';
            noticeMessage = 'Разблокирована регистрация';
            newStatus = _.find($scope.dealerSiteStatuses, {id: true});
        }
        var dealerSiteInfo = ' салона "' + dealerSite.dealer.companyName + '" на сайте "' + dealerSite.site.name + '"';
        if (confirm(confirmMessage + dealerSiteInfo + '?')) {
            var dealerSiteEdited = new DealerSite;
            angular.extend(dealerSiteEdited, dealerSite);
            dealerSiteEdited.isActive = newStatus;
            dealerSiteEdited.save(data).then(function() {
                $scope.savedDealerSiteListNotice = noticeMessage + dealerSiteInfo;
                $location.path('/dealersitelist?');
            });
        }
    };

    $scope.removeDealerSite = function(dealerSite) {
        var confirmMessage,
            noticeMessage;

        confirmMessage = 'Вы действительно хотите отменить экспорт';
        noticeMessage = 'Удалена регистрация '+ dealerSite.id;
        var dealerSiteInfo = ' салона "' + dealerSite.dealer.companyName + '" на сайт "' + dealerSite.site.name + '"';
        if (confirm(confirmMessage + dealerSiteInfo + '?')) {
            dealerSite.remove().then(function() {
                $rootScope.savedDealerSiteListNotice = noticeMessage + dealerSiteInfo;
                $location.path('/dealersitelist?');
            });
        }
    };
    
    $scope.referenceText = function(dealerSite) {
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
    DealerSite, dealersLoader, sitesLoader, DealerSiteLogin, dealerSiteLoginsLoader) {

    _.assign($scope, data);
    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;

    $scope.requiredFields = {
        1:  {                   publicUrl: true },
        2:  {                   publicUrl: true, site: true },
        4:  { externalId: true, publicUrl: true },
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

    if (data.dealerSite) {
        makeDealerSiteCopy();
    } else {
        makeDealerSiteNew();
    }

    $window.scrollTo(0,0);

    function makeDealerSiteCopy() {
        $scope.actionName = "Изменение";
        $scope.dealerSiteEdited = new DealerSite;
        angular.extend($scope.dealerSiteEdited, $scope.dealerSite);
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
            if (dealerSiteLogin.type === 'site') {
                _.assign($scope.dealerSiteLoginsEdited.site, dealerSiteLogin);
            } else if (dealerSiteLogin.type === 'ftp') {
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
            var dealerSiteLoginQueryParams = {
                filters: [
                    { type: 'equal', fields: ['dealer'], value: $scope.dealerSiteEdited.dealer.id },
                    { type: 'equal', fields: ['site'], value: $scope.dealerSiteEdited.site.id }
                ]
            };
            dealerSiteLoginsLoader.loadItems(dealerSiteLoginQueryParams, $scope).then(function(directory) {
                $scope.dealerSiteLogins = directory.dealerSiteLogins;
                makeDealerSiteLoginsCopy();
            });
        }
    }

    function makeDealerSiteNew() {
        $scope.actionName = "Создание";
        $scope.dealerSiteEdited = new DealerSite;
        $scope.dealerSiteEdited.isActive = _.find($scope.dealerSiteStatuses.getItems(), {id: true});
    }

    $scope.$watch('[dealerSiteEdited.dealer, dealerSiteEdited.site]', onDealerSiteChange, true);

    function saveDealerSiteEdited() {
        $scope.dealerSiteEdited.save($scope).then(function(dealerSite) {
            $rootScope.savedDealerSiteListNotice = 'Сохранено разрешение с идентификатором: ' + dealerSite.id;
        });
    }

    function saveRemoveDealerSiteLogin(dealerSiteLogin) {
        if (dealerSiteLogin.login) {
            dealerSiteLogin.save($scope).then(function(dealerSiteLogin) {
                $rootScope.savedDealerSiteListNotice += '.\nСохранён доступ с идентификатором: ' + dealerSiteLogin.id;
            });
        } else if (dealerSiteLogin.id) {
            dealerSiteLogin.remove($scope).then(function() {
                $rootScope.savedDealerSiteListNotice += '.\nУдалён доступ с идентификатором: ' + dealerSiteLogin.id;
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
        })
    };
})

.directive('uiDealerSiteUnique', function(dealerSitesLoader){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {

            function validateDealerSiteUnique(newValue) {
                if (newValue.dealer && newValue.site) {
                    var dealerSitesQueryParams = {
                        filters: [
                            { type: 'equal', fields: ['dealer'], value: newValue.dealer.id },
                            { type: 'equal', fields: ['site'], value: newValue.site.id }
                        ]
                    };
                    dealerSitesLoader.loadItems(dealerSitesQueryParams).then(function(directory) {
                        var doubleItem = _.find(directory.dealerSites.getItems(), function(dealerSite) {
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