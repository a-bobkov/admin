'use strict';

angular.module('BillingCreditApp', ['ngRoute', 'ui.bootstrap.pagination', 'ngInputDate',
    'max.dal.entities.billingcredit',
    'max.dal.entities.dealer'
])

.config(['$routeProvider', function($routeProvider) {

    $routeProvider
    .when('/billingcreditlist', {
        templateUrl: 'template/page/billingcredit/list.html',
        controller: 'BillingCreditListCtrl',
        reloadOnSearch: false,
        resolve: {
            data: function(dealersLoader, $rootScope, $location, $q, Construction) {
                if (_.isEmpty($location.search()) && !_.isEmpty($rootScope.savedBillingCreditListLocationSearch)) {
                    $location.search($rootScope.savedBillingCreditListLocationSearch);
                }
                var ls = $location.search();
                var toResolve = {};
                if (!_.isEmpty(ls.dealers)) {
                    toResolve.dealers = dealersLoader.loadItems({
                        filters: [
                            { fields: ['id'], type: 'in', value: ls.dealers.split(';') } // user.id
                        ],
                        fields: ['dealer_list_name']
                    });
                }
                return $q.all(toResolve).then(function(construction) {
                    return new Construction(construction).resolveRefs();
                });
            }
        }
    })
    .when('/billingcredit', {      // ?id=new - создание нового лимита; ?id=5 - редактирование лимита 5
        templateUrl: 'template/page/billingcredit/edit.html',
        controller: 'BillingCreditEditCtrl',
        resolve: {
            data: function(Construction, billingCreditsLoader, dealersLoader, $location, $q) {
                var ls = $location.search();
                if (ls.id === 'new') {
                    return $q.when();
                } else {
                    return billingCreditsLoader.loadItem(ls.id).then(function(billingCredit) {
                        return dealersLoader.loadItems({
                            filters: [
                                { fields: ['id'], type: 'equal', value: billingCredit.dealer.id }    // user.id
                            ],
                            fields: [ 'dealer_list_name' ]
                        }).then(function(dealers) {
                            var construction = new Construction({dealers: dealers});
                            construction.billingCredit = billingCredit;
                            return construction.resolveRefs();
                        });
                    });
                }
            }
        }
    })
;
}])

