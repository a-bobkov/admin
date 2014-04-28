angular.module("ui.multicombo", [])

.directive("uiMcomboChoices", function($document){
    // simultaneously should not be two open items
    var openElement = null, close;
    return {
        restrict: 'A',
        require: 'ngModel',
        replace: true,
        template:
            '<div class="mcombo-container mcombo-container-multi">' +
            '    <ul class="mcombo-selected-choices">' +
            '        <li class="selected-choice" ng-repeat="choice in _selectedChoices">'+
            '            <span>{{choice.id}}: {{choice[_choiceName]}}</span>' +
            '            <a class="selected-choice-delete" ng-click="removeFromSelected(choice)"></a>' +
            '        </li>' +
            '        <li class="search-field" ng-hide="hide">' +
            '            <input type="text" placeholder="Фильтр с выбором" autocomplete="off" ng-model="_search">' +
            '        </li>' +
            '    </ul>' +
            '    <div class="mcombo-drop" ng-hide="hide">' +
            '        <ul class="choices">' +
            '            <li class="item" ng-repeat="choice in _filteredChoices" ng-click="moveToSelected(choice, $event)">' +
            '                {{choice.id}}: {{choice[_choiceName]}}' +
            '            </li>' +
            '            <li class="no-results" ng-show="_search && _filteredChoices.length == 0">Нет подходящих значений</li>' +
            '        </ul>' +
            '    </div>' +
            '</div>',
        scope: {
            _choicesLoader: '=uiMcomboLoader',
            _choices: '=uiMcomboChoices',
            _selected: '=ngModel',
            _choiceName: '=uiMcomboName'
        },
        controller: ['$scope', '$filter', function($scope, $filter) {
            $scope._searchElem = null;
            if (_.isArray($scope._selected)) {
                $scope._selectedChoices = $scope._selected;
            } else if ($scope._selected) {
                $scope._selectedChoices = [$scope._selected];
            } else {
                $scope._selectedChoices = [];
            }
            $scope.hide = !_.isArray($scope._selected) && $scope._selected;
            $scope._search = '';
            $scope._filteredChoices = [];

            var filterChoices = function() {
                var selectedIds = _.pluck($scope._selectedChoices, 'id');
                $scope._filteredChoices = _.filter($scope._choices.getItems(), function(value) {
                    return (selectedIds.indexOf(value.id) === -1);
                });
            }

            $scope.moveToSelected = function(choice, $event) {
                $scope._selectedChoices.push(choice);
                if (_.isArray($scope._selected)) {
                    $scope._selected = $scope._selectedChoices;
                } else {
                    $scope._selected = $scope._selectedChoices[0];
                }
                $scope.hide = !_.isArray($scope._selected) && $scope._selected;
                filterChoices();

                $scope._searchElem.focus();

                // do not 'close' on choice click
                $event.preventDefault();
                $event.stopPropagation();
            };

            $scope.removeFromSelected = function(choice) {
                $scope._selectedChoices.splice($scope._selectedChoices.indexOf(choice), 1);
                if (_.isArray($scope._selected)) {
                    $scope._selected = $scope._selectedChoices;
                } else {
                    $scope._selected = $scope._selectedChoices[0];
                }
                $scope.hide = !_.isArray($scope._selected) && $scope._selected;
                filterChoices();

                $scope._searchElem.focus();
            };

            $scope.onFilterChange = function(newValue, oldValue) {
                var filters = _.invoke($scope._search.split(' '), function() {
                    return { type: 'contain', fields: ['id', $scope._choiceName], value: this };
                });
                var queryParams = {
                    filters: filters,
                    pager: {
                        per_page: 10
                    }
                };
                $scope._choicesLoader.loadItems(queryParams).then(function(respond) {
                    $scope._choices = respond[_.keys(respond)[0]];
                    filterChoices();
                });
            }

            $scope.$watch('_search', $scope.onFilterChange);

        }],
        link: function(scope, element, attrs) {
            var selUl = element.children().eq(0);
            var selItems = selUl.children();
            scope._searchElem = selItems.eq(selItems.length-1).children().eq(0)[0];
            selUl.bind('click', function(event) {
                // otherwise 'close' will be called immediately
                event.preventDefault();
                event.stopPropagation();

                if (openElement) {
                    close();
                }

                if (!element.hasClass('mcombo-container-active')) {
                    element.addClass('mcombo-container-active');
                    openElement = element;

                    close = function (event) {
                        event && event.preventDefault();
                        event && event.stopPropagation();
                        $document.unbind('click', close);
                        element.removeClass('mcombo-container-active');
                        close = null;
                        openElement = null;
                    }
                    $document.bind('click', close);
                }

                scope._searchElem.focus();
            });
        }
    };
});