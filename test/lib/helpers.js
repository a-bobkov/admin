beforeEach(function() {
    this.addMatchers({
        toEqualData: function(expected) {
            var notText = this.isNot ? " not" : "";
            this.message = function() {
                return "Expected '" + angular.mock.dump(expected) + "'" +
                        notText + " to equal '" + angular.mock.dump(this.actual) + "'.";
            };
            return angular.equals(this.actual, expected);
        },
        toBeArray: function () {
            return angular.isArray(this.actual);
        },
        toBeSortedAscendingNumbers: function () {
            if (angular.isArray(this.actual) && (this.actual.length > 1)) {
                for (var i = this.actual.length; --i; ) {
                    if (parseInt(this.actual[i - 1], 10) > parseInt(this.actual[i], 10)) {
                        return false;
                    }
                }
            }
            return true;
        }
    });
});