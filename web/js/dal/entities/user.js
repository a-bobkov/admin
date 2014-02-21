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
    return new UsersCollection;
}());
})

.factory('User', function(Item) {
    var User = function () {};

    angular.extend(User.prototype, Item.prototype);

    return User;
})

.run(function(users, User, userApi) {
    users._registerCollection('user', 'users', User, userApi);
})

.service('userHours', function() {
    this.data = [
        { 'id':  0, 'name':  '0:00'},
        { 'id':  1, 'name':  '1:00'},
        { 'id':  2, 'name':  '2:00'},
        { 'id':  3, 'name':  '3:00'},
        { 'id':  4, 'name':  '4:00'},
        { 'id':  5, 'name':  '5:00'},
        { 'id':  6, 'name':  '6:00'},
        { 'id':  7, 'name':  '7:00'},
        { 'id':  8, 'name':  '8:00'},
        { 'id':  9, 'name':  '9:00'},
        { 'id': 10, 'name': '10:00'},
        { 'id': 11, 'name': '11:00'},
        { 'id': 12, 'name': '12:00'},
        { 'id': 13, 'name': '13:00'},
        { 'id': 14, 'name': '14:00'},
        { 'id': 15, 'name': '15:00'},
        { 'id': 16, 'name': '16:00'},
        { 'id': 17, 'name': '17:00'},
        { 'id': 18, 'name': '18:00'},
        { 'id': 19, 'name': '19:00'},
        { 'id': 20, 'name': '20:00'},
        { 'id': 21, 'name': '21:00'},
        { 'id': 22, 'name': '22:00'},
        { 'id': 23, 'name': '23:00'},
        { 'id': 24, 'name': '24:00'}
    ];
});