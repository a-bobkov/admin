'use strict';
angular.module('TestApp', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {

    $routeProvider
    .when('/testref1', {
        template: 'testref.html',
        controller: 'TestCtrl',
        resolve: {
            data: function($http, requestCanceler, $q) {
                // var requestCanceler = new RequestCanceler;
                return $q.all({
                    first: $http({
                        method: 'GET',
                        url: 'http://127.0.0.1:1337',
                        params: {
                            value: 100
                        },
                        withCredentials: true,
                        timeout: requestCanceler.defer.promise
                    }).then(function(respond) {
                        console.log('success 1: ', respond);
                        return respond;
                    }, function(respond) {
                        if (respond.status === 0 && respond.data === null) {
                            console.log('cancel 1: ', respond);
                        } else {
                            console.log('error 1: ', respond);
                        }
                        return $q.reject(respond);
                    }),
                    second: $http({
                        method: 'GET',
                        url: 'http://127.0.0.1:1337',
                        params: {
                            value: 500
                        },
                        withCredentials: true,
                        timeout: requestCanceler.defer.promise
                    }).then(function(respond) {
                        console.log('success 2: ', respond);
                        return respond;
                    }, function(respond) {
                        if (respond.status === 0 && respond.data === null) {
                            console.log('cancel 2: ', respond);
                        } else {
                            console.log('error 2: ', respond);
                        }
                        return $q.reject(respond);
                    })
                }).then(function(respond) {
                    return $http({
                        method: 'GET',
                        url: 'http://127.0.0.1:1337',
                        params: {
                            value: 400
                        },
                        withCredentials: true,
                        timeout: requestCanceler.defer.promise
                    }).then(function(respond) {
                        console.log('success 3: ', respond);
                        // respond.requestCanceler = requestCanceler;
                        return respond;
                    }, function(respond) {
                        if (respond.status === 0 && respond.data === null) {
                            console.log('cancel 3: ', respond);
                        } else {
                            console.log('error 3: ', respond);
                        }
                        return $q.reject(respond);
                    })
                })
            }
        }
    })
    .when('/testref2', {
        template: 'testref.html',
        controller: 'TestCtrl',
        resolve: {
            data: function($http, requestCanceler, $q) {
                // var requestCanceler = new RequestCanceler;
                return $q.all({
                    first: $http({
                        method: 'GET',
                        url: 'http://127.0.0.1:1337',
                        params: {
                            value: 100
                        },
                        withCredentials: true,
                        timeout: requestCanceler.defer.promise
                    }).then(function(respond) {
                        console.log('success 1: ', respond);
                        return respond;
                    }, function(respond) {
                        if (respond.status === 0 && respond.data === null) {
                            console.log('cancel 1: ', respond);
                        } else {
                            console.log('error 1: ', respond);
                        }
                        return $q.reject(respond);
                    }),
                    second: $http({
                        method: 'GET',
                        url: 'http://127.0.0.1:1337',
                        params: {
                            value: 500
                        },
                        withCredentials: true,
                        timeout: requestCanceler.defer.promise
                    }).then(function(respond) {
                        console.log('success 2: ', respond);
                        return respond;
                    }, function(respond) {
                        if (respond.status === 0 && respond.data === null) {
                            console.log('cancel 2: ', respond);
                        } else {
                            console.log('error 2: ', respond);
                        }
                        return $q.reject(respond);
                    })
                }).then(function(respond) {
                    return $http({
                        method: 'GET',
                        url: 'http://127.0.0.1:1337',
                        params: {
                            value: 400
                        },
                        withCredentials: true,
                        timeout: requestCanceler.defer.promise
                    }).then(function(respond) {
                        console.log('success 3: ', respond);
                        // respond.requestCanceler = requestCanceler;
                        return respond;
                    }, function(respond) {
                        if (respond.status === 0 && respond.data === null) {
                            console.log('cancel 3: ', respond);
                        } else {
                            console.log('error 3: ', respond);
                        }
                        return $q.reject(respond);
                    })
                })
            }
        }
    })
;
}])

.service('requestCanceler', function($q, $rootScope) {
    // var RequestCanceler = function() {
        this.defer = $q.defer();
        var that = this;
        $rootScope.$on('$routeChangeStart', function() {
            console.log('routeChangeStart');
            that.defer.resolve();
            that.defer = $q.defer();
        });
        window.addEventListener('beforeunload', function() {
            console.log('beforeunload');
            $rootScope.$apply(that.defer.resolve);
            that.defer = $q.defer();
        });
        // window.onbeforeunload = function() {
        //     console.log('beforeunload');
        //     $rootScope.$apply(that.defer.resolve);
        //     // that.defer = $q.defer();
        // };                                             // переделать на сервис с перезарядкой при использовании и прямо в запрос
        // window.onunload = this.defer.resolve;
        // $rootScope.$on('$destroy', this.defer.resolve);

        // window.addEventListener('beforeunload', function() {
        //     console.log('beforeunload');
        //     that.defer.resolve();
        // });
    // }
    // return RequestCanceler;
})

.controller('AppCtrl', function($rootScope, $http, $q) {
    console.log('AppCtrl');
})

.controller('TestCtrl', function($rootScope, $http, data, requestCanceler) {
    console.log('TestCtrl', data);
    $http({
        method: 'GET',
        url: 'http://127.0.0.1:1337',
        params: {
            value: 5000
        },
        withCredentials: true,
        timeout: requestCanceler.defer.promise
    }).then(function(respond) {
        console.log('success 4: ', respond);
        return respond;
    }, function(respond) {
        if (respond.status === 0 && respond.data === null) {
            console.log('cancel 4: ', respond);
        } else {
            console.log('error 4: ', respond);
        }
    })
})
;