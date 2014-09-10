'use strict';

angular.module('BillingUnionApp', ['ngRoute', 'ui.bootstrap.pagination',
    'max.dal.entities.billingunion',
    'max.dal.entities.dealer',
    'max.dal.entities.site'
])

.config(['$routeProvider', function($routeProvider) {

    $routeProvider
    .when('/billingunionlist', {
        templateUrl: 'template/page/billingunion/list.html',
        controller: 'BillingUnionListCtrl',
        reloadOnSearch: false,
        resolve: {
            data: function(sitesLoader, dealersLoader, $rootScope, $location, $q, Construction) {
                if (_.isEmpty($location.search()) && !_.isEmpty($rootScope.savedBillingUnionListLocationSearch)) {
                    $location.search($rootScope.savedBillingUnionListLocationSearch);
                }
                var ls = $location.search();
                var toResolve = {};
                if (!_.isEmpty(ls.slaveDealers)) {
                    toResolve.slaveDealers = dealersLoader.loadItems({
                        filters: [
                            { fields: ['id'], type: 'in', value: ls.slaveDealers.split(';') } // user.id
                        ],
                        fields: ['companyName', 'isActive']
                    });
                }
                if (!_.isEmpty(ls.masterDealers)) {
                    toResolve.masterDealers = dealersLoader.loadItems({
                        filters: [
                            { fields: ['id'], type: 'in', value: ls.masterDealers.split(';') } // user.id
                        ],
                        fields: ['companyName', 'isActive']
                    });
                }
                if (!_.isEmpty(ls.sites)) {
                    toResolve.sites = sitesLoader.loadItems({
                        filters: [
                            { fields: ['id'], type: 'in', value: ls.sites.split(';') }
                        ]
                    });
                }
                return $q.all(toResolve).then(function(construction) {
                    return new Construction(construction).resolveRefs();
                });
            }
        }
    })
    .when('/billingunion', {      // ?id=new - создание нового лимита; ?id=5 - редактирование лимита 5
        templateUrl: 'template/page/billingunion/edit.html',
        controller: 'BillingUnionEditCtrl',
        resolve: {
            data: function(Construction, billingUnionsLoader, sitesLoader, dealersLoader, $location, $q) {
                var ls = $location.search();
                if (ls.id === 'new') {
                    return $q.when();
                } else {
                    return billingUnionsLoader.loadItem(ls.id).then(function(billingUnion) {
                        return $q.all({
                            dealers: dealersLoader.loadItems({
                                filters: [    // user.id
                                    { fields: ['id'], type: 'in', value: [billingUnion.masterDealer.id, billingUnion.slaveDealer.id] }
                                ],
                                fields: [ 'companyName' ]
                            }),
                            sites: sitesLoader.loadItems({
                                filters: [
                                    { fields: ['id'], type: 'equal', value: billingUnion.site.id }
                                ]
                            })
                        }).then(function(collections) {
                            var construction = new Construction({billingUnion: billingUnion});
                            _.assign(construction, collections);
                            return construction.resolveRefs();
                        });
                    });
                }
            }
        }
    })
;
}])

