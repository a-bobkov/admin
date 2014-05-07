'use strict';

angular.module('UsersApp', ['ngRoute', 'max.dal.entities.user', 'ui.bootstrap.pagination'])

.config(['$routeProvider', function($routeProvider) {

    $routeProvider
    .when('/userlist', {
        templateUrl: 'template/page/user/list.html',
        controller: 'UserListCtrl',
        reloadOnSearch: false,
        resolve: {
            data: function(usersLoader) {
                return usersLoader.loadDirectories();
            }
        }
    })
    .when('/users/:userId/edit', {
        templateUrl: 'template/page/user/edit.html',
        controller: 'UserCtrl',
        resolve: {
            data: function(usersLoader, $location) {
                var id = parseInt($location.$$path.replace(/^\/users\/(?:([^\/]+))\/edit$/,'$1'));
                return usersLoader.loadItem(id);
            }
        }
    })
    .when('/usernew', {
        templateUrl: 'template/page/user/edit.html',
        controller: 'UserCtrl',
        resolve: {
            data: function(usersLoader) {
                return usersLoader.loadDirectories();
            }
        }
    })
    .otherwise({
        redirectTo: '/userlist'
    });
}])

.controller('UserListCtrl', function($scope, $rootScope, $filter, $location, $window, $timeout, data, usersLoader) {
    _.forOwn(data, function(collection, key) {
        $scope[key] = collection.getItems();
    });

    if ($rootScope.savedUserListNotice) {
        $scope.savedUserListNotice = $rootScope.savedUserListNotice;
        delete $rootScope.savedUserListNotice;
    }

    $scope.clickNewUser = function() {
        $location.path('/usernew');
    }

    $scope.setPatternsDefault = function() {
        $scope.patterns = {
            complex: '',
            status: [_.find($scope.userstatuses, {id: 'active'})],
            manager: null
        };
    }

    $scope.onPatternChange = function (newValue, oldValue) {
        onSortingChange();
    };

    $scope.$watch('patterns', $scope.onPatternChange, true);

    $scope.sortableColumns = [
        {id: "id", name: "Код", width: '10%'},
        {id: "email", name: "Email", width: '50%'},
        {id: "lastLogin", name: "Был на сайте", width: '20%'}
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
        $rootScope.savedUserListLocationSearch = toLocationSearch(searchParams);
        $location.search($rootScope.savedUserListLocationSearch);
        usersLoader.loadItems(makeQueryParams($rootScope.savedUserListLocationSearch), data).then(function(respond) {
            $scope.users = respond.users.getItems();
            $scope.totalItems = respond.users.getParams().pager.total;
            var topUserList = document.getElementById('UserListAddUserUp').getBoundingClientRect().top;
            if (topUserList < 0) {
                window.scrollBy(0, topUserList);
            }
        });
    };

    var ls = $location.search();
    if (_.isEmpty(ls)) {
        ls =  $rootScope.savedUserListLocationSearch;
    }
    if (_.size(ls)) {
        $scope.patterns = {
            complex: ls.complex || '',
            status: ls.status && _.invoke(ls.status.split(';'), function() {
                    return _.find($scope.userstatuses, {id: this})
                }),
            manager: _.find($scope.managers, {id: _.parseInt(ls.manager)})
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
            if (ls.complex) {
                queryParams.filters = _.invoke(ls.complex.split(' '), function() {
                    return {
                        type: 'contain',
                        fields: ['id', 'email', 'dealer.companyName'],
                        value: this
                    };
                });
            }
            if (ls.status) {
                queryParams.filters.push({
                    type: 'in',
                    fields: ['status'],
                    value: ls.status.split(';')
                });
            }
            if (ls.manager) {
                queryParams.filters.push({
                    type: 'equal',
                    fields: ['dealer.manager'],
                    value: ls.manager
                });
            }
            return queryParams;
        } else {
            return {
                filters: [
                    { type: 'in', fields: ['status'], value: ['active'] }
                ],
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
                return value.id;
            } else {
                return _.mapValues(value, function(value) {
                    return toLocationSearch(value);
                });
            }
        } else {
            return value;
        }
    }
})

