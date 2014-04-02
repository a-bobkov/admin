'use strict';

describe('DalLibPagination', function () {
    var DalLibPagination;

    beforeEach(function () {
        module('max.dal.lib.collection');

        inject(function(_DalLibPagination_) {
            DalLibPagination = _DalLibPagination_;
        });
    });

    describe('Экземпляры постранички создаются с помощью конструктора', function () {

        it('Конструктор должен получить в качестве параметра валидный объект', function () {
            var params = {
                from:   1,
                to:     10,
                total:  200
            };
            expect(new DalLibPagination(params) instanceof DalLibPagination).toBeTruthy();
        });


        it('Конструктор должен получить в качестве параметра объект', function () {
            expect(function () {
                new DalLibPagination();
            }).toThrow("Необходимо передать в конструктор объект со значениями: { from: int, to: int, total: int }");
        });


        it('Параметр конструктора должен содержать валидное значение для form', function () {

            expect(function () {
                new DalLibPagination( {} );
            }).toThrow("Объект с параметрами должен содержать параметр from");

            expect(function () {
                new DalLibPagination( { from: 'not a number' } );
            }).toThrow("Параметр from вместо числа содержит значение 'not a number'");
        });


        it('Параметр конструктора должен содержать валидное значение для to', function () {

            expect(function () {
                new DalLibPagination( { from: 1 } );
            }).toThrow("Объект с параметрами должен содержать параметр to");

            expect(function () {
                new DalLibPagination( { from: 1, to: 'not a number' } );
            }).toThrow("Параметр to вместо числа содержит значение 'not a number'");
        });


        it('Параметр конструктора должен содержать валидное значение для total', function () {

            expect(function () {
                new DalLibPagination( { from: 1, to: 10 } );
            }).toThrow("Объект с параметрами должен содержать параметр total");

            expect(function () {
                new DalLibPagination( { from: 1, to: 10, total: 'not a number' } );
            }).toThrow("Параметр total вместо числа содержит значение 'not a number'");
        });
    });
});

describe('DalLibFilters', function () {

    var DalLibFilters;

    beforeEach(function () {
        module('max.dal.lib.collection');

        inject(function(_DalLibFilters_) {
            DalLibFilters = _DalLibFilters_;
        });
    });

    describe('Экземпляры параметров создаются с помощью конструктора', function () {

        it('Конструктор должен получить входящий параметр', function () {
            expect(function () {
                new DalLibFilters();
            }).toThrow("Необходимо передать в конструктор функцию-фильтр либо массив с таким функциями");
        });

        it('Входящим параметром конструктора может быть функция-фильтр либо массив таких функций', function () {
            expect(function () {
                new DalLibFilters([]);
            }).toThrow("Необходимо передать в конструктор функцию-фильтр либо массив с таким функциями");
        });

        describe('Во входящих параметрах конструктора могут использоваться только валидные функции-фильтры', function () {

            it ('Фильтр должен быть реализован в виде функции', function () {
                expect(function () {
                    new DalLibFilters(['asdf']);
                }).toThrow("Фильтр должен быть реализован в виде функции");
            });

            it ('Функция-фильтр должна иметь метод toObject()', function () {
                expect(function () {
                    new DalLibFilters(function () {});
                }).toThrow("Фильтр должен иметь метод getAsObject");
            });
        });

    });
});

describe('DalLibParams', function () {

    var DalLibParams,
        DalLibFilers,
        DalLibPagination;

    beforeEach(function () {
        module('max.dal.lib.collection');

        inject(function(_DalLibParams_, _DalLibFilters_, _DalLibPagination_) {
            DalLibParams = _DalLibParams_;
            DalLibFilers = _DalLibFilters_;
            DalLibPagination = _DalLibPagination_;
        });
    });

    describe('Экземпляры параметров создаются с помощью конструктора', function () {
        it('Конструктор может обходиться без передачи параметров', function () {
            expect(new DalLibParams() instanceof DalLibParams).toBeTruthy();
        });

        it('Конструктор может принимать объект с фильтром', function () {
            var params,
                filter = function () {};

            filter.getAsObject = function () {
                return { name: 'masc' }
            };

            params = new DalLibParams({ filters: new DalLibFilers(filter) });

            expect(params instanceof DalLibParams).toBeTruthy();
        });

        it('Конструктор может принимать объект с постраничкой в виде литерального объекта', function () {
            var params,
                pagination = { from: 1, to: 10, total: 100 };

            params = new DalLibParams({ pagination: pagination });

            expect(params instanceof DalLibParams).toBeTruthy();
            expect(params.get().pagination.get()).toEqual(pagination);
        });

        it('Конструктор может принимать объект с постраничкой в виде объекта типа постраничка', function () {
            var params,
                pagination;

            pagination = new DalLibPagination({ from: 1, to: 10, total: 100 });
            params = new DalLibParams({ pagination: pagination });

            expect(params instanceof DalLibParams).toBeTruthy();
            expect(params.get().pagination).toBe(pagination);
        });

        it('Конструктор НЕ может принимать объект с постраничкой в виде произвольного объекта', function () {
            expect(function () {
                new DalLibParams({ pagination: function () {} })
            }).toThrow();
        });
    });
});

describe('DalLibCollection', function () {

    var DalLibCollection;

    beforeEach(function () {
        module('max.dal.lib.collection');

        inject(function(_DalLibCollection_) {
            DalLibCollection = _DalLibCollection_;
        });
    });

    it('Экземпляры коллекций создаются с помощью конструктора', function () {

        expect(function () {
            new DalLibCollection();
        }).toThrow("Список элементов коллекции (items) может быть передан только в виде массива");

        expect(function () {
            new DalLibCollection([]);
        }).not.toThrow();

    });

    it('Метод getItems() возвращает все элементы коллекции', function () {

        var items = [1, 2, 3],
            collection = new DalLibCollection(items);

        expect(collection.getItems()).toBe(items);

    });
});