'use strict';

describe('DealerSite App', function() {
    // выбирает в селекте значение по порядковому номеру, начиная с 0
    var setSelect = function (elem, optIndex) {
        return elem.findElements(by.tagName('option')).then(function(options) {
            options[optIndex].click();
        });
    };

    var mapText = function(q) {
        return q.map(function(elm) {
            return elm.getText();
        })
    };

    var regexpEmail = /^[\w-]+@[\w\.-]+$/;
    var regexpPhoneNumber = /^\+7[ ]?(?:(?:\(\d{3}\)[ ]?\d{3})|(?:\(\d{4}\)[ ]?\d{2})|(?:\(\d{5}\)[ ]?\d{1}))-?\d{2}-?\d{2}$/
    var regexpUrl = /^http:\/\/[\w\.-\/]+$/;

    if (browser.baseUrl.match(/maxposter.ru/)) {
        var test_maxposter_ru = true;
        browser.driver.get('http://test.maxposter.ru/');
        var emailInput = browser.driver.findElement(by.id('signin_email'));
        emailInput.sendKeys('protractor@maxposter.ru');
        var passwordInput = browser.driver.findElement(by.id('signin_password'));
        passwordInput.sendKeys('protractor\n');
    }

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
                        return String(arg).toLowerCase();
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
        this.addMatchers({
            toMatchOrEmpty: function(regexp) {
                return !this.actual || this.actual.match(regexp);
            }
        });
    });

    describe('Список регистраций', function() {
        beforeEach(function() {
            browser.get('admin.html#/dealersitelist');
        });

        it('показывает количество регистраций', function() {
            expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/\d+$/);
        });

        it('переходит по верхней кнопке добавления регистрации', function() {
            element.all(by.id('DealerSiteListAddDealerSiteUp')).get(0).click();
            expect(browser.getCurrentUrl()).toMatch('#\/dealersitenew');
        });

        it('переходит по нижней кнопке добавления регистрации', function() {
            element.all(by.id('DealerSiteListAddDealerSiteDown')).get(0).click();
            expect(browser.getCurrentUrl()).toMatch('#\/dealersitenew');
        });

        it('показывает сортируемые колонки заголовка таблицы регистраций - количество', function() {
            var sortableColumns = element.all(by.id('DealerSiteListTableHeader'));
            expect(sortableColumns.count()).toBe(5);
        });

        it('показывает сортируемые колонки заголовка таблицы регистраций - ссылки', function() {
            var sortableColumnsRef = element.all(by.id('DealerSiteListTableHeaderRef'));
            expect(sortableColumnsRef.get(0).getText()).toBeTruthy();
        });

        it('показывает сортируемые колонки заголовка таблицы регистраций - знак сортировки', function() {
            var sortableColumnsRef = element.all(by.id('DealerSiteListTableHeaderRef'));
            var sortableColumnsDir = element.all(by.id('DealerSiteListTableHeaderDir'));
            expect(sortableColumnsDir.get(0).getText()).toBe('   ');
            expect(sortableColumnsDir.get(1).getText()).toBe('   ');
            expect(sortableColumnsDir.get(2).getText()).toBe('   ');

            expect(sortableColumnsRef.get(0).click());
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

        it('показывает реквизиты регистраций', function() {
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('dealerSite.dealer')).getText()).toMatch(/^\d+: /);
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('dealerSite.site')).getText()).toMatch(/^\d+: /);
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('externalId')).getText()).toMatchOrEmpty(/^\w+$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('publicUrl')).getText()).toMatchOrEmpty(/^Ссылка$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('publicUrl')).getAttribute('href')).toMatchOrEmpty(regexpUrl);
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('isActive')).getText()).toMatch(/^Акт$|^Бло$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(0)).getText()).toMatch(/(Акт(?=\s+изменить))|(Бло(?!\s+изменить))/);

            expect(element(by.repeater('dealerSite in dealerSites').row(1).column('dealerSite.dealer')).getText()).toMatch(/^\d+: /);
            expect(element(by.repeater('dealerSite in dealerSites').row(1).column('dealerSite.site')).getText()).toMatch(/^\d+: /);
            expect(element(by.repeater('dealerSite in dealerSites').row(1).column('externalId')).getText()).toMatchOrEmpty(/^\w+$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(1).column('publicUrl')).getText()).toMatchOrEmpty(/^Ссылка$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(1).column('publicUrl')).getAttribute('href')).toMatchOrEmpty(regexpUrl);
            expect(element(by.repeater('dealerSite in dealerSites').row(1).column('isActive')).getText()).toMatch(/^Акт$|^Бло$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(1)).getText()).toMatch(/(Акт(?=\s+изменить))|(Бло(?!\s+изменить))/);

            expect(element(by.repeater('dealerSite in dealerSites').row(2).column('dealerSite.dealer')).getText()).toMatch(/^\d+: /);
            expect(element(by.repeater('dealerSite in dealerSites').row(2).column('dealerSite.site')).getText()).toMatch(/^\d+: /);
            expect(element(by.repeater('dealerSite in dealerSites').row(2).column('externalId')).getText()).toMatchOrEmpty(/^\w+$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(2).column('publicUrl')).getText()).toMatchOrEmpty(/^Ссылка$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(2).column('publicUrl')).getAttribute('href')).toMatchOrEmpty(regexpUrl);
            expect(element(by.repeater('dealerSite in dealerSites').row(2).column('isActive')).getText()).toMatch(/^Акт$|^Бло$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(2)).getText()).toMatch(/(Акт(?=\s+изменить))|(Бло(?!\s+изменить))/);
        });

        it('переходит к редактированию регистрации по ссылке в "изменить"', function() {
            element.all(by.id('DealerSiteListRowEdit')).get(0).click();
            expect(browser.getCurrentUrl()).toMatch(/#\/dealersites\/\d+\/edit/);
        });

        it('показывает 25 регистраций', function() {
            expect(element.all(by.repeater('dealerSite in dealerSites')).count()).toBe(25);
        });

        it('показывает постраничку', function() {
            expect(element.all(by.id('paginationFirst')).count()).toBe(1);
            expect(element.all(by.id('paginationPrev')).count()).toBe(1);
            expect(element.all(by.id('paginationNext')).count()).toBe(1);
            expect(element.all(by.id('paginationLast')).count()).toBe(1);
            expect(element.all(by.id('paginationPages')).count()).toBe(9);
        });

        it('переходит по страничкам', function() {
            if (test_maxposter_ru) {
                element.all(by.id('paginationPages')).get(2).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('14: Авито');

                element(by.id('paginationPrev')).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('5: Ауто');

                element(by.id('paginationNext')).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('14: Авито');

                element(by.id('paginationFirst')).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('6: ИРР');

                element(by.id('paginationLast')).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('13: Кьюто');
            } else {
                element.all(by.id('paginationPages')).get(2).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('14: Авито');

                element(by.id('paginationPrev')).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('5: Ауто');

                element(by.id('paginationNext')).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('14: Авито');

                element(by.id('paginationFirst')).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('6: ИРР');

                element(by.id('paginationLast')).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('13: Кьюто');
            }
        });

        it('накладывает фильтры и инициализирует фильтры', function() {
            if (test_maxposter_ru) {
                element.all(by.id('McomboSearchInput')).get(0).sendKeys('1');
                element.all(by.id('McomboSearchInput')).get(0).click();
                element.all(by.id('McomboDropChoiceItem')).get(0).click();
                element.all(by.id('McomboSearchInput')).get(1).sendKeys('1');
                element.all(by.id('McomboSearchInput')).get(1).click();
                element.all(by.id('McomboDropChoiceItem')).get(1).click();
                setSelect(element(by.select('patterns.isActive')), 1);
                expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 100$/);

                element(by.id('DealerSiteListFilterSetDefault')).click();
                expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 900$/);
            } else {
                element.all(by.id('McomboSearchInput')).get(0).sendKeys('1');
                element.all(by.id('McomboSearchInput')).get(0).click();
                element.all(by.id('McomboDropChoiceItem')).get(0).click();
                element.all(by.id('McomboSearchInput')).get(1).sendKeys('1');
                element.all(by.id('McomboSearchInput')).get(1).click();
                element.all(by.id('McomboDropChoiceItem')).get(1).click();
                setSelect(element(by.select('patterns.isActive')), 1);
                expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 100$/);

                element(by.id('DealerSiteListFilterSetDefault')).click();
                expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 900$/);
            }
        });

        it('сортирует по возрастанию дилера', function() {
            element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                arr[0].click();
                mapText(element.all(by.repeater('dealerSite in dealerSites').column('dealerSite.dealer'))).then(function(data) {
                    expect(data).toBeSortedArrayOf('AscendingStrings');
                });
            });
        });

        it('сортирует по убыванию дилера', function() {
            element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                arr[0].click();
                element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                    arr[0].click();
                    mapText(element.all(by.repeater('dealerSite in dealerSites').column('dealerSite.dealer'))).then(function(data) {
                        expect(data).toBeSortedArrayOf('DescendingStrings');
                    });
                });
            });
        });

        it('сортирует по возрастанию сайта', function() {
            element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                arr[1].click();
                mapText(element.all(by.repeater('dealerSite in dealerSites').column('dealerSite.site'))).then(function(data) {
                    expect(data).toBeSortedArrayOf('AscendingStrings');
                });
            });
        });

        it('сортирует по убыванию сайта', function() {
            element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                arr[1].click();
                element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                    arr[1].click();
                    mapText(element.all(by.repeater('dealerSite in dealerSites').column('dealerSite.site'))).then(function(data) {
                        expect(data).toBeSortedArrayOf('DescendingStrings');
                    });
                });
            });
        });

        it('сортирует по возрастанию кода на сайте', function() {
            element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                arr[2].click();
                mapText(element.all(by.repeater('dealerSite in dealerSites').column('externalId'))).then(function(data) {
                    expect(data).toBeSortedArrayOf('AscendingStrings');
                });
            });
        });

        it('сортирует по убыванию кода на сайте', function() {
            element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                arr[2].click();
                element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                    arr[2].click();
                    mapText(element.all(by.repeater('dealerSite in dealerSites').column('externalId'))).then(function(data) {
                        expect(data).toBeSortedArrayOf('DescendingStrings');
                    });
                });
            });
        });

        it('сортирует по возрастанию страницы на сайте', function() {
            element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                arr[3].click();
                mapText(element.all(by.repeater('dealerSite in dealerSites').column('publicUrl'))).then(function(data) {
                    expect(data).toBeSortedArrayOf('AscendingStrings');
                });
            });
        });

        it('сортирует по убыванию страницы на сайте', function() {
            element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                arr[3].click();
                element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                    arr[3].click();
                    mapText(element.all(by.repeater('dealerSite in dealerSites').column('publicUrl'))).then(function(data) {
                        expect(data).toBeSortedArrayOf('DescendingStrings');
                    });
                });
            });
        });

        it('сортирует по возрастанию статуса', function() {
            element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                arr[4].click();
                mapText(element.all(by.repeater('dealerSite in dealerSites').column('isActive'))).then(function(data) {
                    expect(data).toBeSortedArrayOf('AscendingStrings');
                });
            });
        });

        it('сортирует по убыванию статуса', function() {
            element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                arr[4].click();
                element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                    arr[4].click();
                    mapText(element.all(by.repeater('dealerSite in dealerSites').column('isActive'))).then(function(data) {
                        expect(data).toBeSortedArrayOf('DescendingStrings');
                    });
                });
            });
        });
    });
});