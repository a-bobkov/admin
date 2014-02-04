'use strict';

angular.module('app.dal.entities.user', ['app.dal.entities.collection', 'app.dal.rest.user', 'app.dal.entities.city', 'app.dal.entities.market'])

.factory('users', function(Collection, userApi) {

    var collection;

    collection = new Collection;
    collection.setRestApiProvider(userApi);

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

.service('UserOptions', function($q, Api, cities, markets) {
    /**
     * @param -
     * @returns {Promise}
     */
    this.responseHandlerOptions = function(response) {
        var dataProcessed = {},
            errorMessages = [];

        for (var key in response) {
            switch (key) {       // здесь должны проверяться все секции, которые могут встретиться
              case "cities":
                dataProcessed[key] = cities.addArray(response[key], errorMessages);
                break;
              case "markets":
                dataProcessed[key] = markets.addArray(response[key], errorMessages);
                break;
              default:
                errorMessages.push ('Неизвестная секция: ' + key);
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
