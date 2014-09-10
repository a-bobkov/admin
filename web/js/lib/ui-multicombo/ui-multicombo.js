angular.module("ui.multicombo", [])

.directive("uiMcomboLoader", function($document, $q, $timeout) {
    var openedElement;
    var close;

    return {
        restrict: 'A',
        require: 'ngModel',
        replace: true,
        template:
            '<div class="mcombo-container mcombo-container-multi">' +
            '    <ul class="mcombo-selected-choices">' +
            '        <li class="selected-choice" ng-repeat="choice in _selectedChoices" ng-click="removeFromSelected(choice, $event)">'+
            '            <span id="McomboSelectedItem_{{$index}}">{{choice.idName()}}</span>' +
            '            <a id="McomboRemoveItem_{{$index}}" class="selected-choice-delete"></a>' +
            '        </li>' +
            '        <li class="search-field" ng-click="openElem($event)" ng-keydown="watchControls($event)">' +
            '            <input type="text" id="McomboSearchInput" placeholder="Введите фильтр" autocomplete="off" ng-model="_search" ng-hide="_disabled">' +
            '        </li>' +
            '    </ul>' +
            '    <div class="mcombo-drop">' +
            '        <ul class="choices">' +
            '            <li class="item" ng-mouseenter="mouseHover($index)" ng-class="{hover: $index === hover}" id="McomboDropChoiceItem" ng-repeat="choice in _filteredChoices" ng-click="moveToSelected(choice, $event)">' +
            '                {{choice.idName()}}' +
            '            </li>' +
            '            <li class="no-results" ng-show="_search && _filteredChoices.length == 0">Нет подходящих значений</li>' +
            '        </ul>' +
            '    </div>' +
            '</div>',
        scope: {
            _choicesLoader: '=uiMcomboLoader',
            _choices: '=uiMcomboChoices',
            _selected: '=ngModel',
            _disabled: '=ngDisabled'
        },
        controller: ['$scope', '$filter', '$element', function($scope, $filter, $element) {
            var _searchElem = $element.children().eq(0).children().eq(-1).children().eq(0)[0];
            var constructorName = $scope._choicesLoader.constructor.toString().replace(/^function (\S+)\s*\((?:\S|\s)+/, '$1');

            $scope._single = !_.isArray($scope._selected);
            $scope._filteredChoices = [];

            $scope.close = function() {
                if (close) {
                    _searchElem.blur();
                    close();
                }
            }

            $scope.mouseHover = function(index) {
                $scope.hover = index;
            };

            $scope.$watch('_selected', function _selectedChoicesUpdate() {
                if (_.isArray($scope._selected)) {
                    $scope._selectedChoices = $scope._selected;
                } else if ($scope._selected) {
                    $scope._selectedChoices = [$scope._selected];
                } else {
                    $scope._selectedChoices = [];
                }
            }, true);

            $scope.$watch('_selectedChoices', function _selectedUpdate() {
                if (_.isArray($scope._selected)) {
                    $scope._selected = $scope._selectedChoices;
                } else {
                    $scope._selected = $scope._selectedChoices[0];
                }
            }, true);

            var filterChoices = function() {
                var selectedIds = _.pluck($scope._selectedChoices, 'id');
                if (constructorName === 'sitesLoader') {
                    selectedIds.push(0, 12, 15);    // нельзя выбирать эти сайты
                }
                $scope._filteredChoices = _.filter($scope._choices && $scope._choices.getItems(), function(value) {
                    return (selectedIds.indexOf(value.id) === -1);
                });
            }

            $scope.moveToSelected = function(choice, event) {
                event.preventDefault();
                event.stopPropagation();
                if ($scope._single) {
                    $scope._selectedChoices[0] = choice;
                } else {
                    $scope._selectedChoices.push(choice);
                }
                $scope.close();
            };

            $scope.removeFromSelected = function(choice, event) {
                if ($scope._disabled) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                $scope._selectedChoices.splice($scope._selectedChoices.indexOf(choice), 1);
                filterChoices();
            };

            var numberLoads = 0;
            $scope.loadChoices = function() {
                numberLoads++;
                var choicesName = (constructorName === 'dealersLoader') ? 'companyName' : 'name';
                var filters = _.invoke($scope._search && $scope._search.split(' '), function() {
                    return { fields: ['id', choicesName], type: 'contain', value: this };
                });
                $q.all({
                    choices: $scope._choicesLoader.loadItems({
                        filters: filters,
                        fields: [choicesName, 'isActive'],
                        pager: {
                            per_page: 9
                        }
                    }),
                    numberLoads: numberLoads,
                    timer: $timeout(function() {}, 300)
                }).then(function(data) {
                    if (numberLoads === data.numberLoads) {
                        $scope._choices = data.choices;
                        filterChoices();
                    }
                });
            }

            $scope.watchControls = function(event) {
                if (event.keyCode === 38) {     // Up
                    $scope.hover = Math.max(0, $scope.hover - 1);
                } else if (event.keyCode === 40) {  // Down
                    $scope.hover = Math.min($scope._filteredChoices.length - 1, $scope.hover + 1);
                } else if (event.keyCode === 13) {  // Enter
                    var choice = $scope._filteredChoices[$scope.hover];
                    if (choice) {
                        $scope.moveToSelected(choice, event);
                        $scope.hover = Math.min($scope._filteredChoices.length - 1, $scope.hover);
                    }
                } else if (event.keyCode === 27) {  // Esc
                    $scope.close();
                }
            }

            $scope.openElem = function(event) {
                // otherwise 'close' will be called immediately
                event.preventDefault();
                event.stopPropagation();
                if ($element === openedElement || $scope._disabled) {
                    return;
                }
                $scope.close();      // simultaneously should not be two open items
                openedElement = $element;
                preSearch = '';
                $element.addClass('mcombo-container-active');
                var unWatchSearch = $scope.$watch('_search', $scope.loadChoices);
                close = function (event) {
                    event && event.preventDefault();
                    event && event.stopPropagation();
                    $document.unbind('click', close);
                    $element.removeClass('mcombo-container-active');
                    openedElement = null;
                    close = null;
                    unWatchSearch();
                    $scope._search = '';
                    if (event) {
                        $scope.$digest();
                    }
                }
                $document.bind('click', close);
                $scope.hover = 0;
                _searchElem.focus();
            };
        }]
    };
});