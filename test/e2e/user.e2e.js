'use strict';

describe('MaxPoster frontend app', function() {
    describe('Список пользователей', function() {
        beforeEach(function() {
            // var ptor = protractor.getInstance();
            // ptor.ignoreSynchronization = true;
            browser.get('users.html');
            expect(browser.getTitle()).toBe('MaxPoster - Управление пользователями');
        });

        it('показывает количество пользователей', function() {
            expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 1000$/);
        });

        it('переходит по верхней кнопке добавления пользователя', function() {
            element.all(by.id('UserListAddUser')).get(0).click();
            expect(browser.getCurrentUrl()).toMatch('\/usernew');
        });

        it('переходит по нижней кнопке добавления пользователя', function() {
            element.all(by.id('UserListAddUser')).get(1).click();
            expect(browser.getCurrentUrl()).toMatch('\/usernew');
        });

        it('показывает сортируемые колонки заголовка таблицы пользователей - количество', function() {
            var sortableColumns = element.all(by.id('UserListTableHeader'));
            expect(sortableColumns.count()).toBe(3);
        });

        it('показывает сортируемые колонки заголовка таблицы пользователей - ссылки', function() {
            var sortableColumnsRef = element.all(by.id('UserListTableHeaderRef'));
            expect(sortableColumnsRef.get(0).getText()).toBeTruthy();
        });

        it('показывает сортируемые колонки заголовка таблицы пользователей - знак сортировки', function() {
            var sortableColumnsRef = element.all(by.id('UserListTableHeaderRef'));
            var sortableColumnsDir = element.all(by.id('UserListTableHeaderDir'));
            expect(sortableColumnsDir.get(0).getText()).toBe('↓');
            expect(sortableColumnsDir.get(1).getText()).toBe('   ');
            expect(sortableColumnsDir.get(2).getText()).toBe('   ');

            expect(sortableColumnsRef.get(0).click());
            expect(sortableColumnsDir.get(0).getText()).toBe('↑');
            expect(sortableColumnsDir.get(1).getText()).toBe('   ');
            expect(sortableColumnsDir.get(2).getText()).toBe('   ');

            expect(sortableColumnsRef.get(1).click());
            expect(sortableColumnsDir.get(0).getText()).toBe('   ');
            expect(sortableColumnsDir.get(1).getText()).toBe('↓');
            expect(sortableColumnsDir.get(2).getText()).toBe('   ');

            expect(sortableColumnsRef.get(1).click());
            expect(sortableColumnsDir.get(0).getText()).toBe('   ');
            expect(sortableColumnsDir.get(1).getText()).toBe('↑');
            expect(sortableColumnsDir.get(2).getText()).toBe('   ');

            expect(sortableColumnsRef.get(2).click());
            expect(sortableColumnsDir.get(0).getText()).toBe('   ');
            expect(sortableColumnsDir.get(1).getText()).toBe('   ');
            expect(sortableColumnsDir.get(2).getText()).toBe('↓');

            expect(sortableColumnsRef.get(2).click());
            expect(sortableColumnsDir.get(0).getText()).toBe('   ');
            expect(sortableColumnsDir.get(1).getText()).toBe('   ');
            expect(sortableColumnsDir.get(2).getText()).toBe('↑');
        });

        it('показывает реквизиты пользователя', function() {
            expect(element(by.repeater('user in pagedUsers').row(0).column('user.id')).getText()).toBe('1');
            expect(element(by.repeater('user in pagedUsers').row(0).column('user.email')).getText()).toBe('0a-bobkov@ab.com');
            expect(element(by.repeater('user in pagedUsers').row(0).column('user.last_login')).getText()).toBe('01.01.12');
        });

        it('переходит к редактированию пользователя по ссылке в id', function() {
            element(by.repeater('user in pagedUsers').row(0).column('user.id')).click();
            expect(browser.getCurrentUrl()).toMatch('\/users\/1\/edit');
        });

        it('переходит к редактированию пользователя по ссылке в email', function() {
            element(by.repeater('user in pagedUsers').row(0).column('user.email')).click();
            expect(browser.getCurrentUrl()).toMatch('\/users\/1\/edit');
        });

        it('показывает 25 пользователей', function() {
            expect(element.all(by.repeater('user in pagedUsers')).count()).toBe(25);
        });

        it('показывает постраничку', function() {
            expect(element.all(by.id('paginationFirst')).count()).toBe(1);
            expect(element.all(by.id('paginationPrev')).count()).toBe(1);
            expect(element.all(by.id('paginationNext')).count()).toBe(1);
            expect(element.all(by.id('paginationLast')).count()).toBe(1);
            expect(element.all(by.id('paginationPages')).count()).toBe(9);
        });

        it('переходит по страничкам', function() {
            element.all(by.id('paginationPages')).get(2).click();
            expect(element(by.repeater('user in pagedUsers').row(0).column('user.id')).getText()).toBe('76');

            element(by.id('paginationPrev')).click();
            expect(element(by.repeater('user in pagedUsers').row(0).column('user.id')).getText()).toBe('39');

            element(by.id('paginationNext')).click();
            expect(element(by.repeater('user in pagedUsers').row(0).column('user.id')).getText()).toBe('76');

            element(by.id('paginationFirst')).click();
            expect(element(by.repeater('user in pagedUsers').row(0).column('user.id')).getText()).toBe('1');

            element(by.id('paginationLast')).click();
            expect(element(by.repeater('user in pagedUsers').row(0).column('user.id')).getText()).toBe('1464');
        });

        it('накладывает фильтры и инициализирует фильтры', function() {
            var selectDropdown = function (dropdown, optIndex) {
                return element(dropdown).findElements(by.tagName('option')).then(function(options) {
                    options[optIndex].click();
                });
            };

            element(by.model('patterns.complex')).sendKeys('1 2, 5 демо');
            selectDropdown(by.select('patterns.status'), 0);
            selectDropdown(by.select('patterns.manager'), 1);
            expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 128$/);

            element(by.id('UserListFilterSetDefault')).click();
            expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 1000$/);
        });

        it('сортирует по коду, емэйлу, дате', function() {
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
    });
});