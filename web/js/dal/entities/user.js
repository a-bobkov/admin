'use strict';

angular.module('app.dal.entities.user', ['app.dal.entities.collection', 'app.dal.rest.user', 'app.dal.entities.city', 'app.dal.entities.market'])

.factory('users', function(Collection, userApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(userApi);

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    collection.get = function(id) {
        var self = this;
        return Collection.prototype.get.call(this, id).then(function (item) {
            return self.getRestApiProvider().get(id).then(function(itemData){
                return item._fillData(itemData);
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

.service('UserOptions', function($q, Api, cities, groups, managers, markets, metros, sites) {
    /**
     * @param -
     * @returns {Promise}
     */
    this.responseHandlerOptions = function(response) {
        var dataProcessed = {},
            errorMessages = [];

        for (var key in response) {
            var collection;
            switch (key) {       // здесь должны проверяться все секции, которые могут встретиться при массовой загрузке
              case "cities":
                collection = cities;
                break;
              case "groups":
                collection = groups;
                break;
              case "managers":
                collection = managers;
                break;
              case "markets":
                collection = markets;
                break;
              case "metros":
                collection = metros;
                break;
              case "sites":
                collection = sites;
                break;
              default:
                errorMessages.push ('Неизвестная секция: ' + key);
            }
            if (collection) {
                dataProcessed[key] = collection._addArray(response[key], errorMessages);
            }
        }

        if (errorMessages.length > 0) {
            return $q.reject('Ответ сервера содержит ошибки:\n' + errorMessages);
        }

        return dataProcessed;
    };

    this.getOptions = function() {
        return Api.get('/api2/combined/users/').then(this.responseHandlerOptions);
    };
});


angular.module('app.dal.rest.user', ['app.dal.rest.api'])

.factory('userApi', function(RestApi) {
    return new RestApi('users', 'user');
});