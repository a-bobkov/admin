angular.module("ui.multicombo", [])

.directive("uiMcomboLoader", function($document) {
    var openedElement;
    var close;

    return {
        restrict: 'A',
        require: 'ngModel',
        replace: true,
        template:
            '<div class="mcombo-container mcombo-container-multi">' +
            '    <ul class="mcombo-selected-choices">' +
            '        <li class="selected-choice" ng-repeat="choice in _selectedChoices" ng-click="removeFromSelected(choice)">'+
            '            <span id="McomboSelectedItem_{{$index}}">{{choice.idName()}}</span>' +
            '            <a id="McomboRemoveItem_{{$index}}" class="selected-choice-delete"></a>' +
            '        </li>' +
            '        <li class="search-field" ng-click="openElem($event)" ng-keydown="watchControls($event)" ng-keyup="watchSearch($event)">' +
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
            var preSearch;

            $scope._single = !_.isArray($scope._selected);

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
                if ($scope._choicesLoader.constructor.name === 'sitesLoader') {
                    selectedIds.push(0, 12, 15);    // нельзя выбирать эти сайты
                }
                $scope._filteredChoices = _.filter($scope._choices && $scope._choices.getItems(), function(value) {
                    return (selectedIds.indexOf(value.id) === -1);
                });
            }

            $scope.moveToSelected = function(choice, $event) {
                event.preventDefault();
                event.stopPropagation();
                if ($scope._single) {
                    $scope._selectedChoices[0] = choice;
                } else {
                    $scope._selectedChoices.push(choice);
                }
                $scope.close();
            };

            $scope.removeFromSelected = function(choice) {
                if ($scope._disabled) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                $scope._selectedChoices.splice($scope._selectedChoices.indexOf(choice), 1);
                filterChoices();
            };

            $scope.clickChoice = function(choice) {
                if (!_.isArray($scope._selected)) {
                    $scope.removeFromSelected(choice);
                }
            }

            $scope.loadChoices = function() {
                var choicesId = ($scope._choicesLoader.constructor.name === 'dealersLoader') ? 'id' : 'id';
                var choicesName = ($scope._choicesLoader.constructor.name === 'dealersLoader') ? 'companyName' : 'name';
                var choicesFields = ($scope._choicesLoader.constructor.name === 'dealersLoader') ? ['dealer_list_name'] : [];
                $scope._choicesLoader.loadItems({
                    filters: _.invoke($scope._search && $scope._search.split(' '), function() {
                        return { fields: [choicesId, choicesName], type: 'contain', value: this };
                    }),
                    fields: choicesFields,
                    pager: {
                        per_page: 9
                    }
                }).then(function(collection) {
                    $scope._choices = collection;
                    filterChoices();
                });
            }

            $scope.watchControls = function(event) {
                if (event.keyIdentifier === 'Up') {
                    $scope.hover = Math.max(0, $scope.hover - 1);
                } else if (event.keyIdentifier === 'Down') {
                    $scope.hover = Math.min($scope._filteredChoices.length - 1, $scope.hover + 1);
                } else if (event.keyIdentifier === 'Enter') {
                    var choice = $scope._filteredChoices[$scope.hover];
                    if (choice) {
                        $scope.moveToSelected(choice, event);
                        $scope.hover = Math.min($scope._filteredChoices.length - 1, $scope.hover);
                    }
                } else if (event.keyIdentifier === 'U+001B') {  // Esc
                    $scope.close();
                }
            }

            $scope.watchSearch = function(event) {
                if (event.keyIdentifier === 'Enter') {
                    return;
                }
                var newSearch = $scope._search && $scope._search.trim();
                if (newSearch !== preSearch) {
                    $scope.loadChoices();
                    preSearch = newSearch;
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
                close = function (event) {
                    event && event.preventDefault();
                    event && event.stopPropagation();
                    $document.unbind('click', close);
                    $element.removeClass('mcombo-container-active');
                    openedElement = null;
                    close = null;
                    $scope._search = '';
                    if (event) {
                        $scope.$digest();
                    }
                }
                $document.bind('click', close);
                $scope.loadChoices();
                $scope.hover = 0;
                _searchElem.focus();
            };
        }]
    };
});