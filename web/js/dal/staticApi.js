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
            var group = _.find(data, {id: id});
            if (angular.isUndefined(group)) {
                return $q.reject('404');
            }
            return $q.when(group);
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
            var newGroup = angular.extend(data);
            newGroup.id = _.last(data).id + 1;
            data.push(newGroup);
            return $q.when(newGroup);
        };

        /**
         * @param {object} data
         * @returns {Promise}
         */
        this.update = function(data){
            var group = _.find(data, {id: data.id});
            if (angular.isUndefined(group)) {
                return $q.reject('404');
            }
            angular.extend(group, data);
            return $q.when(group);
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