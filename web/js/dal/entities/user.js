'use strict';

angular.module('max.dal.entities.user', ['max.dal.entities.collection', 'max.dal.rest.api',
    'max.dal.entities.group',
    'max.dal.entities.site',
    'max.dal.entities.dealer',
    'max.dal.entities.manager',
    'max.dal.entities.city',
    'max.dal.entities.market',
    'max.dal.entities.metro'
])

.factory('userApi', function(RestApi, Api) {

    var userApi = new RestApi('users', 'user');

    userApi.getDirectories = function() {
        return Api.get('/combined/users');
    };

    return userApi;
})

.factory('User', function(userApi, Item, userStatuses, Dealer) {
    var User = (function() {
        function User(itemData) {
            Item.call(this, itemData);
        };
        _.assign(User.prototype, Item.prototype);

        User.prototype.lowerName = 'user';

        User.prototype.entityParams = {
            dateFields: ['lastLogin'],
            enumFields: {
                status: userStatuses
            },
            refFields: {
                group: 'groups',
                site: 'sites'
            },
            objectFields: {
                dealer: Dealer
            }
        };

        User.prototype.serialize = function() {
            var itemData = Item.prototype.serialize.call(this);
            if (!this.isDealer()) {
                itemData.dealer = null;
            };
            if (!this.isSite()) {
                itemData.site = null;
            }
            if (this.isDealer()) {
                if (itemData.dealer) {
                    itemData.dealer.id = itemData.id;
                }
            };
            return itemData;
        };

        User.prototype.isValid = function() {
            return _.every(this, function(value, key) {
                if (key === 'dealer' && value) {
                    return value.isValid();
                } else if (_.has(value, 'id')) {    // ссылки пропускаем
                    return true;
                } else {              // todo: валидация значений полей, кроме ссылок
                    return true;
                }
            });
        };

        User.prototype.isDealer = function() {
            return (this.group && this.group.id == 2);
        };

        User.prototype.isSite = function() {
            return (this.group && this.group.id == 3);
        };

        User.prototype.save = function(directories) {
            if (this.id) {
                return userApi.update(this.serialize()).then(function(respond) {
                    return new User(respond.user).resolveRefs(directories);
                });
            } else {
                return userApi.create(this.serialize()).then(function(respond) {
                    return new User(respond.user).resolveRefs(directories);
                });
            }
        };

        User.prototype.remove = function() {
            if (this.id) {
                return userApi.remove(this.id);
            }
            throw new CollectionError('Попытка удалить элемент без id');
        };

        return User;
    }());
    return User;
})

.factory('Users', function(Collection, User) {
    function Users(itemsData, queryParams) {
        Collection.call(this, itemsData, queryParams, User, Users);
    };
    _.assign(Users.prototype, Collection.prototype);
    Users.prototype.lowerName = 'users';
    return Users;
})

.service('usersLoader', function(entityLoader, userApi, User, Users, Construction, 
    Groups, Sites, Managers, BillingCompanies, Cities, Markets, Metros) {
    
    this.loadItems = function(queryParams, directories) {
        return entityLoader.loadItems(queryParams, directories, userApi, Users);
    };
    this.loadItem = function(id, directories) {
        return entityLoader.loadItem(id, directories, userApi, User);
    };
    this.loadDirectories = function() {
        return userApi.getDirectories().then(function(collections) {
            return new Construction({
                groups: new Groups(collections.groups),
                sites: new Sites(collections.sites),
                managers: new Managers(collections.managers),
                billingCompanies: new BillingCompanies(collections.billingCompanies),
                cities: new Cities(collections.cities),
                markets: new Markets(collections.markets),
                metros: new Metros(collections.metros)
            });
        });
    };
})

.factory('UserStatus', function(Item) {
    function UserStatus(itemData) {
        Item.call(this, itemData);
    };
    _.assign(UserStatus.prototype, Item.prototype);
    return UserStatus;
})

.factory('userStatuses', function(Collection, UserStatus) {
    return new Collection([
        { 'id': 'inactive', 'nameMale': 'Неактивный', 'namePlural': 'Неактивные' },
        { 'id': 'active', 'nameMale': 'Активный', 'namePlural': 'Активные' },
        { 'id': 'blocked', 'nameMale': 'Блокированный', 'namePlural': 'Блокированные' }
    ], null, UserStatus);
})
;