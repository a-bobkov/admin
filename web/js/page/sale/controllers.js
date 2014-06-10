'use strict';

angular.module('SaleApp', ['ngRoute', 'ui.bootstrap.pagination', 'ngInputDate',
        'max.dal.entities.sale',
        'max.dal.entities.dealertariff',
        'max.dal.entities.tariffrate'
    ])

.config(['$routeProvider', function($routeProvider) {

    $routeProvider
    .when('/salelist', {
        templateUrl: 'template/page/sale/list.html',
        controller: 'SaleListCtrl',
        reloadOnSearch: false,
        resolve: {
            data: function(saleStatusesLoader, saleTypesLoader, dealersLoader, sitesLoader, $rootScope, $location, $q) {
                var toResolve = {
                    saleTypes: saleTypesLoader.loadItems().then(function(respond) {
                        return respond.saleTypes;
                    }),
                    saleStatuses: saleStatusesLoader.loadItems().then(function(respond) {
                        return respond.saleStatuses;
                    })
                };
                if (_.isEmpty($location.search()) && !_.isEmpty($rootScope.savedSaleListLocationSearch)) {
                    $location.search($rootScope.savedSaleListLocationSearch);
                }
                var ls = $location.search();
                if (!_.isEmpty(ls.dealers)) {
                    var dealerQueryParams = {
                        filters: [
                            { fields: ['id'], type: 'in', value: ls.dealers.split(';') }
                        ],
                        fields: ['dealer_list_name']
                    };
                    toResolve.dealers = dealersLoader.loadItems(dealerQueryParams).then(function(respond) {
                        return respond.dealers;
                    });
                }
                if (!_.isEmpty(ls.sites)) {
                    var siteQueryParams = {
                        filters: [
                            { fields: ['id'], type: 'in', value: ls.sites.split(';') }
                        ]
                    };
                    toResolve.sites = sitesLoader.loadItems(siteQueryParams).then(function(respond) {
                        return respond.sites;
                    });
                }
                return $q.all(toResolve);
            }
        }
    })
    .when('/sale/card', {       // ?id=new - создание новой карточки; ?id=5 - редактирование карточки 5
        templateUrl: 'template/page/sale/edit.html',
        controller: 'SaleCardEditCtrl',
        resolve: {
            data: function(saleStatusesLoader, saleTypesLoader, usersLoader, salesLoader, tariffsLoader, tariffRatesLoader, $location, $q) {
                var toResolve = [
                    saleTypesLoader.loadItems(),
                    saleStatusesLoader.loadItems(),
                    usersLoader.loadDirectories()
                ];
                return $q.all(toResolve).then(function(directoriesArr) {
                    var directories = _.transform(directoriesArr, _.assign, {});
                    var ls = $location.search();
                    if (ls.id === 'new') {
                        return $q.when(directories);
                    } else {
                        var id = _.parseInt(ls.id);
                        return salesLoader.loadItem(id, directories).then(function(salesDirectories) {
                            _.assign(directories, salesDirectories);
                            directories.city = directories.sale.dealer.city;
                            var tariffQueryParams = {
                                filters: [
                                    { fields: ['site'], type: 'equal', value: directories.sale.site.id },
                                    { fields: ['type'], type: 'equal', value: 'periodical' }
                                ]
                            };
                            return tariffsLoader.loadItems(tariffQueryParams, directories).then(function(tariffsDirectories) {
                                _.assign(directories, tariffsDirectories);
                                directories.sale.tariff = tariffsDirectories.tariffs.get(directories.sale.tariff.id);
                                var tariffs = tariffsDirectories.tariffs.getItems();
                                var dealer = directories.dealers.getItems()[0];
                                var tariffRateQueryParams = {
                                    filters: [
                                        { fields: ['tariff'], type: 'in', value: _.pluck(tariffs, 'id') },
                                        { fields: ['city'], type: 'in', value: [dealer.city.id, null] }
                                    ]
                                };
                                return tariffRatesLoader.loadItems(tariffRateQueryParams, directories).then(function(tariffRateDirectories) {
                                    return _.assign(directories, tariffRateDirectories);
                                });
                            });
                        });
                    }
                });
            }
        }
    })
    .when('/sale/addcard', {    // ?id=new&cardId=4 - создание расширения для карточки 4; ?id=5 - редактирование расширения 5
        templateUrl: 'template/page/sale/edit.html',
        controller: 'SaleAddcardEditCtrl',
        resolve: {
            data: function(saleStatusesLoader, saleTypesLoader, salesLoader, usersLoader, tariffsLoader, tariffRatesLoader, $location, $q) {
                var toResolve = [
                    saleTypesLoader.loadItems(),
                    saleStatusesLoader.loadItems(),
                    usersLoader.loadDirectories()
                ];
                return $q.all(toResolve).then(function(directoriesArr) {
                    var directories = _.transform(directoriesArr, _.assign, {});
                    var ls = $location.search();
                    if (ls.id === 'new') {
                        toResolve = $q.when(_.parseInt(ls.cardId));
                    } else {
                        var id = _.parseInt(ls.id);
                        toResolve = salesLoader.loadItem(id, directories).then(function(salesDirectories) {
                            _.assign(directories, salesDirectories);
                            delete directories.tariffs;
                            return salesDirectories.sale.parentId;
                        });
                    }
                    return toResolve.then(function(parentId) {
                        var saleQueryParams = {
                            filters: [
                                { fields: ['type'], type: 'in', value: ['card', 'addcard'] },
                                { fields: ['cardId'], type: 'equal', value: parentId }
                            ]
                        };
                        return salesLoader.loadItems(saleQueryParams, directories).then(function(salesDirectories) {
                            directories.saleParent = salesDirectories.sales.getItems()[0];
                            delete salesDirectories.sales;
                            _.assign(directories, salesDirectories);
                            var tariffQueryParams = {
                                filters: [
                                    { fields: ['site'], type: 'equal', value: directories.saleParent.site.id },
                                    { fields: ['type'], type: 'equal', value: 'periodical' }
                                ]
                            };
                            return tariffsLoader.loadItems(tariffQueryParams, directories).then(function(tariffsDirectories) {
                                _.assign(directories, tariffsDirectories);
                                directories.saleParent.tariff = tariffsDirectories.tariffs.get(directories.saleParent.tariff.id);
                                if (directories.sale) {
                                    directories.sale.tariff = tariffsDirectories.tariffs.get(directories.sale.tariff.id);
                                }
                                var tariffs = tariffsDirectories.tariffs.getItems();
                                var dealer = directories.dealers.getItems()[0];
                                var tariffRateQueryParams = {
                                    filters: [
                                        { fields: ['tariff'], type: 'in', value: _.pluck(tariffs, 'id') },
                                        { fields: ['city'], type: 'in', value: [dealer.city.id, null] }
                                    ]
                                };
                                return tariffRatesLoader.loadItems(tariffRateQueryParams, directories).then(function(tariffRateDirectories) {
                                    return _.assign(directories, tariffRateDirectories);
                                });
                            });
                        });
                    });
                });
            }
        }
    })
    .when('/sale/extra', {      // ?id=new&cardId=4 - создание новой доп.продажи к карточке 4; ?id=5 - редактирование доп.продажи 5
        templateUrl: 'template/page/sale/edit.html',
        controller: 'SaleExtraEditCtrl',
        resolve: {
            data: function(saleStatusesLoader, saleTypesLoader, salesLoader, $location, $q) {
                var toResolve = [
                    saleTypesLoader.loadItems(),
                    saleStatusesLoader.loadItems()
                ];
                return $q.all(toResolve).then(function(directoriesArr) {
                    var directories = _.transform(directoriesArr, _.assign, {});
                    var ls = $location.search();
                    if (ls.id === 'new') {
                        toResolve = $q.when(_.parseInt(ls.cardId));
                    } else {
                        var id = _.parseInt(ls.id);
                        toResolve = salesLoader.loadItem(id, directories).then(function(salesDirectories) {
                            _.assign(directories, salesDirectories);
                            return salesDirectories.sale.cardId;
                        });
                    }
                    return toResolve.then(function(cardId) {
                        var saleQueryParams = {
                            filters: [
                                { fields: ['type'], type: 'in', value: ['card', 'addcard'] },
                                { fields: ['cardId'], type: 'equal', value: cardId }
                            ]
                        };
                        return salesLoader.loadItems(saleQueryParams, directories).then(function(salesDirectories) {
                            directories.saleParent = salesDirectories.sales.getItems()[0];
                            delete salesDirectories.sales;
                            _.assign(directories, salesDirectories);
                            return directories;
                        });
                    });
                });
            }
        }
    })
;
}])

