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
                return; //User_Loader.load(userId);
            }
        }
    })
    .when('/usernew', {
        templateUrl: 'template/page/user/edit.html',
        controller: 'UserCtrl',
        resolve: {
            data: function() {}
        }
    })
    .otherwise({
        redirectTo: '/userlist'
    });
}])

.factory('UserList_Loader', function($q, users, statuses) {
    var data = {};
    var Loader = {};
    Loader.load = function() {
        return $q.all({
            statuses: statuses.getAll(),
            directories: users.getDirectories()
        }).then(function(respond){
            data.statuses = angular.extend(respond.statuses);
            angular.extend(data, respond.directories);
            return users.getAll().then(function(respond) {
                data.users = angular.extend(respond);
                // console.log(angular.toJson(data));
                return data;
            });
        });

        // return users.getDirectories().then(function(respond) {
        //     angular.extend(data, respond);
        //     console.log(angular.toJson(data));
        //     return users.getAll().then(function(respond) {
        //         data.users = angular.extend(respond);
        //         console.log(angular.toJson(data));
        //         return data;
        //     });
        // });
        // return users.getDirectories().then(function() {
        //     return users.getAll();
        // });
    };
    return Loader;
})

.factory('User_Loader', function($q, User, $location) {
    // var data = {};
    // var Loader = {};
    // Loader.load = function(userId) {
    //     return $q.all({
    //         user: User.get(userId)
    //     }).then(function(values){
    //             angular.extend(data, values);
    //             return data;
    //     });
    // };
    // return Loader;
})

