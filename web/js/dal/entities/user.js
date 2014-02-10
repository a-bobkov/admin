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

.factory('userApi', function(RestApi) {
    return new RestApi('users', 'user');
})

.factory('users', function(Collection, userApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(userApi);
    collection.registerChild ('user', 'users');

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    collection.get = function(id) {
        var self = this;
        return Collection.prototype.get.call(this, id).then(function (item) {
            return self.getRestApiProvider().get(id).then(function(itemData){
                try {
                    var errorMessages = [];
                    item._fillData(itemData);
                } catch (errorMessage) {
                    errorMessages.push(errorMessage);
                }
                if (errorMessages.length) {
                    $log.error(errorMessages);
                    return $q.reject({response: item, errorMessage: errorMessages});
                }
                return item;
            });
        })
    };

    return collection;
})

.factory('User', function(Item, users) {
    var User = function () {};

    angular.extend(User.prototype, Item.prototype);

    return User;
})

.run(function(users, User) {
    users.setItemConstructor(User);
})

.service('UserOptions', function($q, $log, Api, Collection) {
    /**
     * @param -
     * @returns {Promise}
     */
    this.responseHandlerOptions = function(response) {
        var dataProcessed = {},
            errorMessages = [];

        for (var key in response) {
            try {
                var collection = Collection.prototype.children[key];
                if (!collection) {
                    throw new CollectionError('Неизвестная секция: ' + key);
                }
                dataProcessed[key] = collection._addArray(response[key]);
            } catch (error) {
                if (!(error instanceof CollectionError)) {
                    throw error;
                }
                errorMessages.push(error.message);
            }
        }

        if (errorMessages.length) {
            $log.error(errorMessages);
            return $q.reject({response: response, errorMessage: errorMessages});
        }

        return dataProcessed;
    };

    this.getOptions = function() {
        return Api.get('/api2/combined/users/').then(this.responseHandlerOptions);
    };
});