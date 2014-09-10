'use strict';

angular.module('DealerSiteApp', ['ngRoute', 'ui.bootstrap.pagination', 'ui.multicombo',
    'max.dal.entities.dealersite', 
    'max.dal.entities.dealersitelogin', 
    'max.dal.entities.dealertariff', 
    'max.dal.entities.user'
])

.config(['$routeProvider', function($routeProvider) {

    $routeProvider
    .when('/dealersitelist', {
        templateUrl: 'template/page/dealersite/list.html',
        controller: 'DealerSiteListCtrl',
        reloadOnSearch: false,
        resolve: {
            data: function(dealersLoader, sitesLoader, $rootScope, $location, $q, Construction) {
                if (_.isEmpty($location.search()) && !_.isEmpty($rootScope.savedDealerSiteListLocationSearch)) {
                    $location.search($rootScope.savedDealerSiteListLocationSearch);
                }
                var ls = $location.search();
                var toResolve = {};
                if (!_.isEmpty(ls.dealers)) {
                    toResolve.dealers = dealersLoader.loadItems({
                        filters: [
                            { fields: ['id'], type: 'in', value: ls.dealers.split(';') }
                        ],
                        fields: ['companyName']
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
    .when('/dealersite', {       // ?id=new - создание новой регистрации; ?id=5 - редактирование регистрации
        templateUrl: 'template/page/dealersite/edit.html',
        controller: 'DealerSiteEditCtrl',
        resolve: {
            data: function(Construction, dealerSitesLoader, dealersLoader, sitesLoader, usersLoader, $location, $q) {
                return usersLoader.loadDirectories().then(function(directories) {
                    var toResolve;
                    var ls = $location.search();
                    if (ls.id === 'new') {
                        return directories.resolveRefs();
                    } else {
                        return dealerSitesLoader.loadItem(ls.id).then(function(dealerSite) {
                            directories.dealerSite = dealerSite;
                            return $q.all({
                                dealers: dealersLoader.loadItems({
                                    filters: [
                                        { fields: ['id'], type: 'equal', value: dealerSite.dealer.id }
                                    ],
                                    fields: ['companyName']
                                }),
                                sites: sitesLoader.loadItems({
                                    filters: [
                                        { fields: ['id'], type: 'equal', value: dealerSite.site.id }
                                    ]
                                })
                            }).then(function(collections) {
                                _.assign(directories, collections);
                                return directories.resolveRefs();
                            });
                        });
                    }
                });
            }
        }
    })
;
}])

.constant('DealerSiteRequiredFields', {
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
    17: {                   publicUrl: true },
    19: {                                                             coordinates: true}
})

.controller('DealerSiteListCtrl', function($scope, $rootScope, $location, $q, data, Construction,
    DealerSite, dealerSiteStatuses, dealerSitesLoader, dealersLoader, sitesLoader, salesLoader, dealerTariffsLoader,
    dealerSiteLoginsLoader, dealerSiteLoginTypes, DealerSiteRequiredFields, Dealers, Sites, usersLoader) {

    _.assign($scope, data);
    $scope.dealerSiteStatuses = dealerSiteStatuses;
    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;

    if ($rootScope.savedDealerSiteListNotice) {
        $scope.savedDealerSiteListNotice = $rootScope.savedDealerSiteListNotice;
        delete $rootScope.savedDealerSiteListNotice;
    }

    $scope.clickNewDealerSite = function() {
        $location.path('/dealersite').search('id=new');
    }

    $scope.setPatternsDefault = function() {
        $scope.patterns = {
            dealers: [],
            sites: [],
            isActive: null
        };
    }

    $scope.onPatternChange = function () {
        onSortingChange();
    };

    $scope.$watch('patterns', $scope.onPatternChange, true);

    $scope.sortableColumns = [
        {id: "dealer", name: "Салон", width: '30%'},
        {id: "site", name: "Сайт", width: '20%'},
        {id: "externalId", name: "Код на сайте", width: '10%'},
        {id: "publicUrl", name: "Страница на сайте", width: '12.5%'},
        {id: "isActive", name: "Статус", width: '12.5%'}
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

    $scope.onSelectPage = function(page) {
        if (page) {
            $scope.paging.currentPage = page;
        }
        var searchParams = _.pick(_.assign({}, $scope.patterns, $scope.paging), function(value) {
            return value;
        });
        searchParams.orders = $scope.sorting;
        $rootScope.savedDealerSiteListLocationSearch = toLocationSearch(searchParams);
        $location.search($rootScope.savedDealerSiteListLocationSearch);

        var dealerSiteQueryParams = makeQueryParams($rootScope.savedDealerSiteListLocationSearch);
        dealerSitesLoader.loadItems(dealerSiteQueryParams).then(function(dealerSites) {
            $scope.totalItems = dealerSites.getParams().pager.total;
            var construction = new Construction({dealerSites: dealerSites});
            var dealerSitesItems = dealerSites.getItems();
            $q.all({
                dealers: dealersLoader.loadItems({
                    filters: [
                        { fields: ['id'], type: 'in', value: _.pluck(_.pluck(dealerSitesItems, 'dealer'), 'id') }
                    ],
                    fields: ['companyName']
                }),
                sites: sitesLoader.loadItems({
                    filters: [
                        { fields: ['id'], type: 'in', value: _.pluck(_.pluck(dealerSitesItems, 'site'), 'id') }
                    ]
                })
            }).then(function(collections) {
                _.assign(construction, collections);
                _.assign($scope, construction.resolveRefs());
                viewTop('DealerSiteListAddDealerSiteUp');
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
            dealers: (!ls.dealers) ? [] : _.invoke(ls.dealers.split(';'), function() {
                return $scope.dealers.get(_.parseInt(this));
            }),
            sites: (!ls.sites) ? [] : _.invoke(ls.sites.split(';'), function() {
                return $scope.sites.get(_.parseInt(this));
            }),
            isActive: dealerSiteStatuses.get((ls.isActive === 'true') ? true : (ls.isActive === 'false') ? false : null)
        };
        $scope.sorting = ls.orders && ls.orders.split(';') || ['-id'];
        $scope.paging = {
            currentPage: _.parseInt(ls.currentPage),
            itemsPerPage: _.parseInt(ls.itemsPerPage)
        };
    } else {
        $scope.setPatternsDefault();
        $scope.sorting = ['-id'];
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
            if (!_.isEmpty(ls.sites)) {
                queryParams.filters.push({
                    fields: ['site'],
                    type: 'in',
                    value: ls.sites.split(';')
                });
            }
            if (ls.isActive === 'true' || ls.isActive === 'false') {
                queryParams.filters.push({
                    fields: ['isActive'],
                    type: 'equal',
                    value: (ls.isActive === 'true') ? true : false
                });
            }
            return queryParams;
        } else {
            return {
                orders: ['-id'],
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

    function invalidFields(dealerSite, dealerSiteLogins, user) {
        var invalid = [];
        var siteRequiredFields = DealerSiteRequiredFields[dealerSite.site.id];
        if (!siteRequiredFields) {
            return invalid;
        }
        if (siteRequiredFields["externalId"] && !dealerSite.externalId) {
            invalid.push(['Код салона на сайте']);
        }
        if (siteRequiredFields["publicUrl"] && !dealerSite.publicUrl) {
            invalid.push(['Страница на сайте']);
        }
        var dealerSiteLoginSite = _.find(dealerSiteLogins.getItems(), {type: dealerSiteLoginTypes.get('site')});
        if (siteRequiredFields["site"] && !(dealerSiteLoginSite && dealerSiteLoginSite.login)) {
            invalid.push(['Логин на сайте']);
        }
        if (siteRequiredFields["site"] && !(dealerSiteLoginSite && dealerSiteLoginSite.password)) {
            invalid.push(['Пароль на сайте']);
        }
        var dealerSiteLoginFtp = _.find(dealerSiteLogins.getItems(), {type: dealerSiteLoginTypes.get('ftp')});
        if (siteRequiredFields["ftp"] && !(dealerSiteLoginFtp && dealerSiteLoginFtp.login)) {
            invalid.push(['Логин для ftp']);
        }
        if (siteRequiredFields["ftp"] && !(dealerSiteLoginFtp && dealerSiteLoginFtp.password)) {
            invalid.push(['Пароль для ftp']);
        }
        if (siteRequiredFields["coordinates"] && !(user && user.dealer.latitude)) {
            invalid.push(['Широта салона']);
        }
        if (siteRequiredFields["coordinates"] && !(user && user.dealer.longitude)) {
            invalid.push(['Долгота салона']);
        }
        return invalid;
    }

    $scope.toggleDealerSiteStatus = function(dealerSite) {
        var confirmMessage,
            noticeMessage,
            newStatus;
        var check;

        if (dealerSite.isActive.id === true) {
            confirmMessage = 'Блокировать регистрацию ';
            noticeMessage = 'Блокирована регистрация ';
            newStatus = dealerSiteStatuses.get(false);
            check = $q.when(true);
        } else {
            confirmMessage = 'Разблокировать регистрацию ';
            noticeMessage = 'Разблокирована регистрация ';
            newStatus = dealerSiteStatuses.get(true);
            check = $q.all({
                dealerSiteLogins: dealerSiteLoginsLoader.loadItemsDealerSite(dealerSite.dealer.id, dealerSite.site.id),
                users: usersLoader.loadItems({
                    filters: [
                        { fields: ['id'], type: 'equal', value: dealerSite.dealer.id }
                    ]
                })
            }).then(function(collections) {
                var invalid = invalidFields(dealerSite, collections.dealerSiteLogins, collections.users.getItems()[0]);
                if (invalid.length) {
                    alert("Для разблокирования необходимо заполнить поля формы регистрации: " + invalid.join('; '));
                }
                return !invalid.length;
            });
        }
        check.then(function(valid) {
            if (valid && confirm(confirmMessage + dealerSite.name() + '?')) {
                var dealerSiteEdited = new DealerSite;
                angular.extend(dealerSiteEdited, dealerSite);
                dealerSiteEdited.isActive = newStatus;
                dealerSiteEdited.save({
                    dealers: (new Dealers()).uniteItem(dealerSiteEdited.dealer),
                    sites: (new Sites()).uniteItem(dealerSiteEdited.site)
                }).then(function(dealerSite) {
                    $scope.savedDealerSiteListNotice = noticeMessage + dealerSite.name();
                    $scope.onSelectPage();
                });
            }
        });
    };

    $scope.removeDealerSite = function(dealerSite) {
        var today = new Date;
        today.setUTCHours(0, 0, 0, 0);
        $q.all({
            sales: salesLoader.loadItems({
                filters: [
                    { fields: ['type'], type: 'equal', value: 'card' },
                    { fields: ['dealer'], type: 'equal', value: dealerSite.dealer.id },
                    { fields: ['site'], type: 'equal', value: dealerSite.site.id },
                    { fields: ['activeTo'], type: 'greaterOrEqual', value: today.toISOString().slice(0, 10) }
                ]
            }),
            dealerTariff: dealerTariffsLoader.loadItemDealerSite(dealerSite.dealer.id, dealerSite.site.id)
        }).then(function(respond) {
            var alertText = "Удаление невозможно, так как";
            var noRemove = false;
            if (respond.sales.getItems().length) {
                noRemove = true;
                alertText += "\nу салона есть активная карточка";
            }
            if (respond.dealerTariff) {
                noRemove = true;
                alertText += "\nу салона есть активный тариф";
            }
            if (noRemove) {
                alert(alertText);
            } else {
                var confirmMessage = 'Вы действительно хотите отменить экспорт ';
                var noticeMessage = 'Удалена регистрация ';
                if (confirm(confirmMessage + dealerSite.name() + '?')) {
                    dealerSite.remove().then(function() {
                        $scope.savedDealerSiteListNotice = noticeMessage + dealerSite.name();
                        $scope.onSelectPage();
                    });
                }
            }
        });
    };
    
    $scope.publicUrlText = function(dealerSite) {
        if (dealerSite.publicUrl) {
            return 'Ссылка';
        }
    }

    $scope.editDealerSiteUrl = function(dealerSite) {
        return '#/dealersite/?id=' + dealerSite.id;
    };
})

.controller('DealerSiteEditCtrl', function($scope, $rootScope, $location, $window, $q, data, 
    DealerSite, dealerSiteStatuses, DealerSiteRequiredFields, dealersLoader, sitesLoader, DealerSiteLogin, 
    dealerSiteLoginTypes, dealerSiteLoginsLoader, Dealers, Sites, usersLoader) {

    _.assign($scope, data);
    $scope.dealerSiteStatuses = dealerSiteStatuses;
    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;
    $scope.requiredFields = DealerSiteRequiredFields;

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

    function makeDealerSiteNew() {
        $scope.actionName = "Создание";
        $scope.dealerSiteEdited = new DealerSite;
        $scope.dealerSiteEdited.isActive = dealerSiteStatuses.get(true);
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

    $scope.$watch('[dealerSiteEdited.dealer, dealerSiteEdited.site]', function loadDealerSiteLogins() {
        $scope.dealerSiteLoginsEdited = {
            site: new DealerSiteLogin({type: 'site'}),
            ftp: new DealerSiteLogin({type: 'ftp'})
        };
        if ($scope.dealerSiteEdited.dealer && $scope.dealerSiteEdited.site) {
            dealerSiteLoginsLoader.loadItemsDealerSite($scope.dealerSiteEdited.dealer.id, $scope.dealerSiteEdited.site.id,
                $scope).then(function(dealerSiteLogins) {
                $scope.dealerSiteLogins = dealerSiteLogins;
                makeDealerSiteLoginsCopy();
            });
        }
    }, true);

    $scope.$watch('[dealerSiteEdited.dealer, dealerSiteEdited.site]', function loadUser() {
        if (!$scope.dealerSiteEdited.dealer || !$scope.dealerSiteEdited.site || !$scope.requiredFields[$scope.dealerSiteEdited.site.id].coordinates) {
            delete $scope.userEdited;
            return;
        }
        usersLoader.loadItem($scope.dealerSiteEdited.dealer.id, $scope).then(function(user) {
            $scope.userEdited = user;
        });
    }, true);

    function saveDealerSiteEdited(directories) {
        return $scope.dealerSiteEdited.save(directories).then(function(dealerSite) {
            $rootScope.savedDealerSiteListNotice = 'Сохранена регистрация ' + dealerSite.name();
        });
    }

    function saveRemoveDealerSiteLogin(dealerSiteLogin, directories) {
        if (dealerSiteLogin.login) {
            dealerSiteLogin.loginError = false;
            return dealerSiteLogin.save(directories);
        } else if (dealerSiteLogin.id) {
            return dealerSiteLogin.remove();
        }
    }

    function saveUserEdited(directories) {
        if ($scope.userEdited) {
            return $scope.userEdited.save(directories);
        }
    }

    $scope.saveDealerSiteEditedWithLogins = function() {
        var directories = {
            dealers: (new Dealers()).uniteItem($scope.dealerSiteEdited.dealer),
            sites: (new Sites()).uniteItem($scope.dealerSiteEdited.site)
        }
        $q.all([
            saveDealerSiteEdited(directories),
            saveRemoveDealerSiteLogin($scope.dealerSiteLoginsEdited.site, directories),
            saveRemoveDealerSiteLogin($scope.dealerSiteLoginsEdited.ftp, directories),
            saveUserEdited($scope)
        ]).then(function() {
            $location.path('/dealersitelist').search('');
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