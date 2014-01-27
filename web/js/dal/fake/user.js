'use strict';

angular.module('app.dal.fake.user', [])

.factory('UserFakeApi', function($q, UserFakeData){
    var UserFakeApi = {};

    UserFakeApi.get = function(id){
        var user = _.find(UserFakeData, {id: id});
        if (angular.isUndefined(user)) {
            return $q.reject('404');
        }
        return $q.when(user);
    };

    UserFakeApi.query = function(params){
//        var page = params && params.page || 1;
//        var limit = params && params.limit || 10;
        return $q.when({
            data: UserFakeData,
//            data: UserFakeData.slice((page - 1) * limit, page * limit),
            total: UserFakeData.length
        });
    };

    UserFakeApi.create = function(data){
        var newUser = angular.extend(data);     // в оригинале было angular.copy, из-за чего плодились сущности по ссылкам
        newUser.id = _.last(UserFakeData).id + 1;
        UserFakeData.push(newUser);
        return $q.when(newUser);
    };

    UserFakeApi.update = function(data){
        var user = _.find(UserFakeData, {id: data.id});
        if (angular.isUndefined(user)) {
            return $q.reject('404');
        }
        angular.extend(user, data);
        return $q.when(user);
    };

    UserFakeApi.remove = function(id){
        UserFakeData.splice(_.findIndex(UserFakeData, {id: id}), 1);
    };
    return UserFakeApi;
})

.value('UserFakeData', [
    {
        'id': 5,
        'email': 'demo@maxposter.ru',
        'last_login': '2013-12-01',
        'status': 'active',             // перечисление
        'role': '2',                    // перечисление
        'tag_id': 1,                    // справочник
        'company_name': 'Демокомпания',
        'city_id': '2',                 // справочник
        'market_id': '6',               // справочник
        'metro_id': '173',              // справочник
        'adress': '191040, Лиговский проспект, 150, оф.505',
        'fax': '+7-812-232-4123',
        'dealer_email': 'demo@demo.ru',
        'site': 'http://www.w3schools.com',
        'contact_name': 'Аверин Константин Петрович',
        'phone': '+7-812-232-4123',
        'phone_from': '10',
        'phone_to': '20',
        'phone2': '+7-812-232-4124',
        'phone2_from': '11',
        'phone2_to': '21',
        'phone3': '+7-812-232-4125',
        'phone3_from': '7',
        'phone3_to': '15',
        'company_info': 'Здесь может быть произвольный текст...',
        'site_id': '17'                 // справочник
    },
    {'id': 1, 'email': 'a-bobkov@ab.com', 'company_name': 'Ещё компания','last_login': '2012-01-01', 'status': 'active', 'tag_id': 1, 'role': '1'},
    {'id': 2, 'email': 'a-bobkov@abb.com', 'company_name': 'Супер-салон','last_login': '2011-03-11', 'status': 'active', 'tag_id': 2, 'role': '1'},
    {'id': 3, 'email': 'a-bobkov@abc.com', 'last_login': '2012-05-31', 'status': 'inactive', 'tag_id': 1, 'role': '1'},
    {'id': 4, 'email': 'a-bobkov@abd.com', 'last_login': '2011-12-12', 'status': 'error', 'tag_id': 2, 'role': '1'},
    {'id': 6, 'email': 'a-bobkov@abe.com', 'last_login': '2013-01-06', 'status': 'active', 'tag_id': 1, 'role': '1'},
    {'id': 7, 'email': 'a-bobkov@abf.com', 'last_login': '2000-01-12', 'status': 'inactive', 'tag_id': 1, 'role': '1'},
    {'id': 8, 'email': 'a-bobkov@abg.com', 'last_login': '2000-08-07', 'status': 'active', 'tag_id': 0, 'role': '1'},
    {'id': 9, 'email': 'a-bobkov@abh.com', 'last_login': '2012-01-01', 'status': 'active', 'tag_id': 8, 'role': '1'},
    {'id': 10, 'email': 'a-bobkov@abi.com', 'last_login': '2012-01-01', 'status': 'active', 'tag_id': 1, 'role': '1'},
    {'id': 11, 'email': 'a-bobkov@abj.com', 'last_login': '2012-01-01', 'status': 'blocked', 'tag_id': 2, 'role': '1'},
    {'id': 12, 'email': 'a-bobkov@abk.com', 'last_login': '2012-01-01', 'status': 'active', 'tag_id': 1, 'role': '1'},
    {'id': 13, 'email': 'a-bobkov@abl.com', 'last_login': '2012-01-01', 'status': 'active', 'tag_id': 1, 'role': '1'},
    {'id': 14, 'email': 'a-bobkov@abo.com', 'last_login': '2012-01-01', 'status': 'blocked', 'tag_id': 2, 'role': '1'},
    {'id': 15, 'email': 'a-bobkov@abm.com', 'last_login': '2012-01-01', 'status': 'active', 'tag_id': 4, 'role': '1'}
]);