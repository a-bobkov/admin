'use strict';

angular.module('app.dal.static.api', [])

.factory('StaticApi', function($q) {

    var StaticApiConstructor = function (collectionData) {

        var data = collectionData;

        /**
         * @param {Number} id
         * @returns {Promise}
         */
        this.get = function(id){
            var item = _.find(data, {id: id});
            if (angular.isUndefined(item)) {
                return $q.reject('404');
            }
            return $q.when(item);
        };

        /**
         * @param {Object} [params]
         * @returns {Promise}
         */
        this.query = function(params){
            return $q.when(data);
        };

        /**
         * @param {Object} data
         * @returns {Promise}
         */
        this.create = function(data){
            var newItem = angular.extend(data);
            newItem.id = _.last(data).id + 1;
            data.push(newItem);
            return $q.when(newItem);
        };

        /**
         * @param {object} data
         * @returns {Promise}
         */
        this.update = function(data){
            var item = _.find(data, {id: data.id});
            if (angular.isUndefined(item)) {
                return $q.reject('404');
            }
            angular.extend(item, data);
            return $q.when(item);
        };

        /**
         * @param {Number} id
         * @returns {Promise}
         */
        this.remove = function(id){
            data.splice(_.findIndex(data, {id: id}), 1);
        };
    };

    return StaticApiConstructor;
});