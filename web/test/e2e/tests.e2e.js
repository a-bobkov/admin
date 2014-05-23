'use strict';

var _ = require('lodash');

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

if (browser.baseUrl.match(/maxposter.ru/)) {
    var test_maxposter_ru = true;
    browser.driver.get('http://test.maxposter.ru/');
    var emailInput = browser.driver.findElement(by.id('signin_email'));
    emailInput.sendKeys('protractor@maxposter.ru');
    var passwordInput = browser.driver.findElement(by.id('signin_password'));
    passwordInput.sendKeys('protractor\n');
}

var regexpEmail = /^[\w-]+@[\w\.-]+$/;
var regexpPhoneNumber = /^\+7[ ]?(?:(?:\(\d{3}\)[ ]?\d{3})|(?:\(\d{4}\)[ ]?\d{2})|(?:\(\d{5}\)[ ]?\d{1}))-?\d{2}-?\d{2}$/
var regexpUrl = /^http:\/\/[\w\.-\/]+$/;

describe('MaxPoster Admin Frontend', function() {

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

xdescribe('User App', function() {

    describe('Список пользователей', function() {
        beforeEach(function() {
            browser.get('admin.html#/userlist');
        });

        it('показывает количество пользователей', function() {
            expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/\d+$/);
        });

        it('переходит по верхней кнопке добавления пользователя', function() {
            element.all(by.id('UserListAddUserUp')).get(0).click();
            expect(browser.getCurrentUrl()).toMatch('#\/usernew');
        });

        it('переходит по нижней кнопке добавления пользователя', function() {
            element.all(by.id('UserListAddUserDown')).get(0).click();
            expect(browser.getCurrentUrl()).toMatch('#\/usernew');
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
            expect(element(by.repeater('user in users').row(0).column('user.id')).getText()).toMatch(/^\d+$/);
            expect(element(by.repeater('user in users').row(0).column('user.email')).getText()).toMatch(/^[\w-]+@[\w\.-]+$/);
            expect(element(by.repeater('user in users').row(0).column('user.lastLogin')).getText()).toMatch(/^\d\d.\d\d.\d\d$/);
        });

        it('переходит к редактированию пользователя по ссылке в id', function() {
            element(by.repeater('user in users').row(0).column('user.id')).click();
            expect(browser.getCurrentUrl()).toMatch('#\/users\/1\/edit');
        });

        it('переходит к редактированию пользователя по ссылке в email', function() {
            element(by.repeater('user in users').row(0).column('user.email')).click();
            expect(browser.getCurrentUrl()).toMatch('#\/users\/1\/edit');
        });

        it('показывает 25 пользователей', function() {
            expect(element.all(by.repeater('user in users')).count()).toBe(25);
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
                expect(element(by.repeater('user in users').row(0).column('user.id')).getText()).toBe('170');

                element(by.id('paginationPrev')).click();
                expect(element(by.repeater('user in users').row(0).column('user.id')).getText()).toBe('72');

                element(by.id('paginationNext')).click();
                expect(element(by.repeater('user in users').row(0).column('user.id')).getText()).toBe('170');

                element(by.id('paginationFirst')).click();
                expect(element(by.repeater('user in users').row(0).column('user.id')).getText()).toBe('1');

                element(by.id('paginationLast')).click();
                expect(element(by.repeater('user in users').row(0).column('user.id')).getText()).toBe('746');
            } else {
                element.all(by.id('paginationPages')).get(2).click();
                expect(element(by.repeater('user in users').row(0).column('user.id')).getText()).toBe('76');

                element(by.id('paginationPrev')).click();
                expect(element(by.repeater('user in users').row(0).column('user.id')).getText()).toBe('39');

                element(by.id('paginationNext')).click();
                expect(element(by.repeater('user in users').row(0).column('user.id')).getText()).toBe('76');

                element(by.id('paginationFirst')).click();
                expect(element(by.repeater('user in users').row(0).column('user.id')).getText()).toBe('1');

                element(by.id('paginationLast')).click();
                expect(element(by.repeater('user in users').row(0).column('user.id')).getText()).toBe('1464');
            }
        });

        it('накладывает фильтры и инициализирует фильтры', function() {
            if (test_maxposter_ru) {
                element(by.model('patterns.complex')).sendKeys('1 2');
                element(by.id('checkbox_group_0')).click();
                setSelect(element(by.select('patterns.manager')), 1);
                expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 47$/);

                element(by.id('UserListFilterSetDefault')).click();
                expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 310$/);
            } else {
                element(by.model('patterns.complex')).sendKeys('1 2');
                element(by.id('checkbox_group_0')).click();
                setSelect(element(by.select('patterns.manager')), 1);
                expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 72$/);

                element(by.id('UserListFilterSetDefault')).click();
                expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 1000$/);
            }
        });

        it('сортирует по возрастанию кода', function() {
            element.all(by.id('UserListTableHeaderRef')).then(function(arr) {
                mapText(element.all(by.repeater('user in users').column('user.id'))).then(function(data) {
                    expect(data).toBeSortedArrayOf('AscendingNumbers');
                });
            });
        });

        it('сортирует по убыванию кода', function() {
            element.all(by.id('UserListTableHeaderRef')).then(function(arr) {
                arr[0].click();
                mapText(element.all(by.repeater('user in users').column('user.id'))).then(function(data) {
                    expect(data).toBeSortedArrayOf('DescendingNumbers');
                });
            });
        });

        it('сортирует по возрастанию емэйла', function() {
            element.all(by.id('UserListTableHeaderRef')).then(function(arr) {
                arr[1].click();
                mapText(element.all(by.repeater('user in users').column('user.email'))).then(function(data) {
                    expect(data).toBeSortedArrayOf('AscendingStrings');
                });
            });
        });

        it('сортирует по убыванию емэйла', function() {
            element.all(by.id('UserListTableHeaderRef')).then(function(arr) {
                arr[1].click();
                element.all(by.id('UserListTableHeaderRef')).then(function(arr) {
                    arr[1].click();
                    mapText(element.all(by.repeater('user in users').column('user.email'))).then(function(data) {
                        expect(data).toBeSortedArrayOf('DescendingStrings');
                    });
                });
            });
        });

        it('сортирует по возрастанию даты', function() {
            element.all(by.id('UserListTableHeaderRef')).then(function(arr) {
                arr[2].click();
                mapText(element.all(by.repeater('user in users').column('user.lastLogin'))).then(function(data) {
                    expect(data).toBeSortedArrayOf('AscendingDates');
                });
            });
        });

        it('сортирует по убыванию даты', function() {
            element.all(by.id('UserListTableHeaderRef')).then(function(arr) {
                arr[2].click();
                element.all(by.id('UserListTableHeaderRef')).then(function(arr) {
                    arr[2].click();
                    mapText(element.all(by.repeater('user in users').column('user.lastLogin'))).then(function(data) {
                        expect(data).toBeSortedArrayOf('DescendingDates');
                    });
                });
            });
        });
    });

    describe('Редактирование пользователя', function() {
        beforeEach(function() {
            browser.get('admin.html#/users/5/edit');
            expect(browser.getTitle()).toBe('MaxPoster - Управление пользователями');
        });

        it('показывает режим работы формы', function() {
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Редактирование /);
        });

        it('выводит email', function() {
            expect(element(by.model('userEdited.email')).getAttribute('value')).toMatch(regexpEmail);
        });

        it('выводит ошибку, если email пустой', function() {
            element(by.model('userEdited.email')).clear();
            expect(element(by.id('UserEditEmailErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если email не соответствует формату', function() {
            element(by.model('userEdited.email')).sendKeys('@@@');
            expect(element(by.id('UserEditEmailErrorEmail')).isDisplayed()).toBeTruthy();
        });

        it('выводит пустой пароль', function() {
            expect(element(by.model('userEdited.password')).getAttribute('value')).toBe('');
        });

        it('не выводит ошибку, если пароль пустой', function() {
            element(by.model('userEdited.password')).clear();
            expect(element(by.id('UserEditPasswordErrorRequired')).isDisplayed()).toBeFalsy();
        });

        it('выводит пустой повторный пароль', function() {
            expect(element(by.model('userPasswordConfirm')).getAttribute('value')).toBe('');
        });

        it('выводит ошибку, если повторный пароль не совпадает с паролем', function() {
            element(by.model('userPasswordConfirm')).sendKeys('1');
            expect(element(by.id('UserEditPasswordErrorEqual')).isDisplayed()).toBeTruthy();
        });

        it('заполняет список статусов', function() {
            element(by.select('userEdited.status')).findElements(by.tagName('option')).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение статуса', function() {
            expect(element(by.selectedOption('userEdited.status')).getText()).toBeTruthy();
        });

        it('заполняет список групп', function() {
            element(by.select('userEdited.group')).findElements(by.tagName('option')).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение группы', function() {
            expect(element(by.selectedOption('userEdited.group')).getText()).toBeTruthy();
        });

        it('заполняет список менеджеров', function() {
            element(by.select('dealerEdited.manager')).findElements(by.tagName('option')).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение менеджера', function() {
            expect(element(by.selectedOption('dealerEdited.manager')).getText()).toBeTruthy();
        });

        it('выводит название компании', function() {
            expect(element(by.model('dealerEdited.companyName')).getAttribute('value')).toBeTruthy();
        });

        it('заполняет список городов', function() {
            element(by.select('dealerEdited.city')).findElements(by.tagName('option')).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение города', function() {
            expect(element(by.selectedOption('dealerEdited.city')).getText()).toBeTruthy();
        });

        it('выводит ошибку, если город не выбран', function() {
            setSelect(element(by.select('dealerEdited.city')), 0);
            expect(element(by.id('UserEditCityErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('заполняет список рынков', function() {
            element(by.select('dealerEdited.market')).findElements(by.tagName('option')).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение рынка', function() {
            expect(element(by.selectedOption('dealerEdited.market')).getText()).toBeTruthy();
        });

        it('при очистке значения города, значение рынка очищается и делается недоступным', function() {
            expect(element(by.selectedOption('dealerEdited.market')).isEnabled()).toBeTruthy();
            setSelect(element(by.select('dealerEdited.city')), 0);
            expect(element(by.selectedOption('dealerEdited.market')).getText()).toBeFalsy();
            expect(element(by.selectedOption('dealerEdited.market')).isEnabled()).toBeFalsy();
        });

        it('заполняет список метро', function() {
            element(by.select('dealerEdited.metro')).findElements(by.tagName('option')).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение метро', function() {
            expect(element(by.selectedOption('dealerEdited.metro')).getText()).toBeTruthy();
        });

        it('при очистке значения города, значение метро очищается и делается недоступным', function() {
            expect(element(by.selectedOption('dealerEdited.metro')).isEnabled()).toBeTruthy();
            setSelect(element(by.select('dealerEdited.city')), 0);
            expect(element(by.selectedOption('dealerEdited.metro')).getText()).toBeFalsy();
            expect(element(by.selectedOption('dealerEdited.metro')).isEnabled()).toBeFalsy();
        });

        it('выводит значение адреса', function() {
            expect(element(by.model('dealerEdited.address')).getAttribute('value')).toBeTruthy();
        });

        it('выводит значение факса', function() {
            expect(element(by.model('dealerEdited.fax')).getAttribute('value')).toMatch(regexpPhoneNumber);
        });

        it('выводит значение мэйла', function() {
            expect(element(by.model('dealerEdited.email')).getAttribute('value')).toMatch(regexpEmail);
        });

        it('выводит значение сайта', function() {
            expect(element(by.model('dealerEdited.url')).getAttribute('value')).toMatch(regexpUrl);
        });

        it('выводит значение контакта', function() {
            expect(element(by.model('dealerEdited.contactName')).getAttribute('value')).toBeTruthy();
        });

        it('выводит список телефонов', function() {
            expect(element.all(by.repeater('phone in dealerEditedPhones')).count()).toBe(3);
        });

        it('показывает значение телефона', function() {
            expect(element.all(by.model('phone.phoneNumber')).get(0).getAttribute('value')).toMatch(regexpPhoneNumber);
        });

        it('заполняет список часов С', function() {
            element.all(by.model('phone.phoneFrom')).get(0).findElements(by.tagName('option')).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение часа С', function() {
            expect(element.all(by.model('phone.phoneFrom')).get(0).getText()).toBeTruthy();
        });

        it('заполняет список часов ДО', function() {
            element.all(by.model('phone.phoneTo')).get(0).findElements(by.tagName('option')).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение часа ДО', function() {
            expect(element.all(by.model('phone.phoneTo')).get(0).getText()).toBeTruthy();
        });

        it('выводит ошибку, если номер телефона или час С или час ДО не заполнен, но не все сразу', function() {
            expect(element.all(by.id('UserEditPhoneErrorConsistent')).get(0).isDisplayed()).toBeFalsy();

            element.all(by.model('phone.phoneNumber')).get(0).clear();
            expect(element.all(by.id('UserEditPhoneErrorConsistent')).get(0).isDisplayed()).toBeTruthy();

            setSelect(element.all(by.model('phone.phoneFrom')).get(0), 0);
            expect(element.all(by.id('UserEditPhoneErrorConsistent')).get(0).isDisplayed()).toBeTruthy();

            setSelect(element.all(by.model('phone.phoneTo')).get(0), 0);
            expect(element.all(by.id('UserEditPhoneErrorConsistent')).get(0).isDisplayed()).toBeFalsy();

            setSelect(element.all(by.model('phone.phoneFrom')).get(0), 3);
            expect(element.all(by.id('UserEditPhoneErrorConsistent')).get(0).isDisplayed()).toBeTruthy();

            element.all(by.model('phone.phoneNumber')).get(0).sendKeys('+7(495)555-55-55');
            expect(element.all(by.id('UserEditPhoneErrorConsistent')).get(0).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если номер телефона не соответствует формату', function() {
            element.all(by.model('phone.phoneNumber')).get(0).clear();
            element.all(by.model('phone.phoneNumber')).get(0).sendKeys('8495-555-55-55');
            expect(element.all(by.id('UserEditPhoneErrorNumber')).get(0).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если время C не меньше, чем время ПО', function() {
            setSelect(element.all(by.model('phone.phoneTo')).get(0), 2);
            expect(element.all(by.id('UserEditPhoneErrorPeriod')).get(0).isDisplayed()).toBeTruthy();
        });

        it('выводит свои ошибки для каждого телефона', function() {
            setSelect(element.all(by.model('phone.phoneTo')).get(0), 2);
            expect(element.all(by.id('UserEditPhoneErrorPeriod')).get(1).isDisplayed()).toBeFalsy();
        });

        it('выводит информацию о компании', function() {
            expect(element(by.model('dealerEdited.companyInfo')).getAttribute('value')).toBeTruthy();
        });

        it('заполняет список сайтов', function() {
            element(by.select('userEdited.site')).findElements(by.tagName('option')).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение сайта', function() {
            setSelect(element(by.select('userEdited.group')), 3);
            setSelect(element(by.select('userEdited.site')), 1);
            expect(element(by.selectedOption('userEdited.site')).getText()).toBeTruthy();
        });

        it('если группа - автосалон, то выводит данные дилера, а данные сайта - нет', function() {
            setSelect(element(by.select('userEdited.group')), 2);
            expect(element(by.id('user_dealer_manager_id')).isDisplayed()).toBeTruthy();
            expect(element(by.id('user_dealer_company_name')).isDisplayed()).toBeTruthy();
            expect(element(by.id('user_sites_list')).isDisplayed()).toBeFalsy();
        });

        it('если группа - сайт, то выводит данные сайта, а данные дилера - нет', function() {
            setSelect(element(by.select('userEdited.group')), 3);
            expect(element(by.id('user_sites_list')).isDisplayed()).toBeTruthy();
            expect(element(by.id('user_dealer_manager_id')).isDisplayed()).toBeFalsy();
            expect(element(by.id('user_dealer_company_name')).isDisplayed()).toBeFalsy();
        });

        it('если группа - админ или не выбрана, то не выводит данные сайта и данные дилера', function() {
            setSelect(element(by.select('userEdited.group')), 0);
            expect(element(by.id('user_sites_list')).isDisplayed()).toBeFalsy();
            expect(element(by.id('user_dealer_manager_id')).isDisplayed()).toBeFalsy();
            expect(element(by.id('user_dealer_company_name')).isDisplayed()).toBeFalsy();

            setSelect(element(by.select('userEdited.group')), 1);
            expect(element(by.id('user_sites_list')).isDisplayed()).toBeFalsy();
            expect(element(by.id('user_dealer_manager_id')).isDisplayed()).toBeFalsy();
            expect(element(by.id('user_dealer_company_name')).isDisplayed()).toBeFalsy();
        });

        it('после сохранения пользователя переходит к списку пользователей', function() {
            element(by.id('UserEditSaveUser')).click();
            expect(browser.getCurrentUrl()).toMatch('#\/userlist');
        });
    });

    describe('Создание пользователя', function() {
        beforeEach(function() {
            browser.get('admin.html#/usernew');
            expect(browser.getTitle()).toBe('MaxPoster - Управление пользователями');
        });

        it('показывает режим работы формы', function() {
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Создание /);
        });

        it('выводит ошибку, если пароль пустой', function() {
            element(by.model('userEdited.password')).clear();
            expect(element(by.id('UserEditPasswordErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит начальные значения полей', function() {
            expect(element(by.model('userEdited.email')).getAttribute('value')).toBeFalsy();
            expect(element(by.model('userEdited.password')).getAttribute('value')).toBeFalsy();
            expect(element(by.model('userPasswordConfirm')).getAttribute('value')).toBeFalsy();
            expect(element(by.selectedOption('userEdited.status')).getText()).toBe('Неактивный');
            expect(element(by.selectedOption('userEdited.group')).getText()).toBeFalsy();
            expect(element(by.selectedOption('dealerEdited.manager')).getText()).toBeFalsy();
            expect(element(by.model('dealerEdited.companyName')).getAttribute('value')).toBeFalsy();
            expect(element(by.selectedOption('dealerEdited.city')).getText()).toBeFalsy();
            expect(element(by.selectedOption('dealerEdited.market')).getText()).toBeFalsy();
            expect(element(by.selectedOption('dealerEdited.metro')).getText()).toBeFalsy();
            expect(element(by.model('dealerEdited.address')).getAttribute('value')).toBeFalsy();
            expect(element(by.model('dealerEdited.fax')).getAttribute('value')).toBeFalsy();
            expect(element(by.model('dealerEdited.email')).getAttribute('value')).toBeFalsy();
            expect(element(by.model('dealerEdited.url')).getAttribute('value')).toBeFalsy();
            expect(element(by.model('dealerEdited.contactName')).getAttribute('value')).toBeFalsy();
            expect(element.all(by.model('phone.phoneNumber')).get(0).getAttribute('value')).toBeFalsy();
            expect(element.all(by.model('phone.phoneFrom')).get(0).getText()).toBeFalsy();
            expect(element.all(by.model('phone.phoneTo')).get(0).getText()).toBeFalsy();
            expect(element.all(by.model('phone.phoneNumber')).get(1).getAttribute('value')).toBeFalsy();
            expect(element.all(by.model('phone.phoneFrom')).get(1).getText()).toBeFalsy();
            expect(element.all(by.model('phone.phoneTo')).get(1).getText()).toBeFalsy();
            expect(element.all(by.model('phone.phoneNumber')).get(2).getAttribute('value')).toBeFalsy();
            expect(element.all(by.model('phone.phoneFrom')).get(2).getText()).toBeFalsy();
            expect(element.all(by.model('phone.phoneTo')).get(2).getText()).toBeFalsy();
            expect(element(by.model('dealerEdited.companyInfo')).getAttribute('value')).toBeFalsy();
            expect(element(by.selectedOption('userEdited.site')).getText()).toBeFalsy();
        });

        it('разрешает сохранение, если нет видимых ошибок', function() {
            var getErrors = function() {
                return element.all(by.css('.error_list li')).map(function(elem) {
                    return {
                        id:   elem.getAttribute('id'),
                        text: elem.getText(),
                        disp: elem.isDisplayed()
                    };
                });
            }

            var noDisplayed = function(q) {
                return q.then(function(arr) {
                    for (var i=arr.length; --i; ) {
                        if (arr[i].disp) {
                            return false;
                        }
                    }
                    return true;
                });
            };

            expect(element(by.id('UserEditSaveUser')).isEnabled()).toEqual(noDisplayed(getErrors()));

            element(by.model('userEdited.email')).sendKeys('1@1.co');
            element(by.model('userEdited.password')).sendKeys('111');
            element(by.model('userPasswordConfirm')).sendKeys('111');

            expect(element(by.id('UserEditSaveUser')).isEnabled()).toEqual(noDisplayed(getErrors()));

            setSelect(element(by.select('userEdited.group')), 2);
            expect(element(by.id('UserEditSaveUser')).isEnabled()).toEqual(noDisplayed(getErrors()));

            setSelect(element(by.select('dealerEdited.city')), 1);
            expect(element(by.id('UserEditSaveUser')).isEnabled()).toEqual(noDisplayed(getErrors()));
        });

        it('после удаления пользователя переходит к списку пользователей', function() {
            element(by.id('UserEditRemoveUser')).click();
            browser.switchTo().alert().accept();
            expect(browser.getCurrentUrl()).toMatch('#\/userlist');
        });
    });

    it('разрешает сохранение, если нет видимых ошибок', function() {
        browser.get('admin.html#/users/5/edit');
        var getErrors = function() {
            return element.all(by.css('.error_list li')).map(function(elem) {
                return {
                    id:   elem.getAttribute('id'),
                    text: elem.getText(),
                    disp: elem.isDisplayed()
                };
            });
        }

        var noDisplayed = function(q) {
            return q.then(function(arr) {
                for (var i=arr.length; --i; ) {
                    if (arr[i].disp) {
                        return false;
                    }
                }
                return true;
            });
        };

        expect(element(by.id('UserEditSaveUser')).isEnabled()).toEqual(noDisplayed(getErrors()));

        element.all(by.model('phone.phoneNumber')).get(0).clear();
        expect(element(by.id('UserEditSaveUser')).isEnabled()).toEqual(noDisplayed(getErrors()));

        setSelect(element(by.select('userEdited.group')), 1);
        expect(element(by.id('UserEditSaveUser')).isEnabled()).toEqual(noDisplayed(getErrors()));
    });
});

describe('DealerSite App', function() {

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
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('dealerSite.dealer')).getText()).toMatch(/^\d+:/);
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('dealerSite.site')).getText()).toMatch(/^\d+:/);
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('externalId')).getText()).toMatchOrEmpty(/^\w+$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('publicUrl')).getText()).toMatchOrEmpty(/^Ссылка$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('publicUrl')).getAttribute('href')).toMatchOrEmpty(regexpUrl);
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('isActive')).getText()).toMatch(/^Акт$|^Бло$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(0)).getText()).toMatch(/(Акт(?=\s+изменить))|(Бло(?!\s+изменить))/);

            expect(element(by.repeater('dealerSite in dealerSites').row(1).column('dealerSite.dealer')).getText()).toMatch(/^\d+:/);
            expect(element(by.repeater('dealerSite in dealerSites').row(1).column('dealerSite.site')).getText()).toMatch(/^\d+:/);
            expect(element(by.repeater('dealerSite in dealerSites').row(1).column('externalId')).getText()).toMatchOrEmpty(/^\w+$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(1).column('publicUrl')).getText()).toMatchOrEmpty(/^Ссылка$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(1).column('publicUrl')).getAttribute('href')).toMatchOrEmpty(regexpUrl);
            expect(element(by.repeater('dealerSite in dealerSites').row(1).column('isActive')).getText()).toMatch(/^Акт$|^Бло$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(1)).getText()).toMatch(/(Акт(?=\s+изменить))|(Бло(?!\s+изменить))/);

            expect(element(by.repeater('dealerSite in dealerSites').row(2).column('dealerSite.dealer')).getText()).toMatch(/^\d+:/);
            expect(element(by.repeater('dealerSite in dealerSites').row(2).column('dealerSite.site')).getText()).toMatch(/^\d+:/);
            expect(element(by.repeater('dealerSite in dealerSites').row(2).column('externalId')).getText()).toMatchOrEmpty(/^\w+$/);
            expect(element(by.repeater('dealerSite in dealerSites').row(2).column('publicUrl')).getText()).toMatchOrEmpty(/^Ссылка$/);
            // expect(element(by.repeater('dealerSite in dealerSites').row(2).column('publicUrl')).getAttribute('href')).toMatchOrEmpty(regexpUrl);
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

        xit('переходит по страничкам', function() {
            if (test_maxposter_ru) {
                element.all(by.id('paginationPages')).get(2).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('4: auto.mail.ru');

                element(by.id('paginationPrev')).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('1: drom.ru');

                element(by.id('paginationNext')).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('4: auto.mail.ru');

                element(by.id('paginationFirst')).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('4: auto.mail.ru');

                element(by.id('paginationLast')).click();
                expect(element(by.repeater('dealerSite in dealerSites').row(0).column('site')).getText()).toBe('10: auto-mos.ru');
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

        xit('накладывает фильтры и инициализирует фильтры', function() {
            if (test_maxposter_ru) {
                element.all(by.id('McomboSearchInput')).get(0).click();
                element.all(by.id('McomboSearchInput')).get(0).sendKeys('1');
                element.all(by.id('McomboDropChoiceItem')).get(0).click();

                element.all(by.id('McomboSearchInput')).get(1).click();
                element.all(by.id('McomboSearchInput')).get(1).sendKeys('1');
                element.all(by.id('McomboDropChoiceItem')).get(1).click();

                setSelect(element(by.select('patterns.isActive')), 1);
                expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 0$/);

                element(by.id('DealerSiteListFilterSetDefault')).click();
                expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 1875$/);
            } else {
                element.all(by.id('McomboSearchInput')).get(0).click();
                element.all(by.id('McomboSearchInput')).get(0).sendKeys('1');
                element.all(by.id('McomboDropChoiceItem')).get(0).click();

                element.all(by.id('McomboSearchInput')).get(1).click();
                element.all(by.id('McomboSearchInput')).get(1).sendKeys('1');
                element.all(by.id('McomboDropChoiceItem')).get(1).click();

                setSelect(element(by.select('patterns.isActive')), 1);
                expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 100$/);

                element(by.id('DealerSiteListFilterSetDefault')).click();
                expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 900$/);
            }
        });

        xit('сортирует по возрастанию дилера', function() {
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
                    expect(data).toBeSortedArrayOf('DescendingStrings');
                });
            });
        });

        it('сортирует по убыванию статуса', function() {
            element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                arr[4].click();
                element.all(by.id('DealerSiteListTableHeaderRef')).then(function(arr) {
                    arr[4].click();
                    mapText(element.all(by.repeater('dealerSite in dealerSites').column('isActive'))).then(function(data) {
                        expect(data).toBeSortedArrayOf('AscendingStrings');
                    });
                });
            });
        });
    });

    describe('Сценарии использования', function() {
        beforeEach(function() {
            browser.get('admin.html#/dealersitelist');
        });

        it('Выдача нового разрешения на экспорт', function() {
            element.all(by.id('McomboSearchInput')).get(0).click();
            element.all(by.id('McomboSearchInput')).get(0).sendKeys('888');
            element.all(by.id('McomboDropChoiceItem')).get(0).click();

            element.all(by.id('McomboSearchInput')).get(1).click();
            element.all(by.id('McomboSearchInput')).get(1).sendKeys('1');
            element.all(by.id('McomboDropChoiceItem')).get(0).click();

            expect(element.all(by.repeater('dealerSite in dealerSites')).count()).toBe(0);

            element(by.id('DealerSiteListAddDealerSiteUp')).click();

            element.all(by.id('McomboSearchInput')).get(0).click();
            element.all(by.id('McomboSearchInput')).get(0).sendKeys('888');
            element.all(by.id('McomboDropChoiceItem')).get(0).click();

            element.all(by.id('McomboSearchInput')).get(1).click();
            element.all(by.id('McomboSearchInput')).get(1).sendKeys('1');
            element.all(by.id('McomboDropChoiceItem')).get(0).click();

            element(by.id('dealerSiteExternalId')).sendKeys('8495555');
            element(by.id('dealerSitePublicUrl')).sendKeys('http://www.protractor.ru');

            element(by.id('dealerSiteEditSave')).click();

            expect(element.all(by.repeater('dealerSite in dealerSites')).count()).toBe(1);
        });

        it('Удаление разрешения на экспорт', function() {
            element.all(by.id('McomboSearchInput')).get(0).click();
            element.all(by.id('McomboSearchInput')).get(0).sendKeys('888');
            element.all(by.id('McomboDropChoiceItem')).get(0).click();
            element.all(by.id('McomboSearchInput')).get(1).click();
            element.all(by.id('McomboSearchInput')).get(1).sendKeys('1');
            element.all(by.id('McomboDropChoiceItem')).get(0).click();

            expect(element.all(by.repeater('dealerSite in dealerSites')).count()).toBe(1);

            element(by.id('DealerSiteListRowDelete')).click();
            browser.switchTo().alert().accept();

            expect(element.all(by.repeater('dealerSite in dealerSites')).count()).toBe(0);
        });

        it('Изменение регистрационных данных', function() {
            element.all(by.id('McomboSearchInput')).get(0).click();
            element.all(by.id('McomboSearchInput')).get(0).sendKeys('14');
            element.all(by.id('McomboDropChoiceItem')).get(0).click();
            element.all(by.id('McomboSearchInput')).get(1).click();
            element.all(by.id('McomboSearchInput')).get(1).sendKeys('1');
            element.all(by.id('McomboDropChoiceItem')).get(0).click();

            expect(element.all(by.repeater('dealerSite in dealerSites')).count()).toBeTruthy();

            var newExternalId = String(Math.floor(Math.random() * 1000000));
            var newPublicUrl = 'http://www.protractor.ru/' + String(Math.floor(Math.random() * 1000000));
            element(by.id('DealerSiteListRowEdit')).click();
            element(by.id('dealerSiteExternalId')).clear();
            element(by.id('dealerSiteExternalId')).sendKeys(newExternalId);
            element(by.id('dealerSitePublicUrl')).clear();
            element(by.id('dealerSitePublicUrl')).sendKeys(newPublicUrl);
            element(by.id('dealerSiteEditSave')).click();

            expect(element(by.id('DealerSiteListNotice')).getText()).toMatch(/^Сохранена регистрация/);
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('externalId')).getText()).toMatch(newExternalId);
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('publicUrl')).getAttribute('href')).toMatchOrEmpty(newPublicUrl);
        });
    });
});

});