.controller('BillingUnionListCtrl', function($scope, $rootScope, $location, $q, data, Construction,
    sitesLoader, dealersLoader, billingUnionsLoader) {

    _.assign($scope, data);
    $scope.sitesLoader = sitesLoader;
    $scope.dealersLoader = dealersLoader;

    if ($rootScope.savedBillingUnionListNotice) {
        $scope.savedBillingUnionListNotice = $rootScope.savedBillingUnionListNotice;
        delete $rootScope.savedBillingUnionListNotice;
    }

    var regexpOrder = /^([+-]?)(\w+)$/;

    $scope.setPatternsDefault = function() {
        $scope.patterns = {
            sites: [],
            masterDealers: [],
            slaveDealers: []
        };
    }

    $scope.onPatternChange = function (newValue, oldValue) {
        onSortingChange();
    };

    $scope.$watch('patterns', $scope.onPatternChange, true);

    $scope.sortableColumns = [
        {id: "site", name: "Сайт", width: '10%'},
        {id: "masterDealer", name: "Салон-плательщик", width: '40%'},
        {id: "slaveDealer", name: "Дочерний салон", width: '40%'}
    ];

    $scope.sortingColumn = function() {
        return $scope.sorting[0].replace(regexpOrder, '$2');
    }

    $scope.sortingMark = function(column) {
        if (column === $scope.sorting[0].replace(regexpOrder, '$2')) {
            return ($scope.sorting[0].replace(regexpOrder, '$1') === '-') ? ' ↑' : ' ↓';
        }
        return '   ';
    }

    $scope.changeSorting = function(column) {
        if (column === $scope.sorting[0].replace(regexpOrder, '$2')) {
            $scope.sorting[0] = (($scope.sorting[0].replace(regexpOrder, '$1') === '-') ? '' : '-') + column;
        } else {
            $scope.sorting = [column];
        }
        onSortingChange();
    }

    var onSortingChange = function() {
        $scope.onSelectPage(1);
    }

    $scope.onSelectPage = function(page) {
        if (page) {
            $scope.paging.currentPage = page;
        }

        var searchParams = _.pick(_.assign({}, $scope.patterns, $scope.paging), function(value) {
            return value;
        });
        searchParams.orders = $scope.sorting;
        $rootScope.savedBillingUnionListLocationSearch = toLocationSearch(searchParams);
        $location.search($rootScope.savedBillingUnionListLocationSearch);

        var queryParams = makeQueryParams($rootScope.savedBillingUnionListLocationSearch);
        billingUnionsLoader.loadItems(queryParams).then(function(billingUnions) {
            $scope.totalItems = billingUnions.getParams().pager.total;
            var billingUnionItems = billingUnions.getItems();
            var construction = new Construction({billingUnions: billingUnions});
            var dealerIds = _.union( _.pluck(_.pluck(billingUnionItems, 'masterDealer'), 'id'),
                                   _.pluck(_.pluck(billingUnionItems, 'slaveDealer'), 'id'));
            $q.all({
                dealers: dealersLoader.loadItems({       // user.id
                    filters: [
                        { fields: ['id'], type: 'in', value: dealerIds }
                    ],
                    fields: ['companyName', 'isActive']
                }),
                sites: sitesLoader.loadItems({
                    filters: [
                        { fields: ['id'], type: 'in', value: _.pluck(_.pluck(billingUnionItems, 'site'), 'id') }
                    ]
                })
            }).then(function(collections) {
                _.assign(construction, collections);
                _.assign($scope, construction.resolveRefs());
                viewTop('addBillingUnionUp');
            });
        });
    };

    function viewTop(elemId) {
        var topElem = document.getElementById(elemId);
        var topList = topElem && topElem.getBoundingClientRect().top;
        if (topList < 0) {
            window.scrollBy(0, topList);
        }
    }

    var ls = $location.search();
    if (_.size(ls)) {
        $scope.patterns = {
            sites: (!ls.sites) ? [] : _.invoke(ls.sites.split(';'), function() {
                return $scope.sites.get(_.parseInt(this));
            }),
            masterDealers: (!ls.masterDealers) ? [] : _.invoke(ls.masterDealers.split(';'), function() {
                return $scope.masterDealers.get(_.parseInt(this));
            }),
            slaveDealers: (!ls.slaveDealers) ? [] : _.invoke(ls.slaveDealers.split(';'), function() {
                return $scope.slaveDealers.get(_.parseInt(this));
            })
        };
        $scope.sorting = ls.orders && ls.orders.split(';') || ['masterDealer'];
        $scope.paging = {
            currentPage: _.parseInt(ls.currentPage),
            itemsPerPage: _.parseInt(ls.itemsPerPage)
        };
    } else {
        $scope.setPatternsDefault();
        $scope.sorting = ['masterDealer'];
        $scope.paging = {
            itemsPerPage: 25
        };
    }
    $scope.maxSizePaging = 9;

    function makeQueryParams(ls) {
        if (_.size(ls)) {
            var queryParams = {
                filters: [],
                orders: ls.orders.split(';'),
                pager: {
                    page: ls.currentPage,
                    per_page: ls.itemsPerPage
                }
            };
            if (!_.isEmpty(ls.sites)) {
                queryParams.filters.push({
                    fields: ['site'],
                    type: 'in',
                    value: ls.sites.split(';')
                });
            }
            if (!_.isEmpty(ls.masterDealers)) {
                queryParams.filters.push({
                    fields: ['masterDealer'],
                    type: 'in',
                    value: ls.masterDealers.split(';')
                });
            }
            if (!_.isEmpty(ls.slaveDealers)) {
                queryParams.filters.push({
                    fields: ['slaveDealer'],
                    type: 'in',
                    value: ls.slaveDealers.split(';')
                });
            }
            return queryParams;
        } else {
            return {
                orders: ['masterDealer'],
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

    $scope.newBillingUnion = function() {
        $location.path('/billingunion').search('id=new');
    };

    $scope.editBillingUnionUrl = function(billingUnion) {
        return '#/billingunion?id=' + billingUnion.id;
    };

    $scope.removeBillingUnion = function(billingUnion) {
        var confirmMessage,
            noticeMessage;

        confirmMessage = 'Вы действительно хотите удалить группировку ';
        noticeMessage = 'Удалена группировка ';
        if (confirm(confirmMessage + billingUnion.name() + '?')) {
            billingUnion.remove().then(function() {
                $scope.savedBillingUnionListNotice = noticeMessage + billingUnion.name();
                $scope.onSelectPage();
            });
        }
    };
})

.controller('BillingUnionEditCtrl', function($scope, $rootScope, $location, $window, data,
    BillingUnion, dealersLoader, sitesLoader, Dealers) {

    _.assign($scope, data);
    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;

    if ($scope.billingUnion) {
        makeBillingUnionCopy();
    } else {
        makeBillingUnionNew();
    }

    $window.scrollTo(0,0);

    function makeBillingUnionCopy() {
        $scope.actionName = "Изменение группировки салонов";
        $scope.billingUnionEdited = new BillingUnion();
        _.assign($scope.billingUnionEdited, $scope.billingUnion);
    }

    function makeBillingUnionNew() {
        $scope.actionName = "Создание группировки салонов";
        $scope.billingUnionEdited = new BillingUnion ({
        }, $scope);
    }

    $scope.saveBillingUnionEdited = function() {
        $scope.dealers = new Dealers();
        $scope.dealers.uniteItem($scope.billingUnionEdited.masterDealer);
        $scope.dealers.uniteItem($scope.billingUnionEdited.slaveDealer);
        $scope.billingUnionEdited.save($scope).then(function(billingUnion) {
            $rootScope.savedBillingUnionListNotice = 'Сохранена группировка ' + billingUnion.name();
            $location.path('/billingunionlist').search('');
        });
    };

    $scope.cancelBillingUnionEdited = function() {
        $location.path('/billingunionlist').search('');
    };
})

.directive('uiSiteSlaveDealerUnique', function(billingUnionsLoader){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch('[billingUnionEdited.site, billingUnionEdited.slaveDealer]', function (newValue, oldValue) {
                if (newValue === oldValue ) {
                    return;
                }
                if (!scope.billingUnionEdited.site || !scope.billingUnionEdited.slaveDealer) {
                    ctrl.$setValidity('unique', true);
                    return;
                }
                billingUnionsLoader.loadItems({
                    filters: [
                        { fields: ['site'], type: 'equal', value: scope.billingUnionEdited.site.id },
                        { fields: ['slaveDealer'], type: 'equal', value: scope.billingUnionEdited.slaveDealer.id }
                    ]
                }).then(function(billingUnions) {
                    var doubleItem = _.find(billingUnions.getItems(), function(billingUnion) {
                        return (billingUnion.id !== scope.billingUnionEdited.id);
                    });
                    ctrl.$setValidity('unique', doubleItem === undefined);
                });
            }, true);
        }
    };
})

.directive('uiSiteSlaveDealerMaster', function(billingUnionsLoader){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch('[billingUnionEdited.site, billingUnionEdited.slaveDealer]', function (newValue, oldValue) {
                if (newValue === oldValue ) {
                    return;
                }
                if (!scope.billingUnionEdited.site || !scope.billingUnionEdited.slaveDealer) {
                    ctrl.$setValidity('master', true);
                    return;
                }
                billingUnionsLoader.loadItems({
                    filters: [
                        { fields: ['site'], type: 'equal', value: scope.billingUnionEdited.site.id },
                        { fields: ['masterDealer'], type: 'equal', value: scope.billingUnionEdited.slaveDealer.id }
                    ]
                }).then(function(billingUnions) {
                    var doubleItem = _.find(billingUnions.getItems(), function(billingUnion) {
                        return (billingUnion.id !== scope.billingUnionEdited.id);
                    });
                    ctrl.$setValidity('master', doubleItem === undefined);
                });
            }, true);
        }
    };
})

