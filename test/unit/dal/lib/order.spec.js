'use strict';

describe('OrderConstructor', function () {
    var OrderConstructor;


    beforeEach(function () {
        module('max.dal.lib.order');

        inject(function(_OrderConstructor_) {
            OrderConstructor = _OrderConstructor_;
        });
    });

    describe('Экземпляр сортировки создается с помощью конструктора', function () {
        it('Конструктор должен получить валидные параметры', function () {
            expect(
                new OrderConstructor('field_name') instanceof OrderConstructor
            ).toBeTruthy();
        });

        it('Название поля сортировки обязательно должен быть задано', function () {
            expect(function () {
                new OrderConstructor();
            }).toThrow("Название поля для сортировки обязательно должно быть задано");
        });

        it('Если задано направление сортировки, то его значение должно быть "asc" или "desc"', function () {
            expect(function () {
                new OrderConstructor('field_name', 123);
            }).toThrow("Направление сортировки может быть задано значениеям: asc, desc");
        });

        it('По умолчанию направление сортировки устанавливается в "asc"', function () {
            var order = new OrderConstructor('field_name');
            expect(order.getDirection()).toEqual('asc');
        });
    });

    it('Экземпляр сортировки умеет возвращать название поля сортировки', function () {
        expect((new OrderConstructor('field_name')).getFieldName()).toEqual('field_name');
    });

    it('Экземпляр сортировки умеет возвращать направление сортировки', function () {
        expect((new OrderConstructor('field_name', 'desc')).getDirection()).toEqual('desc');
    });

    it('Экземпляр сортировки умеет возвращать свое состояние в виде объекта', function () {
        expect(
            (new OrderConstructor('field_name', 'desc')).getAsObject()
        ).toEqual({ order_field: 'field_name', order_direction: 'desc' });
    });

    describe('Экземпляр сортировки умеет сравнивтаь себя с другим сортировками', function () {
        var order,
            comparingOrder,
            OrderCompare;

        beforeEach(function () {
            inject(function(_OrderCompare_) {
                OrderCompare = _OrderCompare_;
            });
        });

        it('Сравнение одинаковых сортировок', function () {
            order = new OrderConstructor('field_name');
            comparingOrder = new OrderConstructor('field_name');

            expect(order.compare(comparingOrder)).toBe(OrderCompare.THE_SAME);
            expect(comparingOrder.compare(order)).toBe(OrderCompare.THE_SAME);
        });

        it('Сравнение разных сортировок', function () {
            order = new OrderConstructor('field_name', 'asc');

            comparingOrder = new OrderConstructor('field_name', 'desc');
            expect(order.compare(comparingOrder)).toBe(OrderCompare.OTHER);
            expect(comparingOrder.compare(order)).toBe(OrderCompare.OTHER);

            comparingOrder = new OrderConstructor('other_field', 'asc');
            expect(order.compare(comparingOrder)).toBe(OrderCompare.OTHER);
            expect(comparingOrder.compare(order)).toBe(OrderCompare.OTHER);

            comparingOrder = new OrderConstructor('other_field', 'desc');
            expect(order.compare(comparingOrder)).toBe(OrderCompare.OTHER);
            expect(comparingOrder.compare(order)).toBe(OrderCompare.OTHER);
        });
    });

});