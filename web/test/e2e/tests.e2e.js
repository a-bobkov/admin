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

var regexpInt = /^\d+$/;
var regexpFloat = /^\d+(.\d*|)$/;
var regexpDate = /^\d{2}.\d{2}.\d{2}$/;
var regexpDateISO = /^20\d{2}-\d{2}-\d{2}$/;
var regexpEmail = /^[\w-]+@[\w\.-]+$/;
var regexpPhoneNumber = /^\+7[ ]?(?:(?:\(\d{3}\)[ ]?\d{3})|(?:\(\d{4}\)[ ]?\d{2})|(?:\(\d{5}\)[ ]?\d{1}))-?\d{2}-?\d{2}$/;
var regexpUrl = /^http:\/\/[\w\.-\/]+$/;
var regexpIdName = /^(\d+): (.+)$/;
var regexpTariff = /^\d+ руб. за \d+ +(мес\.|дн\.), до \d+ объявлений$/;

describe('MaxPoster Admin Frontend', function() {

beforeEach(function() {
    this.addMatchers({
        toBeSortedArrayOf: function(params) {
            var convert = function(arg) {
                if (params.match('Integers')) {
                    return parseInt(arg, 10);
                } else if (params.match('Floats')) {
                    return parseFloat(arg);
                } else if (params.match('Dates')) {
                    return Date.parse(arg);
                } else if (params.match('Strings')) {
                    return String(arg).toLowerCase();
                } else {    // Boolean
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
                    expect(data).toBeSortedArrayOf('AscendingIntegers');
                });
            });
        });

        it('сортирует по убыванию кода', function() {
            element.all(by.id('UserListTableHeaderRef')).then(function(arr) {
                arr[0].click();
                mapText(element.all(by.repeater('user in users').column('user.id'))).then(function(data) {
                    expect(data).toBeSortedArrayOf('DescendingIntegers');
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

describe('Sale App', function() {

    describe('Список продаж', function() {
        beforeEach(function() {
            browser.get('admin.html#/salelist');
        });

        it('показывает количество продаж', function() {
            expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/\d+$/);
        });

        it('переходит по верхней кнопке создания карточки', function() {
            element.all(by.id('SaleListAddSaleUp')).get(0).click();
            expect(browser.getCurrentUrl()).toMatch(/#\/sale\/card\?id=new$/);
        });

        it('переходит по нижней кнопке создания карточки', function() {
            element.all(by.id('SaleListAddSaleDown')).get(0).click();
            expect(browser.getCurrentUrl()).toMatch(/#\/sale\/card\?id=new$/);
        });

        it('показывает сортируемые колонки заголовка таблицы продаж - количество', function() {
            var sortableColumns = element.all(by.id('SaleListTableHeader'));
            expect(sortableColumns.count()).toBe(10);
        });

        it('показывает сортируемые колонки заголовка таблицы продаж - ссылки', function() {
            var sortableColumnsRef = element.all(by.id('SaleListTableHeaderRef'));
            expect(sortableColumnsRef.get(0).getText()).toBeTruthy();
        });

        it('показывает знак сортировки и сортирует элементы', function() {
            function takeInt() {
                return _.parseInt(this);
            }

            function takeFloat() {
                return parseFloat(this);
            }

            function takeDate() {
                return this.replace(/(\d+)\.(\d+)\.(\d+)/, '20$3-$2-$1');
            }

            function takeId() {
                return _.parseInt(this.replace(/^(\d+):(.+)/,'$1'));
            }

            function setHeader(what, where) {
                var copy = header.slice(0, 10);
                copy.splice(where, 1, what);
                return copy;
            }

            var header = ['','','','','','','','','',''];
            var columns = [
                {bind: 'date', type: 'Strings', valueFn: takeDate},
                {bind: 'dealer.id', type: 'Integers', valueFn: takeId},
                {bind: 'site.id', type: 'Integers', valueFn: takeId},
                {bind: 'type', type: 'Strings', valueFn: function() {   // сортирует по id, а не по отображаемому наименованию
                    return ['card', 'addcard', 'extra'][['Осн', 'Расш', 'Доп'].indexOf(this)];
                }},
                {bind: 'count', type: 'Integers', valueFn: takeInt},
                {bind: 'activeFrom', type: 'Strings', valueFn: takeDate},
                {bind: 'activeTo', type: 'Strings', valueFn: takeDate},
                {bind: 'amount', type: 'Floats', valueFn: takeFloat},
                {bind: 'siteAmount', type: 'Floats', valueFn: takeFloat},
                {bind: 'isActive', type: 'Booleans', valueFn: function() {   // сортирует по id, а не по отображаемому наименованию
                    return [true, false][['А', 'Н/А'].indexOf(this)];
                }}
            ]

            element(by.model('patterns.archive')).click();
            var sortableColumnsRef = element.all(by.id('SaleListTableHeaderRef'));
            var sortableColumnsDir = element.all(by.id('SaleListTableHeaderDir'));
            expect(mapText(sortableColumnsDir)).toEqual(header);
            _.forEach(header, function(value, idx) {
                sortableColumnsRef.get(idx).click();
                expect(mapText(sortableColumnsDir)).toEqual(setHeader('↓', idx));
                mapText(element.all(by.repeater('sale in sales').column('sale.' + columns[idx].bind))).then(function(data) {
                    expect(_.invoke(data, columns[idx].valueFn)).toBeSortedArrayOf('Ascending' + columns[idx].type);
                });
                sortableColumnsRef.get(idx).click();
                expect(mapText(sortableColumnsDir)).toEqual(setHeader('↑', idx));
                mapText(element.all(by.repeater('sale in sales').column('sale.' + columns[idx].bind))).then(function(data) {
                    expect(_.invoke(data, columns[idx].valueFn)).toBeSortedArrayOf('Descending' + columns[idx].type);
                });
            });
        });

        it('показывает реквизиты продаж', function() {
            var sales = by.repeater('sale in sales');
            element.all(sales).count().then(function(count) {
                for(var i = count; i--; ) {
                    var sale = sales.row(i);
                    expect(element(sale.column('sale.type')).getText()).toMatch(/^Осн$|^Расш$|^Доп$/);
                    expect(element(sale.column('sale.date')).getText()).toMatch(regexpDate);
                    expect(element(sale.column('sale.dealer.id')).getText()).toMatch(/^\d+:/);
                    expect(element(sale.column('sale.site.id')).getText()).toMatch(/^\d+:/);
                    expect(element(sale.column('sale.activeFrom')).getText()).toMatch(regexpDate);
                    expect(element(sale.column('sale.activeTo')).getText()).toMatch(regexpDate);
                    expect(element(sale.column('sale.isActive')).getText()).toMatch(/^А$|^Н\/А$/);
                    expect(element(sale).getText()).toMatch(/(Осн(?=[\s\S]+доплатить))|(Расш(?![\s\S]+доплатить))|(Доп(?![\s\S]+доплатить))/);
                    expect(element(sale).getText()).toMatch(/(Осн)|(Расш)|(Доп(?![\s\S]+расширить))/);
                }
            });
        });

        it('переходит к url изменения продажи по ссылке в "изменить"', function() {
            var sales = by.repeater('sale in sales');
            element.all(sales).count().then(function(count) {
                for(var i = count; i--; ) {
                    element.all(by.id('SaleListRowEdit')).get(i).click();
                    expect(browser.getCurrentUrl()).toMatch(/#\/sale\//);
                    element(by.id('saleEditCancel')).click();
                }
            });
        });

        it('показывает постраничку', function() {
            expect(element.all(by.id('paginationFirst')).count()).toBe(1);
            expect(element.all(by.id('paginationPrev')).count()).toBe(1);
            expect(element.all(by.id('paginationNext')).count()).toBe(1);
            expect(element.all(by.id('paginationLast')).count()).toBe(1);
            expect(element.all(by.id('paginationPages')).count()).toBeTruthy();
        });

        it('накладывает фильтр по дилеру', function() {
            var searchElem = element.all(by.id('McomboSearchInput')).get(0);
            searchElem.click();
            searchElem.sendKeys('1');
            var dropElem = element.all(by.id('McomboDropChoiceItem')).get(0);
            dropElem.getText().then(function(selectedValue) {
                dropElem.click();
                expect(element(by.id('McomboSelectedItem_0')).getText()).toBe(selectedValue);
                mapText(element.all(by.repeater('sale in sales').column('sale.dealer.id'))).then(function(data) {
                    _.forEach(data, function(value) {
                        expect(value).toBe(selectedValue);
                    });
                });
            });
        });

        it('накладывает фильтр по сайту', function() {
            var searchElem = element.all(by.id('McomboSearchInput')).get(1);
            searchElem.click();
            searchElem.sendKeys('1');
            var dropElem = element.all(by.id('McomboDropChoiceItem')).get(0);
            dropElem.getText().then(function(selectedValue) {
                dropElem.click();
                expect(element(by.id('McomboSelectedItem_0')).getText()).toBe(selectedValue);
                mapText(element.all(by.repeater('sale in sales').column('sale.site.id'))).then(function(data) {
                    expect(data.length).toBeTruthy();
                    _.forEach(data, function(value) {
                        expect(value).toBe(selectedValue);
                    });
                });
            });
        });

        it('накладывает фильтр по статусу true', function() {
            var setElem = element(by.select('patterns.isActive'));
            setSelect(setElem, 1);
            setElem.element(by.css('option:checked')).getText().then(function(selectedValue) {
                mapText(element.all(by.repeater('sale in sales').column('sale.isActive'))).then(function(data) {
                    expect(data.length).toBeTruthy();
                    _.forEach(data, function(value) {
                        expect(value).toBe(selectedValue);
                    });
                });
            });
        });

        it('накладывает фильтр по статусу false', function() {
            var setElem = element(by.select('patterns.isActive'));
            setSelect(setElem, 2);
            setElem.element(by.css('option:checked')).getText().then(function(selectedValue) {
                mapText(element.all(by.repeater('sale in sales').column('sale.isActive'))).then(function(data) {
                    expect(data.length).toBeTruthy();
                    _.forEach(data, function(value) {
                        expect(value).toBe(selectedValue);
                    });
                });
            });
        });

        it('накладывает фильтр по типу', function() {
            var setElem = element(by.select('patterns.type'));
            setSelect(setElem, 1);
            setElem.element(by.css('option:checked')).getText().then(function(selectedValue) {
                mapText(element.all(by.repeater('sale in sales').column('sale.type'))).then(function(data) {
                    expect(data.length).toBeTruthy();
                    _.forEach(data, function(value) {
                        expect(value).toBe(selectedValue);
                    });
                });
            });
        });

        it('накладывает фильтр по архиву', function() {
            var archive = element(by.model('patterns.archive'));
            archive.click();
            expect(archive.isSelected()).toBeTruthy();
            mapText(element.all(by.repeater('sale in sales').column('sale.activeTo'))).then(function(data) {
                expect(data.length).toBeTruthy();
                var today = new Date().toISOString().slice(0, 10);
                expect(_.any(data, function(value) {
                    var date = value.replace(/(\d+)\.(\d+)\.(\d+)/, '20$3-$2-$1');
                    return date < today;
                })).toBeTruthy();
            });
        });

        it('сбрасывает фильтры по кнопке', function() {
            var searchDealer = element.all(by.id('McomboSearchInput')).get(0);
            searchDealer.click();
            searchDealer.sendKeys('1');
            var dropDealer = element.all(by.id('McomboDropChoiceItem')).get(0);
            dropDealer.getText().then(function(selectedValue) {
                dropDealer.click();
                expect(element.all(by.id('McomboSelectedItem_0')).get(0).getText()).toBe(selectedValue);
            });

            var searchSite = element.all(by.id('McomboSearchInput')).get(1);
            searchSite.click();
            searchSite.sendKeys('1');
            var dropSite = element.all(by.id('McomboDropChoiceItem')).get(0);
            dropSite.getText().then(function(selectedValue) {
                dropSite.click();
                expect(element.all(by.id('McomboSelectedItem_0')).get(1).getText()).toBe(selectedValue);
            });

            var status = element(by.select('patterns.isActive'));
            setSelect(status, 1);
            expect(status.element(by.css('option:checked')).getText()).toBeTruthy();

            var type = element(by.select('patterns.type'));
            setSelect(type, 1);
            expect(type.element(by.css('option:checked')).getText()).toBeTruthy();

            var archive = element(by.model('patterns.archive'));
            archive.click();
            expect(archive.isSelected()).toBeTruthy();

            element(by.id('SaleListFilterSetDefault')).click();
            expect(element.all(by.id('McomboSelectedItem_0')).count()).toBe(0);
            expect(status.element(by.css('option:checked')).getText()).toBeFalsy();
            expect(type.element(by.css('option:checked')).getText()).toBeFalsy();
            expect(archive.isSelected()).toBeFalsy();
        });
    });

    describe('Редактирование карточки', function() {
        beforeEach(function() {
            browser.get('admin.html#/salelist?type=card&archive=true');
            element.all(by.id('SaleListRowEdit')).get(0).click();
        });

        it('показывает режим работы формы', function() {
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Изменение карточки$/);
        });

        it('выводит значение дилера', function() {
            expect(element.all(by.id('McomboSelectedItem_0')).get(0).getText()).toMatch(regexpIdName);
        });

        it('выводит ошибку, если dealer пустой', function() {
            element.all(by.id('McomboRemoveItem_0')).get(0).click();
            expect(element(by.id('saleEditDealerErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит значение сайта', function() {
            expect(element.all(by.id('McomboSelectedItem_0')).get(1).getText()).toMatch(/^\d+:/);
        });

        it('выводит ошибку, если site пустой', function() {
            element.all(by.id('McomboRemoveItem_0')).get(1).click();
            expect(element(by.id('saleEditSiteErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('не выводит tariffParent', function() {
            expect(element(by.id('saleTariffParent')).isDisplayed()).toBeFalsy();
        });

        it('выводит значение тарифа', function() {
            var tariffElem = element(by.id('saleTariff'));
            expect(tariffElem.element(by.css('option:checked')).getText()).toMatch(regexpTariff);
        });

        it('при выборе сайта заполняет список тарифов', function() {
            mapText(element.all(by.id('saleTariff'))).then(function(tariffs) {
                var preTariffs = tariffs.join();
                element.all(by.id('McomboSelectedItem_0')).get(1).getText().then(function(siteText) {
                    var preSiteId = siteText.replace(regexpIdName, '$1');
                    element.all(by.id('McomboRemoveItem_0')).get(1).click();
                    mapText(element.all(by.id('McomboDropChoiceItem'))).then(function(dropTexts) {
                        var newSiteIdx = _.findIndex(dropTexts, function(value) {
                            return (value.replace(regexpIdName, '$1') !== preSiteId);
                        });
                        expect(newSiteIdx).toBeDefined();
                        element.all(by.id('McomboDropChoiceItem')).get(newSiteIdx).click();
                        mapText(element.all(by.id('saleTariff'))).then(function(tariffs) {
                            expect(tariffs.join()).not.toEqual(preTariffs);
                            expect(_.every(tariffs, function(value) {
                                return (value.search(regexpTariff) !== -1);
                            })).toBeTruthy();
                        });
                    });
                });
            });
        });

        it('выводит значение count', function() {
            expect(element(by.model('saleEdited.count')).getAttribute('value')).toMatch(regexpInt);
        });

        it('выводит ошибку, если count пустой', function() {
            element(by.model('saleEdited.count')).clear();
            expect(element(by.id('saleCountErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если count отрицательный', function() {
            var count = element(by.model('saleEdited.count'));
            count.clear();
            count.sendKeys('-1');
            expect(element(by.id('saleCountErrorMin')).isDisplayed()).toBeTruthy();
        });

        it('выводит предупреждение, если count отличается от tariff.count', function() {
            element(by.id('saleTariff')).element(by.css('option:checked')).getText().then(function(tariffText) {
                var tariffCount = _.parseInt(tariffText.replace(regexpTariff, '$4'));
                var countElem = element(by.model('saleEdited.count'));
                countElem.clear();
                countElem.sendKeys(tariffCount.toString() + '1');
                expect(element(by.id('saleEditCountWarningDifferent')).isDisplayed()).toBeTruthy();
            })
        });

        it('выводит значение activeFrom', function() {
            expect(element(by.model('saleEdited.activeFrom')).getAttribute('value')).toMatch(regexpDateISO);
        });

        it('выводит ошибку, если activeFrom пустой', function() {
            element(by.model('saleEdited.activeFrom')).sendKeys('0');
            expect(element(by.id('saleActiveFromErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит значение activeTo', function() {
            expect(element(by.model('saleEdited.activeTo')).getAttribute('value')).toMatch(regexpDateISO);
        });

        it('выводит ошибку, если activeTo пустой', function() {
            element(by.model('saleEdited.activeTo')).sendKeys('0');
            expect(element(by.id('saleActiveToErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если activeTo меньше activeFrom', function() {
            element(by.model('saleEdited.activeTo')).sendKeys('010101');
            expect(element(by.id('saleActiveToErrorGreater')).isDisplayed()).toBeTruthy();
        });

        it('выводит значение cardAmount', function() {
            expect(element(by.model('saleEdited.cardAmount')).getAttribute('value')).toMatch(regexpFloat);
        });

        it('выводит ошибку, если cardAmount пустой', function() {
            element(by.model('saleEdited.cardAmount')).clear();
            expect(element(by.id('saleCardAmountErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если cardAmount отрицательный', function() {
            var cardAmountElem = element(by.model('saleEdited.cardAmount'));
            cardAmountElem.clear();
            cardAmountElem.sendKeys('-1');
            expect(element(by.id('saleCardAmountErrorMin')).isDisplayed()).toBeTruthy();
        });

        it('выводит значение amount', function() {
            expect(element(by.model('saleEdited.amount')).getAttribute('value')).toMatch(regexpFloat);
        });

        it('выводит ошибку, если amount пустой', function() {
            element(by.model('saleEdited.amount')).clear();
            expect(element(by.id('saleAmountErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если amount отрицательный', function() {
            var cardAmountElem = element(by.model('saleEdited.amount'));
            cardAmountElem.clear();
            cardAmountElem.sendKeys('-1');
            expect(element(by.id('saleAmountErrorMin')).isDisplayed()).toBeTruthy();
        });

        it('выводит предупреждение, если amount меньше cardAmount', function() {
            var cardAmountElem = element(by.model('saleEdited.cardAmount'));
            cardAmountElem.clear();
            cardAmountElem.sendKeys('10');
            var amountElem = element(by.model('saleEdited.amount'));
            amountElem.clear();
            amountElem.sendKeys('9');
            expect(element(by.id('saleEditAmountWarningLessCard')).isDisplayed()).toBeTruthy();
        });

        it('выводит значение siteAmount', function() {
            expect(element(by.model('saleEdited.siteAmount')).getAttribute('value')).toMatch(regexpFloat);
        });

        it('выводит ошибку, если siteAmount пустой', function() {
            element(by.model('saleEdited.siteAmount')).clear();
            expect(element(by.id('saleSiteAmountErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если siteAmount отрицательный', function() {
            var siteAmountElem = element(by.model('saleEdited.siteAmount'));
            siteAmountElem.clear();
            siteAmountElem.sendKeys('-1');
            expect(element(by.id('saleSiteAmountErrorMin')).isDisplayed()).toBeTruthy();
        });

        it('выводит значение info', function() {
            expect(element(by.model('saleEdited.siteAmount')).getAttribute('value')).toBeTruthy();
        });

        it('выводит ошибку, если info пустой', function() {
            element(by.model('saleEdited.info')).clear();
            expect(element(by.id('saleInfoErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит значение статуса', function() {
            var setElem = element(by.model('saleEdited.isActive'));
            expect(setElem.element(by.css('option:checked')).getText()).toMatch(/^(А|Н\/А)$/);
        });

        it('после сохранения переходит к списку', function() {
            element(by.id('saleEditSave')).click();
            expect(browser.getCurrentUrl()).toMatch('#\/salelist');
        });

        it('при отмене переходит к списку', function() {
            element(by.id('saleEditCancel')).click();
            expect(browser.getCurrentUrl()).toMatch('#\/salelist');
        });
    });

    describe('Создание карточки', function() {
        beforeEach(function() {
            browser.get('admin.html#/sale/card?id=new');
        });

        it('показывает режим работы формы', function() {
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Создание карточки$/);
        });

        it('выводит начальное значение статуса', function() {
            var setElem = element(by.model('saleEdited.isActive'));
            expect(setElem.element(by.css('option:checked')).getText()).toMatch(/^Н\/А$/);
        });

        it('выводит ошибку, если tariff пустой', function() {
            expect(element(by.id('saleEditTariffErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('позволяет выбрать дилера', function() {
            var dealerElem = element.all(by.id('McomboSearchInput')).get(0);
            dealerElem.click();
            var dropElem = element.all(by.id('McomboDropChoiceItem')).get(0);
            dropElem.getText().then(function(selectedValue) {
                dropElem.click();
                expect(element(by.id('McomboSelectedItem_0')).getText()).toBe(selectedValue);
            });
        });

        it('позволяет выбрать сайт', function() {
            var siteElem = element.all(by.id('McomboSearchInput')).get(1);
            siteElem.click();
            var dropElem = element.all(by.id('McomboDropChoiceItem')).get(0);
            dropElem.getText().then(function(selectedValue) {
                dropElem.click();
                expect(element(by.id('McomboSelectedItem_0')).getText()).toBe(selectedValue);
            });
        });

        it('выводит предупреждение, если для дилера и сайта нет тарифа по-умолчанию ', function() {
            var dealerElem = element(by.id('saleDealer'));
            var dealerElemSearch = dealerElem.element(by.id('McomboSearchInput'));
            dealerElemSearch.click();
            var dealerElemDrop = dealerElem.element.all(by.id('McomboDropChoiceItem')).get(0);
            dealerElemDrop.click();

            var tariffElem = element(by.id('saleTariff'));
            var siteElem = element(by.id('saleSite'));
            var siteElemSearch = siteElem.element(by.id('McomboSearchInput'));
            siteElemSearch.click();
            var siteElemsDrop = siteElem.element.all(by.id('McomboDropChoiceItem'));
            mapText(siteElemsDrop).then(function(sites) {
                _.forEach(sites, function(site, siteIdx) {
                    siteElemsDrop.get(siteIdx).click();
                    tariffElem.element(by.css('option:checked')).getText().then(function(tariffText) {
                        if (!tariffText) {
                            expect(element(by.id('saleEditTariffWarningNoDefaultTariff')).isDisplayed()).toBeTruthy();
                        }
                        siteElem.element(by.id('McomboRemoveItem_0')).click();
                    });
                });
            });
        });
    });

    describe('Редактирование расширения', function() {
        beforeEach(function() {
            browser.get('admin.html#/salelist?type=addcard&archive=true');
            element.all(by.id('SaleListRowEdit')).get(0).click();
        });

        it('показывает режим работы формы', function() {
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Изменение расширения$/);
        });

        it('не позволяет очистить dealer', function() {
            var dealerElem = element(by.id('saleDealer'));
            dealerElem.element(by.id('McomboRemoveItem_0')).click();
            expect(dealerElem.element.all(by.id('McomboSelectedItem_0')).get(0).getText()).toMatch(regexpIdName);
        });

        it('не позволяет очистить site', function() {
            var siteElem = element(by.id('saleSite'));
            siteElem.element(by.id('McomboRemoveItem_0')).click();
            expect(siteElem.element.all(by.id('McomboSelectedItem_0')).get(0).getText()).toMatch(regexpIdName);
        });

        it('выводит tariffParent', function() {
            expect(element(by.id('saleTariffParent')).isDisplayed()).toBeTruthy();
        });

        it('не позволяет изменить tariffParent', function() {
            expect(element(by.id('saleTariffParent')).isEnabled()).toBeFalsy();
        });

        it('не позволяет изменить activeTo', function() {
            expect(element(by.id('saleActiveTo')).isEnabled()).toBeFalsy();
        });
    });

    describe('Создание расширения', function() {
        beforeEach(function() {
            browser.get('admin.html#/salelist?type=card&archive=true');
            mapText(element.all(by.id('SaleListRowAdd'))).then(function(rows) {
                var saleIdx = rows.indexOf('расширить');
                element.all(by.id('SaleListRowAdd')).get(saleIdx).click();
            });
        });

        it('показывает режим работы формы', function() {
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Создание расширения$/);
        });

        it('выводит начальное значение статуса', function() {
            var setElem = element(by.model('saleEdited.isActive'));
            expect(setElem.element(by.css('option:checked')).getText()).toMatch(/^Н\/А$/);
        });
    });

    describe('Редактирование доплаты', function() {
        beforeEach(function() {
            browser.get('admin.html#/salelist?type=extra&archive=true');
            element.all(by.id('SaleListRowEdit')).get(0).click();
        });

        it('выводит режим работы формы', function() {
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Изменение доплаты$/);
        });

        it('не позволяет очистить dealer', function() {
            var dealerElem = element(by.id('saleDealer'));
            dealerElem.element(by.id('McomboRemoveItem_0')).click();
            expect(dealerElem.element.all(by.id('McomboSelectedItem_0')).get(0).getText()).toMatch(regexpIdName);
        });

        it('не позволяет очистить site', function() {
            var siteElem = element(by.id('saleSite'));
            siteElem.element(by.id('McomboRemoveItem_0')).click();
            expect(siteElem.element.all(by.id('McomboSelectedItem_0')).get(0).getText()).toMatch(regexpIdName);
        });

        it('не выводит tariff', function() {
            expect(element(by.id('saleTariff')).isDisplayed()).toBeFalsy();
        });

        it('не выводит tariffParent', function() {
            expect(element(by.id('saleTariffParent')).isDisplayed()).toBeFalsy();
        });

        it('не выводит count', function() {
            expect(element(by.id('saleCount')).isDisplayed()).toBeFalsy();
        });

        it('не выводит saleActiveFrom', function() {
            expect(element(by.id('saleActiveFrom')).isDisplayed()).toBeFalsy();
        });

        it('не выводит saleActiveTo', function() {
            expect(element(by.id('saleActiveTo')).isDisplayed()).toBeFalsy();
        });

        it('не выводит saleCardAmount', function() {
            expect(element(by.id('saleCardAmount')).isDisplayed()).toBeFalsy();
        });
    });

    describe('Создание доплаты', function() {
        beforeEach(function() {
            browser.get('admin.html#/salelist?type=card&archive=true');
            element.all(by.id('SaleListRowExtra')).get(0).click();
        });

        it('показывает режим работы формы', function() {
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Создание доплаты$/);
        });

        it('выводит значение дилера', function() {
            var dealerElem = element(by.id('saleDealer'));
            expect(dealerElem.element.all(by.id('McomboSelectedItem_0')).get(0).getText()).toMatch(regexpIdName);
        });

        it('выводит значение сайта', function() {
            var siteElem = element(by.id('saleSite'));
            expect(siteElem.element.all(by.id('McomboSelectedItem_0')).get(0).getText()).toMatch(regexpIdName);
        });

        it('выводит начальное значение статуса', function() {
            var setElem = element(by.model('saleEdited.isActive'));
            expect(setElem.element(by.css('option:checked')).getText()).toMatch(/^Н\/А$/);
        });
    });
});

xdescribe('DealerSite App', function() {

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

    describe('Редактирование регистрации', function() {
        beforeEach(function() {
            browser.get('admin.html#/dealersitelist');
            element.all(by.id('McomboSearchInput')).get(1).click();
            element.all(by.id('McomboSearchInput')).get(1).sendKeys('6');
            element.all(by.id('McomboDropChoiceItem')).get(0).click();
            setSelect(element(by.select('patterns.isActive')), 1);
            element.all(by.id('DealerSiteListRowEdit')).get(0).click();
        });

        it('показывает режим работы формы', function() {
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Изменение /);
        });

        it('выводит выбранного дилера', function() {
            expect(element.all(by.id('McomboSelectedItem_0')).get(0).getText()).toMatch(/^\d+:/);
        });

        it('выводит выбранный сайт', function() {
            expect(element.all(by.id('McomboSelectedItem_0')).get(1).getText()).toMatch(/^\d+:/);
        });

        it('выводит значение externalId', function() {
            expect(element(by.model('dealerSiteEdited.externalId')).getAttribute('value')).toBeTruthy();
        });

        it('выводит ошибку, если externalId пустой', function() {
            element(by.model('dealerSiteEdited.externalId')).clear();
            expect(element(by.id('dealerSiteExternalIdErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('не позволяет ввести в externalId больше 10 символов', function() {
            var maxValue = '1234567890';
            element(by.model('dealerSiteEdited.externalId')).clear();
            element(by.model('dealerSiteEdited.externalId')).sendKeys(maxValue + '1');
            expect(element(by.model('dealerSiteEdited.externalId')).getAttribute('value')).toBe(maxValue);
        });

        it('выводит значение publicUrl', function() {
            expect(element(by.model('dealerSiteEdited.publicUrl')).getAttribute('value')).toBeTruthy();
        });

        it('выводит ошибку, если publicUrl пустой', function() {
            element(by.model('dealerSiteEdited.publicUrl')).clear();
            expect(element(by.id('dealerSitePublicUrlErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если publicUrl не соответствует формату', function() {
            element(by.model('dealerSiteEdited.publicUrl')).clear();
            element(by.model('dealerSiteEdited.publicUrl')).sendKeys('@@@');
            expect(element(by.id('dealerSitePublicUrlErrorUrl')).isDisplayed()).toBeTruthy();
        });

        it('не позволяет ввести в publicUrl больше 255 символов', function() {
            var maxValue = '1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDE';
            element(by.model('dealerSiteEdited.publicUrl')).clear();
            element(by.model('dealerSiteEdited.publicUrl')).sendKeys(maxValue + '1');
            expect(element(by.model('dealerSiteEdited.publicUrl')).getAttribute('value')).toBe(maxValue);
        });

        it('выводит значение логина на сайте', function() {
            expect(element(by.model('dealerSiteLoginsEdited.site.login')).getAttribute('value')).toBeTruthy();
        });

        it('выводит ошибку, если логин на сайте пустой', function() {
            element(by.model('dealerSiteLoginsEdited.site.login')).clear();
            expect(element(by.id('dealerSiteLoginSiteLoginErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('не позволяет ввести в логин на сайте больше 100 символов', function() {
            var maxValue = '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
            element(by.model('dealerSiteLoginsEdited.site.login')).clear();
            element(by.model('dealerSiteLoginsEdited.site.login')).sendKeys(maxValue + '1');
            expect(element(by.model('dealerSiteLoginsEdited.site.login')).getAttribute('value')).toBe(maxValue);
        });

        it('выводит значение пароля на сайте', function() {
            expect(element(by.model('dealerSiteLoginsEdited.site.password')).getAttribute('value')).toBeTruthy();
        });

        it('выводит ошибку, если пароль на сайте пустой', function() {
            element(by.model('dealerSiteLoginsEdited.site.password')).clear();
            expect(element(by.id('dealerSiteLoginSitePasswordErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('не позволяет ввести в пароль на сайте больше 100 символов', function() {
            var maxValue = '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
            element(by.model('dealerSiteLoginsEdited.site.password')).clear();
            element(by.model('dealerSiteLoginsEdited.site.password')).sendKeys(maxValue + '1');
            expect(element(by.model('dealerSiteLoginsEdited.site.password')).getAttribute('value')).toBe(maxValue);
        });

        it('выводит значение логина на ftp', function() {
            expect(element(by.model('dealerSiteLoginsEdited.ftp.login')).getAttribute('value')).toBeTruthy();
        });

        it('выводит ошибку, если логин на ftp пустой', function() {
            element(by.model('dealerSiteLoginsEdited.ftp.login')).clear();
            expect(element(by.id('dealerSiteLoginFtpLoginErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('не позволяет ввести в логин на ftp больше 100 символов', function() {
            var maxValue = '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
            element(by.model('dealerSiteLoginsEdited.ftp.login')).clear();
            element(by.model('dealerSiteLoginsEdited.ftp.login')).sendKeys(maxValue + '1');
            expect(element(by.model('dealerSiteLoginsEdited.ftp.login')).getAttribute('value')).toBe(maxValue);
        });

        it('выводит значение пароля на ftp', function() {
            expect(element(by.model('dealerSiteLoginsEdited.ftp.password')).getAttribute('value')).toBeTruthy();
        });

        it('выводит ошибку, если пароль на ftp пустой', function() {
            element(by.model('dealerSiteLoginsEdited.ftp.password')).clear();
            expect(element(by.id('dealerSiteLoginFtpPasswordErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('не позволяет ввести в пароль на ftp больше 100 символов', function() {
            var maxValue = '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
            element(by.model('dealerSiteLoginsEdited.ftp.password')).clear();
            element(by.model('dealerSiteLoginsEdited.ftp.password')).sendKeys(maxValue + '1');
            expect(element(by.model('dealerSiteLoginsEdited.ftp.password')).getAttribute('value')).toBe(maxValue);
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

            expect(element(by.id('DealerSiteListNotice')).getText()).toMatch(/^Сохранена регистрация/);
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

            expect(element(by.id('DealerSiteListNotice')).getText()).toMatch(/^Удалена регистрация/);
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

            browser.get('admin.html#/dealersitelist');
            element.all(by.id('McomboSearchInput')).get(0).click();
            element.all(by.id('McomboSearchInput')).get(0).sendKeys('14');
            element.all(by.id('McomboDropChoiceItem')).get(0).click();
            element.all(by.id('McomboSearchInput')).get(1).click();
            element.all(by.id('McomboSearchInput')).get(1).sendKeys('1');
            element.all(by.id('McomboDropChoiceItem')).get(0).click();

            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('externalId')).getText()).toMatch(newExternalId);
            expect(element(by.repeater('dealerSite in dealerSites').row(0).column('publicUrl')).getAttribute('href')).toMatchOrEmpty(newPublicUrl);
        });
    });
});

});