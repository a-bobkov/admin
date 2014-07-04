angular.module("ui.multicombo", [])

.directive("uiMcomboLoader", function($document) {
    var openedElement;
    var close;

    return {
        restrict: 'A',
        require: 'ngModel',
        replace: true,
        template:
            '<div class="mcombo-container mcombo-container-multi" ng-click="clickElem($event)">' +
            '    <ul class="mcombo-selected-choices">' +
            '        <li class="selected-choice" ng-repeat="choice in _selectedChoices">'+
            '            <span id="McomboSelectedItem_{{$index}}" ng-click="clickChoice(choice)">{{choice.idName()}}</span>' +
            '            <a id="McomboRemoveItem_{{$index}}" class="selected-choice-delete" ng-click="removeFromSelected(choice)"></a>' +
            '        </li>' +
            '        <li class="search-field" ng-hide="hide()" ng-keydown="watchControls($event)" ng-keyup="watchSearch($event)">' +
            '            <input type="text" id="McomboSearchInput" placeholder="Фильтр с выбором" autocomplete="off" ng-model="_search">' +
            '        </li>' +
            '    </ul>' +
            '    <div class="mcombo-drop" ng-hide="hide()">' +
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

            $scope.hide = function() {
                return !_.isArray($scope._selected) && $scope._selected;
            }

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
                $scope._selectedChoices.push(choice);
                $scope._search = '';
                filterChoices();
                _searchElem.focus();
            };

            $scope.removeFromSelected = function(choice) {
                if ($scope._disabled) {
                    return;
                }
                $scope._selectedChoices.splice($scope._selectedChoices.indexOf(choice), 1);
                filterChoices();
                // _searchElem.focus();
                window.setTimeout(function(){_searchElem.focus();}, 100);
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
                    $scope.hover = Math.max(-1, $scope.hover - 1);
                } else if (event.keyIdentifier === 'Down') {
                    $scope.hover = Math.min($scope._filteredChoices.length - 1, $scope.hover + 1);
                } else if (event.keyIdentifier === 'Enter') {
                    var choice = $scope._filteredChoices[$scope.hover];
                    if (choice) {
                        $scope.moveToSelected(choice, event);
                        $scope.hover = Math.min($scope._filteredChoices.length - 1, $scope.hover);
                    }
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

            $scope.clickElem = function(event) {
                // otherwise 'close' will be called immediately
                event.preventDefault();
                event.stopPropagation();
                if ($element === openedElement || $scope._disabled) {
                    return;
                }
                if (close) {
                    close();     // simultaneously should not be two open items
                }
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
                    _searchElem.value = '';
                }
                $document.bind('click', close);
                $scope.loadChoices();
                $scope.hover = 0;
                _searchElem.focus();
            };
        }]
    };
});