.directive('uiSiteMasterDealerSlave', function(billingUnionsLoader){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch('[billingUnionEdited.site, billingUnionEdited.masterDealer]', function (newValue, oldValue) {
                if (newValue === oldValue ) {
                    return;
                }
                if (!scope.billingUnionEdited.site || !scope.billingUnionEdited.masterDealer) {
                    ctrl.$setValidity('slave', true);
                    return;
                }
                billingUnionsLoader.loadItems({
                    filters: [
                        { fields: ['site'], type: 'equal', value: scope.billingUnionEdited.site.id },
                        { fields: ['slaveDealer'], type: 'equal', value: scope.billingUnionEdited.masterDealer.id }
                    ]
                }).then(function(billingUnions) {
                    var doubleItem = _.find(billingUnions.getItems(), function(billingUnion) {
                        return (billingUnion.id !== scope.billingUnionEdited.id);
                    });
                    ctrl.$setValidity('slave', doubleItem === undefined);
                });
            }, true);
        }
    };
})

.directive('uiDealersEqual', function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch('[billingUnionEdited.slaveDealer, billingUnionEdited.masterDealer]', function (newValue, oldValue) {
                if (newValue === oldValue ) {
                    return;
                }
                if (!scope.billingUnionEdited.slaveDealer || !scope.billingUnionEdited.masterDealer) {
                    ctrl.$setValidity('equal', true);
                    return;
                }
                ctrl.$setValidity('equal', scope.billingUnionEdited.slaveDealer.id !== scope.billingUnionEdited.masterDealer.id);
            }, true);
        }
    };
})
;