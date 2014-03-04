'use strict';

// angular.scenario.matcher('toView', function() {
//     console.log(this.actual);
//     return true;
// });

describe('MaxPoster frontend app', function() {
    describe('Список пользователей', function() {
        beforeEach(function() {
            // var ptor = protractor.getInstance();
            // ptor.ignoreSynchronization = true;
            browser.get('users.html');
            expect(browser.getTitle()).toBe('MaxPoster - Управление пользователями');
        });

        beforeEach(function() {
            this.addMatchers({
                toBeSortedArrayOf: function(params) {
                    // var params = 'AscendingNumbers';
                    var convert = function(arg) {
                        if (params.match('Numbers')) {
                            return parseInt(arg, 10);
                        } else if (params.match('Dates')) {
                            return Date.parse(arg);
                        } else {
                            return arg;
                        }
                    }
                    var compare = function(a, b) {
                        if (params.match('Ascending')) {
                            return (a > b);
                        } else {
                            return (a < b);
                        }
                    }
                    if (this.actual.length > 1) {
                        for (var i = this.actual.length; --i; ) {
                            if (compare(convert(this.actual[i - 1]), convert(this.actual[i]))) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
            });
        });

        it('показывает 25 пользователей', function() {
            var users = element.all(by.repeater('user in pagedUsers'));
            expect(users.count()).toBe(25);

            // expect(repeater('#UserListTable tr').count()).toBe(25);
            // expect(repeater('#UsersTable_Paginate a').count()).toBe(6); // кнопок в постраничке

            // element('#UsersTable_Paginate a:nth-child(4)').click();
            // expect(repeater('#UsersTable tr').count()).toBe(5);

            // input('patterns.email').enter('di');
            // expect(repeater('#UsersTable tr').count()).toBe(2);
            // expect(repeater('#UsersTable_Paginate a').count()).toBe(5);

            // input('patterns.code').enter('mi');
            // expect(repeater('#UsersTable tr').count()).toBe(2);
            // expect(repeater('#UsersTable_Paginate a').count()).toBe(5);
        });

        it('сортируется по коду, емэйлу, дате', function() {
            var mapText = function(q) {
                return q.map(function(elm) {
                    return elm.getText();
                })
            };

            mapText(element.all(by.repeater('user in pagedUsers').column('user.id'))).then(function(data) {
                expect(data).toBeSortedArrayOf('AscendingNumbers');
                expect(data).not.toBeSortedArrayOf('DescendingNumbers');
            });

            mapText(element.all(by.repeater('user in pagedUsers').column('user.email'))).then(function(data) {
                expect(data).not.toBeSortedArrayOf('AscendingStrings');
                expect(data).not.toBeSortedArrayOf('DescendingStrings');
            });

            mapText(element.all(by.repeater('user in pagedUsers').column('user.last_login'))).then(function(data) {
                expect(data).not.toBeSortedArrayOf('AscendingDates');
                expect(data).not.toBeSortedArrayOf('DescendingDates');
            });

            element.all(by.id('UserListTableHeaderRef')).then(function(arr) {
                arr[0].click();
                mapText(element.all(by.repeater('user in pagedUsers').column('user.id'))).then(function(data) {
                    expect(data).not.toBeSortedArrayOf('AscendingNumbers');
                    expect(data).toBeSortedArrayOf('DescendingNumbers');
                });
                mapText(element.all(by.repeater('user in pagedUsers').column('user.email'))).then(function(data) {
                    expect(data).not.toBeSortedArrayOf('AscendingStrings');
                    expect(data).not.toBeSortedArrayOf('DescendingStrings');
                });
                mapText(element.all(by.repeater('user in pagedUsers').column('user.last_login'))).then(function(data) {
                    expect(data).not.toBeSortedArrayOf('AscendingDates');
                    expect(data).not.toBeSortedArrayOf('DescendingDates');
                });

                arr[1].click();
                mapText(element.all(by.repeater('user in pagedUsers').column('user.id'))).then(function(data) {
                    expect(data).not.toBeSortedArrayOf('AscendingNumbers');
                    expect(data).not.toBeSortedArrayOf('DescendingNumbers');
                });
                mapText(element.all(by.repeater('user in pagedUsers').column('user.email'))).then(function(data) {
                    expect(data).toBeSortedArrayOf('AscendingStrings');
                    expect(data).not.toBeSortedArrayOf('DescendingStrings');
                });
                mapText(element.all(by.repeater('user in pagedUsers').column('user.last_login'))).then(function(data) {
                    expect(data).not.toBeSortedArrayOf('AscendingDates');
                    expect(data).not.toBeSortedArrayOf('DescendingDates');
                });

                arr[1].click();
                mapText(element.all(by.repeater('user in pagedUsers').column('user.id'))).then(function(data) {
                    expect(data).not.toBeSortedArrayOf('AscendingNumbers');
                    expect(data).not.toBeSortedArrayOf('DescendingNumbers');
                });
                mapText(element.all(by.repeater('user in pagedUsers').column('user.email'))).then(function(data) {
                    expect(data).not.toBeSortedArrayOf('AscendingStrings');
                    expect(data).toBeSortedArrayOf('DescendingStrings');
                });
                mapText(element.all(by.repeater('user in pagedUsers').column('user.last_login'))).then(function(data) {
                    expect(data).not.toBeSortedArrayOf('AscendingDates');
                    expect(data).not.toBeSortedArrayOf('DescendingDates');
                });

                arr[2].click();
                mapText(element.all(by.repeater('user in pagedUsers').column('user.id'))).then(function(data) {
                    expect(data).not.toBeSortedArrayOf('AscendingNumbers');
                    expect(data).not.toBeSortedArrayOf('DescendingNumbers');
                });
                mapText(element.all(by.repeater('user in pagedUsers').column('user.email'))).then(function(data) {
                    expect(data).not.toBeSortedArrayOf('AscendingStrings');
                    expect(data).not.toBeSortedArrayOf('DescendingStrings');
                });
                mapText(element.all(by.repeater('user in pagedUsers').column('user.last_login'))).then(function(data) {
                    expect(data).toBeSortedArrayOf('AscendingDates');
                });

                arr[2].click();
                mapText(element.all(by.repeater('user in pagedUsers').column('user.id'))).then(function(data) {
                    expect(data).not.toBeSortedArrayOf('AscendingNumbers');
                    expect(data).not.toBeSortedArrayOf('DescendingNumbers');
                });
                mapText(element.all(by.repeater('user in pagedUsers').column('user.email'))).then(function(data) {
                    expect(data).not.toBeSortedArrayOf('AscendingStrings');
                    expect(data).not.toBeSortedArrayOf('DescendingStrings');
                });
                mapText(element.all(by.repeater('user in pagedUsers').column('user.last_login'))).then(function(data) {
                    expect(data).toBeSortedArrayOf('DescendingDates');
                });
            })
        });

        xit('фильтруется по сложному фильтру', function() {
            input('patterns.complex').enter('5');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 435$/);

            input('patterns.complex').enter('55');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 30$/);

            input('patterns.complex').enter('max');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 100$/);

            input('patterns.complex').enter('ё');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 100$/);

            input('patterns.complex').enter('демо');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 100$/);

            input('patterns.complex').enter('5 1');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 204$/);

            input('patterns.complex').enter('5 демо');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 72$/);

            input('patterns.complex').enter('5 abb');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 31$/);

            input('patterns.complex').enter('демо abb');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 0$/);

            input('patterns.complex').enter('5,');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 435$/);

            input('patterns.complex').enter('5, 1');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 847$/);

            input('patterns.complex').enter('1 2, 5');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 635$/);

            input('patterns.complex').enter('1,2,3,4,5,6,7,8');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 999$/);

            input('patterns.complex').enter('5, демо');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 463$/);

            input('patterns.complex').enter('5, abb');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 504$/);

            input('patterns.complex').enter('');
            expect(element('#UserListNumberUsers').text()).toMatch(/ 1000$/);
        });

        xit('фильтруется по статусам', function() {
            select('patterns.status').option(['0']);
            expect(element('#UserListNumberUsers').text()).toMatch(/ 200$/);

            select('patterns.status').option(['2']);
            expect(element('#UserListNumberUsers').text()).toMatch(/ 300$/);

            select('patterns.status').options(['0'], ['1']);
            // expect(element('#UserListNumberUsers').text()).toMatch(/ 1200$/);
        });

        xit('фильтруется по менеджерам', function() {
            select('patterns.manager').option(['0']);
            expect(element('#UserListNumberUsers').text()).toMatch(/ 200$/);

            select('patterns.manager').option(['1']);
            expect(element('#UserListNumberUsers').text()).toMatch(/ 300$/);
        });

        xit('фильтруется по всем фильтрам вместе и инициализирует фильтры', function() {
            input('patterns.complex').enter('1 2, 5 демо');
            select('patterns.status').option(['0']);
            select('patterns.manager').option(['0']);
            expect(element('#UserListNumberUsers').text()).toMatch(/ 22$/);

            element('#UserListFilterSetDefault').click();
            expect(element('#UserListNumberUsers').text()).toMatch(/ 1000$/);
        });

    });
});