.controller('BillingCreditListCtrl', function($scope, $rootScope, $location, $q, data, Construction,
    dealersLoader, billingCreditsLoader) {

    _.assign($scope, data);
    $scope.dealersLoader = dealersLoader;

    if ($rootScope.savedBillingCreditListNotice) {
        $scope.savedBillingCreditListNotice = $rootScope.savedBillingCreditListNotice;
        delete $rootScope.savedBillingCreditListNotice;
    }

    var regexpOrder = /^([+-]?)(\w+)$/;

    $scope.setPatternsDefault = function() {
        $scope.patterns = {
            dealers: []
        };
    }

    $scope.onPatternChange = function (newValue, oldValue) {
        onSortingChange();
    };

    $scope.$watch('patterns', $scope.onPatternChange, true);

    $scope.sortableColumns = [
        {id: "dealer", name: "Салон", width: '70%'},
        {id: "amount", name: "Сумма, руб.", width: '10%'},
        {id: "expiresAt", name: "Срок", width: '10%'}
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
        $rootScope.savedBillingCreditListLocationSearch = toLocationSearch(searchParams);
        $location.search($rootScope.savedBillingCreditListLocationSearch);

        var queryParams = makeQueryParams($rootScope.savedBillingCreditListLocationSearch);
        billingCreditsLoader.loadItems(queryParams).then(function(billingCredits) {
            $scope.totalItems = billingCredits.getParams().pager.total;
            var construction = new Construction({billingCredits: billingCredits});
            dealersLoader.loadItems({       // user.id
                filters: [
                    { fields: ['id'], type: 'in', value: _.pluck(_.pluck(billingCredits.getItems(), 'dealer'), 'id') }
                ],
                fields: ['dealer_list_name']
            }).then(function(dealers) {
                construction.dealers = dealers;
                _.assign($scope, construction.resolveRefs());
                var topList = document.getElementById('addBillingCreditUp').getBoundingClientRect().top;
                if (topList < 0) {
                    window.scrollBy(0, topList);
                }
            });
        });
    };

    var ls = $location.search();
    if (_.size(ls)) {
        $scope.patterns = {
            dealers: (!ls.dealers) ? [] : _.invoke(ls.dealers.split(';'), function() {
                return $scope.dealers.get(_.parseInt(this));
            })
        };
        $scope.sorting = ls.orders && ls.orders.split(';') || ['expiresAt'];
        $scope.paging = {
            currentPage: _.parseInt(ls.currentPage),
            itemsPerPage: _.parseInt(ls.itemsPerPage)
        };
    } else {
        $scope.setPatternsDefault();
        $scope.sorting = ['expiresAt'];
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
            if (!_.isEmpty(ls.dealers)) {
                queryParams.filters.push({
                    fields: ['dealer'],
                    type: 'in',
                    value: ls.dealers.split(';')
                });
            }
            return queryParams;
        } else {
            return {
                orders: ['expiresAt'],
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

    $scope.newBillingCredit = function() {
        $location.path('/billingcredit').search('id=new');
    };

    $scope.editBillingCredit = function(billingCredit) {
        $location.path('/billingcredit').search('id=' + billingCredit.id);
    };

    $scope.removeBillingCredit = function(billingCredit) {
        var confirmMessage,
            noticeMessage;

        confirmMessage = 'Вы действительно хотите удалить кредитный лимит ';
        noticeMessage = 'Удален кредитный лимит ';
        if (confirm(confirmMessage + billingCredit.name() + '?')) {
            billingCredit.remove().then(function() {
                $scope.savedBillingCreditListNotice = noticeMessage + billingCredit.name();
                $scope.onSelectPage();
            });
        }
    };
})

.controller('BillingCreditEditCtrl', function($scope, $rootScope, $location, $window, data,
    BillingCredit, dealersLoader) {

    _.assign($scope, data);
    $scope.dealersLoader = dealersLoader;

    if ($scope.billingCredit) {
        makeBillingCreditCopy();
    } else {
        makeBillingCreditNew();
    }

    $window.scrollTo(0,0);

    function makeBillingCreditCopy() {
        $scope.actionName = "Изменение кредитного лимита";
        $scope.billingCreditEdited = new BillingCredit();
        _.assign($scope.billingCreditEdited, $scope.billingCredit);
    }

    function makeBillingCreditNew() {
        $scope.actionName = "Создание кредитного лимита";
        $scope.billingCreditEdited = new BillingCredit ({
        }, $scope);
    }

    $scope.saveBillingCreditEdited = function() {
        $scope.billingCreditEdited.save($scope).then(function(billingCredit) {
            $rootScope.savedBillingCreditListNotice = 'Сохранен кредитный лимит ' + billingCredit.name();
            $location.path('/billingcreditlist').search('');
        });
    };

    $scope.cancelBillingCreditEdited = function() {
        $location.path('/billingcreditlist').search('');
    };
})

.directive('uiDealerUnique', function(billingCreditsLoader){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch('billingCreditEdited.dealer', function (newValue, oldValue) {
                if (newValue === oldValue || !newValue) {
                    ctrl.$setValidity('unique', true);
                    return;
                }
                billingCreditsLoader.loadItems({
                    filters: [
                        { fields: ['dealer'], type: 'equal', value: newValue.id }
                    ]
                }).then(function(billingCredits) {
                    var doubleItem = _.find(billingCredits.getItems(), function(billingCredit) {
                        return (billingCredit.id !== scope.billingCreditEdited.id);
                    });
                    ctrl.$setValidity('unique', doubleItem === undefined);
                });
            });
        }
    };
})
;