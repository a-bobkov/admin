'use strict';

describe('Сервисы dealers и dealerApi', function() {
    var $rootScope,
        $q,
        $log,
        dealers,
        dealerApi;


    beforeEach(function() {
        module('app.dal.entities.dealer');

        inject(function(_$rootScope_, _$q_, _$log_, _dealers_, _dealerApi_)  {
            $rootScope = _$rootScope_;
            $q = _$q_;
            $log = _$log_;
            dealers = _dealers_;
            dealerApi = _dealerApi_;
        });
    });

    describe('Сервис Dealer должен', function() {

        it('группировать телефоны в массив, удаляя линейные параметры телефонов', function() {
            var dealersData = [{
                    id: 5,
                    contact_name: 'Аверин Константин Петрович',
                    phone: '+7-812-232-4123',
                    phoneFrom: 10,
                    phoneTo: 20,
                    phone2: '+7-812-232-4124',
                    phone2From: 11,
                    phone2To: 21,
                    phone3: '+7-812-232-4125',
                    phone3From: 7,
                    companyInfo: 'Здесь может быть произвольный текст...',
                }];

            var dealer = dealers._setAll(dealersData)[0];

            expect(dealer.phones).toEqual([
                { phoneNumber: '+7-812-232-4123', phoneFrom: 10, phoneTo: 20 },
                { phoneNumber: '+7-812-232-4124', phoneFrom: 11, phoneTo: 21 },
                { phoneNumber: '+7-812-232-4125', phoneFrom: 7, phoneTo: undefined }
            ]);
            expect(dealer.phone).toBeUndefined();
            expect(dealer.phoneFrom).toBeUndefined();
            expect(dealer.phoneTo).toBeUndefined();
            expect(dealer.phone2).toBeUndefined();
            expect(dealer.phone2From).toBeUndefined();
            expect(dealer.phone2To).toBeUndefined();
            expect(dealer.phone3).toBeUndefined();
            expect(dealer.phone3From).toBeUndefined();
            expect(dealer.phone3To).toBeUndefined();
        });
   
        it('группировать телефоны в массив, так что пропущенные не сдвигаются', function() {
            var dealersData = [{
                    id: 5,
                    contact_name: 'Аверин Константин Петрович',
                    phone: '+7-812-232-4123',
                    phoneFrom: 10,
                    phoneTo: 20,
                    phone3: '+7-812-232-4125',
                    phone3From: 7,
                    phone3To: 15,
                    companyInfo: 'Здесь может быть произвольный текст...',
                }];

            var dealer = dealers._setAll(dealersData)[0];

            expect(dealer.phones).toEqual([
                { phoneNumber: '+7-812-232-4123', phoneFrom: 10, phoneTo: 20 },
                { phoneNumber: undefined, phoneFrom: undefined, phoneTo: undefined },
                { phoneNumber: '+7-812-232-4125', phoneFrom: 7, phoneTo: 15 }
            ]);
        });
    });
});