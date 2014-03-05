'use strict';

angular.module('UsersApp', ['ngRoute', 'app.dal.entities.user', 'ui.bootstrap.pagination'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/userlist', {
        templateUrl: 'template/page/user/list.html',
        controller: 'UserListCtrl',
        resolve: {
            data: function(UserList_Loader) {
                return UserList_Loader.load();
            }
        }
    })
    .when('/users/:userId/edit', {
        templateUrl: 'template/page/user/edit.html',
        controller: 'UserCtrl',
        resolve: {
            data: function(User_Loader, $location) {
                var userId = parseInt($location.$$path.replace(/^\/users\/(?:([^\/]+))\/edit$/,'$1'));
                return User_Loader.load(userId);
            }
        }
    })
    .when('/usernew', {
        templateUrl: 'template/page/user/edit.html',
        controller: 'UserCtrl',
        resolve: {
            data: function(UserList_Loader) {
                return UserList_Loader.load();
            }
        }
    })
    .otherwise({
        redirectTo: '/userlist'
    });
}])

.factory('Directories_Loader', function($q, users, statuses) {
    var data = {};
    var Loader = {};
    Loader.load = function() {
        return $q.all({
            statuses: statuses.getAll(),
            directories: users.getDirectories()
        }).then(function(respond){
            data.statuses = angular.extend(respond.statuses);
            angular.extend(data, respond.directories);
            return data;
        });
    };
    return Loader;
})

.factory('UserList_Loader', function(Directories_Loader, users) {
    var data = {};
    var Loader = {};
    Loader.load = function() {
        return Directories_Loader.load().then(function(respond) {
            data = respond;
            return users.getAll().then(function(respond) {
                data.users = respond;
                return data;
            });
        });
    };
    return Loader;
})

.factory('User_Loader', function(Directories_Loader, users) {
    var data = {};
    var Loader = {};
    Loader.load = function(id) {
        return Directories_Loader.load().then(function(respond) {
            data = respond;
            return users.get(id).then(function(respond) {
                data.user = respond;
                return data;
            });
        });
    };
    return Loader;
})

