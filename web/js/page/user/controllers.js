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
            data: function(Directories_Loader) {
                return Directories_Loader.load();
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
                return data;
            });
        });
    };
    return Loader;
})

.factory('User_Loader', function($q, users, statuses) {
    var data = {};
    var Loader = {};
    Loader.load = function(id) {
        return $q.all({
            statuses: statuses.getAll(),
            directories: users.getDirectories()
        }).then(function(respond){
            data = respond.directories;
            data.statuses = respond.statuses;
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

    $scope.clickNewUser = function() {
        $location.path('/usernew');
    }

    var filterComplex = function(itemToFilter) {
        var arr = $scope.patterns.complex.split(' ');
        for (var i = arr.length; i--; ) {
            if ((arr[i] !== '')
                && (String(itemToFilter.id).indexOf(arr[i]) === -1)
                && ((!itemToFilter.email) || (itemToFilter.email.indexOf(arr[i]) === -1))
                && ((!itemToFilter.dealer) || (!itemToFilter.dealer.company_name) || (itemToFilter.dealer.company_name.indexOf(arr[i]) === -1))) {
                return false;
            }
        }
        return true;
    };

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
        return filterComplex(itemToFilter)
            && filterId(itemToFilter)
            && filterEmail(itemToFilter)
            && filterStatus(itemToFilter)
            && filterTag(itemToFilter);
    };

    $scope.setPatternsDefault = function() {
        $scope.patterns = {
            complex: '',
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

    $scope.sortableColumns = [
        {id: "id", name: "Код"},
        {id: "email", name: "Email"},
        {id: "last_login", name: "Был на сайте"}
    ];

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
        filteredUsers = $filter('filter')(allUsers, filterPatterns);
        $scope.totalItems = filteredUsers.length;
        if ($scope.currentPage != 1) {
            $scope.currentPage = 1;
        } else {
            pageUsers();
        };
        $rootScope.savedUserListPatterns = $scope.patterns;
    };

    $scope.$watch('patterns', $scope.onPatternChainge, true);
    $scope.$watch('currentPage', pageUsers);
})

.controller('UserCtrl', function($scope, $location, data, userHours, users, User, Dealer) {
    angular.extend($scope, data);
    $scope.userHours = userHours;

    $scope.pwd = '';
    $scope.pwdConfirm = '';

    if (data.user) {
        makeUserCopy();
    } else {
        makeUserNew();
    }

    $scope.userInvalid = function() {
        return ($scope.userEdited.group) && ($scope.userEdited.group.id == 2) &&
            ($scope.company_nameErrorMessage()
            || $scope.cityErrorMessage()
            || $scope.phoneErrorMessage()
            || $scope.phone2ErrorMessage()
            || $scope.phone3ErrorMessage());
    }

    $scope.company_nameErrorMessage = function() {
        if (!$scope.dealerEdited.company_name) {
            return 'Не задано значение.';
        }
        return '';
    }

    $scope.cityErrorMessage = function() {
        if (!$scope.dealerEdited.city) {
            return 'Не задано значение.';
        }
        return '';
    }

    $scope.phoneErrorMessage = function() {
        if (($scope.dealerEdited.phone || $scope.dealerEdited.phone_from || $scope.dealerEdited.phone_to) &&
        !($scope.dealerEdited.phone && $scope.dealerEdited.phone_from && $scope.dealerEdited.phone_to)) {
            return 'Необходимо заполнить все три поля';
        }
        return '';
    }

    $scope.phone2ErrorMessage = function() {
        if (($scope.dealerEdited.phone2 || $scope.dealerEdited.phone2_from || $scope.dealerEdited.phone2_to) &&
        !($scope.dealerEdited.phone2 && $scope.dealerEdited.phone2_from && $scope.dealerEdited.phone2_to)) {
            return 'Необходимо заполнить все три поля';
        }
        return '';
    }

    $scope.phone3ErrorMessage = function() {
        if (($scope.dealerEdited.phone3 || $scope.dealerEdited.phone3_from || $scope.dealerEdited.phone3_to) &&
        !($scope.dealerEdited.phone3 && $scope.dealerEdited.phone3_from && $scope.dealerEdited.phone3_to)) {
            return 'Необходимо заполнить все три поля';
        }
        return '';
    }

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
        $scope.dealerEdited = new Dealer;
        $scope.userEdited.dealer = $scope.dealerEdited;
    }

    $scope.saveUser = function() {
        users.save($scope.userEdited).then(function(user) {
            if (data.user) {
                makeUserCopy();
            } else {
                $location.path('/users/' + user.id + '/edit');
            }
        });
    };

    $scope.removeUser = function() {
        if (confirm('Вы уверены?')) {
            if ($scope.userEdited.id) {
                users.remove($scope.userEdited.id).then(function() {
                    $location.path('/userlist');
                })
            } else {
                $location.path('/userlist');
            }
        }
    };
});