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
                    phone_from: 10,
                    phone_to: 20,
                    phone2: '+7-812-232-4124',
                    phone2_from: 11,
                    phone2_to: 21,
                    phone3: '+7-812-232-4125',
                    phone3_from: 7,
                    companyInfo: 'Здесь может быть произвольный текст...',
                }];

            var dealer = dealers._setAll(dealersData)[0];

            expect(dealer.phones).toEqual([
                { phoneNumber: '+7-812-232-4123', phoneFrom: 10, phoneTo: 20 },
                { phoneNumber: '+7-812-232-4124', phoneFrom: 11, phoneTo: 21 },
                { phoneNumber: '+7-812-232-4125', phoneFrom: 7, phoneTo: undefined }
            ]);
            expect(dealer.phone).toBeUndefined();
            expect(dealer.phone_from).toBeUndefined();
            expect(dealer.phone_to).toBeUndefined();
            expect(dealer.phone2).toBeUndefined();
            expect(dealer.phone2_from).toBeUndefined();
            expect(dealer.phone2_to).toBeUndefined();
            expect(dealer.phone3).toBeUndefined();
            expect(dealer.phone3_from).toBeUndefined();
            expect(dealer.phone3_to).toBeUndefined();
        });
   
        it('группировать телефоны в массив, так что пропущенные не сдвигаются', function() {
            var dealersData = [{
                    id: 5,
                    contact_name: 'Аверин Константин Петрович',
                    phone: '+7-812-232-4123',
                    phone_from: 10,
                    phone_to: 20,
                    phone3: '+7-812-232-4125',
                    phone3_from: 7,
                    phone3_to: 15,
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