.controller('UserCtrl', function($scope, $rootScope, $location, $window, data, User, Dealer, dealerPhoneHours) {
    _.forOwn(data, function(collection, key) {
        if (key === 'user') {
            $scope[key] = collection;
        } else {
            $scope[key] = collection.getItems();
        }
    });

    $scope.dealerPhoneHours = dealerPhoneHours;

    if (data.user) {
        makeUserCopy();
    } else {
        makeUserNew();
    }
    $scope.userEdited.password = '';
    $scope.userPasswordConfirm = '';

    $window.scrollTo(0,0);

    function makeUserCopy() {
        $scope.actionName = "Редактирование";
        $scope.userEdited = new User;
        angular.extend($scope.userEdited, data.user);
        $scope.dealerEdited = new Dealer;
        $scope.userEdited.dealer = $scope.dealerEdited;
        if (data.user.dealer) {
            angular.extend($scope.dealerEdited, data.user.dealer);
        }

        $scope.dealerEditedPhones = [];
        pushPhone('phone');
        pushPhone('phone2');
        pushPhone('phone3');

        function pushPhone(name) {
            $scope.dealerEditedPhones.push({
                phoneNumber: $scope.dealerEdited[name],
                phoneFrom: $scope.dealerEdited[name + 'From'],
                phoneTo: $scope.dealerEdited[name + 'To']
            });
        }

    }

    function makeUserNew() {
        $scope.actionName = "Создание";
        $scope.userEdited = new User;      // данные нового пользователя по умолчанию
        $scope.userEdited.status = _.find($scope.userstatuses, {id: 'inactive'});
        $scope.userEdited.manager = _.find($scope.managers, {id: 0});
        $scope.dealerEdited = new Dealer;
        $scope.userEdited.dealer = $scope.dealerEdited;
        $scope.dealerEditedPhones = [{}, {}, {}];
    }

    $scope.matchCity = function(city) {
        return function(item) {
            return (!item || item.city === city);
        }
    };

    $scope.onCityChange = function () {
        if (!$scope.matchCity($scope.dealerEdited.city)($scope.dealerEdited.market)) {
            $scope.dealerEdited.market = null;
        }
        if (!$scope.matchCity($scope.dealerEdited.city)($scope.dealerEdited.metro)) {
            $scope.dealerEdited.metro = null;
        }
    };

    $scope.$watch('dealerEdited.city', $scope.onCityChange);

    $scope.saveUser = function() {

        function getPhone(idx, name) {
            var phone = $scope.dealerEditedPhones[idx];
            $scope.dealerEdited[name] = phone.phoneNumber;
            $scope.dealerEdited[name + 'From'] = phone.phoneFrom;
            $scope.dealerEdited[name + 'To'] = phone.phoneTo;
        }

        getPhone(0, 'phone');
        getPhone(1, 'phone2');
        getPhone(2, 'phone3');

        $scope.userEdited.save(data).then(function(user) {
            $rootScope.savedUserListNotice = 'Сохранён пользователь с идентификатором: ' + user.id;
            $location.path('/userlist');
        });
    };

    $scope.removeUser = function() {
        if (confirm('Вы уверены?')) {
            if ($scope.userEdited.id) {
                $scope.userEdited.remove().then(function() {
                    $rootScope.savedUserListNotice = 'Удалён пользователь с идентификатором: ' + $scope.userEdited.id;
                    $location.path('/userlist');
                })
            } else {
                $location.path('/userlist');
            }
        }
    };
})

// from https://github.com/andreev-artem/angular_experiments/tree/master/ui-equal-to
.directive('uiEqualTo', function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            function validateEqual(myValue, otherValue) {
                if (myValue === otherValue) {
                    ctrl.$setValidity('equal', true);
                    return myValue;
                } else {
                    ctrl.$setValidity('equal', false);
                    return myValue;
                }
            }

            // при изменении значения в ссылочном поле (с точностью до хвостовых пробелов)
            scope.$watch(attrs.uiEqualTo, function (otherModelValue) {
                validateEqual(ctrl.$viewValue, otherModelValue);
            });

            // при изменении значения в поле (с точностью до хвостовых пробелов)
            ctrl.$parsers.unshift(function (viewValue) {
                return validateEqual(viewValue, scope.$eval(attrs.uiEqualTo));
            });
            // непонятно зачем - вроде работает и без этого
            ctrl.$formatters.unshift(function (modelValue) {
                return validateEqual(modelValue, scope.$eval(attrs.uiEqualTo));
            });
        }
    };
})

.directive('uiPhoneNumber', function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            _number: '=ngModel'
        },
        link: function (scope, elem, attrs, ctrl) {
            var regexpPhoneNumber = /^\+7[ ]?(?:(?:\(\d{3}\)[ ]?\d{3})|(?:\(\d{4}\)[ ]?\d{2})|(?:\(\d{5}\)[ ]?\d{1}))-?\d{2}-?\d{2}$/
            function validatePhoneNumber(newValue) {
                if ((!newValue) || (newValue.match(regexpPhoneNumber))) {
                    ctrl.$setValidity('number', true);
                } else {
                    ctrl.$setValidity('number', false);
                }
            }

            scope.$watch('userEdited.isDealer()', function (newValue) {
                if (newValue) {
                    validatePhoneNumber(scope._number);
                } else {
                    ctrl.$setValidity('number', true);
                }
            });

            scope.$watch('_number', validatePhoneNumber);
        }
    };
})

.directive('uiPhoneFields', function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            function validatePhonePeriod(newValue) {
                if (newValue.phoneFrom && newValue.phoneTo && (newValue.phoneFrom >= newValue.phoneTo)) {
                    ctrl.$setValidity('period', false);
                } else {
                    ctrl.$setValidity('period', true);
                }
            }

            function validatePhoneFields(newValue) {
                if ((newValue.phoneNumber || newValue.phoneFrom || newValue.phoneTo) &&
                !(newValue.phoneNumber && newValue.phoneFrom && newValue.phoneTo)) {
                    ctrl.$setValidity('consistent', false);
                } else {
                    ctrl.$setValidity('consistent', true);
                }
            }

            scope.$watch('userEdited.isDealer()', function (otherModelValue) {
                if (scope.userEdited.isDealer()) {
                    validatePhoneFields(scope.$eval(attrs.uiPhoneFields));
                    validatePhonePeriod(scope.$eval(attrs.uiPhoneFields));
                } else {
                    ctrl.$setValidity('period', true);
                    ctrl.$setValidity('consistent', true);
                }
            });

            scope.$watch(attrs.uiPhoneFields, function (otherModelValue) {
                validatePhoneFields(scope.$eval(attrs.uiPhoneFields));
                validatePhonePeriod(scope.$eval(attrs.uiPhoneFields));
            }, true);
        }
    };
});