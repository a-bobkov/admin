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
                return usersLoader.loadDirectories().then(function(directories) {
                    return directories.resolveRefs();
                });
            }
        }
    })
    .when('/users/:userId/edit', {
        templateUrl: 'template/page/user/edit.html',
        controller: 'UserCtrl',
        resolve: {
            data: function(usersLoader, $location, $q) {
                var id = parseInt($location.$$path.replace(/^\/users\/(?:([^\/]+))\/edit$/,'$1'));
                return $q.all({
                    user: usersLoader.loadItem(id),
                    construction: usersLoader.loadDirectories()
                }).then(function(respond) {
                    var construction = respond.construction;
                    construction.user = respond.user;
                    return construction.resolveRefs();
                });
            }
        }
    })
    .when('/usernew', {
        templateUrl: 'template/page/user/edit.html',
        controller: 'UserCtrl',
        resolve: {
            data: function(usersLoader) {
                return usersLoader.loadDirectories().then(function(directories) {
                    return directories.resolveRefs();
                });
            }
        }
    })
;
}])

.controller('UserListCtrl', function($scope, $rootScope, $location, $window, $q, $timeout,  data,
    usersLoader, userStatuses) {

    _.assign($scope, data);
    $scope.userStatuses = userStatuses;

    if ($rootScope.savedUserListNotice) {
        $scope.savedUserListNotice = $rootScope.savedUserListNotice;
        delete $rootScope.savedUserListNotice;
    }

    $scope.clickNewUser = function() {
        $location.path('/usernew').search('');
    }

    $scope.setPatternsDefault = function() {
        $scope.patterns = {
            complex: '',
            status: [userStatuses.get('active')],
            manager: null
        };
    }

    $scope.onPatternChange = function (newValue, oldValue) {
        onSortingChange();
    };

    $scope.$watch('patterns', $scope.onPatternChange, true);

    $scope.sortableColumns = [
        {id: "id", name: "Код", width: '5%'},
        {id: "email", name: "Email", width: '25%'},
        {id: "lastLogin", name: "Был на сайте", width: '10%'}
    ];

    var regexpOrder = /^([+-]?)(\w+)$/;

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

    var numberLoads = 0;
    $scope.onSelectPage = function(page) {
        numberLoads++;
        if (page) {
            $scope.paging.currentPage = page;
        }
        var searchParams = _.pick(_.assign({}, $scope.patterns, $scope.paging), function(value) {
            return value;
        });
        searchParams.orders = $scope.sorting;
        $rootScope.savedUserListLocationSearch = toLocationSearch(searchParams);
        $q.all({
            users: usersLoader.loadItems(makeQueryParams($rootScope.savedUserListLocationSearch), data),
            numberLoads: numberLoads,
            timer: $timeout(function() {}, 300)
        }).then(function(data) {
            if (numberLoads === data.numberLoads) {
                $location.search($rootScope.savedUserListLocationSearch);
                $scope.users = data.users;
                $scope.totalItems = data.users.getParams().pager.total;
                var topUserList = document.getElementById('UserListAddUserUp').getBoundingClientRect().top;
                if (topUserList < 0) {
                    window.scrollBy(0, topUserList);
                }
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
                    return $scope.userStatuses.get(this)
                }),
            manager: $scope.managers.get(ls.manager)
        };
        $scope.sorting = ls.orders && ls.orders.split(';') || ['id'];
        $scope.paging = {
            currentPage: _.parseInt(ls.currentPage),
            itemsPerPage: _.parseInt(ls.itemsPerPage)
        };
    } else {
        $scope.setPatternsDefault();
        $scope.sorting = ['id'];
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
                orders: ['id'],
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

    $scope.editUserUrl = function(user) {
        return '#/users/' + user.id + '/edit';
    };

    $scope.switchUser = function(user) {
        if ($location.host().match(/maxposter.ru$/)) {
            $window.location.href = $location.protocol() + '://'+ $location.host() + '/user/' + user.id + '/switch';
        }
    }
})

.controller('UserCtrl', function($scope, $rootScope, $location, $window, data,
    User, userStatuses, Dealer, dealerPhoneHours) {

    _.assign($scope, data);
    $scope.userStatuses = userStatuses;
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
        _.assign($scope.userEdited, data.user);
        $scope.dealerEdited = new Dealer;
        $scope.userEdited.dealer = $scope.dealerEdited;
        if (data.user.dealer) {
            _.assign($scope.dealerEdited, data.user.dealer);
        }

        $scope.dealerEditedPhones = [];
        pushPhone('phone');
        pushPhone('phone2');
        pushPhone('phone3');

        function pushPhone(name) {
            $scope.dealerEditedPhones.push({
                phoneNumber: $scope.dealerEdited[name] || null,
                phoneFrom: $scope.dealerEdited[name + 'From'] || null,
                phoneTo: $scope.dealerEdited[name + 'To'] || null
            });
        }
    }

    function makeUserNew() {
        $scope.actionName = "Создание";
        $scope.userEdited = new User;      // данные нового пользователя по умолчанию
        $scope.userEdited.status = userStatuses.get('inactive');
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
            $scope.dealerEdited[name] = phone.phoneNumber || null;
            $scope.dealerEdited[name + 'From'] = phone.phoneFrom || null;
            $scope.dealerEdited[name + 'To'] = phone.phoneTo || null;
        }

        getPhone(0, 'phone');
        getPhone(1, 'phone2');
        getPhone(2, 'phone3');

        $scope.userEdited.save(data).then(function(user) {
            $rootScope.savedUserListNotice = 'Сохранён пользователь с идентификатором: ' + user.id;
            $location.path('/userlist').search('');
        });
    };

    $scope.removeUser = function() {
        if (confirm('Вы уверены?')) {
            if ($scope.userEdited.id) {
                $scope.userEdited.remove().then(function() {
                    $rootScope.savedUserListNotice = 'Удалён пользователь с идентификатором: ' + $scope.userEdited.id;
                    $location.path('/userlist').search('');
                })
            } else {
                $location.path('/userlist').search('');
            }
        }
    };

    var myMap;
    var myPlacemark;

    ymaps.ready(function init() {
        myMap = new ymaps.Map("map", {
            center: [
                $scope.dealerEdited.latitude > 0 ? $scope.dealerEdited.latitude : ymaps.geolocation.latitude,
                $scope.dealerEdited.longitude > 0 ? $scope.dealerEdited.longitude : ymaps.geolocation.longitude
            ],
            zoom: 13
        });
        myMap.controls.add("smallZoomControl");

        if (_.isNumber($scope.dealerEdited.latitude) && _.isNumber($scope.dealerEdited.longitude)) {
            setPlacemark($scope.dealerEdited.latitude, $scope.dealerEdited.longitude);
        }
    });

    function setPlacemark(lat, lng) {
        unsetPlacemark();
        myPlacemark = new ymaps.Placemark(
            [lat, lng], {}, {
                preset: "twirl#redDotIcon",
                draggable: true
            }
        );
        myPlacemark.events.add("dragend", setDealerCoordinates);
        myMap.geoObjects.add(myPlacemark);

        setDealerCoordinates();

        function setDealerCoordinates() {
            var coordinates = myPlacemark.geometry.getCoordinates();
            $scope.dealerEdited.latitude = coordinates[0].ceil(8);
            $scope.dealerEdited.longitude = coordinates[1].ceil(8);
        }
    }

    function unsetPlacemark() {
        if (myMap && myPlacemark) {
            myMap.geoObjects.remove(myPlacemark);
            myPlacemark = null;
            $scope.dealerEdited.latitude = 0;
            $scope.dealerEdited.longitude = 0;
        }
    }

    $scope.setCoordinates = function() {
        if ($scope.dealerEdited.address) {
            ymaps.geocode($scope.dealerEdited.address).then(function(respond) {
                var geoObject = respond.geoObjects.get(0);
                if (geoObject) {
                    var coordinates = geoObject.geometry.getCoordinates();
                    setPlacemark(coordinates[0], coordinates[1]);
                    myMap.setCenter(coordinates);
                } else {
                    alert('Координаты введенного адреса не определены Яндексом!');
                }
            });
        } else {
            alert('Для определения координат необходимо ввести адрес!');
        }
    };

    $scope.unsetCoordinates = function() {
        if (confirm('Вы уверены, что нужно убрать маркер с карты?')) {
            unsetPlacemark();
        };
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

.directive("uiCheckboxgroup", function($document){
    return {
        restrict: 'A',
        replace: true,
        template:
            '<ul class="checkbox-group"">' +
            '    <li ng-repeat="item in _items">'+
            '        <input type="checkbox" id="checkbox_group_{{$index}}" ng-model=_selected[item.id] ng-change="updateSelectedItems()">' +
            '        <label for="checkbox_group_{{$index}}">{{item.namePlural}}</label>' +
            '    </li>' +
            '</ul>',
        scope: {
            _items: '=uiCheckboxgroup',
            _selectedItems: '=uiCheckboxgroupSelected'
        },
        controller: ['$scope', function($scope) {
                $scope._selected = {};

                $scope.updateSelectedItems = function() {
                    $scope._selectedItems = _.filter($scope._items, function(value) {
                        return $scope._selected[value.id];
                    });
                };

                $scope.$watch('_selectedItems', function updateSelected(newValue, oldValue) {
                    _.forEach($scope._items, function(value, key) {
                        $scope._selected[value.id] = !!_.find(newValue, {id: value.id});
                    })
                }, true);
            }
        ]
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
            var regexpPhoneNumber = /^\+\d{1,3}\040?\(\d{3}(?:\-?\d{1,2})?\)\040?\d{1,3}\-?\d{2,3}(?:\-?\d{1,3})?(?:\040\d{1,6})?$/
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
                if (newValue.phoneFrom && newValue.phoneTo && (newValue.phoneFrom.id >= newValue.phoneTo.id)) {
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
})

.directive('uiUserEmailUnique', function(usersLoader){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch('userEdited.email', function (newValue, oldValue) {
                if (newValue === oldValue || !newValue) {
                    ctrl.$setValidity('unique', true);
                    return;
                }
                usersLoader.loadItems({
                    filters: [
                        { type: 'equal', fields: ['email'], value: newValue }
                    ]
                }).then(function(users) {
                    var doubleItem = _.find(users.getItems(), function(user) {
                        return (user.id !== scope.userEdited.id);
                    });
                    ctrl.$setValidity('unique', doubleItem === undefined);
                });
            });
        }
    };
})
;