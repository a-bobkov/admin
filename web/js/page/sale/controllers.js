'use strict';

angular.module('SaleApp', ['ngRoute', 'ui.bootstrap.pagination', 'ngInputDate',
        'max.dal.entities.dealer',
        'max.dal.entities.site',
        'max.dal.entities.tariff',
        'max.dal.entities.dealertariff',
        'max.dal.entities.tariffrate',
        'max.dal.entities.sale',
        'max.dal.entities.sitebalance',
        'max.dal.entities.billingcredit',
        'max.dal.entities.dealerbalance'
    ])

.config(['$routeProvider', function($routeProvider) {

    function uniteUniq(itemArray, item) {
        var itemIdx = _.findIndex(itemArray, {id: item.id});
        if (itemIdx !== -1) {
            itemArray[itemIdx] = item;
        } else {
            itemArray.push(item);
        }
    }

    $routeProvider
    .when('/salelist', {
        templateUrl: 'template/page/sale/list.html',
        controller: 'SaleListCtrl',
        reloadOnSearch: false,
        resolve: {
            data: function(dealersLoader, sitesLoader, $rootScope, $location, $q, Construction) {
                if (_.isEmpty($location.search()) && !_.isEmpty($rootScope.savedSaleListLocationSearch)) {
                    $location.search($rootScope.savedSaleListLocationSearch);
                }
                var ls = $location.search();
                var toResolve = {};
                if (!_.isEmpty(ls.dealers)) {
                    var dealerQueryParams = {
                        filters: [
                            { fields: ['id'], type: 'in', value: ls.dealers.split(';') }
                        ],
                        fields: ['dealer_list_name']
                    };
                    toResolve.dealers = dealersLoader.loadItems(dealerQueryParams);
                }
                if (!_.isEmpty(ls.sites)) {
                    var siteQueryParams = {
                        filters: [
                            { fields: ['id'], type: 'in', value: ls.sites.split(';') }
                        ]
                    };
                    toResolve.sites = sitesLoader.loadItems(siteQueryParams);
                }
                return $q.all(toResolve).then(function(construction) {
                    return new Construction(construction).resolveRefs();
                });
            }
        }
    })
    .when('/sale/card', {       // ?id=new - создание новой карточки; ?id=5 - редактирование карточки 5
        templateUrl: 'template/page/sale/edit.html',
        controller: 'SaleCardEditCtrl',
        resolve: {
            data: function(usersLoader, salesLoader, dealersLoader, tariffsLoader, tariffRatesLoader, dealerTariffsLoader, $location, $q) {
                return usersLoader.loadDirectories().then(function(directories) {
                    var ls = $location.search();
                    if (ls.id === 'new') {
                        return $q.when(directories.resolveRefs());
                    } else {
                        return salesLoader.loadItem(ls.id).then(function(saleData) {
                            directories.sale = saleData;
                            var toResolve = {
                                dealers: dealersLoader.loadItems({
                                    filters: [
                                        { fields: ['id'], type: 'equal', value: saleData.dealer.id }
                                    ]
                                }),
                                addSales: salesLoader.loadItems({
                                    filters: [
                                        { fields: ['type'], type: 'equal', value: 'addcard' },
                                        { fields: ['parentId'], type: 'equal', value: saleData.cardId }
                                    ]
                                }),
                                extraSales: salesLoader.loadItems({
                                    filters: [
                                        { fields: ['type'], type: 'equal', value: 'extra' },
                                        { fields: ['cardId'], type: 'equal', value: saleData.cardId }
                                    ]
                                }),
                                dealerTariff: dealerTariffsLoader.loadItemDealerSite(saleData.dealer.id, saleData.site.id)
                            };
                            return $q.all(toResolve).then(function(salesData) {
                                _.assign(directories, salesData);
                                var tariffIds = _.pluck(_.compact(_.pluck(directories.addSales.getItems(), 'tariff')), 'id');
                                tariffIds.push(directories.sale.tariff.id);
                                toResolve = {
                                    selectedTariffs: tariffsLoader.loadItems({
                                        filters: [
                                            { fields: ['id'], type: 'in', value: tariffIds }
                                        ]
                                    }),
                                    optionTariffs: tariffsLoader.loadItems({
                                        filters: [
                                            { fields: ['site'], type: 'equal', value: directories.sale.site.id },
                                            { fields: ['type'], type: 'equal', value: 'periodical' },
                                            { fields: ['isActive'], type: 'equal', value: true }
                                        ]
                                    })
                                };
                                return $q.all(toResolve).then(function(tariffsData) {
                                    directories.tariffs = tariffsData.optionTariffs;
                                    _.forEach(tariffsData.selectedTariffs.getItems(), function(item) {
                                        uniteUniq(directories.tariffs.getItems(), item);
                                    });
                                    var tariffRateQueryParams = {
                                        filters: [
                                            { fields: ['tariff'], type: 'in', value: _.pluck(directories.tariffs.getItems(), 'id') },
                                            { fields: ['city'], type: 'in', value: [directories.dealers.getItems()[0].city.id, null] }
                                        ]
                                    };
                                    return tariffRatesLoader.loadItems(tariffRateQueryParams).then(function(tariffRatesData) {
                                        directories.tariffRates = tariffRatesData;
                                        return directories.resolveRefs();
                                    });
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
            data: function(usersLoader, salesLoader, dealersLoader, tariffsLoader, tariffRatesLoader, dealerTariffsLoader, $location, $q) {
                return usersLoader.loadDirectories().then(function(directories) {
                    var ls = $location.search();
                    var toResolve;
                    if (ls.id === 'new') {
                        toResolve = $q.when(ls.cardId);
                    } else {
                        toResolve = salesLoader.loadItem(ls.id).then(function(sale) {
                            directories.sale = sale;
                            return salesLoader.loadItems({
                                filters: [
                                    { fields: ['type'], type: 'equal', value: 'addcard' },
                                    { fields: ['parentId'], type: 'equal', value: sale.cardId }
                                ]
                            }).then(function(addSales) {
                                if (addSales.getItems().length) {
                                    directories.addSale = addSales.getItems()[0];
                                }
                                return sale.parentId;
                            });
                        });
                    }
                    return toResolve.then(function(parentId) {
                        return salesLoader.loadItems({
                            filters: [
                                { fields: ['type'], type: 'in', value: ['card', 'addcard'] },
                                { fields: ['cardId'], type: 'equal', value: parentId }
                            ]
                        }).then(function(parentSales) {
                            directories.parentSale = parentSales.getItems()[0];
                            return $q.all({
                                dealers: dealersLoader.loadItems({
                                    filters: [
                                        { fields: ['id'], type: 'equal', value: directories.parentSale.dealer.id }
                                    ]
                                }),
                                dealerTariff: dealerTariffsLoader.loadItemDealerSite(directories.parentSale.dealer.id, directories.parentSale.site.id),
                                optionTariffs: tariffsLoader.loadItems({
                                    filters: [
                                        { fields: ['site'], type: 'equal', value: directories.parentSale.site.id },
                                        { fields: ['type'], type: 'equal', value: 'periodical' },
                                        { fields: ['isActive'], type: 'equal', value: true }
                                    ]
                                })
                            }).then(function(parentData) {
                                directories.dealers = parentData.dealers;
                                directories.dealerTariff = parentData.dealerTariff;
                                directories.tariffs = parentData.optionTariffs;
                                var selectedTariffIds = [];
                                if (!directories.tariffs.get(directories.parentSale.tariff.id)) {
                                    selectedTariffIds.push(directories.parentSale.tariff.id);
                                }
                                if (directories.sale && directories.sale.tariff && !directories.tariffs.get(directories.sale.tariff.id)) {
                                    selectedTariffIds.push(directories.sale.tariff.id);
                                }
                                if (directories.addSale && !directories.tariffs.get(directories.addSale.tariff.id)) {
                                    selectedTariffIds.push(directories.addSale.tariff.id);
                                }
                                if (selectedTariffIds.length) {
                                    toResolve = tariffsLoader.loadItems({
                                        filters: [
                                            { fields: ['id'], type: 'in', value: selectedTariffIds }
                                        ]
                                    }).then(function(tariffs) {
                                        _.forEach(tariffs, function(tariff) {
                                            uniteUniq(directories.tariffs.getItems(), tariff);
                                        });
                                    })
                                } else {
                                    toResolve = $q.when();
                                }
                                return toResolve.then(function() {
                                    return tariffRatesLoader.loadItems({
                                        filters: [
                                            { fields: ['tariff'], type: 'in', value: _.pluck(directories.tariffs.getItems(), 'id') },
                                            { fields: ['city'], type: 'in', value: [directories.dealers.getItems()[0].city.id, null] }
                                        ]
                                    }).then(function(tariffRates) {
                                        directories.tariffRates = tariffRates;
                                        return directories.resolveRefs();
                                    });
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
            data: function(Construction, salesLoader, dealersLoader, sitesLoader, tariffsLoader, $location, $q) {
                var directories = new Construction;
                var toResolve;
                var ls = $location.search();
                if (ls.id === 'new') {
                    toResolve = $q.when(ls.cardId);
                } else {
                    toResolve = salesLoader.loadItem(ls.id).then(function(sale) {
                        directories.sale = sale;
                        return sale.cardId;
                    });
                }
                return toResolve.then(function(cardId) {
                    return salesLoader.loadItems({
                        filters: [
                            { fields: ['type'], type: 'in', value: ['card', 'addcard'] },
                            { fields: ['cardId'], type: 'equal', value: cardId }
                        ]
                    }).then(function(parentSales) {
                        directories.parentSale = parentSales.getItems()[0];
                        return $q.all({
                            dealers: dealersLoader.loadItems({
                                filters: [
                                    { fields: ['id'], type: 'equal', value: directories.parentSale.dealer.id }
                                ],
                                fields: ['dealer_list_name']
                            }),
                            sites: sitesLoader.loadItems({
                                filters: [
                                    { fields: ['id'], type: 'equal', value: directories.parentSale.site.id }
                                ]
                            }),
                            tariffs: tariffsLoader.loadItems({
                                filters: [
                                    { fields: ['id'], type: 'equal', value: directories.parentSale.tariff.id }
                                ]
                            })
                        }).then(function(parentData) {
                            _.assign(directories, parentData);
                            return directories.resolveRefs();
                        });
                    });
                });
            }
        }
    })
;
}])

.controller('SaleListCtrl', function($scope, $rootScope, $location, $q, data, 
    Sale, saleStatuses, saleTypes, salesLoader, dealersLoader, sitesLoader, tariffsLoader, dealerTariffsLoader, 
    Construction, siteBalancesLoader) {

    _.assign($scope, data);
    $scope.saleStatuses = saleStatuses;
    $scope.saleTypes = saleTypes;
    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;

    if ($rootScope.savedSaleListNotice) {
        $scope.savedSaleListNotice = $rootScope.savedSaleListNotice;
        delete $rootScope.savedSaleListNotice;
    }

    var regexpOrder = /^([+-]?)(\w+)$/;

    $scope.toggleSiteBalances = function() {
        if (!$scope.showSiteBalances) {
            $q.all({
                siteBalances: siteBalancesLoader.loadItems({
                    filters: [
                        { fields: ['site'], type: 'in', value: [5, 6] }
                    ]
                }),
                sites: sitesLoader.loadItems({
                    filters: [
                        { fields: ['id'], type: 'in', value: [5, 6] }
                    ]
                })
            }).then(function(collections) {
                collections.siteBalances.resolveRefs(collections);
                $scope.siteBalances = collections.siteBalances;
                $scope.showSiteBalances = !$scope.showSiteBalances;
            });
        } else {
            $scope.showSiteBalances = !$scope.showSiteBalances;
        }
    };

    $scope.setPatternsDefault = function() {
        $scope.patterns = {
            dealers: [],
            sites: [],
            isActive: saleStatuses.get(false),
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
        {id: "dealer", name: "Салон", width: '25%'},
        {id: "site", name: "Сайт", width: '10%'},
        {id: "type", name: "Тип", width: '5%'},
        {id: "count", name: "Лимит", width: '5%'},
        {id: "activeFrom", name: "С", width: '5%'},
        {id: "activeTo", name: "По", width: '5%'},
        {id: "amount", name: "Стоимость, руб.", width: '7.5%'},
        {id: "siteAmount", name: "Себестоим, руб.", width: '7.5%'},
        {id: "isActive", name: "Статус", width: '5%'}
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
            $scope.sorting = [column, '-id'];
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
        $rootScope.savedSaleListLocationSearch = toLocationSearch(searchParams);
        $location.search($rootScope.savedSaleListLocationSearch);

        var saleQueryParams = makeQueryParams($rootScope.savedSaleListLocationSearch);
        salesLoader.loadItems(saleQueryParams).then(function(sales) {
            $scope.totalItems = sales.getParams().pager.total;
            var construction = new Construction({sales: sales});
            var salesItems = sales.getItems();
            $q.all({
                addSales: salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'addcard' },
                        { fields: ['parentId'], type: 'in', value: _.pluck(salesItems, 'cardId') }
                    ]
                }),
                extraSales: salesLoader.loadItems({
                    filters: [
                        { fields: ['type'], type: 'equal', value: 'extra' },
                        { fields: ['cardId'], type: 'in', value: _.pluck(_.where(salesItems, {type: saleTypes.get('card')}), 'cardId') }
                    ]
                }),
                dealers: dealersLoader.loadItems({
                    filters: [
                        { fields: ['id'], type: 'in', value: _.pluck(_.pluck(salesItems, 'dealer'), 'id') }
                    ],
                    fields: ['dealer_list_name']
                }),
                sites: sitesLoader.loadItems({
                    filters: [
                        { fields: ['id'], type: 'in', value: _.pluck(_.pluck(salesItems, 'site'), 'id') }
                    ]
                })
            }).then(function(collections) {
                _.assign(construction, collections);
                tariffsLoader.loadItems({
                    filters: [
                        { fields: ['id'], type: 'in', value: 
                            _.pluck(_.compact(_.pluck(_.union(salesItems, construction.addSales.getItems()), 'tariff')), 'id')
                        }
                    ]
                }).then(function(tariffs) {
                    construction.tariffs = tariffs;
                    _.assign($scope, construction.resolveRefs());
                    var topElem = document.getElementById('SaleListAddSaleUp');
                    var topSaleList = topElem && topElem.getBoundingClientRect().top;
                    if (topSaleList < 0) {
                        window.scrollBy(0, topSaleList);
                    }
                });
            });
        });
    };

    $scope.isAddable = function(sale) {
        return (sale.isCard() || sale.isAddcard()) && sale.tariff && !_.find($scope.addSales.getItems(), {parentId: sale.cardId});
    }

    $scope.isRemoveable = function(sale) {
        var addItems = $scope.addSales.getItems();
        var extraItems = $scope.extraSales.getItems();
        return sale.isCard() && !_.find(addItems, {parentId: sale.cardId}) && !_.find(extraItems, {cardId: sale.cardId})
            || sale.isAddcard() && !_.find(addItems, {parentId: sale.cardId})
            || sale.isExtra();
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
            isActive: saleStatuses.get((ls.isActive === 'true') ? true : (ls.isActive === 'false') ? false : null),
            type: saleTypes.get(ls.type),
            archive: !!ls.archive
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

    $scope.toggleSaleStatus = function(sale) {
        var confirmMessage,
            noticeMessage,
            newStatus;
        var check;

        if (sale.isActive.id === true) {
            confirmMessage = 'Дезактивировать продажу ';
            noticeMessage = 'Дезактивирована продажа ';
            newStatus = $scope.saleStatuses.get(false);
            check = $q.when(true);
        } else {
            confirmMessage = 'Активировать продажу ';
            noticeMessage = 'Активирована продажа ';
            newStatus = $scope.saleStatuses.get(true);
            check = dealerTariffsLoader.loadItems({
                filters: [
                    { fields: ['dealer'], type: 'equal', value: sale.dealer.id },
                    { fields: ['site'], type: 'equal', value: sale.site.id }
                ]
            }).then(function(dealerTariffs) {
                if (!dealerTariffs.getItems().length) {
                    alert("У салона не включен экспорт на сайт!");
                }
                return !!dealerTariffs.getItems().length;
            });
        }
        check.then(function(valid) {
            if (valid && confirm(confirmMessage + sale.name() + '?')) {
                var saleEdited = new Sale;
                _.assign(saleEdited, sale);
                saleEdited.isActive = newStatus;
                saleEdited.save($scope).then(function() {
                    $scope.savedSaleListNotice = noticeMessage + sale.name();
                    $scope.onSelectPage();
                });
            }
        });
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

.service('SaleCommonCtrl', function($rootScope, $location, $q, dealerBalancesLoader, billingCreditsLoader) {
    this.saveSaleEdited = function($scope) {
        $q.all({
            dealerBalance: dealerBalancesLoader.loadItemDealer($scope.saleEdited.dealer.id),
            billingCredit: billingCreditsLoader.loadItemDealer($scope.saleEdited.dealer.id)
        }).then(function(collections) {
            var today = new Date;
            today.setUTCHours(0, 0, 0, 0);
            var balance = collections.dealerBalance && collections.dealerBalance.balance || 0;
            var limit = collections.billingCredit && collections.billingCredit.expiresAt >= today && -collections.billingCredit.amount || 0;
            var newBalance = balance - $scope.saleEdited.amount + (($scope.sale && $scope.sale.dealer.id === $scope.saleEdited.dealer.id) ? $scope.sale.amount : 0);
            if (newBalance >= limit || (newBalance < limit && confirm('После сохранения баланс клиента будет меньше лимита (' + newBalance.ceil(2) + ' < ' + limit.ceil(2) + ')! Продолжить сохранение?'))) {
                $scope.saleEdited.save($scope).then(function(sale) {
                    $rootScope.savedSaleListNotice = 'Сохранена продажа ' + sale.name();
                    $location.path('/salelist').search('');
                });
            }
        });
    };
})

.controller('SaleCardEditCtrl', function($scope, $rootScope, $location, $window, data, SaleCommonCtrl,
    Sale, saleStatuses, dealersLoader, sitesLoader, salesLoader, tariffsLoader, dealerTariffsLoader, tariffRatesLoader) {

    _.assign($scope, data);
    if ($scope.dealers) {
        $scope.city = $scope.dealers.getItems()[0].city;
    }
    $scope.saleNoDefaultTariff = !$scope.dealerTariff;
    $scope.saleStatuses = saleStatuses;
    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;

    $scope.tariffFieldTitle = "Тариф";

    if ($scope.sale) {
        makeSaleCopy();
    } else {
        makeSaleNew();
    }

    $window.scrollTo(0,0);

    function makeSaleCopy() {
        $scope.actionName = "Изменение карточки";
        $scope.saleEdited = new Sale();
        _.assign($scope.saleEdited, $scope.sale);
    }

    function makeSaleNew() {
        $scope.actionName = "Создание карточки";
        $scope.saleEdited = new Sale ({
            type: 'card',
            cardId: null,
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
                { fields: ['type'], type: 'equal', value: 'periodical' },
                { fields: ['isActive'], type: 'equal', value: true }
            ]
        };
        var oldDirectories = _.pick($scope, 'sites');
        tariffsLoader.loadItems(tariffQueryParams, oldDirectories).then(function(tariffs) {
            $scope.tariffs = tariffs;
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
        var oldDirectories = _.pick($scope, ['cities', 'markets', 'metros', 'managers', 'billingCompanies']);
        dealersLoader.loadItems(dealerQueryParams, oldDirectories).then(function(dealers) {
            $scope.city = dealers.getItems()[0].city;
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
        tariffRatesLoader.loadItems(tariffRateQueryParams, oldDirectories).then(function(tariffRates) {
            $scope.tariffRates = tariffRates;
        });
    }, true);

    $scope.$watch('[saleEdited.dealer, saleEdited.site, tariffs]', function loadDealerTariff(newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if (!$scope.saleEdited.dealer || !$scope.saleEdited.site || _.isEmpty($scope.tariffs)) {
            $scope.saleEdited.tariff = null;
            $scope.saleNoDefaultTariff = false;
            return;
        }
        dealerTariffsLoader.loadItemDealerSite($scope.saleEdited.dealer.id, $scope.saleEdited.site.id, $scope).then(function(dealerTariff) {
            $scope.saleNoDefaultTariff = !dealerTariff;
            if (dealerTariff) {
                $scope.saleEdited.tariff = dealerTariff.tariff;
            } else {
                $scope.saleEdited.tariff = null;
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
        var salesQueryParams = {
            filters: [
                { fields: ['dealer'], type: 'equal', value: $scope.saleEdited.dealer.id },
                { fields: ['site'], type: 'equal', value: $scope.saleEdited.site.id },
                { fields: ['type'], type: 'in', value: ['card', 'addcard'] },
                { fields: ['activeTo'], type: 'greaterOrEqual', value: new Date().toISOString().slice(0, 10) }
            ],
            orders: ['-activeTo']
        };
        var oldDirectories = _.pick($scope, ['saleTypes', 'saleStatuses', 'dealers', 'sites', 'tariffs']);
        salesLoader.loadItems(salesQueryParams, oldDirectories).then(function(sales) {
            $scope.lastActiveCard = sales.getItems()[0];
        });
    }, true);

    $scope.activeTo = function(activeFrom, tariff) {
        if (!activeFrom || !tariff) {
            return;
        }
        var activeTo = _.clone(activeFrom);
        if (tariff.periodUnit.id === 'day') {
            activeTo.setDate(activeTo.getDate() + tariff.period);
            activeTo.setDate(activeTo.getDate() - 1);
        } else if (tariff.periodUnit.id === 'month') {
            activeTo.setMonth(activeTo.getMonth() + tariff.period);
            activeTo.setDate(activeTo.getDate() - 1);
        } else {
            throw Error('Неизвестное значение единицы периода тарифа: ' + tariff.periodUnit);
        }
        return activeTo;
    }

    $scope.$watch('[lastActiveCard, saleEdited.tariff]', function setActiveDates(newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if (!$scope.saleEdited.tariff) {
            $scope.saleEdited.activeFrom = null;
            $scope.saleEdited.activeTo = null;
            return;
        }
        if ($scope.lastActiveCard) {
            $scope.saleEdited.activeFrom = _.clone($scope.lastActiveCard.activeTo);
        } else {
            $scope.saleEdited.activeFrom = new Date();
            $scope.saleEdited.activeFrom.setUTCHours(0, 0, 0, 0);
        }
        $scope.saleEdited.activeFrom.setDate($scope.saleEdited.activeFrom.getDate() + 1);
        $scope.saleEdited.activeTo = $scope.activeTo($scope.saleEdited.activeFrom, $scope.saleEdited.tariff);
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
        var tariffRate = $scope.saleEdited.tariff.getLastRate($scope.city, $scope.tariffRates);
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
        if (!$scope.saleEdited.site || !$scope.saleEdited.tariff) {
            $scope.saleEdited.info = '';
            return;
        }
        $scope.saleEdited.info = 'Оплата на сайте ' + $scope.saleEdited.site.name + ' размещения ' + 
            ($scope.saleEdited.count ? $scope.saleEdited.count : 'неограниченно') + ' объявлений в течение ' + 
            $scope.saleEdited.tariff.period + ' ' + $scope.saleEdited.tariff.periodUnit.name;
    }, true);

    $scope.saveSaleEdited = function() {
        SaleCommonCtrl.saveSaleEdited($scope);
    };

    $scope.activeRateTariffs = function(selectedTariff) {
        return function(tariff) {
            return (tariff === selectedTariff || tariff.isActive && tariff.getLastRate($scope.city, $scope.tariffRates));
        }
    }
})

.controller('SaleAddcardEditCtrl', function($scope, $rootScope, $location, $window, data, SaleCommonCtrl,
    Sale, saleStatuses, dealersLoader, sitesLoader, salesLoader, tariffsLoader, usersLoader, tariffRatesLoader) {

    _.assign($scope, data);
    $scope.city = $scope.parentSale.dealer.city;
    $scope.saleNoDefaultTariff = !$scope.dealerTariff;
    $scope.saleStatuses = saleStatuses;
    $scope.dealersLoader = dealersLoader;
    $scope.sitesLoader = sitesLoader;
    $scope.tariffFieldTitle = "Новый тариф";

    if ($scope.sale) {
        makeSaleCopy();
    } else {
        makeSaleNew();
    }

    $window.scrollTo(0,0);

    function makeSaleCopy() {
        $scope.actionName = "Изменение расширения";
        $scope.saleEdited = new Sale();
        _.assign($scope.saleEdited, $scope.sale);
        $scope.tariffParent = $scope.parentSale.tariff;
    }

    function makeSaleNew() {
        $scope.actionName = "Создание расширения";
        $scope.saleEdited = new Sale({
            type: 'addcard',
            cardId: null,
            parentId: $scope.parentSale.cardId,
            date: new Date,
            isActive: false
        }).resolveRefs(data);
        $scope.saleEdited.dealer = $scope.parentSale.dealer;
        $scope.saleEdited.site = $scope.parentSale.site;
        $scope.tariffParent = $scope.parentSale.tariff;

        if ($scope.dealerTariff && ($scope.dealerTariff.tariff.getLastRate($scope.city, $scope.tariffRates).rate 
            > $scope.tariffParent.getLastRate($scope.city, $scope.tariffRates).rate)) {
            $scope.saleEdited.tariff = $scope.dealerTariff.tariff;
        }

        $scope.saleEdited.activeFrom = new Date();
        $scope.saleEdited.activeFrom.setUTCHours(0, 0, 0, 0);
        if ($scope.saleEdited.site.id !== 1 && $scope.saleEdited.site.id !== 5) {   // Дром и Ауто.ру
            $scope.saleEdited.activeFrom.setDate($scope.saleEdited.activeFrom.getDate() + 1);
        }
        $scope.saleEdited.activeTo = $scope.parentSale.activeTo;
    }

    $scope.$watch('saleEdited.tariff', function setCount(newValue, oldValue) {
        if (newValue === oldValue && $scope.sale) {
            return;
        }
        if (!$scope.saleEdited.tariff) {
            return;
        }
        if ($scope.saleEdited.tariff.count) {
            $scope.saleEdited.count = $scope.saleEdited.tariff.count - $scope.parentSale.tariff.count;
        } else {
            $scope.saleEdited.count = null;
        }
    });

    $scope.$watch('[saleEdited.tariff, saleEdited.activeFrom]', function setSums(newValue, oldValue) {
        if (newValue === oldValue && $scope.sale) {
            return;
        }
        if (!$scope.saleEdited.tariff || !$scope.saleEdited.activeFrom) {
            return;
        }
        var intervalParent = ($scope.parentSale.activeTo - $scope.parentSale.activeFrom) / (1000 * 60 * 60 * 24) + 1;
        var intervalNew = Math.max(($scope.saleEdited.activeTo - $scope.saleEdited.activeFrom) / (1000 * 60 * 60 * 24) + 1, 0);
        var k = intervalNew / intervalParent;
        var rateNew = $scope.saleEdited.tariff.getLastRate($scope.city, $scope.tariffRates);
        var rateParent = $scope.tariffParent.getLastRate($scope.city, $scope.tariffRates);
        $scope.saleEdited.cardAmount = Math.ceil((rateNew.rate - rateParent.rate) * k * 100) / 100;
        $scope.saleEdited.amount = $scope.saleEdited.cardAmount;
        $scope.saleEdited.siteAmount = Math.ceil((rateNew.siteRate - rateParent.siteRate) * k * 100) / 100;
    }, true);

    $scope.$watch('saleEdited.tariff', function setInfo(newValue, oldValue) {
        if (newValue === oldValue && $scope.sale) {
            return;
        }
        if (!$scope.saleEdited.site || !$scope.saleEdited.tariff) {
            return;
        }
        $scope.saleEdited.info = 'Доплата на сайте ' + $scope.saleEdited.site.name + ' за расширение до ' +
            ($scope.saleEdited.tariff.count ? $scope.saleEdited.tariff.count : 'неограниченно') + ' объявлений.'; 
    });


    $scope.saveSaleEdited = function() {
        SaleCommonCtrl.saveSaleEdited($scope);
    };

    $scope.activeRateTariffs = function(selectedTariff) {
        return function(tariff) {
            return (tariff === selectedTariff || tariff.isActive && tariff.getLastRate($scope.city, $scope.tariffRates));
        }
    }
})

.controller('SaleExtraEditCtrl', function($scope, $rootScope, $location, $window, data, SaleCommonCtrl,
    Sale, dealersLoader, sitesLoader) {

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
        _.assign($scope.saleEdited, $scope.sale);
    }

    function makeSaleNew() {
        $scope.actionName = "Создание доплаты";
        $scope.saleEdited = new Sale({
            type: 'extra',
            cardId: $scope.parentSale.cardId,
            date: new Date,
            activeFrom: $scope.parentSale.activeFrom,
            activeTo: $scope.parentSale.activeTo
        });
        $scope.saleEdited.dealer = $scope.parentSale.dealer;
        $scope.saleEdited.site = $scope.parentSale.site;
        $scope.saleEdited.info = info();
    }

    function info() {
        return 'Доплата на сайте ' + $scope.saleEdited.site.name + ' за ';
    }

    $scope.infoPattern = function() {
        return '^' + info() + '\\s*\\S+';
    };

    $scope.saveSaleEdited = function() {
        SaleCommonCtrl.saveSaleEdited($scope);
    };
})

.directive('uiCrossCards', function(salesLoader) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch('[saleEdited.dealer, saleEdited.site, saleEdited.activeFrom, saleEdited.activeTo]', function getCrossCards(newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                if (!scope.saleEdited || scope.saleEdited.type.id !== 'card'
                    || !scope.saleEdited.dealer || !scope.saleEdited.site
                    || !scope.saleEdited.activeFrom || !scope.saleEdited.activeTo
                    || scope.saleEdited.activeFrom > scope.saleEdited.activeTo) {
                    ctrl.$setValidity('crossCards', true);
                } else {
                    salesLoader.loadItems({
                        filters: [
                            { fields: ['type'], type: 'equal', value: 'card' },
                            { fields: ['dealer'], type: 'equal', value: scope.saleEdited.dealer.id },
                            { fields: ['site'], type: 'equal', value: scope.saleEdited.site.id },
                            { fields: ['activeTo'], type: 'greaterOrEqual', value: scope.saleEdited.activeFrom.toISOString().slice(0, 10) },
                            { fields: ['activeFrom'], type: 'lessOrEqual', value: scope.saleEdited.activeTo.toISOString().slice(0, 10) }
                        ]
                    }).then(function(crossCards) {
                        if (scope.saleEdited.id) {
                            _.remove(crossCards.getItems(), {id: scope.saleEdited.id});
                        }
                        ctrl.$setValidity('crossCards', !crossCards.getItems().length);
                    });
                }
            }, true);
        }
    };
})

.directive('uiGreaterOrEqual', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            _oneValue: '=ngModel',
            _otherValue: '=uiGreaterOrEqual',
            _required: '=ngRequired'
        },
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch('[_oneValue, _otherValue]', function() {
                ctrl.$setValidity('greaterOrEqual', !scope._required || !scope._otherValue || scope._oneValue >= scope._otherValue);
            }, true);
        }
    };
})

.directive('uiLessOrEqual', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            _oneValue: '=ngModel',
            _otherValue: '=uiLessOrEqual',
            _required: '=ngRequired'
        },
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch('[_oneValue, _otherValue]', function() {
                ctrl.$setValidity('lessOrEqual', !scope._required || !scope._otherValue || scope._oneValue <= scope._otherValue);
            }, true);
        }
    };
})

.directive('isActive', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            _value: '=ngModel',
            _required: '=ngRequired'
        },
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch('_value', function() {
                ctrl.$setValidity('isActive', !scope._required || !scope._value || scope._value.isActive);
            });
        }
    };
})

.directive('maxInfoPattern', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            _value: '=ngModel',
            _pattern: '=maxInfoPattern'
        },
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch('[_value, _pattern]', function() {
                ctrl.$setValidity('infoPattern', !scope._value || scope._value.match(new RegExp(scope._pattern)) !== null);
            }, true);
        }
    };
})
;