beforeEach(function() {
    this.addMatchers({
        toEqualData: function(expected) {
            var notText = this.isNot ? " not" : "";
            this.message = function() {
                return "Expected '" + angular.toJson(expected) + "'" +
                        notText + " to equal '" + angular.toJson(this.actual) + "'.";
            };
            return angular.equals(this.actual, expected);
        },
        toBeArray: function () {
            return angular.isArray(this.actual);
        },
        toBeInteger: function () {
            return typeof this.actual === 'number';
        },
        toBeIntegerOrNull: function () {
            return typeof this.actual === 'number' || this.actual === null;
        },
        toBeStringOrNull: function () {
            return typeof this.actual === 'string' || this.actual === null;
        },
        toBeReference: function () {
            return _.isEqual(_.keys(this.actual), ["id"]);
        },
        toBeMemberOf: function (array) {
            return _.contains(array, this.actual);
        },
        toBeSorted: function(params) {
            var convert = function(arg) {
                if (params.match('Numbers')) {
                    return parseInt(arg, 10);
                } else if (params.match('Dates')) {
                    return Date.parse(arg);
                } else if (params.match('Booleans')) {
                    return !!arg;
                } else if (params.match('Strings')) {
                    if (arg) {
                        return arg.toLowerCase();
                    }
                    return arg;
                }
            }
            var compare = function(a, b) {
                if (params.match('Ascending')) {
                    return (a > b);
                } else {
                    return (a < b);
                }
            }
            if (_.isArray(this.actual) && (this.actual.length > 1)) {
                for (var i = this.actual.length; --i; ) {
                    if (compare(convert(this.actual[i - 1]), convert(this.actual[i]))) {
                        return false;
                    }
                }
            }
            return true;
        }
    });
});