.controller('UserListCtrl', function($scope, $rootScope, $filter, $location, data) {
    var users = data.users;
    $scope.optionsStatus = data.statuses;
    $scope.optionsTag = data.managers;

//     $scope.clickExtra = function () {
//         if ($scope.showExtraControls == false) {
//             $scope.showExtraControls = true;
//             $scope.textExtraButton = "<<";
//         } else {
//             $scope.showExtraControls = false;
//             $scope.textExtraButton = ">>";
//         }
//     }

//     $scope.clickExtra();

//     $scope.clickLine = function(id) {
//         $location.path('/users/'+id+'/edit');
//     }

//     $scope.filterIdNameMail = function(itemToFilter) {
//         if ($scope.patterns.idNameMail.length > 0) {
//             var filterInt = parseInt ($scope.patterns.idNameMail);
//             if (filterInt > 0) {   // введено число - проверяем только по коду
//                 return (itemToFilter.id == filterInt);
//             } else {            // введено не число - проверяем по мэйлу и названию
//                 return (itemToFilter.email && itemToFilter.email.toLowerCase().indexOf($scope.patterns.idNameMail.toLowerCase())!=-1) 
//                 || (itemToFilter.company_name && itemToFilter.company_name.toLowerCase().indexOf($scope.patterns.idNameMail.toLowerCase())!=-1);
//             }
//         } else {
//             return true;
//         }
//     };

    var filterId = function(itemToFilter) {
        return (!$scope.patterns.id) 
            || String(itemToFilter.id).indexOf($scope.patterns.id) !== -1;
    };

    var filterEmail = function(itemToFilter) {
        if ($scope.patterns.emailEmpty) {
            return !itemToFilter.email;
        } else if (!$scope.patterns.email) {
            return true;
        } else {
            return itemToFilter.email.indexOf($scope.patterns.email) !== -1;
        }
    };

    var filterStatus = function(itemToFilter) {
        if ($scope.patterns.status.length > 0) {
            if ($scope.patterns.status.indexOf(itemToFilter.status) !== -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    };

    var filterTag = function(itemToFilter) {
        return ($scope.patterns.tag == null)
            || (itemToFilter.dealer && itemToFilter.dealer.manager === $scope.patterns.tag);
    };

    var filterPatterns = function(itemToFilter) {
        return filterId(itemToFilter)
            && filterEmail(itemToFilter)
            && filterStatus(itemToFilter)
            && filterTag(itemToFilter);
    };

    $scope.setPatternsDefault = function() {
        $scope.patterns = {
            id: '',
            email: '',
            emailEmpty: null,
            status: [_.find($scope.optionsStatus, {id: 'active'})],
            tag: null
            //, idNameMail: ''
        };
    }

    // по мотивам: http://stackoverflow.com/questions/12940974/maintain-model-of-scope-when-changing-between-views-in-angularjs
    if ($rootScope.savedUserListPatterns) {
        $scope.patterns = $rootScope.savedUserListPatterns;
    } else {
        $scope.setPatternsDefault();
    }

    $scope.sortingMark = function(column) {
        if (column === $scope.sorting.column) {
            return ($scope.sorting.reverse) ? ' ↑': ' ↓';
        }
        return '\u00A0\u00A0\u00A0';
    }

    $scope.clickHeader = function(column) {
        if (column === $scope.sorting.column) {
            $scope.sorting.reverse = !$scope.sorting.reverse;
        } else {
            $scope.sorting.column = column;
            $scope.sorting.reverse = false;
        }
    }

    $scope.setSortingDefault = function() {
        $scope.sorting = {
            column: 'id',
            reverse: false
        };
    }

    if ($rootScope.savedUserListSorting) {
        $scope.sorting = $rootScope.savedUserListSorting;
    } else {
        $scope.setSortingDefault();
    }

    var filteredUsers = [];
    $scope.itemsPerPage = 6;
    $scope.pagedUsers = [];

    var pageUsers = function () {
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
            end = begin + $scope.itemsPerPage;
        $scope.pagedUsers = filteredUsers.slice(begin, end);
    };

    $scope.onPatternChainge = function () {
        // $scope.filteredUsers = $filter('filter')(users,$scope.filterIdNameMail);
        filteredUsers = $filter('filter')(users, filterPatterns);
        $scope.totalItems = filteredUsers.length;
        if ($scope.currentPage != 1) {
            $scope.currentPage = 1;
        } else {
            pageUsers();
        };
        $rootScope.savedUserListPatterns = $scope.patterns;
    };

    $scope.$watch('patterns', $scope.onPatternChainge,true);
    $scope.$watch('currentPage', pageUsers);
})

.controller('UserCtrl', function($scope, $routeParams, data, User, optionsStatus, optionsTag, optionsHour) {
    $scope.optionsStatus = optionsStatus;
    $scope.optionsTag = optionsTag;
    $scope.optionsHour = optionsHour;

    $scope.pwd = '';
    $scope.pwdConfirm = '';

    if ($routeParams.userId) {
        makeUserCopy();
    } else {
        makeUserNew();
    }

    $scope.phoneErrorMessage = function() {
        if (($scope.userEdited.phone || $scope.userEdited.phone_from || $scope.userEdited.phone_to) &&
        !($scope.userEdited.phone && $scope.userEdited.phone_from && $scope.userEdited.phone_to)) {
            return "Необходимо заполнить все три поля";
        } else {
            return "";
        }
    }

    $scope.phoneErrorMessage2 = function() {
        if (($scope.userEdited.phone2 || $scope.userEdited.phone2_from || $scope.userEdited.phone2_to) &&
        !($scope.userEdited.phone2 && $scope.userEdited.phone2_from && $scope.userEdited.phone2_to)) {
            return "Необходимо заполнить все три поля";
        } else {
            return "";
        }
    }

    $scope.phoneErrorMessage3 = function() {
        if (($scope.userEdited.phone3 || $scope.userEdited.phone3_from || $scope.userEdited.phone3_to) &&
        !($scope.userEdited.phone3 && $scope.userEdited.phone3_from && $scope.userEdited.phone3_to)) {
            return "Необходимо заполнить все три поля";
        } else {
            return "";
        }
    }

    function makeUserCopy() {
        $scope.actionName = "Редактирование";
        $scope.userEdited = angular.extend(data.user);
    }

    function makeUserNew() {
        $scope.actionName = "Создание";
        $scope.userEdited = new User ({   // данные нового пользователя по умолчанию
            'status': optionsStatus.getStatusById("inactive"),
            'tag_id': optionsTag.getTagById(0)
        })
    }

    $scope.updateUser = function() {
        if ($scope.userEdited.id) {  // обновление
            $scope.userEdited.save();
        } else {    // создание
            $scope.userEdited.create();
            $scope.actionName = "Редактирование";
        }
    };

    $scope.deleteUser = function() {
        if ($scope.userEdited.id) {
            $scope.userEdited.remove();
        }
    };
})

.controller('UserDeleteModalCtrl', function ($scope, $modal, $location) {
    $scope.openUserDeleteModal = function () {
        var modalInstance = $modal.open({
            templateUrl: 'UserDeleteModalContent.html',
            controller: 'UserDeleteModalInstanceCtrl'
        });

        modalInstance.result.then(function () {
          $scope.deleteUser();
          $location.path('/userlist');
        });
    };
})

.controller('UserDeleteModalInstanceCtrl', function ($scope, $modalInstance) {
    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
})

// from https://github.com/andreev-artem/angular_experiments/tree/master/ui-checkbox
.directive('uiCheckbox', function () {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        template:
            '<label class>' +
                '<div ng-click="toggle()" class="icheckbox_flat-blue" ng-class="{\'checked\': value}" style="position: relative">' +
                    '<input type="checkbox" name="checkboxes" checked="" style="position: absolute; opacity: 0;">' +
                '</div>' +
                '<span class="checkbox-label" ng-transclude></span>' +
            '</label>',
        require: 'ngModel',
        scope: true,
        link: function (scope, elem, attrs, ngModelCtrl) {
            scope.value = false;

            ngModelCtrl.$render = function () {
                scope.value = ngModelCtrl.$viewValue;
            };

            scope.toggle = function () {
                scope.value = !scope.value;
                ngModelCtrl.$setViewValue(scope.value);
            };
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
            // ctrl.$formatters.unshift(function (modelValue) {
            //     return validateEqual(modelValue, scope.$eval(attrs.uiEqualTo));
            // });
        }
    };
});