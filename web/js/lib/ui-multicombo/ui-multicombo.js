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
            '        <li class="selected-choice" ng-repeat="choice in _selectedChoices">'+
            '            <span id="McomboSelectedItem_{{$index}}" ng-click="clickChoice(choice)">{{choice.idName()}}</span>' +
            '            <a id="McomboRemoveItem_{{$index}}" class="selected-choice-delete" ng-click="removeFromSelected(choice)"></a>' +
            '        </li>' +
            '        <li class="search-field" ng-hide="hide()">' +
            '            <input type="text" id="McomboSearchInput" placeholder="Фильтр с выбором" autocomplete="off" ng-model="_search">' +
            '        </li>' +
            '    </ul>' +
            '    <div class="mcombo-drop" ng-hide="hide()">' +
            '        <ul class="choices">' +
            '            <li class="item" id="McomboDropChoiceItem" ng-repeat="choice in _filteredChoices" ng-click="moveToSelected(choice, $event)">' +
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
        controller: ['$scope', '$filter', function($scope, $filter) {
            var preSearch = '';

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
                $scope._searchElem.focus();
            };

            $scope.removeFromSelected = function(choice) {
                if ($scope._disabled) {
                    return;
                }
                $scope._selectedChoices.splice($scope._selectedChoices.indexOf(choice), 1);
                filterChoices();
                // $scope._searchElem.focus();
                window.setTimeout(function(){$scope._searchElem.focus();}, 100);
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

            $scope.watchSearch = function() {
                var newSearch = $scope._search && $scope._search.trim();
                if (newSearch !== preSearch) {
                    $scope.loadChoices();
                    preSearch = newSearch;
                }
            }

        }],
        link: function(scope, element, attrs) {
            var selItems = element.children().eq(0).children();
            var searchElems = selItems.eq(selItems.length-1).children().eq(0);
            scope._searchElem = searchElems[0];
            searchElems.bind('keyup', scope.watchSearch);
            element.bind('click', function(event) {
                // otherwise 'close' will be called immediately
                event.preventDefault();
                event.stopPropagation();
                if (element === openedElement || scope._disabled) {
                    return;
                }
                openedElement = element;
                if (close) {
                    close();     // simultaneously should not be two open items
                }
                if (!element.hasClass('mcombo-container-active')) {
                    element.addClass('mcombo-container-active');
                    close = function (event) {
                        event && event.preventDefault();
                        event && event.stopPropagation();
                        $document.unbind('click', close);
                        element.removeClass('mcombo-container-active');
                        openedElement = null;
                        close = null;
                        scope._search = '';
                        scope._searchElem.value = '';
                    }
                    $document.bind('click', close);
                    scope.loadChoices();
                }
                scope._searchElem.focus();
            });
        }
    };
});