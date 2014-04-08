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
            '        <li class="search-field" ng-hide="!angular.isArray(_selected) && _selected">' +
            '            <input type="text" placeholder="Фильтр с выбором" autocomplete="off" ng-model="_search">' +
            '        </li>' +
            '    </ul>' +
            '    <div class="mcombo-drop" ng-hide="!angular.isArray(_selected) && _selected">' +
            '        <ul class="choices">' +
            '            <li class="item" ng-repeat="choice in filteredChoices()" ng-click="moveToSelected(choice, $event)">' +
            '                {{choice.id}}: {{choice[_choiceName]}}' +
            '            </li>' +
            '            <li class="no-results" ng-show="_search && filteredChoices().length == 0">Нет подходящих значений</li>' +
            '        </ul>' +
            '    </div>' +
            '</div>',
        scope: {
            _choices: '=uiMcomboChoices',
            _selected: '=ngModel',
            _choiceName: '=uiMcomboName'
        },
        controller: ['$scope', '$filter', function($scope, $filter) {
                $scope._searchElem = null;
                if (angular.isArray($scope._selected)) {
                    $scope._selectedChoices = $scope._selected;
                } else if ($scope._selected) {
                    $scope._selectedChoices = [$scope._selected];
                } else {
                    $scope._selectedChoices = [];
                }

                var filterItem = function(item, pattern) {
                    return !(pattern
                        && (String(item.id).indexOf(pattern) === -1)
                        && ((!item[$scope._choiceName]) || (item[$scope._choiceName].toLowerCase().indexOf(pattern) === -1)));
                };

                var filterSpace = function(item, pattern) {
                    var arr = pattern.split(' ');
                    for (var i = arr.length; i--; ) {
                        if (!filterItem(item, arr[i])) {
                            return false;
                        }
                    }
                    return true;
                };

                var filterSearch = function(item) {
                    return (!$scope._search || filterSpace(item, $scope._search.toLowerCase()));
                }

                $scope.filteredChoices = function() {
                    var filteredSearch = $filter('filter')($scope._choices, filterSearch);
                    var filtered = _.difference(filteredSearch, $scope._selectedChoices);
                    return $filter('orderBy')(filtered, 'id');
                };

                $scope.moveToSelected = function(choice, $event) {
                    $scope._selectedChoices.push(choice);
                    if (angular.isArray($scope._selected)) {
                        $scope._selected = $scope._selectedChoices;
                    } else {
                        $scope._selected = $scope._selectedChoices[0];
                    }

                    $scope._searchElem.focus();

                    // do not 'close' on choice click
                    $event.preventDefault();
                    $event.stopPropagation();
                };

                $scope.removeFromSelected = function(choice) {
                    $scope._selectedChoices.splice($scope._selectedChoices.indexOf(choice), 1);
                    if (angular.isArray($scope._selected)) {
                        $scope._selected = $scope._selectedChoices;
                    } else {
                        $scope._selected = $scope._selectedChoices[0];
                    }

                    $scope._searchElem.focus();
                };
            }
        ],
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