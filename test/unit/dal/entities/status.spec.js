'use strict';

describe('Сервис statuses из модуля app.dal.entities.status', function() {
    var $rootScope,
        $q,
        $log,
        statuses,
        Status;

    beforeEach(function() {
        module('app.dal.entities.status');

        inject(function(_$rootScope_, _$q_, _$log_, _statuses_, _Status_)  {
            $rootScope = _$rootScope_;
            $q = _$q_;
            $log = _$log_;
            statuses = _statuses_;
            Status = _Status_;
        });
    });

    it('должен инициализироваться начальными значениями', function() {
        var expected = [
            { 'id': 'inactive', 'nameMale': 'Неактивный', 'namePlural': 'Неактивные' },
            { 'id': 'active', 'nameMale': 'Активный', 'namePlural': 'Активные' },
            { 'id': 'blocked', 'nameMale': 'Блокированный', 'namePlural': 'Блокированные' }
        ],
        actualSuccess,
        actualError;

        statuses.getAll().then(function(respond) {
            actualSuccess = respond;
        },function(respond) {
            actualError = respond;
        });
        $rootScope.$digest();

        expect(actualSuccess).toEqualData(expected);
    });

    it('при инициализации выдавать ошибку при отсутствии id в начальных значениях и пропускать их', function() {
        var data = [
                { 'id': 'inactive', 'nameMale': 'Неактивный', 'namePlural': 'Неактивные' },
                { 'id': 'active', 'nameMale': 'Активный', 'namePlural': 'Активные' },
                { 'idd': 'blocked', 'nameMale': 'Блокированный', 'namePlural': 'Блокированные' }
            ],
            expected = [
                { 'id': 'inactive', 'nameMale': 'Неактивный', 'namePlural': 'Неактивные' },
                { 'id': 'active', 'nameMale': 'Активный', 'namePlural': 'Активные' },
                undefined
            ],
            actualSuccess,
            actualError;

        spyOn($log, 'error').andReturn(null);

        actualSuccess = statuses._setAll(data);

        $rootScope.$digest();
        expect($log.error).toHaveBeenCalledWith([{message: 'Нет параметра id в элементе: {"idd":"blocked","nameMale":"Блокированный","namePlural":"Блокированные"}'}]);
        expect(actualSuccess).toEqualData(expected);
        // expect(actualError.errorMessage).toEqual(['Нет параметра id в элементе: {"name":"Без идентификатора"}']);
    });

    it('возвращать массив объектов', function() {
        var actualSuccess,
            actualError;

        statuses.getAll().then(function(respond) {
            actualSuccess = respond;
        },function(respond) {
            actualError = respond;
        });
        $rootScope.$digest();
        expect(actualSuccess).toBeArray();
    });

    it('элементы массива должны быть созданы конструктором элементов коллекции', function() {
        var actualSuccess,
            actualError;

        statuses.getAll().then(function(respond) {
            actualSuccess = respond;
        },function(respond) {
            actualError = respond;
        });

        $rootScope.$digest();
        _.forEach(actualSuccess, function(item) {
            expect(item.constructor).toBe(Status);
            expect(item instanceof Status).toBeTruthy();
        });
    });

    it('должен возвращать элемент коллекции по id', function() {
        var expected = {
            'id': 'active',
            'nameMale': 'Активный',
            'namePlural': 'Активные'
        },
        actualSuccess,
        actualError;

        statuses.get('active').then(function(respond) {
            actualSuccess = respond;
        },function(respond) {
            actualError = respond;
        });

        $rootScope.$digest();
        expect(actualSuccess).toEqualData(expected);
    });

    it('должен возвращать ошибку, если требуемый элемент не найден в коллекции', function() {
        var expected = {
            'id': 'active',
            'nameMale': 'Активный',
            'namePlural': 'Активные'
        },
        actualSuccess,
        actualError;

        statuses.get('bla').then(function(respond) {
            actualSuccess = respond;
        },function(respond) {
            actualError = respond;
        });
        $rootScope.$digest();
        expect(actualError.errorMessage).toEqual('В коллекции не найден элемент с id: bla');
    });

    it('должен выбрасывать эксепшен при попытке получить провайдера REST API', function() {
        expect(function() {
            statuses._getRestApiProvider();
        }).toThrow('Не задан провайдер REST API для коллекции: statuses');
    });

    it('должен выбрасывать эксепшен при попытке получить данные с сервера', function() {
        expect(function() {
            statuses.load();
        }).toThrow('Не задан провайдер REST API для коллекции: statuses');
    });

    it('должен выбрасывать эксепшен при попытке сохранить данные на сервер', function() {
        var status = new Status;

        expect(function() {
            statuses.save(status);
        }).toThrow('Не задан провайдер REST API для коллекции: statuses');
    });

    it('должен выбрасывать эксепшен при попытке удалить данные на сервере', function() {
        var actualSuccess,
            actualError;

        statuses.getAll().then(function(respond) {
            actualSuccess = respond;
        },function(respond) {
            actualError = respond;
        });
        $rootScope.$digest();
        expect(function() {
            statuses.remove('active');
        }).toThrow('Не задан провайдер REST API для коллекции: statuses');
    });
});