.controller('UserListCtrl', function($scope, $rootScope, $filter, $location, data) {
    var allUsers = data.users;
    $scope.optionsStatus = data.statuses;
    $scope.optionsManager = data.managers;

    if ($rootScope.savedUserListNotice) {
        $scope.savedUserListNotice = $rootScope.savedUserListNotice;
        delete $rootScope.savedUserListNotice;
    }

    var filteredUsers = [];

    $scope.clickNewUser = function() {
        $location.path('/usernew');
    }

    var filterComma = function(item, pattern) {
        var arr = pattern.split(',');
        for (var i = arr.length; i--; ) {
            if (arr[i] && filterSpace(item, arr[i])) {
                return true;
            }
        }
        return false;
    }

    var filterSpace = function(item, pattern) {
        var arr = pattern.split(' ');
        for (var i = arr.length; i--; ) {
            if (arr[i]
                && (String(item.id).indexOf(arr[i]) === -1)
                && ((!item.email) || (item.email.toLowerCase().indexOf(arr[i]) === -1))
                && ((!item.dealer) || (!item.dealer.company_name) || (item.dealer.company_name.toLowerCase().indexOf(arr[i]) === -1))) {
                return false;
            }
        }
        return true;
    };

    var filterComplex = function(item) {
        return (!$scope.patterns.complex || filterComma(item, $scope.patterns.complex.toLowerCase()));
    }

    var filterStatus = function(item) {
        if ($scope.patterns.status.length > 0) {
            if ($scope.patterns.status.indexOf(item.status) !== -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    };

    var filterManager = function(item) {
        return ($scope.patterns.manager == null)
            || (item.dealer && item.dealer.manager === $scope.patterns.manager);
    };

    var filterPatterns = function(item) {
        return filterComplex(item)
            && filterStatus(item)
            && filterManager(item);
    };

    $scope.setPatternsDefault = function() {
        $scope.patterns = {
            complex: '',
            status: [_.find($scope.optionsStatus, {id: 'active'})],
            manager: null
        };
    }

    $scope.onPatternChange = function () {
        filteredUsers = $filter('filter')(allUsers, filterPatterns);
        $rootScope.savedUserListPatterns = $scope.patterns;
        onSortingChange();
    };

    $scope.$watch('patterns', $scope.onPatternChange, true);

    // по мотивам: http://stackoverflow.com/questions/12940974/maintain-model-of-scope-when-changing-between-views-in-angularjs
    if ($rootScope.savedUserListPatterns) {
        $scope.patterns = $rootScope.savedUserListPatterns;
    } else {
        $scope.setPatternsDefault();
    }

    var sortedUsers = [];

    $scope.sortableColumns = [
        {id: "id", name: "Код"},
        {id: "email", name: "Email"},
        {id: "last_login", name: "Был на сайте"}
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
        $rootScope.savedUserListSorting = $scope.sorting;
        onSortingChange();
    }

    var onSortingChange = function() {
        sortedUsers = $filter('orderBy')(filteredUsers, $scope.sorting.column, $scope.sorting.reverse);
        $scope.totalItems = filteredUsers.length;
        if ($scope.currentPage != 1) {
            $scope.currentPage = 1;
        } else {
            pageUsers();
        };
    }

    var setSortingDefault = function() {
        $scope.sorting = {
            column: 'id',
            reverse: false
        };
    }

    if ($rootScope.savedUserListSorting) {
        $scope.sorting = $rootScope.savedUserListSorting;
    } else {
        setSortingDefault();
    }

    $scope.itemsPerPage = 25;
    $scope.maxSize = 9;
    $scope.pagedUsers = [];

    var pageUsers = function () {
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
            end = begin + $scope.itemsPerPage;
        $scope.pagedUsers = sortedUsers.slice(begin, end);
    };

    $scope.$watch('currentPage', pageUsers);
})

.controller('UserCtrl', function($scope, $rootScope, $location, data, dealerPhoneHours, users, User, Dealer) {
    angular.extend($scope, data);
    $scope.dealerPhoneHours = dealerPhoneHours;

    if (data.user) {
        makeUserCopy();
    } else {
        makeUserNew();
    }
    $scope.userEdited.password = '';
    $scope.userPasswordConfirm = '';

    function makeUserCopy() {
        $scope.actionName = "Редактирование";
        $scope.userEdited = new User;
        angular.extend($scope.userEdited, data.user);
        $scope.dealerEdited = new Dealer;
        $scope.userEdited.dealer = $scope.dealerEdited;
        if (data.user.dealer) {
            angular.extend($scope.dealerEdited, data.user.dealer);
        }
    }

    function makeUserNew() {
        $scope.actionName = "Создание";
        $scope.userEdited = new User;      // данные нового пользователя по умолчанию
        $scope.userEdited.status = _.find($scope.statuses, {id: 'inactive'});
        $scope.userEdited.manager = _.find($scope.managers, {id: 0});
        $scope.dealerEdited = new Dealer;  // данные нового дилера по умолчанию
        $scope.dealerEdited.phones = [{}, {}, {}];
        $scope.userEdited.dealer = $scope.dealerEdited;
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
        users.save($scope.userEdited).then(function(user) {
            $rootScope.savedUserListNotice = 'Сохранён пользователь с идентификатором: ' + user.id;
            $location.path('/userlist');
        });
    };

    $scope.removeUser = function() {
        if (confirm('Вы уверены?')) {
            if ($scope.userEdited.id) {
                users.remove($scope.userEdited.id).then(function() {
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

.directive('uiPhoneFields', function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var regexpPhoneNumber = /^\+7[ ]?(?:(?:\(\d{3}\)[ ]?\d{3})|(?:\(\d{4}\)[ ]?\d{2})|(?:\(\d{5}\)[ ]?\d{1}))-?\d{2}-?\d{2}$/
            function validatePhonePeriod(newValue) {
                if (newValue.phoneFrom && newValue.phoneTo && (newValue.phoneFrom >= newValue.phoneTo)) {
                    ctrl.$setValidity('period', false);
                } else {
                    ctrl.$setValidity('period', true);
                }
            }

            function validatePhoneNumber(newValue) {
                if ((!newValue.phoneNumber) || (newValue.phoneNumber.match(regexpPhoneNumber))) {
                    ctrl.$setValidity('number', true);
                } else {
                    ctrl.$setValidity('number', false);
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

            scope.$watch(attrs.uiPhoneFields, function (otherModelValue) {
                validatePhoneFields(scope.$eval(attrs.uiPhoneFields));
                validatePhoneNumber(scope.$eval(attrs.uiPhoneFields));
                validatePhonePeriod(scope.$eval(attrs.uiPhoneFields));
            }, true);
        }
    };
});