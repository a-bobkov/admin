'use strict';
angular.module('app.dal.entities.user', ['app.dal.rest.user'])

.service('optionsStatus', function() {
    this.data = [
        { 'id': 'inactive', 'nameMale': 'Неактивный', 'namePlural': 'Неактивные' },
        { 'id': 'active', 'nameMale': 'Активный', 'namePlural': 'Активные' },
        { 'id': 'blocked', 'nameMale': 'Блокированный', 'namePlural': 'Блокированные' }
    ];

    this.getStatusById = function(id) {
        for (var i=0; i<this.data.length; i++) {
            if (this.data[i].id == id) {
                return this.data[i];
            }
        }
        return id;
    }
})

.service('optionsTag', function() {
    this.data = [
        { 'id': 1, 'name': 'Катя'},
        { 'id': 2, 'name': 'Инна'},
        { 'id': 4, 'name': 'Потеряшки'},
        { 'id': 0, 'name': 'Без тэга'}
    ];

    this.getTagById = function(id) {
        for (var i=0; i<this.data.length; i++) {
            if (this.data[i].id == id) {
                return this.data[i];
            }
        }
        return id;
    }
})

.service('optionsHour', function() {
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

    this.getHourById = function(id) {
        for (var i=0; i<this.data.length; i++) {
            if (this.data[i].id == id) {
                return this.data[i];
            }
        }
        return id;
    }
})

/**
 * Too simple example of entity.
 * Different caching strategies (using memory, localstorage, etc) can be added.
 * More params/responses handling can be used.
 */
.factory('User', function(UserApi, optionsStatus, optionsTag, optionsHour){
    var User = function(data) {
        angular.extend(this, data);
        // any processing logic: parse dates, etc
        this.status = optionsStatus.getStatusById(this.status);
        this.tag_id = optionsTag.getTagById(this.tag_id);
        this.phone_from = optionsHour.getHourById(this.phone_from);
        this.phone_to = optionsHour.getHourById(this.phone_to);
        this.phone2_from = optionsHour.getHourById(this.phone2_from);
        this.phone2_to = optionsHour.getHourById(this.phone2_to);
        this.phone3_from = optionsHour.getHourById(this.phone3_from);
        this.phone3_to = optionsHour.getHourById(this.phone3_to);
    };

    User.prototype.getStatusNameMale = function () {
        return this.status.nameMale || this.status;
    }

    User.prototype.getTagName = function () {
        return this.tag_id.name || this.tag_id;
    }

    /**
     * Returns humanized user's full name
     * @returns {string}
     */
    User.prototype.getFullName = function(){
        var names = [];
        if (this.firstName && this.firstName.length > 0) {
            names.push(this.firstName);
        }
        if (this.middleName && this.middleName.length > 0) {
            names.push(this.middleName);
        }
        if (this.lastName && this.lastName.length > 0) {
            names.push(this.lastName);
        }
        return names.join(' ');
    };

    /**
     * @param {Number} id
     * @returns {Promise}
     */
    User.get = function(id){
        return UserApi.get(id).then(function(userData){
            return new User(userData);
        })
    };

    /**
     * @param {Object} [pagination]
     * @param {(Number|undefined)} pagination.page
     * @param {(Number|undefined)} pagination.perPage
     * @returns {Promise}
     */
    User.getAll = function() { //pagination) {
        var params = {
//            page: pagination.page || 1,
//            limit: pagination.perPage
        };
        return UserApi.query(params).then(function (response) {
            var users = _.collect(response.data, function(u){ return new User(u); });
            return {
                list: users,
                total: response.total
            };
        });
    };

    /**
     * @returns {Promise}
     */
    User.prototype.create = function() {
        var self = this;
        return UserApi.create(this).then(function(data){
            angular.extend(self, data);
            return self;
        });
    };

    /**
     * @returns {Promise}
     */
    User.prototype.save = function() {
        var self = this;
        return UserApi.update(this).then(function(data){
            angular.extend(self, data);
            return self;
        });
    };

    /**
     * @returns {Promise}
     */
    User.prototype.remove = function() {
        var self = this;
        return UserApi.remove(this.id);
    };

    return User;
});