.controller('SaleListCtrl', function($scope, $rootScope, $filter, $location, $window, $timeout, data, 
    salesLoader, dealersLoader, sitesLoader, Sale) {

    _.assign($scope, data);
    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;

    if ($rootScope.savedSaleListNotice) {
        $scope.savedSaleListNotice = $rootScope.savedSaleListNotice;
        delete $rootScope.savedSaleListNotice;
    }

    $scope.setPatternsDefault = function() {
        $scope.patterns = {
            dealers: [],
            sites: [],
            isActive: null,
            type: null,
            archive: false
        };
    }

    $scope.onPatternChange = function (newValue, oldValue) {
        onSortingChange();
    };

    $scope.$watch('patterns', $scope.onPatternChange, true);

    $scope.sortableColumns = [
        {id: "date", name: "Дата", width: '5%'},
        {id: "dealer", name: "Салон", width: '20%'},
        {id: "site", name: "Сайт", width: '15%'},
        {id: "type", name: "Тип", width: '5%'},
        {id: "count", name: "Лимит", width: '5%'},
        {id: "activeFrom", name: "С", width: '5%'},
        {id: "activeTo", name: "По", width: '5%'},
        {id: "amount", name: "Стоим, руб.", width: '10%'},
        {id: "siteAmount", name: "Себест, руб.", width: '10%'},
        {id: "isActive", name: "Акт", width: '5%'}
    ];

    $scope.sortingMark = function(column) {
        if (column === $scope.sorting.column) {
            return ($scope.sorting.reverse) ? ' ↑': ' ↓';
        }
        return '   ';
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
        if (page) {
            $scope.paging.currentPage = page;
        }

        var searchParams = _.pick(_.extend({}, $scope.patterns, $scope.sorting, $scope.paging), function(value) {
            return value;
        });
        $rootScope.savedSaleListLocationSearch = toLocationSearch(searchParams);
        $location.search($rootScope.savedSaleListLocationSearch);

        var queryParams = makeQueryParams($rootScope.savedSaleListLocationSearch);
        var staticDirectories = _.pick($scope, ['saleTypes', 'saleStatuses']);
        salesLoader.loadItems(queryParams, staticDirectories).then(function(newDirectories) {
            _.assign($scope, newDirectories);
            $scope.totalItems = $scope.sales.getParams().pager.total;
            var topSaleList = document.getElementById('SaleListAddSaleUp').getBoundingClientRect().top;
            if (topSaleList < 0) {
                window.scrollBy(0, topSaleList);
            }

            var cards = _.filter($scope.sales.getItems(), function(sale) {
                return sale.isCard() || sale.isAddcard();
            });
            var cardIds = _.pluck(cards, 'cardId');
            var addSaleQueryParams = {
                filters: [
                    { fields: ['type'], type: 'equal', value: 'addcard' },
                    { fields: ['parentId'], type: 'in', value: cardIds }
                ]
            };
            var directories = _.assign({}, staticDirectories, _.pick(newDirectories, ['dealers', 'sites']));
            return salesLoader.loadItems(addSaleQueryParams, directories).then(function(collection) {
                $scope.sales_add = collection.sales;
            });
        });
    };

    $scope.isAddable = function(sale) {
        return (sale.isCard() || sale.isAddcard()) && $scope.sales_add && !_.find($scope.sales_add.getItems(), {parentId: sale.cardId});
    }

    var ls = $location.search();
    if (_.size(ls)) {
        $scope.patterns = {
            dealers: ls.dealers && _.invoke(ls.dealers.split(';'), function() {
                return $scope.dealers.get(_.parseInt(this));
            }),
            sites: ls.sites && _.invoke(ls.sites.split(';'), function() {
                return $scope.sites.get(_.parseInt(this));
            }),
            isActive: $scope.saleStatuses.get((ls.isActive === 'true') ? true : (ls.isActive === 'false') ? false : null),
            type: $scope.saleTypes.get(ls.type),
            archive: !!ls.archive
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
            if (!_.isEmpty(ls.type)) {
                queryParams.filters.push({
                    fields: ['type'],
                    type: 'equal',
                    value: ls.type
                });
            }
            if (!ls.archive) {
                queryParams.filters.push({
                    fields: ['activeTo'],
                    type: 'greaterOrEqual',
                    value: new Date().toISOString().slice(0, 10)
                });
            }
            return queryParams;
        } else {
            return {
                order: {
                    order_field: 'id'
                },
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

    $scope.toggleSaleStatus = function(sale) {
        var confirmMessage,
            noticeMessage,
            newStatus;

        if (sale.isActive.id === true) {
            confirmMessage = 'Дезактивировать продажу ';
            noticeMessage = 'Дезактивирована продажа ';
            newStatus = $scope.saleStatuses.get(false);
        } else {
            confirmMessage = 'Активировать продажу ';
            noticeMessage = 'Активирована продажа ';
            newStatus = $scope.saleStatuses.get(true);
        }
        if (confirm(confirmMessage + sale.name() + '?')) {
            var saleEdited = new Sale;
            angular.extend(saleEdited, sale);
            saleEdited.isActive = newStatus;
            saleEdited.save($scope).then(function() {
                $scope.savedSaleListNotice = noticeMessage + sale.name();
                $scope.onSelectPage();
            });
        }
    };

    $scope.newSaleCard = function() {
        $location.search('id=new');
        $location.path('/sale/card');
    };

    $scope.newSaleAddcard = function(sale) {
        $location.search('id=new&cardId=' + sale.cardId);
        $location.path('/sale/addcard');
    };

    $scope.newSaleExtra = function(sale) {
        $location.search('id=new&cardId=' + sale.cardId);
        $location.path('/sale/extra');
    };

    $scope.editSale = function(sale) {
        $location.search('id=' + sale.id);
        $location.path('/sale/' + sale.type.id);
    };

    $scope.removeSale = function(sale) {
        var confirmMessage,
            noticeMessage;

        confirmMessage = 'Вы действительно хотите удалить продажу ';
        noticeMessage = 'Удалена продажа ';
        if (confirm(confirmMessage + sale.name() + '?')) {
            sale.remove().then(function() {
                $scope.savedSaleListNotice = noticeMessage + sale.name();
                $scope.onSelectPage();
            });
        }
    };
})

.controller('SaleCardEditCtrl', function($scope, $rootScope, $location, $window, $filter, data, Sale,
    dealersLoader, sitesLoader, salesLoader, tariffsLoader, dealerTariffsLoader, tariffRatesLoader) {

    _.assign($scope, data);

    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;

    if ($scope.sale) {
        makeSaleCopy();
    } else {
        makeSaleNew();
    }

    $window.scrollTo(0,0);

    function makeSaleCopy() {
        $scope.actionName = "Изменение карточки";
        $scope.saleEdited = new Sale();
        angular.extend($scope.saleEdited, $scope.sale);
    }

    function makeSaleNew() {
        $scope.actionName = "Создание карточки";
        $scope.saleEdited = new Sale ({
            type: 'card',
            date: new Date,
            isActive: false
        }, $scope);
    }

    $scope.$watch('saleEdited.site', function loadTariffs(newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if (!$scope.saleEdited.site) {
            delete $scope.tariffs;
            return;
        }
        var tariffQueryParams = {
            filters: [
                { fields: ['site'], type: 'equal', value: $scope.saleEdited.site.id },
                { fields: ['type'], type: 'equal', value: 'periodical' }
            ]
        };
        var oldDirectories = _.pick($scope, 'sites');
        tariffsLoader.loadItems(tariffQueryParams, oldDirectories).then(function(tariffsDirectories) {
            _.assign($scope, tariffsDirectories);
        });
    });

    $scope.$watch('saleEdited.dealer', function loadCity(newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if (!$scope.saleEdited.dealer) {
            delete $scope.city;
            return;
        }
        var dealerQueryParams = {
            filters: [
                { fields: ['id'], type: 'equal', value: $scope.saleEdited.dealer.id }
            ]
        };
        var oldDirectories = _.pick($scope, ['cities', 'markets', 'metros', 'managers']);
        dealersLoader.loadItems(dealerQueryParams, oldDirectories).then(function(dealerDirectories) {
            var dealer = dealerDirectories.dealers.getItems()[0];
            $scope.city = dealer.city;
        });
    });

    $scope.$watch('[city, tariffs]', function loadTariffRates(newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if (!$scope.city || _.isEmpty($scope.tariffs)) {
            delete $scope.tariffRates;
            return;
        }
        var tariffRateQueryParams = {
            filters: [
                { fields: ['tariff'], type: 'in', value: _.pluck($scope.tariffs.getItems(), 'id') },
                { fields: ['city'], type: 'in', value: [$scope.city.id, null] }
            ]
        };
        var oldDirectories = _.pick($scope, ['cities', 'tariffs']);
        tariffRatesLoader.loadItems(tariffRateQueryParams, oldDirectories).then(function(tariffRateDirectories) {
            _.assign($scope, tariffRateDirectories);
        });
    }, true);

    $scope.$watch('[saleEdited.dealer, saleEdited.site, tariffs]', function loadDealerTariff(newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if (!$scope.saleEdited.dealer || !$scope.saleEdited.site || _.isEmpty($scope.tariffs)) {
            $scope.saleEdited.tariff = null;
            $scope.saleEditTariffWarningNoDefaultTariff = false;
            return;
        }
        var dealerTariffsQueryParams = {
            filters: [
                { fields: ['dealer'], type: 'equal', value: $scope.saleEdited.dealer.id },
                { fields: ['site'], type: 'equal', value: $scope.saleEdited.site.id }
            ]
        };
        var oldDirectories = _.pick($scope, ['dealers', 'sites', 'tariffs']);
        dealerTariffsLoader.loadItems(dealerTariffsQueryParams, oldDirectories).then(function(dealerTariffsDirectories) {
            var dealerTariff = dealerTariffsDirectories.dealerTariffs.getItems()[0];
            if (dealerTariff) {
                $scope.saleEdited.tariff = dealerTariff.tariff;
                $scope.saleEditTariffWarningNoDefaultTariff = false;
            } else {
                $scope.saleEdited.tariff = null;
                $scope.saleEditTariffWarningNoDefaultTariff = true;
            }
        });
    }, true);

    $scope.$watch('[saleEdited.dealer, saleEdited.site, tariffs]', function loadLastActiveCard(newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if (!$scope.saleEdited.dealer || !$scope.saleEdited.site || _.isEmpty($scope.tariffs)) {
            delete $scope.lastActiveCard; 
            return;
        }
        var queryParams = {
            filters: [
                { fields: ['dealer'], type: 'equal', value: $scope.saleEdited.dealer.id },
                { fields: ['site'], type: 'equal', value: $scope.saleEdited.site.id },
                { fields: ['type'], type: 'in', value: ['card', 'addcard'] },
                { fields: ['activeTo'], type: 'greaterOrEqual', value: new Date().toISOString().slice(0, 10) }
            ],
            order: {
                order_field: 'activeTo',
                order_direction: 'desc'
            }
        };
        var oldDirectories = _.pick($scope, ['saleTypes', 'saleStatuses', 'dealers', 'sites', 'tariffs']);
        salesLoader.loadItems(queryParams, oldDirectories).then(function(newDirectories) {
            $scope.lastActiveCard = newDirectories.sales.getItems()[0];
        });
    }, true);

    $scope.$watch('[lastActiveCard, saleEdited.tariff]', function setActiveDates(newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if (!$scope.lastActiveCard || !$scope.saleEdited.tariff) {
            $scope.saleEdited.activeFrom = null;
            $scope.saleEdited.activeTo = null;
            return;
        }
        if ($scope.lastActiveCard) {
            $scope.saleEdited.activeFrom = angular.copy($scope.lastActiveCard.activeTo);
        } else {
            $scope.saleEdited.activeFrom = new Date();
        }
        $scope.saleEdited.activeTo = angular.copy($scope.saleEdited.activeFrom);
        $scope.saleEdited.activeFrom.setDate($scope.saleEdited.activeFrom.getDate() + 1);
        if ($scope.saleEdited.tariff.periodUnit === 'day') {
            $scope.saleEdited.activeTo.setDate($scope.saleEdited.activeTo.getDate() + $scope.saleEdited.tariff.period);
        } else if ($scope.saleEdited.tariff.periodUnit === 'month') {
            $scope.saleEdited.activeTo.setMonth($scope.saleEdited.activeTo.getMonth() + $scope.saleEdited.tariff.period);
        }
    }, true);

    $scope.$watch('[city, saleEdited.tariff, tariffRates]', function setCountAndSums(newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if (!$scope.city || !$scope.saleEdited.tariff || _.isEmpty($scope.tariffRates)) {
            $scope.saleEdited.cardAmount = 0;
            $scope.saleEdited.amount = 0;
            $scope.saleEdited.siteAmount = 0;
            return;
        }
        $scope.saleEdited.count = $scope.saleEdited.tariff.count;
        var tariffRate = $scope.saleEdited.tariff.getLastRate($scope.city, $scope.tariffRates.getItems());
        if (tariffRate) {
            $scope.saleEdited.cardAmount = tariffRate.rate;
            $scope.saleEdited.amount = tariffRate.rate;
            $scope.saleEdited.siteAmount = tariffRate.siteRate;
        } else {
            $scope.saleEdited.cardAmount = 0;
            $scope.saleEdited.amount = 0;
            $scope.saleEdited.siteAmount = 0;
        }
    }, true);

    $scope.$watch('[saleEdited.site, saleEdited.count, saleEdited.tariff]', function setInfo(newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if (!$scope.saleEdited.site || !$scope.saleEdited.count || !$scope.saleEdited.tariff) {
            $scope.saleEdited.info = '';
            return;
        }
        $scope.saleEdited.info = 'Оплата на сайте ' + $scope.saleEdited.site.name + ' размещения ' + $scope.saleEdited.count + ' объявлений в течение ' + $scope.saleEdited.tariff.period + ' ' + $scope.saleEdited.tariff.periodUnit;
    }, true);

    $scope.saveSaleEdited = function() {
        $scope.saleEdited.save($scope).then(function(sale) {
            $rootScope.savedSaleListNotice = 'Сохранена продажа ' + sale.name();
            $location.search('');
            $location.path('/salelist');
        });
    };
})

.controller('SaleAddcardEditCtrl', function($scope, $rootScope, $location, $window, $filter, data, Sale,
    dealersLoader, sitesLoader, salesLoader, tariffsLoader, usersLoader, dealerTariffsLoader, tariffRatesLoader) {

    _.assign($scope, data);

    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;

    if ($scope.sale) {
        makeSaleCopy();
    } else {
        makeSaleNew();
    }

    $window.scrollTo(0,0);

    function makeSaleCopy() {
        $scope.actionName = "Изменение расширения";
        $scope.saleEdited = new Sale();
        angular.extend($scope.saleEdited, $scope.sale);
        $scope.tariffParent = $scope.saleParent.tariff;
    }

    function makeSaleNew() {
        $scope.actionName = "Создание расширения";
        $scope.saleEdited = new Sale ({
            type: 'addcard',
            parentId: $scope.saleParent.cardId,
            date: new Date,
            isActive: false
        }, $scope);
        $scope.saleEdited.dealer = $scope.saleParent.dealer;
        $scope.saleEdited.site = $scope.saleParent.site;
        $scope.tariffParent = $scope.saleParent.tariff;
        var dealerTariffsQueryParams = {
            filters: [
                { fields: ['dealer'], type: 'equal', value: $scope.saleEdited.dealer.id },
                { fields: ['site'], type: 'equal', value: $scope.saleEdited.site.id }
            ]
        };
        var directories = _.pick($scope, ['dealers', 'sites', 'tariffs']);
        dealerTariffsLoader.loadItems(dealerTariffsQueryParams, directories).then(function(newDirectories) {
            var dealerTariff = newDirectories.dealerTariffs.getItems()[0];
            $scope.saleEditTariffWarningNoDefaultTariff = !dealerTariff;
            var dealer = $scope.saleEdited.dealer;
            var tariffRates = $scope.tariffRates.getItems();
            if (dealerTariff && (dealerTariff.tariff.getLastRate(dealer, tariffRates).rate > $scope.tariffParent.getLastRate(dealer, tariffRates).rate)) {
                $scope.saleEdited.tariff = dealerTariff.tariff;
            }
        });
        $scope.saleEdited.activeFrom = new Date();
        if ($scope.saleEdited.site.id !== 1 && $scope.saleEdited.site.id !== 5) {   // Дром и Ауто.ру
            $scope.saleEdited.activeFrom.setDate($scope.saleEdited.activeFrom.getDate() + 1);
        }
        $scope.saleEdited.activeTo = $scope.saleParent.activeTo;
    }

    $scope.$watch('saleEdited.tariff', function setCount(newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if (!$scope.saleEdited.tariff) {
            return;
        }
        if ($scope.saleEdited.tariff.count) {
            $scope.saleEdited.count = $scope.saleEdited.tariff.count - $scope.saleParent.tariff.count;
        } else {
            $scope.saleEdited.count = null;
        }
    });

    $scope.$watch('[saleEdited.tariff, saleEdited.activeFrom]', function setSums(newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if (!$scope.saleEdited.tariff || !$scope.saleEdited.activeFrom) {
            return;
        }
        var intervalParent = ($scope.saleParent.activeTo - $scope.saleParent.activeFrom) * 1000 * 60 * 60 * 24 + 1;
        var intervalNew = ($scope.saleEdited.activeTo - $scope.saleEdited.activeFrom) * 1000 * 60 * 60 * 24 + 1;
        var k = intervalNew / intervalParent;
        var dealer = $scope.saleEdited.dealer;
        var tariffRates = $scope.tariffRates.getItems();
        var rateNew = $scope.saleEdited.tariff.getLastRate(dealer, tariffRates);
        var rateParent = $scope.tariffParent.getLastRate(dealer, tariffRates);
        $scope.saleEdited.cardAmount = Math.ceil((rateNew.rate - rateParent.rate) * k * 100) / 100;
        $scope.saleEdited.amount = $scope.saleEdited.cardAmount;
        $scope.saleEdited.siteAmount = Math.ceil((rateNew.siteRate - rateParent.siteRate) * k * 100) / 100;
    }, true);

    $scope.$watch('saleEdited.count', function setInfo(newValue, oldValue) {
        $scope.saleEdited.info = 'Доплата на сайте ' + $scope.saleEdited.site.name + ' за размещение ' + $scope.saleEdited.count + ' объявлений.';
    });

    $scope.saveSaleEdited = function() {
        $scope.saleEdited.save($scope).then(function(sale) {
            $rootScope.savedSaleListNotice = 'Сохранена продажа ' + sale.name();
            $location.search('');
            $location.path('/salelist');
        });
    };
})

.controller('SaleExtraEditCtrl', function($scope, $rootScope, $location, $window, $filter, data, Sale,
    dealersLoader, sitesLoader) {

    _.assign($scope, data);
    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;

    if ($scope.sale) {
        makeSaleCopy();
    } else {
        makeSaleNew();
    }

    $window.scrollTo(0,0);

    function makeSaleCopy() {
        $scope.actionName = "Изменение доплаты";
        $scope.saleEdited = new Sale();
        angular.extend($scope.saleEdited, $scope.sale);
    }

    function makeSaleNew() {
        $scope.actionName = "Создание доплаты";
        $scope.saleEdited = new Sale ({
            type: 'extra',
            cardId: $scope.saleParent.cardId,
            date: new Date,
            activeFrom: $scope.saleParent.activeFrom,
            activeTo: $scope.saleParent.activeTo,
            isActive: false
        }, $scope);
        $scope.saleEdited.dealer = $scope.saleParent.dealer;
        $scope.saleEdited.site = $scope.saleParent.site;
        $scope.saleEdited.info = 'Доплата на сайте ' + $scope.saleEdited.site.name + ' за ';
    }

    $scope.saveSaleEdited = function() {
        $scope.saleEdited.save($scope).then(function(sale) {
            $rootScope.savedSaleListNotice = 'Сохранена продажа ' + sale.name();
            $location.search('');
            $location.path('/salelist');
        });
    };
})

.directive('uiGreater', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            _oneValue: '=ngModel',
            _otherValue: '=uiGreater',
            _required: '=ngRequired'
        },
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch('[_oneValue, _otherValue]', function() {
                ctrl.$setValidity('greater', !scope._required || scope._oneValue > scope._otherValue);
            }, true);
        }
    };
})
;