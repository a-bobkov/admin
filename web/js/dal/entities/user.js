'use strict';

angular.module('app.dal.entities.user', ['app.dal.entities.collection', 'app.dal.rest.api', 
    'app.dal.entities.city',
    'app.dal.entities.dealer',
    'app.dal.entities.group',
    'app.dal.entities.status',
    'app.dal.entities.manager',
    'app.dal.entities.market',
    'app.dal.entities.metro',
    'app.dal.entities.site'
])

.factory('userApi', function(RestApi, Api) {
    var userApi = new RestApi('users', 'user');

    userApi.getDirectories = function() {
        return Api.get('/api2/combined/users/');
    }

    return userApi;
})

.factory('users', function(Collection, User, userApi, $q, $log) {

return (function() {

    var collection = inherit(function() {
        this.registerCollection('user', 'users', User, userApi);
    }, Collection);

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    collection.prototype.get = function(id) {
        var self = this;
        return Collection.prototype.get.call(this, id).then(function (item) {
            return self.getRestApiProvider().get(id).then(function(itemData){
                var respond = item._fillItem(itemData);
                var errorMessages = respond.errorMessages;
                if (errorMessages.length) {
                    $log.error(errorMessages);
                    return $q.reject({response: respond.result, errorMessage: errorMessages});
                }
                return respond.result;
            });
        })
    };    
    return new collection;
}());
})

.factory('User', function(Item) {
    var User = function () {};

    angular.extend(User.prototype, Item.prototype);

    return User;
})

.run(function(users, User) {
});