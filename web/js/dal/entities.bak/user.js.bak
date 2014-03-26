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
        return Api.get('/combined/users');
    }

    userApi.query = function() {
        return Api.get('/users/partial').then(
            this._getResponseHandler('users')
        );
    };

    return userApi;
})

.factory('users', function(Collection, $q, $log) {

return (function() {

    var UsersCollection = inheritCollection(function() {}, Collection);

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    UsersCollection.prototype.get = function(id) {
        var self = this;
        return Collection.prototype.get.call(this, id).then(function (item) {
            return self._getRestApiProvider().get(id).then(function(itemData){
                return item._fillItem(itemData);
            });
        })
    };    
    return new UsersCollection;
}());
})

.factory('User', function(Item) {
    var User = function () {};

    angular.extend(User.prototype, Item.prototype);

    User.prototype.isDealer = function() {
        return (this.group && this.group.id == 2);
    }

    User.prototype.isSite = function() {
        return (this.group && this.group.id == 3);
    }

    User.prototype._serialize = function() {
        var itemData = {};
        angular.forEach(this, function(value, key){
            if (angular.isObject(value)) {
                if (key === "dealer") {
                    itemData[key] = value._serialize();
                } else {
                    itemData[key] = {id: value.id};
                }
            } else {
                itemData[key] = value;
            }
        });
        if (!this.isDealer()) {
            delete itemData.dealer;
        };
        if (!this.isSite()) {
            delete itemData.site;
        }
        return itemData;
    };

    return User;
})

.run(function(users, User, userApi) {
    users._registerCollection('user', 'users', User, userApi);
});