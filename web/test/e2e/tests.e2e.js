'use strict';

var _ = require('lodash');

// выбирает в селекте значение по порядковому номеру, начиная с 0
var setSelect = function (elem, optIndex) {
    return elem.all(by.tagName('option')).then(function(options) {
        options[optIndex].click();
    });
};

var getSelectOptions = function(elem) {
    return elem.all(by.css('option'));
}

var selectedOption = function(elem) {
    return elem.element(by.css('option:checked'));
}

var clearDate = function(id, model) {
    browser.executeScript('var s = angular.element(document.getElementById("' + id + '")).scope(); s.' + model + ' = ""; s.$apply();');
}

var setDate = function(id, model, value) {
    browser.executeScript('var s = angular.element(document.getElementById("' + id + '")).scope(); s.' + model + ' = new Date("' + value + '"); s.$apply();');
}

var mapText = function(q) {
    return q.map(function(elm) {
        return elm.getText();
    })
};

var mapIsDisplayed = function(q) {
    return q.map(function(elm) {
        return elm.isDisplayed();
    });
};

var parseFloatRu = function(value) {
    return parseFloat(value.replace(/ /g, '').replace(/,/, '.'));
};

var randomMillion = function() {
    return String(Math.floor(Math.random() * 1000000));
}

Number.prototype.ceil = function(places) {  // found on http://stackoverflow.com/a/19722641/3745041
    return +(Math.ceil(this + "e+" + places)  + "e-" + places);
}

function randomCoordinate(min, max) {
    return (Math.random() * (max - min) + min).ceil(8);
}

function randomLatitude() {
    return randomCoordinate(40, 90);
}

function randomLongitude() {
    return randomCoordinate(20, 180);
}

if (browser.baseUrl.match(/maxposter.ru/)) {
    var test_maxposter_ru = true;
    browser.driver.get('http://test.maxposter.ru/');
    var emailInput = browser.driver.findElement(by.id('signin_email'));
    emailInput.sendKeys('protractor@maxposter.ru');
    var passwordInput = browser.driver.findElement(by.id('signin_password'));
    passwordInput.sendKeys('protractor' + protractor.Key.ENTER);
    browser.driver.wait(function() {
        return browser.driver.isElementPresent(by.className("client-code"));
    });
}

var regexpInt = /^\d+$/;
var regexpFloat = /^\d+(?:\.\d*)?$/;
var regexpFloatRu = /^[\d ]+(?:,\d*|)$/;
var regexpDate = /^(\d{2}).(\d{2}).(\d{2})$/;
var regexpDateISO = /^(20\d{2})-(\d{2})-(\d{2})$/;
var regexpEmail = /^[\w-]+@[\w\.-]+$/;
var regexpPhoneNumber = /^\+7[ ]?(?:(?:\(\d{3}\)[ ]?\d{3})|(?:\(\d{4}\)[ ]?\d{2})|(?:\(\d{5}\)[ ]?\d{1}))-?\d{2}-?\d{2}$/;
var regexpUrl = /^(http|https):\/\/([\-\S]+\.)+([\-\S]{2,})/;
var regexpIdName = /^(\d+): (.+)$/;
var regexpTariff = /^(\d+(?:\.\d+)?) руб. за (\d+) +(мес\.|дн\.)(?:, до (\d+) объявлений)?( \(Н\/А\))?$/;
var regexpSaleName = /^.+"(.+)".+"(.+)".*$/;
var regexpUserGroupName = /^([А-Яа-яЁё]+)(?:: (.+))?$/;
var regexpTotalItems = /^.+: (\d+)$/;

describe('MaxPoster Admin Frontend', function() {

beforeEach(function() {
    this.addMatchers({
        toBeSortedArrayOf: function(params) {
            var convert = function(arg) {
                if (params.match('Integers')) {
                    return parseInt(arg, 10);
                } else if (params.match('Floats')) {
                    return arg;
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

describe('User App', function() {

    describe('Список пользователей', function() {
        beforeEach(function() {
            browser.get('admin.html#/userlist?orders=id&itemsPerPage=15');
        });

        it('показывает количество пользователей', function() {
            expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/\d+$/);
        });

        it('переходит по верхней кнопке добавления пользователя', function() {
            element.all(by.id('UserListAddUserUp')).get(0).click();
            expect(browser.getLocationAbsUrl()).toMatch('#\/usernew');
        });

        it('переходит по нижней кнопке добавления пользователя', function() {
            element.all(by.id('UserListAddUserDown')).get(0).click();
            expect(browser.getLocationAbsUrl()).toMatch('#\/usernew');
        });

        it('показывает сортируемые колонки заголовка таблицы пользователей - количество', function() {
            var sortableColumns = element.all(by.id('UserListTableHeader'));
            expect(sortableColumns.count()).toBe(3);
        });

        it('показывает сортируемые колонки заголовка таблицы пользователей - ссылки', function() {
            var sortableColumnsRef = element.all(by.id('UserListTableHeaderRef'));
            expect(sortableColumnsRef.get(0).getText()).toBeTruthy();
        });

        it('показывает знак сортировки и сортирует элементы', function() {
            function takeInt() {
                return _.parseInt(this);
            }

            function takeFloat() {
                return parseFloatRu(this);
            }

            function takeDate() {
                return this.replace(regexpDate, '20$3-$2-$1');
            }

            function takeString() {
                return this;
            }

            function takeId() {
                return _.parseInt(this.replace(regexpIdName,'$1'));
            }

            function setHeader(what, where) {
                var copy = header.slice(0, 10);
                copy.splice(where, 1, what);
                return copy;
            }

            var header = ['','',''];
            var columns = [
                {bind: 'id', type: 'Integers', valueFn: takeId},
                {bind: 'email', type: 'Strings', valueFn: takeString},
                {bind: 'lastLogin', type: 'Dates', valueFn: takeDate}
            ]

            var sortableColumnsRef = element.all(by.id('UserListTableHeaderRef'));
            var sortableColumnsDir = element.all(by.id('UserListTableHeaderDir'));
            expect(mapText(sortableColumnsDir)).toEqual(setHeader('↓', 0));
            sortableColumnsRef.get(0).click();
            _.forEach(header, function(value, idx) {
                sortableColumnsRef.get(idx).click();
                expect(mapText(sortableColumnsDir)).toEqual(setHeader('↓', idx));
                mapText(element.all(by.repeater('user in users').column('user.' + columns[idx].bind))).then(function(data) {
                    expect(_.invoke(data, columns[idx].valueFn)).toBeSortedArrayOf('Ascending' + columns[idx].type);
                });
                sortableColumnsRef.get(idx).click();
                expect(mapText(sortableColumnsDir)).toEqual(setHeader('↑', idx));
                mapText(element.all(by.repeater('user in users').column('user.' + columns[idx].bind))).then(function(data) {
                    expect(_.invoke(data, columns[idx].valueFn)).toBeSortedArrayOf('Descending' + columns[idx].type);
                });
            });
        });

        it('показывает реквизиты пользователя', function() {
            expect(element(by.repeater('user in users').row(0).column('user.id')).getText()).toMatch(/^\d+$/);
            expect(element(by.repeater('user in users').row(0).column('user.email')).getText()).toMatch(/^[\w-]+@[\w\.-]+$/);
            expect(element(by.repeater('user in users').row(0).column('user.lastLogin')).getText()).toMatch(/^\d\d.\d\d.\d\d$/);
        });

        it('переходит к редактированию пользователя по ссылке в id', function() {
            element(by.repeater('user in users').row(0).column('user.id')).click();
            expect(browser.getLocationAbsUrl()).toMatch('#\/users\/1\/edit');
        });

        it('переходит к редактированию пользователя по ссылке в email', function() {
            element(by.repeater('user in users').row(0).column('user.email')).click();
            expect(browser.getLocationAbsUrl()).toMatch('#\/users\/1\/edit');
        });

        it('показывает несколько пользователей', function() {
            expect(element.all(by.repeater('user in users')).count()).not.toBeLessThan(2);
        });

        it('показывает постраничку', function() {
            expect(element.all(by.id('paginationFirst')).count()).toBe(1);
            expect(element.all(by.id('paginationPrev')).count()).toBe(1);
            expect(element.all(by.id('paginationNext')).count()).toBe(1);
            expect(element.all(by.id('paginationLast')).count()).toBe(1);
            expect(element.all(by.id('paginationPages')).count()).not.toBeLessThan(3);
        });

        it('переходит по страничкам', function() {
            var usersSelector = by.repeater('user in users');
            var paginationTexts = [];

            element(usersSelector.row(0)).getText().then(function(userText) {
                paginationTexts[0] = userText;
            });
            element.all(by.id('paginationPages')).get(1).click();
            element(usersSelector.row(0)).getText().then(function(userText) {
                expect(_.indexOf(paginationTexts, userText)).toBe(-1);
                paginationTexts[1] = userText;
            });
            element(by.id('paginationPrev')).click();
            element(usersSelector.row(0)).getText().then(function(userText) {
                expect(_.indexOf(paginationTexts, userText)).toBe(0);
            });
            element(by.id('paginationNext')).click();
            element(usersSelector.row(0)).getText().then(function(userText) {
                expect(_.indexOf(paginationTexts, userText)).toBe(1);
            });
            element(by.id('paginationFirst')).click();
            element(usersSelector.row(0)).getText().then(function(userText) {
                expect(_.indexOf(paginationTexts, userText)).toBe(0);
            });
            element(by.id('paginationLast')).click();
            element(usersSelector.row(0)).getText().then(function(userText) {
                expect(_.indexOf(paginationTexts, userText)).toBe(-1);
            });
        });

        it('накладывает фильтр по текстовому поиску', function() {
            var usersSelector = by.repeater('user in users');
            var complexElem = element(by.model('patterns.complex'));
            var testValues = '1 S Д';
            complexElem.sendKeys(testValues);

            var usersData={};
            mapText(element.all(usersSelector.column('user.id'))).then(function(respond) {
                usersData.id = respond;
                expect(usersData.id).toBeTruthy();
            });
            mapText(element.all(usersSelector.column('user.email'))).then(function(respond) {
                usersData.email = respond;
            });
            mapText(element.all(usersSelector.column('user.groupName()'))).then(function(respond) {
                usersData.name = _.map(respond, function(value) {
                    var group = value.replace(regexpUserGroupName, '$1');
                    var dealerName = (group === 'Автосалон') ? value.replace(regexpUserGroupName, '$2') : '';
                    return dealerName;
                });
            });
            browser.controlFlow().execute(function() {
                _.forEach(testValues.toLowerCase().split(' '), function(testValue) {
                    _.forEach(usersData.id, function(value, userIdx) {
                        expect(usersData.id[userIdx].toLowerCase().indexOf(testValue) 
                            || usersData.email[userIdx].toLowerCase().indexOf(testValue) 
                            || usersData.name[userIdx].toLowerCase().indexOf(testValue)).toBeTruthy();
                    });
                });
            });
        });

        it('накладывает фильтр по статусу', function() {
            var statusElem = element(by.id('checkbox_group_2'));
            statusElem.click();
            expect(statusElem.isSelected()).toBeTruthy();

            var usersData={};
            mapText(element.all(by.model('user.status'))).then(function(respond) {
                usersData.status = respond;
            });

            browser.controlFlow().execute(function() {
                _.forEach(usersData.status, function(userStatus) {
                    expect(userStatus).toBe('Блокированный');
                });
            });
        });

        it('накладывает фильтр по менеджеру', function() {
            var managerElem = element(by.model('patterns.manager'));
            setSelect(managerElem, 1);

            var selectedValue;
            selectedOption(managerElem).getText().then(function(respond) {
                selectedValue = respond;
            });

            var usersData={};
            mapText(element.all(by.model('user.dealer.manager'))).then(function(respond) {
                usersData.manager = respond;
            });

            browser.controlFlow().execute(function() {
                _.forEach(usersData.manager, function(dealerManager) {
                    expect(dealerManager).toBe(selectedValue);
                });
            });
        });

        it('инициализирует фильтры по кнопке', function() {
            element(by.model('patterns.complex')).sendKeys('1');
            element(by.id('checkbox_group_2')).click();
            var managerElem = element(by.model('patterns.manager'));
            setSelect(managerElem, 1);

            element(by.id('UserListFilterSetDefault')).click();

            expect(element(by.model('patterns.complex')).getAttribute('value')).toBeFalsy();
            expect(element(by.id('checkbox_group_1')).isSelected()).toBeTruthy();
            expect(element(by.id('checkbox_group_2')).isSelected()).toBeFalsy();
            expect(selectedOption(managerElem).getText()).toBeFalsy();
        });
    });

    describe('Редактирование пользователя', function() {
        beforeEach(function() {
            browser.get('admin.html#/users/5/edit');
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
            element(by.model('userEdited.email')).clear();
            element(by.model('userEdited.email')).sendKeys('@@@');
            expect(element(by.id('UserEditEmailErrorPattern')).isDisplayed()).toBeTruthy();
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
            getSelectOptions(element(by.model('userEdited.status'))).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение статуса', function() {
            expect(selectedOption(element(by.model('userEdited.status'))).getText()).toBeTruthy();
        });

        it('заполняет список групп', function() {
            getSelectOptions(element(by.model('userEdited.group'))).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение группы', function() {
            expect(selectedOption(element(by.model('userEdited.group'))).getText()).toBeTruthy();
        });

        it('заполняет список менеджеров', function() {
            getSelectOptions(element(by.model('dealerEdited.manager'))).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение менеджера', function() {
            expect(selectedOption(element(by.model('dealerEdited.manager'))).getText()).toBeTruthy();
        });

        it('заполняет список компаний', function() {
            getSelectOptions(element(by.model('dealerEdited.billingCompany'))).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение компании', function() {
            expect(selectedOption(element(by.model('dealerEdited.billingCompany'))).getText()).toBeTruthy();
        });

        it('выводит название дилера', function() {
            expect(element(by.model('dealerEdited.companyName')).getAttribute('value')).toBeTruthy();
        });

        it('заполняет список городов', function() {
            getSelectOptions(element(by.model('dealerEdited.city'))).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение города', function() {
            expect(selectedOption(element(by.model('dealerEdited.city'))).getText()).toBeTruthy();
        });

        it('выводит ошибку, если город не выбран', function() {
            setSelect(element(by.model('dealerEdited.city')), 0);
            expect(element(by.id('UserEditCityErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('заполняет список рынков', function() {
            getSelectOptions(element(by.model('dealerEdited.market'))).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение рынка', function() {
            expect(selectedOption(element(by.model('dealerEdited.market'))).getText()).toBeTruthy();
        });

        it('при очистке значения города, значение рынка очищается и делается недоступным', function() {
            expect(selectedOption(element(by.model('dealerEdited.market'))).isEnabled()).toBeTruthy();
            setSelect(element(by.model('dealerEdited.city')), 0);
            expect(selectedOption(element(by.model('dealerEdited.market'))).getText()).toBeFalsy();
            expect(selectedOption(element(by.model('dealerEdited.market'))).isEnabled()).toBeFalsy();
        });

        it('заполняет список метро', function() {
            getSelectOptions(element(by.model('dealerEdited.metro'))).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение метро', function() {
            expect(selectedOption(element(by.model('dealerEdited.metro'))).getText()).toBeTruthy();
        });

        it('при очистке значения города, значение метро очищается и делается недоступным', function() {
            expect(selectedOption(element(by.model('dealerEdited.metro'))).isEnabled()).toBeTruthy();
            setSelect(element(by.model('dealerEdited.city')), 0);
            expect(selectedOption(element(by.model('dealerEdited.metro'))).getText()).toBeFalsy();
            expect(selectedOption(element(by.model('dealerEdited.metro'))).isEnabled()).toBeFalsy();
        });

        it('выводит значение адреса', function() {
            expect(element(by.model('dealerEdited.address')).getAttribute('value')).toBeTruthy();
        });

        it('выводит значение dealer.fax', function() {
            expect(element(by.model('dealerEdited.fax')).getAttribute('value')).toMatch(regexpPhoneNumber);
        });

        it('выводит ошибку, если dealer.fax не соответствует формату', function() {
            element(by.model('dealerEdited.fax')).clear();
            element(by.model('dealerEdited.fax')).sendKeys('122-23-32');
            expect(element(by.id('UserEditDealerFaxNumber')).isDisplayed()).toBeTruthy();
        });

        it('выводит значение мэйла', function() {
            expect(element(by.model('dealerEdited.email')).getAttribute('value')).toMatch(regexpEmail);
        });

        it('выводит ошибку, если email дилера не соответствует формату', function() {
            element(by.model('dealerEdited.email')).clear();
            element(by.model('dealerEdited.email')).sendKeys('@@@');
            expect(element(by.id('DealerEmailErrorPattern')).isDisplayed()).toBeTruthy();
        });

        it('выводит значение сайта', function() {
            expect(element(by.model('dealerEdited.url')).getAttribute('value')).toMatch(regexpUrl);
        });

        it('выводит ошибку, если сайт введен, но не соответствует формату', function() {
            element(by.model('dealerEdited.url')).clear();
            expect(element(by.id('DealerUrlErrorPattern')).isDisplayed()).toBeFalsy();
            element(by.model('dealerEdited.url')).sendKeys('http://a');
            expect(element(by.id('DealerUrlErrorPattern')).isDisplayed()).toBeTruthy();
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
            getSelectOptions(element.all(by.model('phone.phoneFrom')).get(0)).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение часа С', function() {
            expect(element.all(by.model('phone.phoneFrom')).get(0).getText()).toBeTruthy();
        });

        it('заполняет список часов ДО', function() {
            getSelectOptions(element.all(by.model('phone.phoneTo')).get(0)).then(function(options) {
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
            getSelectOptions(element(by.model('userEdited.site'))).then(function(options) {
                expect(options.length).toBeGreaterThan(1);
            });
        });

        it('выводит значение сайта', function() {
            setSelect(element(by.model('userEdited.group')), 3);
            setSelect(element(by.model('userEdited.site')), 1);
            expect(selectedOption(element(by.model('userEdited.site'))).getText()).toBeTruthy();
        });

        it('если группа - автосалон, то выводит данные дилера, а данные сайта - нет', function() {
            setSelect(element(by.model('userEdited.group')), 2);
            expect(element(by.id('user_dealer_manager_id')).isDisplayed()).toBeTruthy();
            expect(element(by.id('user_dealer_company_name')).isDisplayed()).toBeTruthy();
            expect(element(by.id('user_sites_list')).isDisplayed()).toBeFalsy();
        });

        it('если группа - сайт, то выводит данные сайта, а данные дилера - нет', function() {
            setSelect(element(by.model('userEdited.group')), 3);
            expect(element(by.id('user_sites_list')).isDisplayed()).toBeTruthy();
            expect(element(by.id('user_dealer_manager_id')).isDisplayed()).toBeFalsy();
            expect(element(by.id('user_dealer_company_name')).isDisplayed()).toBeFalsy();
        });

        it('если группа - админ или не выбрана, то не выводит данные сайта и данные дилера', function() {
            setSelect(element(by.model('userEdited.group')), 0);
            expect(element(by.id('user_sites_list')).isDisplayed()).toBeFalsy();
            expect(element(by.id('user_dealer_manager_id')).isDisplayed()).toBeFalsy();
            expect(element(by.id('user_dealer_company_name')).isDisplayed()).toBeFalsy();

            setSelect(element(by.model('userEdited.group')), 1);
            expect(element(by.id('user_sites_list')).isDisplayed()).toBeFalsy();
            expect(element(by.id('user_dealer_manager_id')).isDisplayed()).toBeFalsy();
            expect(element(by.id('user_dealer_company_name')).isDisplayed()).toBeFalsy();
        });

        it('после сохранения пользователя переходит к списку пользователей', function() {
            element(by.id('UserEditSaveUser')).click();
            expect(browser.getLocationAbsUrl()).toMatch('#\/userlist');
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

            setSelect(element(by.model('userEdited.group')), 1);
            expect(element(by.id('UserEditSaveUser')).isEnabled()).toEqual(noDisplayed(getErrors()));
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
            expect(selectedOption(element(by.model('userEdited.status'))).getText()).toBe('Неактивный');
            expect(selectedOption(element(by.model('userEdited.group'))).getText()).toBeFalsy();
            expect(selectedOption(element(by.model('dealerEdited.manager'))).getText()).toBeFalsy();
            expect(element(by.model('dealerEdited.companyName')).getAttribute('value')).toBeFalsy();
            expect(selectedOption(element(by.model('dealerEdited.city'))).getText()).toBeFalsy();
            expect(selectedOption(element(by.model('dealerEdited.market'))).getText()).toBeFalsy();
            expect(selectedOption(element(by.model('dealerEdited.metro'))).getText()).toBeFalsy();
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
            expect(selectedOption(element(by.model('userEdited.site'))).getText()).toBeFalsy();
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

            setSelect(element(by.model('userEdited.group')), 2);
            expect(element(by.id('UserEditSaveUser')).isEnabled()).toEqual(noDisplayed(getErrors()));

            setSelect(element(by.model('dealerEdited.city')), 1);
            expect(element(by.id('UserEditSaveUser')).isEnabled()).toEqual(noDisplayed(getErrors()));
        });

        it('после удаления пользователя переходит к списку пользователей', function() {
            element(by.id('UserEditRemoveUser')).click();
            browser.switchTo().alert().accept();
            expect(browser.getLocationAbsUrl()).toMatch('#\/userlist');
        });
    });

    describe('Сценарии использования', function() {

        beforeEach(function() {
            browser.get('admin.html#/userlist?orders=-id&itemsPerPage=15');
        });

        it('Создание пользователя-администратора', function() {
            var usersSelector = by.repeater('user in users');
            element(by.id('UserListAddUserUp')).click();

            element(by.model('userEdited.email')).sendKeys(randomMillion() + '@protractor.ru');
            element(by.model('userEdited.password')).sendKeys('123');
            element(by.model('userPasswordConfirm')).sendKeys('123');
            setSelect(element(by.model('userEdited.group')), 1);

            var userData = {};
            element(by.model('userEdited.email')).getAttribute('value').then(function(respond) {
                userData.email = respond;
            });
            selectedOption(element(by.model('userEdited.status'))).getText().then(function(respond) {
                userData.status = respond;
            });
            selectedOption(element(by.model('userEdited.group'))).getText().then(function(respond) {
                userData.group = respond;
            });

            element(by.id('UserEditSaveUser')).click();

            element.all(usersSelector.column('user.email')).get(0).getText().then(function(respond) {
                expect(respond).toBe(userData.email);
            });
            element.all(usersSelector.column('user.lastLogin')).get(0).getText().then(function(respond) {
                expect(respond).toBeFalsy();
            });
            element.all(usersSelector.column('user.id')).get(0).getText().then(function(respond) {
                userData.idText = respond;
            });
            element(by.id('savedUserListNotice')).getText().then(function(noticeText) {
                expect(noticeText).toBe('Сохранён пользователь с идентификатором: ' + userData.idText);
            });

            element.all(usersSelector.column('user.email')).get(0).click();

            element(by.model('userEdited.email')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(userData.email);
            });
            selectedOption(element(by.model('userEdited.status'))).getText().then(function(respond) {
                expect(respond).toBe(userData.status);
            });
            selectedOption(element(by.model('userEdited.group'))).getText().then(function(respond) {
                expect(respond).toBe(userData.group);
            });
        });
    
        it('Создание и изменение пользователя-дилера', function() {
            var usersSelector = by.repeater('user in users');
            element(by.id('UserListAddUserUp')).click();

            element(by.model('userEdited.email')).sendKeys(randomMillion() + '@protractor.ru');
            element(by.model('userEdited.password')).sendKeys('123');
            element(by.model('userPasswordConfirm')).sendKeys('123');
            setSelect(element(by.model('userEdited.group')), 2);

            setSelect(element(by.model('dealerEdited.manager')), 1);
            setSelect(element(by.model('dealerEdited.billingCompany')), 1);

            element(by.model('dealerEdited.companyName')).sendKeys('Название');
            setSelect(element(by.model('dealerEdited.city')), 1);
            setSelect(element(by.model('dealerEdited.market')), 1);
            setSelect(element(by.model('dealerEdited.metro')), 1);
            element(by.model('dealerEdited.address')).sendKeys('Адрес');
            element(by.model('dealerEdited.fax')).sendKeys('+7(812)555-55-55');
            element(by.model('dealerEdited.email')).sendKeys('email@protractor.ru');
            element(by.model('dealerEdited.url')).sendKeys('http://www.protractor.ru');
            element(by.model('dealerEdited.contactName')).sendKeys('Контакт');

            element.all(by.model('phone.phoneNumber')).get(0).sendKeys('+7(812)111-11-11');
            setSelect(element.all(by.model('phone.phoneFrom')).get(0), 1);
            setSelect(element.all(by.model('phone.phoneTo')).get(0), 2);
            element.all(by.model('phone.phoneNumber')).get(1).sendKeys('+7(812)222-22-22');
            setSelect(element.all(by.model('phone.phoneFrom')).get(1), 11);
            setSelect(element.all(by.model('phone.phoneTo')).get(1), 12);
            element.all(by.model('phone.phoneNumber')).get(2).sendKeys('+7(812)333-33-33');
            setSelect(element.all(by.model('phone.phoneFrom')).get(2), 21);
            setSelect(element.all(by.model('phone.phoneTo')).get(2), 22);

            element(by.model('dealerEdited.companyInfo')).sendKeys('Описание');

            var userData = {};
            element(by.model('userEdited.email')).getAttribute('value').then(function(respond) {
                userData.email = respond;
            });
            selectedOption(element(by.model('userEdited.status'))).getText().then(function(respond) {
                userData.status = respond;
            });
            selectedOption(element(by.model('userEdited.group'))).getText().then(function(respond) {
                userData.group = respond;
            });

            var dealerData = {};
            selectedOption(element(by.model('dealerEdited.manager'))).getText().then(function(respond) {
                dealerData.manager = respond;
            });
            selectedOption(element(by.model('dealerEdited.billingCompany'))).getText().then(function(respond) {
                dealerData.billingCompany = respond;
            });
            element(by.model('dealerEdited.companyName')).getAttribute('value').then(function(respond) {
                dealerData.companyName = respond;
            });
            selectedOption(element(by.model('dealerEdited.city'))).getText().then(function(respond) {
                dealerData.city = respond;
            });
            selectedOption(element(by.model('dealerEdited.market'))).getText().then(function(respond) {
                dealerData.market = respond;
            });
            selectedOption(element(by.model('dealerEdited.metro'))).getText().then(function(respond) {
                dealerData.metro = respond;
            });
            element(by.model('dealerEdited.address')).getAttribute('value').then(function(respond) {
                dealerData.address = respond;
            });
            element(by.model('dealerEdited.fax')).getAttribute('value').then(function(respond) {
                dealerData.fax = respond;
            });
            element(by.model('dealerEdited.email')).getAttribute('value').then(function(respond) {
                dealerData.email = respond;
            });
            element(by.model('dealerEdited.url')).getAttribute('value').then(function(respond) {
                dealerData.url = respond;
            });
            element(by.model('dealerEdited.contactName')).getAttribute('value').then(function(respond) {
                dealerData.contactName = respond;
            });

            element.all(by.model('phone.phoneNumber')).get(0).getAttribute('value').then(function(respond) {
                dealerData.phone = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_from_0'))).getText().then(function(respond) {
                dealerData.phoneFrom = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_to_0'))).getText().then(function(respond) {
                dealerData.phoneTo = respond;
            });
            element.all(by.model('phone.phoneNumber')).get(1).getAttribute('value').then(function(respond) {
                dealerData.phone2 = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_from_1'))).getText().then(function(respond) {
                dealerData.phone2From = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_to_1'))).getText().then(function(respond) {
                dealerData.phone2To = respond;
            });
            element.all(by.model('phone.phoneNumber')).get(2).getAttribute('value').then(function(respond) {
                dealerData.phone3 = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_from_2'))).getText().then(function(respond) {
                dealerData.phone3From = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_to_2'))).getText().then(function(respond) {
                dealerData.phone3To = respond;
            });

            element(by.model('dealerEdited.companyInfo')).getAttribute('value').then(function(respond) {
                dealerData.companyInfo = respond;
            });

            element(by.id('UserEditSaveUser')).click();

            element.all(usersSelector.column('user.email')).get(0).getText().then(function(respond) {
                expect(respond).toBe(userData.email);
            });
            element.all(usersSelector.column('user.lastLogin')).get(0).getText().then(function(respond) {
                expect(respond).toBeFalsy();
            });
            element.all(usersSelector.column('user.id')).get(0).getText().then(function(respond) {
                userData.idText = respond;
            });
            element(by.id('savedUserListNotice')).getText().then(function(noticeText) {
                expect(noticeText).toBe('Сохранён пользователь с идентификатором: ' + userData.idText);
            });

            element.all(usersSelector.column('user.email')).get(0).click();

            element(by.model('userEdited.email')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(userData.email);
            });
            selectedOption(element(by.model('userEdited.status'))).getText().then(function(respond) {
                expect(respond).toBe(userData.status);
            });
            selectedOption(element(by.model('userEdited.group'))).getText().then(function(respond) {
                expect(respond).toBe(userData.group);
            });

            selectedOption(element(by.model('dealerEdited.manager'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.manager);
            });
            selectedOption(element(by.model('dealerEdited.billingCompany'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.billingCompany);
            });
            element(by.model('dealerEdited.companyName')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.companyName);
            });
            selectedOption(element(by.model('dealerEdited.city'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.city);
            });
            selectedOption(element(by.model('dealerEdited.market'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.market);
            });
            selectedOption(element(by.model('dealerEdited.metro'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.metro);
            });

            element(by.model('dealerEdited.address')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.address);
            });
            element(by.model('dealerEdited.fax')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.fax);
            });
            element(by.model('dealerEdited.email')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.email);
            });
            element(by.model('dealerEdited.url')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.url);
            });
            element(by.model('dealerEdited.contactName')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.contactName);
            });

            element.all(by.model('phone.phoneNumber')).get(0).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.phone);
            });
            selectedOption(element(by.id('user_dealer_phone_from_0'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phoneFrom);
            });
            selectedOption(element(by.id('user_dealer_phone_to_0'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phoneTo);
            });
            element.all(by.model('phone.phoneNumber')).get(1).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.phone2);
            });
            selectedOption(element(by.id('user_dealer_phone_from_1'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phone2From);
            });
            selectedOption(element(by.id('user_dealer_phone_to_1'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phone2To);
            });
            element.all(by.model('phone.phoneNumber')).get(2).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.phone3);
            });
            selectedOption(element(by.id('user_dealer_phone_from_2'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phone3From);
            });
            selectedOption(element(by.id('user_dealer_phone_to_2'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phone3To);
            });

            element(by.model('dealerEdited.companyInfo')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.companyInfo);
            });

            element(by.id('UserEditCancel')).click();
            // изменение

            var userData = {};
            element.all(usersSelector.column('user.id')).get(0).getText().then(function(respond) {
                userData.id = respond;
            });
            element.all(usersSelector.column('user.lastLogin')).get(0).getText().then(function(respond) {
                userData.lastLogin = respond;
            });

            element.all(usersSelector.column('user.email')).get(0).click();

            element(by.model('userEdited.email')).clear();
            element(by.model('userEdited.email')).sendKeys(randomMillion() + '@protractor.ru');
            setSelect(element(by.model('userEdited.status')), 1);

            setSelect(element(by.model('dealerEdited.manager')), 2);
            setSelect(element(by.model('dealerEdited.billingCompany')), 2);

            element(by.model('dealerEdited.companyName')).sendKeys('1');
            setSelect(element(by.model('dealerEdited.city')), 2);
            setSelect(element(by.model('dealerEdited.market')), 2);
            setSelect(element(by.model('dealerEdited.metro')), 2);
            element(by.model('dealerEdited.address')).sendKeys('1');
            element(by.model('dealerEdited.fax')).clear();
            element(by.model('dealerEdited.email')).clear();
            element(by.model('dealerEdited.url')).clear();
            element(by.model('dealerEdited.contactName')).clear();

            element.all(by.model('phone.phoneNumber')).get(0).clear();
            setSelect(element.all(by.model('phone.phoneFrom')).get(0), 0);
            setSelect(element.all(by.model('phone.phoneTo')).get(0), 0);
            element.all(by.model('phone.phoneNumber')).get(1).clear();
            setSelect(element.all(by.model('phone.phoneFrom')).get(1), 0);
            setSelect(element.all(by.model('phone.phoneTo')).get(1), 0);
            element.all(by.model('phone.phoneNumber')).get(2).clear();
            setSelect(element.all(by.model('phone.phoneFrom')).get(2), 0);
            setSelect(element.all(by.model('phone.phoneTo')).get(2), 0);

            element(by.model('dealerEdited.companyInfo')).clear();

            element(by.model('userEdited.email')).getAttribute('value').then(function(respond) {
                userData.email = respond;
            });
            selectedOption(element(by.model('userEdited.status'))).getText().then(function(respond) {
                userData.status = respond;
            });
            selectedOption(element(by.model('userEdited.group'))).getText().then(function(respond) {
                userData.group = respond;
            });

            var dealerData = {};
            selectedOption(element(by.model('dealerEdited.manager'))).getText().then(function(respond) {
                dealerData.manager = respond;
            });
            selectedOption(element(by.model('dealerEdited.billingCompany'))).getText().then(function(respond) {
                dealerData.billingCompany = respond;
            });
            element(by.model('dealerEdited.companyName')).getAttribute('value').then(function(respond) {
                dealerData.companyName = respond;
            });
            selectedOption(element(by.model('dealerEdited.city'))).getText().then(function(respond) {
                dealerData.city = respond;
            });
            selectedOption(element(by.model('dealerEdited.market'))).getText().then(function(respond) {
                dealerData.market = respond;
            });
            selectedOption(element(by.model('dealerEdited.metro'))).getText().then(function(respond) {
                dealerData.metro = respond;
            });
            element(by.model('dealerEdited.address')).getAttribute('value').then(function(respond) {
                dealerData.address = respond;
            });
            element(by.model('dealerEdited.fax')).getAttribute('value').then(function(respond) {
                dealerData.fax = respond;
            });
            element(by.model('dealerEdited.email')).getAttribute('value').then(function(respond) {
                dealerData.email = respond;
            });
            element(by.model('dealerEdited.url')).getAttribute('value').then(function(respond) {
                dealerData.url = respond;
            });
            element(by.model('dealerEdited.contactName')).getAttribute('value').then(function(respond) {
                dealerData.contactName = respond;
            });

            element.all(by.model('phone.phoneNumber')).get(0).getAttribute('value').then(function(respond) {
                dealerData.phone = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_from_0'))).getText().then(function(respond) {
                dealerData.phoneFrom = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_to_0'))).getText().then(function(respond) {
                dealerData.phoneTo = respond;
            });
            element.all(by.model('phone.phoneNumber')).get(1).getAttribute('value').then(function(respond) {
                dealerData.phone2 = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_from_1'))).getText().then(function(respond) {
                dealerData.phone2From = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_to_1'))).getText().then(function(respond) {
                dealerData.phone2To = respond;
            });
            element.all(by.model('phone.phoneNumber')).get(2).getAttribute('value').then(function(respond) {
                dealerData.phone3 = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_from_2'))).getText().then(function(respond) {
                dealerData.phone3From = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_to_2'))).getText().then(function(respond) {
                dealerData.phone3To = respond;
            });

            element(by.model('dealerEdited.companyInfo')).getAttribute('value').then(function(respond) {
                dealerData.companyInfo = respond;
            });

            element(by.id('UserEditSaveUser')).click();

            element(by.id('savedUserListNotice')).getText().then(function(noticeText) {
                expect(noticeText).toBe('Сохранён пользователь с идентификатором: ' + userData.id);
            });

            element.all(usersSelector.column('user.email')).get(0).getText().then(function(respond) {
                expect(respond).toBe(userData.email);
            });
            element.all(usersSelector.column('user.lastLogin')).get(0).getText().then(function(respond) {
                expect(respond).toBe(userData.lastLogin);
            });
            element.all(usersSelector.column('user.id')).get(0).getText().then(function(respond) {
                expect(respond).toBe(userData.id);
            });
            element.all(usersSelector.column('user.email')).get(0).click();

            element(by.model('userEdited.email')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(userData.email);
            });
            selectedOption(element(by.model('userEdited.status'))).getText().then(function(respond) {
                expect(respond).toBe(userData.status);
            });
            selectedOption(element(by.model('userEdited.group'))).getText().then(function(respond) {
                expect(respond).toBe(userData.group);
            });

            selectedOption(element(by.model('dealerEdited.manager'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.manager);
            });
            selectedOption(element(by.model('dealerEdited.billingCompany'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.billingCompany);
            });
            element(by.model('dealerEdited.companyName')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.companyName);
            });
            selectedOption(element(by.model('dealerEdited.city'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.city);
            });
            selectedOption(element(by.model('dealerEdited.market'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.market);
            });
            selectedOption(element(by.model('dealerEdited.metro'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.metro);
            });

            element(by.model('dealerEdited.address')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.address);
            });
            element(by.model('dealerEdited.fax')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.fax);
            });
            element(by.model('dealerEdited.email')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.email);
            });
            element(by.model('dealerEdited.url')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.url);
            });
            element(by.model('dealerEdited.contactName')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.contactName);
            });

            element.all(by.model('phone.phoneNumber')).get(0).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.phone);
            });
            selectedOption(element(by.id('user_dealer_phone_from_0'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phoneFrom);
            });
            selectedOption(element(by.id('user_dealer_phone_to_0'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phoneTo);
            });
            element.all(by.model('phone.phoneNumber')).get(1).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.phone2);
            });
            selectedOption(element(by.id('user_dealer_phone_from_1'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phone2From);
            });
            selectedOption(element(by.id('user_dealer_phone_to_1'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phone2To);
            });
            element.all(by.model('phone.phoneNumber')).get(2).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.phone3);
            });
            selectedOption(element(by.id('user_dealer_phone_from_2'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phone3From);
            });
            selectedOption(element(by.id('user_dealer_phone_to_2'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phone3To);
            });

            element(by.model('dealerEdited.companyInfo')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.companyInfo);
            });
        });

        it('Создание пользователя-сайта', function() {
            var usersSelector = by.repeater('user in users');
            element(by.id('UserListAddUserUp')).click();

            element(by.model('userEdited.email')).sendKeys(randomMillion() + '@protractor.ru');
            element(by.model('userEdited.password')).sendKeys('123');
            element(by.model('userPasswordConfirm')).sendKeys('123');
            setSelect(element(by.model('userEdited.group')), 3);
            setSelect(element(by.model('userEdited.site')), 1);

            var userData = {};
            element(by.model('userEdited.email')).getAttribute('value').then(function(respond) {
                userData.email = respond;
            });
            selectedOption(element(by.model('userEdited.status'))).getText().then(function(respond) {
                userData.status = respond;
            });
            selectedOption(element(by.model('userEdited.group'))).getText().then(function(respond) {
                userData.group = respond;
            });
            selectedOption(element(by.model('userEdited.site'))).getText().then(function(respond) {
                userData.site = respond;
            });

            element(by.id('UserEditSaveUser')).click();

            element.all(usersSelector.column('user.email')).get(0).getText().then(function(respond) {
                expect(respond).toBe(userData.email);
            });
            element.all(usersSelector.column('user.lastLogin')).get(0).getText().then(function(respond) {
                expect(respond).toBeFalsy();
            });
            element.all(usersSelector.column('user.id')).get(0).getText().then(function(respond) {
                userData.idText = respond;
            });
            element(by.id('savedUserListNotice')).getText().then(function(noticeText) {
                expect(noticeText).toBe('Сохранён пользователь с идентификатором: ' + userData.idText);
            });

            element.all(usersSelector.column('user.email')).get(0).click();

            element(by.model('userEdited.email')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(userData.email);
            });
            selectedOption(element(by.model('userEdited.status'))).getText().then(function(respond) {
                expect(respond).toBe(userData.status);
            });
            selectedOption(element(by.model('userEdited.group'))).getText().then(function(respond) {
                expect(respond).toBe(userData.group);
            });
            selectedOption(element(by.model('userEdited.site'))).getText().then(function(respond) {
                expect(respond).toBe(userData.site);
            });
        });

        it('Изменение пользователя-администратора (с превращением в сайт)', function() {
            var usersSelector = by.repeater('user in users');
            var usersData = {};
            expect(element.all(usersSelector).count()).toBeTruthy();
            mapText(element.all(usersSelector.column('user.group'))).then(function(respond) {
                usersData.group = respond;
            });

            var count;
            var userData = {};
            browser.controlFlow().execute(function() {
                count = _.indexOf(usersData.group, 'Администратор');
                expect(count).not.toBe(-1);
                element.all(usersSelector.column('user.lastLogin')).get(count).getText().then(function(respond) {
                    userData.lastLogin = respond;
                });
                element.all(usersSelector.column('user.email')).get(count).click();
            });

            element(by.model('userEdited.email')).clear();
            element(by.model('userEdited.email')).sendKeys(randomMillion() + '@protractor.ru');
            setSelect(element(by.model('userEdited.status')), 2);
            setSelect(element(by.model('userEdited.group')), 3);
            setSelect(element(by.model('userEdited.site')), 1);

            element(by.model('userEdited.email')).getAttribute('value').then(function(respond) {
                userData.email = respond;
            });
            selectedOption(element(by.model('userEdited.status'))).getText().then(function(respond) {
                userData.status = respond;
            });
            selectedOption(element(by.model('userEdited.group'))).getText().then(function(respond) {
                userData.group = respond;
            });
            selectedOption(element(by.model('userEdited.site'))).getText().then(function(respond) {
                userData.site = respond;
            });

            element(by.id('UserEditSaveUser')).click();

            browser.controlFlow().execute(function() {
                element.all(usersSelector.column('user.email')).get(count).getText().then(function(respond) {
                    expect(respond).toBe(userData.email);
                });
                element.all(usersSelector.column('user.lastLogin')).get(count).getText().then(function(respond) {
                    expect(respond).toBe(userData.lastLogin);
                });
                element.all(usersSelector.column('user.id')).get(count).getText().then(function(respond) {
                    userData.idText = respond;
                });
            });
            element(by.id('savedUserListNotice')).getText().then(function(noticeText) {
                expect(noticeText).toBe('Сохранён пользователь с идентификатором: ' + userData.idText);
            });

            browser.controlFlow().execute(function() {
                element.all(usersSelector.column('user.email')).get(count).click();
            });

            element(by.model('userEdited.email')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(userData.email);
            });
            selectedOption(element(by.model('userEdited.status'))).getText().then(function(respond) {
                expect(respond).toBe(userData.status);
            });
            selectedOption(element(by.model('userEdited.group'))).getText().then(function(respond) {
                expect(respond).toBe(userData.group);
            });
            selectedOption(element(by.model('userEdited.site'))).getText().then(function(respond) {
                expect(respond).toBe(userData.site);
            });
        });

        it('Изменение пользователя-дилера', function() {
            var usersSelector = by.repeater('user in users');
            var usersData = {};
            expect(element.all(usersSelector).count()).toBeTruthy();
            mapText(element.all(usersSelector.column('user.group'))).then(function(respond) {
                usersData.group = _.map(respond, function(value) {
                    var group = value.replace(regexpUserGroupName, '$1');
                    return group;
                });
            });

            var count;
            var userData = {};
            browser.controlFlow().execute(function() {
                count = _.indexOf(usersData.group, 'Автосалон');
                expect(count).not.toBe(-1);
                element.all(usersSelector.column('user.id')).get(count).getText().then(function(respond) {
                    userData.id = respond;
                });
                element.all(usersSelector.column('user.lastLogin')).get(count).getText().then(function(respond) {
                    userData.lastLogin = respond;
                });
                element.all(usersSelector.column('user.email')).get(count).click();
            });

            element(by.model('userEdited.email')).clear();
            element(by.model('userEdited.email')).sendKeys(randomMillion() + '@protractor.ru');
            setSelect(element(by.model('userEdited.status')), 0);

            setSelect(element(by.model('dealerEdited.manager')), 2);
            setSelect(element(by.model('dealerEdited.billingCompany')), 2);

            element(by.model('dealerEdited.companyName')).sendKeys('1');
            setSelect(element(by.model('dealerEdited.city')), 2);
            setSelect(element(by.model('dealerEdited.market')), 2);
            setSelect(element(by.model('dealerEdited.metro')), 2);
            element(by.model('dealerEdited.address')).sendKeys('1');
            element(by.model('dealerEdited.fax')).clear();
            element(by.model('dealerEdited.email')).clear();
            element(by.model('dealerEdited.url')).clear();
            element(by.model('dealerEdited.contactName')).clear();

            element.all(by.model('phone.phoneNumber')).get(0).clear();
            setSelect(element.all(by.model('phone.phoneFrom')).get(0), 0);
            setSelect(element.all(by.model('phone.phoneTo')).get(0), 0);
            element.all(by.model('phone.phoneNumber')).get(1).clear();
            setSelect(element.all(by.model('phone.phoneFrom')).get(1), 0);
            setSelect(element.all(by.model('phone.phoneTo')).get(1), 0);
            element.all(by.model('phone.phoneNumber')).get(2).clear();
            setSelect(element.all(by.model('phone.phoneFrom')).get(2), 0);
            setSelect(element.all(by.model('phone.phoneTo')).get(2), 0);

            element(by.model('dealerEdited.companyInfo')).clear();

            element(by.model('userEdited.email')).getAttribute('value').then(function(respond) {
                userData.email = respond;
            });
            selectedOption(element(by.model('userEdited.status'))).getText().then(function(respond) {
                userData.status = respond;
            });
            selectedOption(element(by.model('userEdited.group'))).getText().then(function(respond) {
                userData.group = respond;
            });

            var dealerData = {};
            selectedOption(element(by.model('dealerEdited.manager'))).getText().then(function(respond) {
                dealerData.manager = respond;
            });
            selectedOption(element(by.model('dealerEdited.billingCompany'))).getText().then(function(respond) {
                dealerData.billingCompany = respond;
            });
            element(by.model('dealerEdited.companyName')).getAttribute('value').then(function(respond) {
                dealerData.companyName = respond;
            });
            selectedOption(element(by.model('dealerEdited.city'))).getText().then(function(respond) {
                dealerData.city = respond;
            });
            selectedOption(element(by.model('dealerEdited.market'))).getText().then(function(respond) {
                dealerData.market = respond;
            });
            selectedOption(element(by.model('dealerEdited.metro'))).getText().then(function(respond) {
                dealerData.metro = respond;
            });
            element(by.model('dealerEdited.address')).getAttribute('value').then(function(respond) {
                dealerData.address = respond;
            });
            element(by.model('dealerEdited.fax')).getAttribute('value').then(function(respond) {
                dealerData.fax = respond;
            });
            element(by.model('dealerEdited.email')).getAttribute('value').then(function(respond) {
                dealerData.email = respond;
            });
            element(by.model('dealerEdited.url')).getAttribute('value').then(function(respond) {
                dealerData.url = respond;
            });
            element(by.model('dealerEdited.contactName')).getAttribute('value').then(function(respond) {
                dealerData.contactName = respond;
            });

            element.all(by.model('phone.phoneNumber')).get(0).getAttribute('value').then(function(respond) {
                dealerData.phone = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_from_0'))).getText().then(function(respond) {
                dealerData.phoneFrom = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_to_0'))).getText().then(function(respond) {
                dealerData.phoneTo = respond;
            });
            element.all(by.model('phone.phoneNumber')).get(1).getAttribute('value').then(function(respond) {
                dealerData.phone2 = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_from_1'))).getText().then(function(respond) {
                dealerData.phone2From = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_to_1'))).getText().then(function(respond) {
                dealerData.phone2To = respond;
            });
            element.all(by.model('phone.phoneNumber')).get(2).getAttribute('value').then(function(respond) {
                dealerData.phone3 = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_from_2'))).getText().then(function(respond) {
                dealerData.phone3From = respond;
            });
            selectedOption(element(by.id('user_dealer_phone_to_2'))).getText().then(function(respond) {
                dealerData.phone3To = respond;
            });

            element(by.model('dealerEdited.companyInfo')).getAttribute('value').then(function(respond) {
                dealerData.companyInfo = respond;
            });

            element(by.id('UserEditSaveUser')).click();

            element(by.id('savedUserListNotice')).getText().then(function(noticeText) {
                expect(noticeText).toBe('Сохранён пользователь с идентификатором: ' + userData.id);
            });

            browser.controlFlow().execute(function() {
                element.all(usersSelector.column('user.email')).get(count).getText().then(function(respond) {
                    expect(respond).toBe(userData.email);
                });
                element.all(usersSelector.column('user.lastLogin')).get(count).getText().then(function(respond) {
                    expect(respond).toBe(userData.lastLogin);
                });
                element.all(usersSelector.column('user.id')).get(count).getText().then(function(respond) {
                    expect(respond).toBe(userData.id);
                });
                element.all(usersSelector.column('user.email')).get(count).click();
            });

            element(by.model('userEdited.email')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(userData.email);
            });
            selectedOption(element(by.model('userEdited.status'))).getText().then(function(respond) {
                expect(respond).toBe(userData.status);
            });
            selectedOption(element(by.model('userEdited.group'))).getText().then(function(respond) {
                expect(respond).toBe(userData.group);
            });

            selectedOption(element(by.model('dealerEdited.manager'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.manager);
            });
            selectedOption(element(by.model('dealerEdited.billingCompany'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.billingCompany);
            });
            element(by.model('dealerEdited.companyName')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.companyName);
            });
            selectedOption(element(by.model('dealerEdited.city'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.city);
            });
            selectedOption(element(by.model('dealerEdited.market'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.market);
            });
            selectedOption(element(by.model('dealerEdited.metro'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.metro);
            });

            element(by.model('dealerEdited.address')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.address);
            });
            element(by.model('dealerEdited.fax')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.fax);
            });
            element(by.model('dealerEdited.email')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.email);
            });
            element(by.model('dealerEdited.url')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.url);
            });
            element(by.model('dealerEdited.contactName')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.contactName);
            });

            element.all(by.model('phone.phoneNumber')).get(0).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.phone);
            });
            selectedOption(element(by.id('user_dealer_phone_from_0'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phoneFrom);
            });
            selectedOption(element(by.id('user_dealer_phone_to_0'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phoneTo);
            });
            element.all(by.model('phone.phoneNumber')).get(1).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.phone2);
            });
            selectedOption(element(by.id('user_dealer_phone_from_1'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phone2From);
            });
            selectedOption(element(by.id('user_dealer_phone_to_1'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phone2To);
            });
            element.all(by.model('phone.phoneNumber')).get(2).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.phone3);
            });
            selectedOption(element(by.id('user_dealer_phone_from_2'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phone3From);
            });
            selectedOption(element(by.id('user_dealer_phone_to_2'))).getText().then(function(respond) {
                expect(respond).toBe(dealerData.phone3To);
            });

            element(by.model('dealerEdited.companyInfo')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerData.companyInfo);
            });
        });
    });
});

describe('Sale App', function() {

    describe('Одиночный выбор значений, загружаемых с сервера', function() {
        beforeEach(function() {
            browser.get('admin.html#/salelist?archive=true&type=card&orders=date;-id&itemsPerPage=15');
        });

        it('заменяет в карточке дилера с помощью загружающего контрола', function() {
            mapIsDisplayed(element.all(by.id('SaleListRowRemove'))).then(function(isDisplayedArray) {
                var saleIdx = isDisplayedArray.indexOf(true);
                expect(saleIdx).not.toBe(-1);
                element.all(by.id('SaleListRowEdit')).get(saleIdx).click();
            });

            var dealerElem = element(by.model('saleEdited.dealer'));
            var selectedElems = dealerElem.all(by.repeater('choice in _selectedChoices'));
            var searchElem = dealerElem.element(by.id('McomboSearchInput'));
            var dropElems = dealerElem.all(by.id('McomboDropChoiceItem'));
            var noResultsElem = dealerElem.element(by.css('.no-results'));

            // показывает контрол в исходном состоянии
            expect(selectedElems.count()).toBe(1);
            expect(searchElem.isDisplayed()).toBeTruthy();
            expect(searchElem.isEnabled()).toBeTruthy();
            expect(searchElem.getAttribute('value')).toBeFalsy();
            expect(dropElems.count()).toBeFalsy();
            expect(noResultsElem.isDisplayed()).toBeFalsy();

            // заполняет и показывает начальный список вариантов и ставит маркер на верхний
            searchElem.click();
            expect(dropElems.count()).toBeTruthy();
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeTruthy();
                });
            });
            expect(dropElems.count()).not.toBeLessThan(2);
            mapText(dropElems).then(function(dropTexts) {
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
            });

            // изменяет список вариантов
            mapText(dropElems).then(function(preDrops) {
                searchElem.sendKeys('3');
                mapText(dropElems).then(function(newDrops) {
                    expect(_.isEqual(newDrops, preDrops)).toBeFalsy();
                });
            });

            // выводит пустой список вариантов и надпись "Нет вариантов"
            searchElem.sendKeys('999');
            expect(dropElems.count()).toBeFalsy();
            expect(noResultsElem.isDisplayed()).toBeTruthy();

            // убирает надпись "Нет вариантов"
            searchElem.sendKeys(protractor.Key.BACK_SPACE + protractor.Key.BACK_SPACE + protractor.Key.BACK_SPACE);
            expect(dropElems.count()).toBeTruthy();
            expect(noResultsElem.isDisplayed()).toBeFalsy();

            // двигает маркер вниз и вверх в пределах списка
            mapText(dropElems).then(function(dropTexts) {
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
                searchElem.sendKeys(protractor.Key.ARROW_DOWN);
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[1]);
                });
                searchElem.sendKeys(protractor.Key.ARROW_UP);
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
                searchElem.sendKeys(protractor.Key.ARROW_UP);
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
            });

            // выбирает значение с помощью клавиатуры, скрывает список вариантов, очищает фильтр
            dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                searchElem.sendKeys(protractor.Key.ENTER);
                expect(selectedElems.count()).toBe(1);
                mapText(selectedElems).then(function(selectedTexts) {
                    expect(selectedTexts[0]).toBe(hoverText);
                });
            });
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeFalsy();
                });
            });
            expect(searchElem.getAttribute('value')).toBeFalsy();

            // удаляет значение с помощью мыши, не показывая список вариантов
            selectedElems.get(0).click();
            expect(selectedElems.count()).toBe(0);
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeFalsy();
                });
            });

            // показывает список вариантов и скрывает его по нажатию Esc
            searchElem.click();
            expect(dropElems.count()).toBeTruthy();
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeTruthy();
                });
            });
            searchElem.sendKeys(protractor.Key.ESCAPE);
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeFalsy();
                });
            });
        });
    });

    describe('Множественный выбор значений, загружаемых с сервера', function() {
        beforeEach(function() {
            browser.get('admin.html#/salelist?dealers=3');
        });

        it('выбирает несколько дилеров с помощью загружающего контрола', function() {
            var dealerElem = element(by.model('patterns.dealers'));
            var selectedElems = dealerElem.all(by.repeater('choice in _selectedChoices'));
            var searchElem = dealerElem.element(by.id('McomboSearchInput'));
            var dropElems = dealerElem.all(by.id('McomboDropChoiceItem'));
            var noResultsElem = dealerElem.element(by.css('.no-results'));

            // показывает контрол в исходном состоянии
            expect(selectedElems.count()).toBe(1);
            expect(searchElem.isDisplayed()).toBeTruthy();
            expect(searchElem.isEnabled()).toBeTruthy();
            expect(searchElem.getAttribute('value')).toBeFalsy();
            expect(dropElems.count()).toBeFalsy();
            expect(noResultsElem.isDisplayed()).toBeFalsy();

            // заполняет и показывает начальный список вариантов и ставит маркер на верхний
            searchElem.click();
            expect(dropElems.count()).toBeTruthy();
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeTruthy();
                });
            });
            expect(dropElems.count()).not.toBeLessThan(2);
            mapText(dropElems).then(function(dropTexts) {
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
            });

            // изменяет список вариантов
            mapText(dropElems).then(function(preDrops) {
                searchElem.sendKeys('3');
                mapText(dropElems).then(function(newDrops) {
                    expect(_.isEqual(newDrops, preDrops)).toBeFalsy();
                });
            });

            // выводит пустой список вариантов и надпись "Нет вариантов"
            searchElem.sendKeys('999');
            expect(dropElems.count()).toBeFalsy();
            expect(noResultsElem.isDisplayed()).toBeTruthy();

            // убирает надпись "Нет вариантов"
            searchElem.sendKeys(protractor.Key.BACK_SPACE + protractor.Key.BACK_SPACE + protractor.Key.BACK_SPACE);
            expect(dropElems.count()).toBeTruthy();
            expect(noResultsElem.isDisplayed()).toBeFalsy();

            // двигает маркер вниз и вверх в пределах списка
            mapText(dropElems).then(function(dropTexts) {
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
                searchElem.sendKeys(protractor.Key.ARROW_DOWN);
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[1]);
                });
                searchElem.sendKeys(protractor.Key.ARROW_UP);
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
                searchElem.sendKeys(protractor.Key.ARROW_UP);
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
            });

            // выбирает значение с помощью клавиатуры, скрывает список вариантов, очищает фильтр
            dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                searchElem.sendKeys(protractor.Key.ENTER);
                expect(selectedElems.count()).toBe(2);
                mapText(selectedElems).then(function(selectedTexts) {
                    expect(selectedTexts[1]).toBe(hoverText);
                });
            });
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeFalsy();
                });
            });
            expect(searchElem.getAttribute('value')).toBeFalsy();

            // удаляет значение с помощью мыши, не показывая список вариантов
            selectedElems.get(0).click();
            expect(selectedElems.count()).toBe(1);
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeFalsy();
                });
            });

            // показывает список вариантов и скрывает его по нажатию Esc
            searchElem.click();
            expect(dropElems.count()).toBeTruthy();
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeTruthy();
                });
            });
            searchElem.sendKeys(protractor.Key.ESCAPE);
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeFalsy();
                });
            });
        });
    });

    describe('Список продаж', function() {
        beforeEach(function() {
            browser.get('admin.html#/salelist?archive=true&itemsPerPage=15');
        });

        it('показывает количество продаж', function() {
            expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/\d+$/);
        });

        it('переходит по верхней кнопке создания карточки', function() {
            element.all(by.id('SaleListAddSaleUp')).get(0).click();
            expect(browser.getLocationAbsUrl()).toMatch(/#\/sale\/card\?id=new$/);
        });

        it('переходит по нижней кнопке создания карточки', function() {
            element.all(by.id('SaleListAddSaleDown')).get(0).click();
            expect(browser.getLocationAbsUrl()).toMatch(/#\/sale\/card\?id=new$/);
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
                return parseFloatRu(this);
            }

            function takeDate() {
                return this.replace(regexpDate, '20$3-$2-$1');
            }

            function takeId() {
                return _.parseInt(this.replace(regexpIdName,'$1'));
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
            element.all(sales).each(function(sale) {
                expect(sale.element(by.binding('sale.date')).getText()).toMatch(regexpDate);
                expect(sale.element(by.binding('sale.dealer.id')).getText()).toMatch(regexpIdName);
                expect(sale.element(by.binding('sale.site.id')).getText()).toMatch(regexpIdName);
                expect(sale.element(by.binding('sale.type')).getText()).toMatch(/^(Осн|Расш|Доп)$/);
                expect(sale.element(by.binding('sale.count')).getText()).toMatchOrEmpty(regexpInt);
                expect(sale.element(by.binding('sale.activeFrom')).getText()).toMatch(regexpDate);
                expect(sale.element(by.binding('sale.activeTo')).getText()).toMatch(regexpDate);
                expect(sale.element(by.binding('sale.amount')).getText()).toMatch(regexpFloatRu);
                expect(sale.element(by.binding('sale.siteAmount')).getText()).toMatch(regexpFloatRu);
                expect(sale.element(by.binding('sale.isActive')).getText()).toMatchOrEmpty(/^(А|Н\/А)$/);
                expect(sale.getText()).toMatch(/(Осн(?=[\s\S]+доплатить))|(Расш(?![\s\S]+доплатить))|(Доп(?![\s\S]+доплатить))/);
                expect(sale.getText()).toMatch(/(Осн)|(Расш)|(Доп(?![\s\S]+расширить))/);
            });
        });

        it('переходит к url изменения продажи по ссылке в "изменить"', function() {
            var sales = by.repeater('sale in sales');
            element.all(sales).count().then(function(count) {
                for(var i = count; i--; ) {
                    element.all(by.id('SaleListRowEdit')).get(i).click();
                    expect(browser.getLocationAbsUrl()).toMatch(/#\/sale\//);
                    element(by.id('saleEditCancel')).click();
                }
            });
        });

        it('переходит к url создания расширения для карточки по ссылке в "расширить"', function() {
            var setElem = element(by.model('patterns.type'));
            setSelect(setElem, 1);
            element.all(by.id('SaleListTableHeaderRef')).get(6).click();
            var saleAdd = element.all(by.id('SaleListRowAdd'));
            mapIsDisplayed(saleAdd).then(function(displayed) {
                var saleIdx = displayed.indexOf(true);
                expect(saleIdx).not.toBe(-1);
                saleAdd.get(saleIdx).click();
                expect(browser.getLocationAbsUrl()).toMatch(/#\/sale\/addcard\?id=new&cardId=\d+/);
            });
        });

        it('переходит к url создания расширения для расширения по ссылке в "расширить"', function() {
            setSelect(element(by.model('patterns.type')), 2);
            var saleAdd = element.all(by.id('SaleListRowAdd'));
            mapIsDisplayed(saleAdd).then(function(displayed) {
                var saleIdx = displayed.indexOf(true);
                expect(saleIdx).not.toBe(-1);
                saleAdd.get(saleIdx).click();
                expect(browser.getLocationAbsUrl()).toMatch(/#\/sale\/addcard\?id=new&cardId=\d+/);
            });
        });

        it('переходит к url создания дополнительной продажи по ссылке в "доплатить"', function() {
            setSelect(element(by.model('patterns.type')), 1);
            var saleAdd = element.all(by.id('SaleListRowExtra'));
            mapIsDisplayed(saleAdd).then(function(displayed) {
                var saleIdx = displayed.indexOf(true);
                expect(saleIdx).not.toBe(-1);
                saleAdd.get(saleIdx).click();
                expect(browser.getLocationAbsUrl()).toMatch(/#\/sale\/extra\?id=new&cardId=\d+/);
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
            var dealerElem = element(by.model('patterns.dealers'));
            var searchElem = dealerElem.element(by.id('McomboSearchInput'));
            searchElem.click();
            searchElem.sendKeys('3');
            var dropElem = dealerElem.all(by.id('McomboDropChoiceItem')).get(2);
            dropElem.getText().then(function(selectedValue) {
                dropElem.click();
                expect(dealerElem.element(by.id('McomboSelectedItem_0')).getText()).toBe(selectedValue);
                mapText(element.all(by.repeater('sale in sales').column('sale.dealer.id'))).then(function(data) {
                    _.forEach(data, function(value) {
                        expect(value).toBe(selectedValue);
                    });
                });
            });
        });

        it('накладывает фильтр по сайту', function() {
            var siteElem = element(by.model('patterns.sites'));
            var searchElem = siteElem.element(by.id('McomboSearchInput'));
            searchElem.click();
            searchElem.sendKeys('17');
            var dropElem = siteElem.all(by.id('McomboDropChoiceItem')).get(0);
            dropElem.getText().then(function(selectedValue) {
                dropElem.click();
                expect(siteElem.element(by.id('McomboSelectedItem_0')).getText()).toBe(selectedValue);
                mapText(element.all(by.repeater('sale in sales').column('sale.site.id'))).then(function(data) {
                    _.forEach(data, function(value) {
                        expect(value).toBe(selectedValue);
                    });
                });
            });
        });

        it('накладывает фильтр по статусу true', function() {
            var setElem = element(by.model('patterns.isActive'));
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
            var setElem = element(by.model('patterns.isActive'));
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
            var setElem = element(by.model('patterns.type'));
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
            expect(archive.isSelected()).toBeTruthy();
            element.all(by.id('SaleListTableHeaderRef')).get(6).click();
            element.all(by.repeater('sale in sales').column('sale.activeTo')).get(0).getText().then(function(activeToText) {
                var activeTo = activeToText.replace(regexpDate, '20$3-$2-$1');
                var today = new Date().toISOString().slice(0, 10);
                expect(activeTo < today);
            });
        });

        it('сбрасывает фильтры по кнопке', function() {
            var dealerElem = element(by.model('patterns.dealers'));
            var dealerElemSearch = dealerElem.element(by.id('McomboSearchInput'));
            dealerElemSearch.click();
            dealerElemSearch.sendKeys('1');
            var dealerElemDrop = dealerElem.all(by.id('McomboDropChoiceItem')).get(0);
            dealerElemDrop.getText().then(function(selectedValue) {
                dealerElemDrop.click();
                expect(dealerElem.all(by.id('McomboSelectedItem_0')).get(0).getText()).toBe(selectedValue);
            });
            element(by.id('SaleListNumberSales')).click();

            var siteElem = element(by.model('patterns.sites'));
            var siteElemSearch = siteElem.element(by.id('McomboSearchInput'));
            siteElemSearch.click();
            siteElemSearch.sendKeys('1');
            var siteElemDrop = siteElem.all(by.id('McomboDropChoiceItem')).get(0);
            siteElemDrop.getText().then(function(selectedValue) {
                siteElemDrop.click();
                expect(siteElem.all(by.id('McomboSelectedItem_0')).get(0).getText()).toBe(selectedValue);
            });
            element(by.id('SaleListNumberSales')).click();

            var isActive = element(by.model('patterns.isActive'));
            setSelect(isActive, 1);
            expect(isActive.element(by.css('option:checked')).getText()).toBeTruthy();

            var type = element(by.model('patterns.type'));
            setSelect(type, 1);
            expect(type.element(by.css('option:checked')).getText()).toBeTruthy();

            var archive = element(by.model('patterns.archive'));
            expect(archive.isSelected()).toBeTruthy();

            element(by.id('SaleListFilterSetDefault')).click();
            expect(dealerElem.all(by.id('McomboSelectedItem_0')).count()).toBe(0);
            expect(siteElem.all(by.id('McomboSelectedItem_0')).count()).toBe(0);
            expect(isActive.element(by.css('option:checked')).getText()).toBe('Н\/А');
            expect(type.element(by.css('option:checked')).getText()).toBeFalsy();
            expect(archive.isSelected()).toBeFalsy();
        });
    });

    describe('Редактирование карточки', function() {
        beforeEach(function() {
            browser.get('admin.html#/salelist?archive=true&type=card&orders=date;-id&itemsPerPage=15');
            mapIsDisplayed(element.all(by.id('SaleListRowRemove'))).then(function(isDisplayedArray) {
                var saleIdx = isDisplayedArray.indexOf(true);
                expect(saleIdx).not.toBe(-1);
                element.all(by.id('SaleListRowEdit')).get(saleIdx).click();
            });
        });

        it('показывает начальные значения', function() {
            browser.waitForAngular();
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Изменение карточки$/);
            expect(element(by.model('saleEdited.dealer')).element(by.id('McomboSelectedItem_0')).getText()).toMatch(regexpIdName);
            expect(element(by.model('saleEdited.site')).element(by.id('McomboSelectedItem_0')).getText()).toMatch(regexpIdName);
            expect(element(by.model('tariffParent')).isDisplayed()).toBeFalsy();
            expect(selectedOption(element(by.model('saleEdited.tariff'))).getText()).toMatch(regexpTariff);
            expect(element(by.model('saleEdited.date')).getAttribute('value')).toMatch(regexpDateISO);
            expect(element(by.model('saleEdited.count')).getAttribute('value')).toMatchOrEmpty(regexpInt);
            expect(element(by.id('saleCountErrorPattern')).isDisplayed()).toBeFalsy();
            expect(element(by.model('saleEdited.activeFrom')).getAttribute('value')).toMatch(regexpDateISO);
            expect(element(by.model('saleEdited.activeTo')).getAttribute('value')).toMatch(regexpDateISO);
            expect(element(by.model('saleEdited.cardAmount')).getAttribute('value')).toMatch(regexpFloat);
            expect(element(by.model('saleEdited.amount')).getAttribute('value')).toMatch(regexpFloat);
            expect(element(by.model('saleEdited.siteAmount')).getAttribute('value')).toMatch(regexpFloat);
            expect(element(by.model('saleEdited.siteAmount')).getAttribute('value')).toBeTruthy();
            expect(selectedOption(element(by.model('saleEdited.isActive'))).getText()).toMatch(/^(А|Н\/А)$/);
        });

        it('выводит ошибку, если dealer пустой', function() {
            element(by.model('saleEdited.dealer')).element(by.id('McomboRemoveItem_0')).click();
            expect(element(by.id('saleEditDealerErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если site пустой', function() {
            element(by.model('saleEdited.site')).element(by.id('McomboRemoveItem_0')).click();
            expect(element(by.id('saleEditSiteErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('заполняет список тарифов', function() {
            mapText(getSelectOptions(element(by.model('saleEdited.tariff')))).then(function(options) {
                expect(_.compact(options).length).toBeTruthy();
            });
        });

        it('при выборе сайта перезаполняет список тарифов', function() {
            var tariffElem = element(by.model('saleEdited.tariff'));
            var tariffElemOptions = getSelectOptions(tariffElem);
            var siteElem = element(by.model('saleEdited.site'));
            var siteDropElems = siteElem.all(by.id('McomboDropChoiceItem'));

            var preTariffs;
            mapText(tariffElemOptions).then(function(tariffs) {
                preTariffs = tariffs;
            });

            var preSite;
            siteElem.element(by.id('McomboSelectedItem_0')).getText().then(function(selectedText) {
                preSite = selectedText;
                siteElem.element(by.id('McomboRemoveItem_0')).click();
                siteElem.element(by.id('McomboSearchInput')).click();
            });

            mapText(siteDropElems).then(function(dropTexts) {
                var newSiteIdx = _.findIndex(dropTexts, function(value) {
                    return value !== preSite;
                });
                expect(newSiteIdx).toBeDefined();
                siteDropElems.get(newSiteIdx).click();
            });

            mapText(tariffElemOptions).then(function(tariffs) {
                tariffs = _.compact(tariffs);
                expect(tariffs.length).toBeTruthy();
                _.forEach(tariffs, function(tariff) {
                    expect(tariff).toMatch(regexpTariff);
                });
                expect(_.intersection(tariffs, preTariffs).length).toBe(0);
            });
        });

        it('выводит ошибку, если date пустое', function() {
            browser.waitForAngular();
            clearDate('saleDate', 'saleEdited.date');
            expect(element(by.id('saleDateErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если count отрицательный', function() {
            var count = element(by.model('saleEdited.count'));
            count.clear();
            count.sendKeys('-1');
            expect(element(by.id('saleCountErrorPattern')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если count ноль', function() {
            var count = element(by.model('saleEdited.count'));
            count.clear();
            count.sendKeys('0');
            expect(element(by.id('saleCountErrorPattern')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если count содержит не цифры', function() {
            var count = element(by.model('saleEdited.count'));
            count.clear();
            count.sendKeys('1.1');
            expect(element(by.id('saleCountErrorPattern')).isDisplayed()).toBeTruthy();
        });

        it('выводит предупреждение, если count отличается от tariff.count', function() {
            selectedOption(element(by.model('saleEdited.tariff'))).getText().then(function(tariffText) {
                var tariffCount = _.parseInt(tariffText.replace(regexpTariff, '$4'));
                var countElem = element(by.model('saleEdited.count'));
                countElem.clear();
                countElem.sendKeys(tariffCount.toString() + '1');
                expect(element(by.id('saleEditCountWarningDifferent')).isDisplayed()).toBeTruthy();
            })
        });

        it('выводит ошибку, если activeFrom не дата', function() {
            browser.waitForAngular();
            clearDate('saleActiveFrom', 'saleEdited.activeFrom');
            expect(element(by.id('saleActiveFromErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если activeTo пустой', function() {
            browser.waitForAngular();
            clearDate('saleActiveTo', 'saleEdited.activeTo');
            expect(element(by.id('saleActiveToErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если activeTo меньше activeFrom', function() {
            browser.waitForAngular();
            setDate('saleActiveTo', 'saleEdited.activeTo', '2001-01-01');
            expect(element(by.id('saleActiveToErrorGreater')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если cardAmount пустой', function() {
            element(by.model('saleEdited.cardAmount')).clear();
            expect(element(by.id('saleCardAmountErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если cardAmount не соответствует формату', function() {
            var cardAmountElem = element(by.model('saleEdited.cardAmount'));
            cardAmountElem.clear();
            cardAmountElem.sendKeys('-1');
            expect(element(by.id('saleCardAmountErrorPattern')).isDisplayed()).toBeTruthy();
            cardAmountElem.clear();
            cardAmountElem.sendKeys('1234567');
            expect(element(by.id('saleCardAmountErrorPattern')).isDisplayed()).toBeTruthy();
            cardAmountElem.clear();
            cardAmountElem.sendKeys('123456.123');
            expect(element(by.id('saleCardAmountErrorPattern')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если amount пустой', function() {
            element(by.model('saleEdited.amount')).clear();
            expect(element(by.id('saleAmountErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если amount не соответствует формату', function() {
            var amountElem = element(by.model('saleEdited.amount'));
            amountElem.clear();
            amountElem.sendKeys('-1');
            expect(element(by.id('saleAmountErrorPattern')).isDisplayed()).toBeTruthy();
            amountElem.clear();
            amountElem.sendKeys('12345678');
            expect(element(by.id('saleAmountErrorPattern')).isDisplayed()).toBeTruthy();
            amountElem.clear();
            amountElem.sendKeys('1234567.123');
            expect(element(by.id('saleAmountErrorPattern')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если cardAmount больше amount', function() {
            var amountElem = element(by.model('saleEdited.amount'));
            amountElem.clear();
            amountElem.sendKeys('9');
            var cardAmountElem = element(by.model('saleEdited.cardAmount'));
            cardAmountElem.clear();
            cardAmountElem.sendKeys('10');
            expect(element(by.id('saleCardAmountErrorLessAmount')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если siteAmount пустой', function() {
            element(by.model('saleEdited.siteAmount')).clear();
            expect(element(by.id('saleSiteAmountErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если siteAmount не соответствует формату', function() {
            var siteAmountElem = element(by.model('saleEdited.siteAmount'));
            siteAmountElem.clear();
            siteAmountElem.sendKeys('-1');
            expect(element(by.id('saleSiteAmountErrorPattern')).isDisplayed()).toBeTruthy();
            siteAmountElem.clear();
            siteAmountElem.sendKeys('12345678');
            expect(element(by.id('saleSiteAmountErrorPattern')).isDisplayed()).toBeTruthy();
            siteAmountElem.clear();
            siteAmountElem.sendKeys('1234567.123');
            expect(element(by.id('saleSiteAmountErrorPattern')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если siteAmount больше amount', function() {
            var amountElem = element(by.model('saleEdited.amount'));
            amountElem.clear();
            amountElem.sendKeys('9');
            var siteAmountElem = element(by.model('saleEdited.siteAmount'));
            siteAmountElem.clear();
            siteAmountElem.sendKeys('10');
            expect(element(by.id('saleSiteAmountErrorLessAmount')).isDisplayed()).toBeTruthy();
        });

        it('выводит ошибку, если info пустой', function() {
            element(by.model('saleEdited.info')).clear();
            expect(element(by.id('saleInfoErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('заполняет список isActive', function() {
            var isActiveElem = element(by.model('saleEdited.isActive'));
            mapText(getSelectOptions(isActiveElem)).then(function(options) {
                expect(_.compact(options).length).toBeTruthy();
            });
        });

        it('выводит предупреждение статуса и запрещает его изменение, если статус Н/А и нет тарифа по-умолчанию', function() {
            browser.get('admin.html#/salelist?archive=true&type=card&isActive=false&orders=id&itemsPerPage=15');
            var noDefaultTariffSum = 0;
            var isDefaultTariffSum = 0;
            var sales = element.all(by.id('SaleListRowEdit'));
            sales.count().then(function(count) {
                expect(count).not.toBeLessThan(2);
                for(var i = count; i--; ) {
                    sales.get(i).click();
                    var noDefaultTariff;
                    var isActiveDisabled;
                    var isActive;
                    element(by.id('saleNoDefaultTariff')).isDisplayed().then(function(respond) {
                        noDefaultTariff = respond;
                    });
                    element(by.id('saleIsActiveDisabled')).isDisplayed().then(function(respond) {
                        isActiveDisabled = respond;
                    });
                    element(by.model('saleEdited.isActive')).isEnabled().then(function(respond) {
                        isActive = respond;
                    });
                    browser.controlFlow().execute(function() {
                        noDefaultTariff ? noDefaultTariffSum++ : isDefaultTariffSum++;
                        expect(isActiveDisabled).toBe(noDefaultTariff);
                        expect(isActiveDisabled).not.toBe(isActive);
                    });
                    element(by.id('saleEditCancel')).click();
                }
                browser.controlFlow().execute(function() {
                    expect(noDefaultTariffSum).toBeTruthy();
                    expect(isDefaultTariffSum).toBeTruthy();
                });
            });
        });

        it('после сохранения переходит к списку', function() {
            element(by.id('saleEditSave')).click();
            expect(browser.getLocationAbsUrl()).toMatch('#\/salelist');
        });

        it('при отмене переходит к списку', function() {
            element(by.id('saleEditCancel')).click();
            expect(browser.getLocationAbsUrl()).toMatch('#\/salelist');
        });
    });

    describe('Создание карточки', function() {
        beforeEach(function() {
            browser.get('admin.html#/sale/card?id=new');
        });

        it('показывает режим работы формы', function() {
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Создание карточки$/);
        });

        it('выводит начальные значения полей', function() {
            expect(element(by.model('saleEdited.dealer')).element(by.id('McomboSelectedItem_0')).isPresent()).toBeFalsy();
            expect(element(by.model('saleEdited.site')).element(by.id('McomboSelectedItem_0')).isPresent()).toBeFalsy();
            expect(selectedOption(element(by.model('saleEdited.tariff'))).getText()).toBeFalsy();

            var today = new Date;
            today.setUTCHours(0, 0, 0, 0);
            var todayISO = today.toISOString().slice(0, 10);
            expect(element(by.model('saleEdited.date')).getAttribute('value')).toBe(todayISO);

            expect(element(by.model('saleEdited.count')).getAttribute('value')).toBeFalsy();
            expect(element(by.model('saleEdited.activeFrom')).getAttribute('value')).toBeFalsy();
            expect(element(by.model('saleEdited.activeTo')).getAttribute('value')).toBeFalsy();
            expect(element(by.model('saleEdited.cardAmount')).getAttribute('value')).toBeFalsy();
            expect(element(by.model('saleEdited.amount')).getAttribute('value')).toBeFalsy();
            expect(element(by.model('saleEdited.siteAmount')).getAttribute('value')).toBeFalsy();
            expect(element(by.model('saleEdited.info')).getAttribute('value')).toBeFalsy();

            expect(selectedOption(element(by.model('saleEdited.isActive'))).getText()).toBe('Н\/А');
        });

        it('выводит ошибку, если tariff пустой', function() {
            expect(element(by.id('saleEditTariffErrorRequired')).isDisplayed()).toBeTruthy();
        });

        it('позволяет выбрать дилера', function() {
            var dealerElem = element(by.model('saleEdited.dealer'));
            var searchElem = dealerElem.element(by.id('McomboSearchInput'));
            searchElem.click();
            searchElem.sendKeys('3');
            var dropElem = dealerElem.all(by.id('McomboDropChoiceItem')).get(2);
            dropElem.getText().then(function(selectedValue) {
                dropElem.click();
                expect(dealerElem.element(by.id('McomboSelectedItem_0')).getText()).toBe(selectedValue);
            });
        });

        it('позволяет выбрать сайт', function() {
            var siteElem = element(by.model('saleEdited.site'));
            var searchElem = siteElem.element(by.id('McomboSearchInput'));
            searchElem.click();
            searchElem.sendKeys('17');
            var dropElem = siteElem.all(by.id('McomboDropChoiceItem')).get(0);
            dropElem.getText().then(function(selectedValue) {
                dropElem.click();
                expect(siteElem.element(by.id('McomboSelectedItem_0')).getText()).toBe(selectedValue);
            });
        });

        it('выводит предупреждение, если для дилера и сайта нет тарифа по-умолчанию ', function() {
            var dealerElem = element(by.model('saleEdited.dealer'));
            var dealerElemSearch = dealerElem.element(by.id('McomboSearchInput'));
            dealerElemSearch.click();
            var dealerElemDrop = dealerElem.all(by.id('McomboDropChoiceItem')).get(0);
            dealerElemDrop.click();

            var siteElem = element(by.model('saleEdited.site'));
            var siteElemSearch = siteElem.element(by.id('McomboSearchInput'));
            siteElemSearch.click();
            var siteElemsDrop = siteElem.all(by.id('McomboDropChoiceItem'));
            mapText(siteElemsDrop).then(function(sites) {
                var tariffElem = element(by.model('saleEdited.tariff'));
                _.forEach(sites, function(site, siteIdx) {
                    siteElemsDrop.get(siteIdx).click();
                    selectedOption(tariffElem).getText().then(function(tariffText) {
                        if (!tariffText) {
                            expect(element(by.id('saleNoDefaultTariff')).isDisplayed()).toBeTruthy();
                        }
                        siteElem.element(by.id('McomboRemoveItem_0')).click();
                        siteElemSearch.click();
                    });
                });
            });
        });
    });

    describe('Редактирование расширения', function() {
        beforeEach(function() {
            browser.get('admin.html#/salelist?type=addcard&archive=true&orders=-id&itemsPerPage=15');
            mapIsDisplayed(element.all(by.id('SaleListRowRemove'))).then(function(isDisplayedArray) {
                var saleIdx = isDisplayedArray.indexOf(true);
                expect(saleIdx).not.toBe(-1);
                element.all(by.id('SaleListRowEdit')).get(saleIdx).click();
            });
        });

        it('показывает начальные значения', function() {
            browser.waitForAngular();
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Изменение расширения$/);
            expect(element(by.model('tariffParent')).isDisplayed()).toBeTruthy();
            expect(element(by.model('tariffParent')).isEnabled()).toBeFalsy();
            expect(element(by.model('saleEdited.activeTo')).isEnabled()).toBeFalsy();
            expect(selectedOption(element(by.model('saleEdited.isActive'))).getText()).toMatch(/^(А|Н\/А)$/);
        });

        it('не позволяет очистить dealer', function() {
            var dealerElem = element(by.model('saleEdited.dealer'));
            dealerElem.element(by.id('McomboRemoveItem_0')).click();
            expect(dealerElem.element(by.id('McomboSelectedItem_0')).getText()).toMatch(regexpIdName);
        });

        it('не позволяет очистить site', function() {
            var siteElem = element(by.model('saleEdited.dealer'));
            siteElem.element(by.id('McomboRemoveItem_0')).click();
            expect(siteElem.element(by.id('McomboSelectedItem_0')).getText()).toMatch(regexpIdName);
        });

        it('выводит ошибку, если activeFrom меньше activeFrom родительской карточки', function() {
            var tariffElem = element(by.model('saleEdited.tariff'));
            mapText(tariffElem.all(by.css('option'))).then(function(options) {
                var tariffIdx = _.findIndex(options, function(value) {
                    return !!value;
                })
                expect(tariffIdx).not.toBe(-1);
                setSelect(tariffElem, tariffIdx);
            });

            setDate('saleActiveFrom', 'saleEdited.activeFrom', '2001-01-01');
            expect(element(by.id('saleActiveFromErrorGreater')).isDisplayed()).toBeTruthy();
        });

        it('заполняет список isActive', function() {
            mapText(getSelectOptions(element(by.model('saleEdited.isActive')))).then(function(options) {
                expect(_.compact(options).length).toBeTruthy();
            });
        });

        it('выводит предупреждение статуса и запрещает его изменение, если статус Н/А и нет тарифа по-умолчанию', function() {
            element(by.id('saleEditCancel')).click();
            setSelect(element(by.model('patterns.isActive')), 2);

            var noDefaultTariffSum = 0;
            var isDefaultTariffSum = 0;
            var sales = element.all(by.id('SaleListRowEdit'));
            sales.count().then(function(count) {
                expect(count).not.toBeLessThan(2);
                for(var i = count; i--; ) {
                    sales.get(i).click();
                    var noDefaultTariff;
                    var isActiveDisabled;
                    var isActive;
                    element(by.id('saleNoDefaultTariff')).isDisplayed().then(function(respond) {
                        noDefaultTariff = respond;
                    });
                    element(by.id('saleIsActiveDisabled')).isDisplayed().then(function(respond) {
                        isActiveDisabled = respond;
                    });
                    element(by.id('saleIsActive')).isEnabled().then(function(respond) {
                        isActive = respond;
                    });
                    browser.controlFlow().execute(function() {
                        noDefaultTariff ? noDefaultTariffSum++ : isDefaultTariffSum++;
                        expect(isActiveDisabled).toBe(noDefaultTariff);
                        expect(isActiveDisabled).not.toBe(isActive);
                    });
                    element(by.id('saleEditCancel')).click();
                }
                browser.controlFlow().execute(function() {
                    expect(noDefaultTariffSum).toBeTruthy();
                    expect(isDefaultTariffSum).toBeTruthy();
                });
            });
        });
    });

    describe('Создание расширения', function() {
        beforeEach(function() {
            browser.get('admin.html#/salelist?archive=true&orders=id&itemsPerPage=15');
        });

        it('показывает режим работы формы', function() {
            mapText(element.all(by.id('SaleListRowAdd'))).then(function(rows) {
                var saleIdx = rows.indexOf('расширить');
                element.all(by.id('SaleListRowAdd')).get(saleIdx).click();
            });
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Создание расширения$/);
        });

        it('выводит начальные значения полей', function() {
            var saleElems = by.repeater('sale in sales');
            var sales = {};
            mapText(element.all(saleElems.column('sale.dealer.idName'))).then(function(respond) {
                sales.dealerText = respond;
            });
            mapText(element.all(saleElems.column('sale.site.idName'))).then(function(respond) {
                sales.siteText = respond;
            });
            mapText(element.all(saleElems.column('sale.type.name'))).then(function(respond) {
                sales.typeText = respond;
            });
            mapText(element.all(saleElems.column('sale.activeFrom'))).then(function(respond) {
                sales.activeFrom = respond;
            });
            mapText(element.all(saleElems.column('sale.activeTo'))).then(function(respond) {
                sales.activeTo = respond;
            });
            var addcardElems = element.all(by.id('SaleListRowAdd'));
            mapIsDisplayed(addcardElems).then(function(respond) {
                sales.isDisplayed = respond;
            });

            var today = new Date;
            today.setUTCHours(0, 0, 0, 0);
            var todayISO = today.toISOString().slice(0, 10);
            var tomorrow = _.clone(today);
            tomorrow.setUTCHours(24);
            var tomorrowISO = tomorrow.toISOString().slice(0, 10);

            var numberCases = {
                isTariff: 0,            // выбрался тариф
                noTariff: 0,            // не выбрался тариф
                noDealerTariff: 0,      // у дилера нет тарифа
                isTariffLimited: 0,     // выбрался лимитный тариф
                isTariffUnlimited: 0,   // выбрался безлимитный тариф
                isInterval: 0,          // получилась дата начала <= даты конца
                isAddAdd: 0             // расширение расширения
            };

            browser.controlFlow().execute(function() {
                _.forEach(sales.isDisplayed, function(isDisplayed, saleIdx) {
                    if (!isDisplayed) {
                        return;
                    }

                    if (sales.typeText[saleIdx] === 'Расш') {
                        numberCases.isAddAdd++;
                    }

                    addcardElems.get(saleIdx).click();

                    var dealerText;
                    element(by.model('saleEdited.dealer')).element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                        dealerText = respond;
                        expect(dealerText).toBe(sales.dealerText[saleIdx]);
                    });

                    var dealerTariffText;
                    // var elem = element(by.model('dealerTariff.tariff')).element(by.css('option:checked'));
                    browser.executeScript("var e=document.getElementById('saleDealerTariff'); return e.options[e.selectedIndex].text;")
                        .then(function(respond) {
                        dealerTariffText = respond;
                        if (dealerTariffText) {
                            expect(dealerTariffText).toMatch(regexpTariff);
                        }
                    });

                    var siteText;
                    element(by.model('saleEdited.site')).element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                        siteText = respond;
                        expect(siteText).toBe(sales.siteText[saleIdx]);
                    });

                    var parentTariffText;
                    element(by.model('tariffParent')).element(by.css('option:checked')).getText().then(function(respond) {
                        parentTariffText = respond;
                        expect(parentTariffText).toMatch(regexpTariff);
                    });

                    var tariffText;
                    element(by.model('saleEdited.tariff')).element(by.css('option:checked')).getText().then(function(respond) {
                        tariffText = respond;
                        var dealerTariffRate = parseFloat(dealerTariffText.replace(regexpTariff, '$1'));
                        if (dealerTariffRate) {
                            var parentTariffRate = parseFloat(parentTariffText.replace(regexpTariff, '$1'));
                            if (dealerTariffRate > parentTariffRate) {
                                expect(tariffText).toMatch(regexpTariff);
                                numberCases.isTariff++;
                            } else {
                                expect(tariffText).toBeFalsy();
                                numberCases.noTariff++;
                            }
                        } else {
                            expect(tariffText).toBeFalsy();
                            numberCases.noDealerTariff++;
                        }
                    });

                    expect(element(by.model('saleEdited.date')).getAttribute('value')).toBe(todayISO);

                    element(by.model('saleEdited.count')).getAttribute('value').then(function(countText) {
                        if (!tariffText) {
                            expect(countText).toBeFalsy();  // если тариф не выбран, то лимит пустой
                        } else {
                            var tariffCountText = tariffText.replace(regexpTariff, '$4');
                            if (!tariffCountText) {
                                expect(countText).toBeFalsy();  // если тариф выбран и он безлимитный, то лимит пустой
                                numberCases.isTariffUnlimited++;
                            } else {
                                // если тариф выбран и он лимитный, то лимит = лимит тарифа - лимит родительского тарифа
                                var parentTariffCountText = parentTariffText.replace(regexpTariff, '$4');
                                expect(_.parseInt(countText)).toBe(_.parseInt(tariffCountText) - _.parseInt(parentTariffCountText));
                                numberCases.isTariffLimited++;
                            }
                        }
                    });

                    var activeFromText;
                    element(by.model('saleEdited.activeFrom')).getAttribute('value').then(function(respond) {
                        activeFromText = respond;
                        var siteId = _.parseInt(siteText.replace(regexpIdName, '$1'));
                        expect(activeFromText).toBe((siteId === 1 || siteId === 5) ? todayISO : tomorrowISO);
                    });

                    var activeToText;
                    element(by.model('saleEdited.activeTo')).getAttribute('value').then(function(respond) {
                        activeToText = respond;
                        expect(activeToText).toBe(sales.activeTo[saleIdx].replace(regexpDate, '20$3-$2-$1'));
                    });

                    element(by.model('saleEdited.cardAmount')).getAttribute('value').then(function(cardAmountText) {
                        if (!tariffText) {
                            expect(cardAmountText).toBeFalsy();
                        } else {
                            var parentActiveFrom = new Date(sales.activeFrom[saleIdx].replace(regexpDate, '20$3-$2-$1'));
                            parentActiveFrom.setUTCHours(0, 0, 0, 0);
                            var parentActiveTo = new Date(sales.activeTo[saleIdx].replace(regexpDate, '20$3-$2-$1'));
                            parentActiveTo.setUTCHours(0, 0, 0, 0);
                            var parentInterval = (parentActiveTo - parentActiveFrom) / (1000 * 60 * 60 * 24) + 1;

                            var activeFrom = new Date(activeFromText);
                            activeFrom.setUTCHours(0, 0, 0, 0);
                            var activeTo = new Date(activeToText);
                            activeTo.setUTCHours(0, 0, 0, 0);
                            var interval = Math.max((activeTo - activeFrom) / (1000 * 60 * 60 * 24) + 1, 0);
                            if (interval) {
                                 numberCases.isInterval++;
                            }

                            var parentTariffRate = parseFloat(parentTariffText.replace(regexpTariff, '$1'));
                            var tariffRate = parseFloat(tariffText.replace(regexpTariff, '$1'));

                            expect(parseFloat(cardAmountText))
                                .toBe(Math.ceil((tariffRate - parentTariffRate) / parentInterval * interval * 100) / 100);
                        }
                    });
                    element(by.model('saleEdited.amount')).getAttribute('value').then(function(amountText) {
                        if (!tariffText) {
                            expect(amountText).toBeFalsy();
                        } else {
                            var parentActiveFrom = new Date(sales.activeFrom[saleIdx].replace(regexpDate, '20$3-$2-$1'));
                            parentActiveFrom.setUTCHours(0, 0, 0, 0);
                            var parentActiveTo = new Date(sales.activeTo[saleIdx].replace(regexpDate, '20$3-$2-$1'));
                            parentActiveTo.setUTCHours(0, 0, 0, 0);
                            var parentInterval = (parentActiveTo - parentActiveFrom) / (1000 * 60 * 60 * 24) + 1;

                            var activeFrom = new Date(activeFromText);
                            activeFrom.setUTCHours(0, 0, 0, 0);
                            var activeTo = new Date(activeToText);
                            activeTo.setUTCHours(0, 0, 0, 0);
                            var interval = Math.max((activeTo - activeFrom) / (1000 * 60 * 60 * 24) + 1, 0);

                            var parentTariffRate = parseFloat(parentTariffText.replace(regexpTariff, '$1'));
                            var tariffRate = parseFloat(tariffText.replace(regexpTariff, '$1'));

                            expect(parseFloat(amountText))
                                .toBe(Math.ceil((tariffRate - parentTariffRate) / parentInterval * interval * 100) / 100);
                        }
                    });
                    element(by.model('saleEdited.siteAmount')).getAttribute('value').then(function(siteAmountText) {
                        expect(!!siteAmountText).toBe(!!tariffText);
                    });
                    element(by.model('saleEdited.info')).getAttribute('value').then(function(info) {
                        if (!tariffText) {
                            expect(info).toBeFalsy();  // если тариф не выбран, то комментарий пустой
                        } else {
                            expect(info).toBeTruthy();
                        }
                    });
                    expect(element(by.model('saleEdited.isActive')).element(by.css('option:checked')).getText()).toBe('Н\/А');

                    element(by.id('saleEditCancel')).click();
                });
            });
            browser.controlFlow().execute(function() {
                expect(numberCases.isTariff).toBeTruthy();
                expect(numberCases.noTariff).toBeTruthy();
                expect(numberCases.noDealerTariff).toBeTruthy();
                expect(numberCases.isTariffLimited).toBeTruthy();
                expect(numberCases.isTariffUnlimited).toBeTruthy();
                expect(numberCases.isInterval).toBeTruthy();
                expect(numberCases.isAddAdd).toBeTruthy();
            });
        });
    });

    describe('Редактирование доплаты', function() {
        beforeEach(function() {
            browser.get('admin.html#/salelist?type=extra&archive=true&itemsPerPage=15');
            element.all(by.id('SaleListRowEdit')).get(0).click();
        });

        it('показывает начальные значения', function() {
            browser.waitForAngular();
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Изменение доплаты$/);
            expect(element(by.id('saleTariff')).isDisplayed()).toBeFalsy();
            expect(element(by.id('saleTariffParent')).isDisplayed()).toBeFalsy();
            expect(element(by.id('saleCount')).isDisplayed()).toBeFalsy();
            expect(element(by.id('saleActiveFrom')).isDisplayed()).toBeFalsy();
            expect(element(by.id('saleActiveTo')).isDisplayed()).toBeFalsy();
            expect(element(by.id('saleCardAmount')).isDisplayed()).toBeFalsy();
            expect(element(by.id('saleIsActive')).isDisplayed()).toBeFalsy();
        });

        it('не позволяет очистить dealer', function() {
            var dealerElem = element(by.id('saleDealer'));
            dealerElem.element(by.id('McomboRemoveItem_0')).click();
            expect(dealerElem.all(by.id('McomboSelectedItem_0')).get(0).getText()).toMatch(regexpIdName);
        });

        it('не позволяет очистить site', function() {
            var siteElem = element(by.id('saleSite'));
            siteElem.element(by.id('McomboRemoveItem_0')).click();
            expect(siteElem.all(by.id('McomboSelectedItem_0')).get(0).getText()).toMatch(regexpIdName);
        });
    });

    describe('Создание доплаты', function() {
        beforeEach(function() {
            browser.get('admin.html#/salelist?type=card&archive=true&itemsPerPage=15');
            element.all(by.id('SaleListRowExtra')).get(0).click();
        });

        it('показывает начальные значения', function() {
            browser.waitForAngular();
            expect(element(by.binding('{{actionName}}')).getText()).toMatch(/^Создание доплаты$/);
        });

        it('выводит значение дилера', function() {
            var dealerElem = element(by.id('saleDealer'));
            expect(dealerElem.all(by.id('McomboSelectedItem_0')).get(0).getText()).toMatch(regexpIdName);
        });

        it('выводит значение сайта', function() {
            var siteElem = element(by.id('saleSite'));
            expect(siteElem.all(by.id('McomboSelectedItem_0')).get(0).getText()).toMatch(regexpIdName);
        });

        it('выводит ошибку, если info не дописано', function() {
            var infoErrorElem = element(by.id('saleInfoErrorPattern'));
            expect(infoErrorElem.isDisplayed()).toBeTruthy();
        });
    });

    describe('Сценарии использования', function() {

        beforeEach(function() {
            browser.get('admin.html#/salelist?archive=true&orders=-amount&itemsPerPage=15');
        });

        it('Создание карточки', function() {
            var salesSelector = by.repeater('sale in sales');

            var preAmountText;
            element.all(salesSelector.column('sale.amount')).get(0).getText().then(function(respond) {
                preAmountText = respond;
            });

            element.all(by.id('SaleListAddSaleUp')).get(0).click();

            var dealerElem = element(by.model('saleEdited.dealer'));
            var dealerElemSearch = dealerElem.element(by.id('McomboSearchInput'));
            dealerElemSearch.click();
            dealerElemSearch.sendKeys('5');
            var dealerElemDrop = dealerElem.all(by.id('McomboDropChoiceItem')).get(2);
            dealerElemDrop.click();

            var siteElem = element(by.model('saleEdited.site'));
            var siteElemSearch = siteElem.element(by.id('McomboSearchInput'));
            siteElemSearch.click();
            siteElemSearch.sendKeys('1');
            var siteElemDrop = siteElem.all(by.id('McomboDropChoiceItem')).get(0);
            siteElemDrop.click();

            var tariffElem = element(by.model('saleEdited.tariff'));
            mapText(tariffElem.all(by.css('option'))).then(function(options) {
                var tariffIdx = _.findIndex(options, function(value) {
                    return !!value;
                })
                expect(tariffIdx).not.toBe(-1);
                setSelect(tariffElem, tariffIdx);
            });

            browser.controlFlow().execute(function() {
                var newAmount = parseFloatRu(preAmountText) + 1;
                var amountElem = element(by.model('saleEdited.amount'));
                amountElem.clear();
                amountElem.sendKeys(newAmount.toString());
            });

            var saleData = {};
            dealerElem.element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                saleData.dealerText = respond;
            });
            siteElem.element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                saleData.siteText = respond;
            });
            selectedOption(element(by.model('saleEdited.tariff'))).getText().then(function(respond) {
                saleData.tariffText = respond;
            });
            element(by.model('saleEdited.date')).getAttribute('value').then(function(respond) {
                saleData.dateText = respond;
            });
            element(by.model('saleEdited.count')).getAttribute('value').then(function(respond) {
                saleData.countText = respond;
            });
            element(by.model('saleEdited.activeFrom')).getAttribute('value').then(function(respond) {
                saleData.activeFromText = respond;
            });
            element(by.model('saleEdited.activeTo')).getAttribute('value').then(function(respond) {
                saleData.activeToText = respond;
            });
            element(by.model('saleEdited.cardAmount')).getAttribute('value').then(function(respond) {
                saleData.cardAmountText = respond;
            });
            element(by.model('saleEdited.amount')).getAttribute('value').then(function(respond) {
                saleData.amountText = respond;
            });
            element(by.model('saleEdited.siteAmount')).getAttribute('value').then(function(respond) {
                saleData.siteAmountText = respond;
            });
            element(by.model('saleEdited.info')).getAttribute('value').then(function(respond) {
                saleData.infoText = respond;
            });
            selectedOption(element(by.model('saleEdited.isActive'))).getText().then(function(respond) {
                saleData.isActiveText = respond;
            });

            element(by.id('saleEditSave')).click();

            element.all(salesSelector.column('sale.date')).get(0).getText().then(function(dateText) {
                expect(dateText.replace(regexpDate, '20$3-$2-$1')).toBe(saleData.dateText);
            });
            element.all(salesSelector.column('sale.dealer.')).get(0).getText().then(function(dealerText) {
                expect(dealerText).toBe(saleData.dealerText);
            });
            element.all(salesSelector.column('sale.site.')).get(0).getText().then(function(siteText) {
                expect(siteText).toBe(saleData.siteText);
            });
            element.all(salesSelector.column('sale.type')).get(0).getText().then(function(typeText) {
                expect(typeText).toBe('Осн');
            });
            element.all(salesSelector.column('sale.count')).get(0).getText().then(function(countText) {
                expect(countText).toBe(saleData.countText);
            });
            element.all(salesSelector.column('sale.activeFrom')).get(0).getText().then(function(activeFromText) {
                expect(activeFromText.replace(regexpDate, '20$3-$2-$1')).toBe(saleData.activeFromText);
            });
            element.all(salesSelector.column('sale.activeTo')).get(0).getText().then(function(activeToText) {
                expect(activeToText.replace(regexpDate, '20$3-$2-$1')).toBe(saleData.activeToText);
            });
            element.all(salesSelector.column('sale.amount')).get(0).getText().then(function(amountText) {
                expect(parseFloatRu(amountText)).toBe(parseFloat(saleData.amountText));
            });
            element.all(salesSelector.column('sale.siteAmount')).get(0).getText().then(function(siteAmountText) {
                expect(parseFloatRu(siteAmountText)).toBe(parseFloat(saleData.siteAmountText));
            });
            element.all(salesSelector.column('sale.isActive')).get(0).getText().then(function(isActiveText) {
                expect(isActiveText).toBe(saleData.isActiveText);
            });
            expect(element.all(by.id('SaleListRowAdd')).get(0).isDisplayed()).toBeTruthy();
            expect(element.all(by.id('SaleListRowExtra')).get(0).isDisplayed()).toBeTruthy();
            element(by.id('savedSaleListNotice')).getText().then(function(noticeText) {
                var dealerName = saleData.dealerText.replace(regexpIdName, '$2');
                var siteName = saleData.siteText.replace(regexpIdName, '$2');
                expect(noticeText).toBe('Сохранена продажа салона "' + dealerName + '" на сайте "' + siteName + '"');
            });

            element.all(by.id('SaleListRowEdit')).get(0).click();

            selectedOption(element(by.model('saleEdited.tariff'))).getText().then(function(tariffText) {
                expect(tariffText).toBe(saleData.tariffText);
            });
            element(by.model('saleEdited.cardAmount')).getAttribute('value').then(function(cardAmountText) {
                expect(cardAmountText).toBe(saleData.cardAmountText);
            });
            element(by.model('saleEdited.info')).getAttribute('value').then(function(infoText) {
                expect(infoText).toBe(saleData.infoText);
            });
        });

        it('Создание расширения карточки', function() {
            var salesSelector = by.repeater('sale in sales');

            var preAmountText;
            element.all(salesSelector.column('sale.amount')).get(0).getText().then(function(respond) {
                preAmountText = respond;
            });

            var saleTypes;
            mapText(element.all(salesSelector.column('sale.type'))).then(function(types) {
                saleTypes = types;
            });
            var saleAdds = element.all(by.id('SaleListRowAdd'));
            mapIsDisplayed(saleAdds).then(function(saleAddsDisplayed) {
                var saleIdx = _.findIndex(saleAddsDisplayed, function(saleAddDisplayed, saleIdx) {
                    return saleAddDisplayed && _.contains(['Осн', 'Расш'], saleTypes[saleIdx]); 
                });
                expect(saleIdx).not.toBe(-1);
                saleAdds.get(saleIdx).click();
            });

            var tariffParentText;
            selectedOption(element(by.model('tariffParent'))).getText().then(function(tariffText) {
                tariffParentText = tariffText;
            });

            var tariffElem = element(by.model('saleEdited.tariff'));
            mapText(getSelectOptions(tariffElem)).then(function(options) {
                function tariffPrice(tariffText) {
                    return parseFloat(tariffText.replace(regexpTariff, '$1'));
                }
                var tariffIdx = _.findIndex(options, function(value) {
                    return !!value && tariffPrice(value) > tariffPrice(tariffParentText);
                })
                expect(tariffIdx).not.toBe(-1);
                setSelect(tariffElem, tariffIdx);
            });

            element(by.model('saleEdited.activeTo')).getAttribute('value').then(function(activeToText) {
                setDate('saleActiveFrom', 'saleEdited.activeFrom', activeToText);
            });

            browser.controlFlow().execute(function() {
                var newAmount = parseFloatRu(preAmountText) + 1;
                var amountElem = element(by.model('saleEdited.amount'));
                amountElem.clear();
                amountElem.sendKeys(newAmount.toString());
            });

            var saleData = {};
            element(by.model('saleEdited.dealer')).element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                saleData.dealerText = respond;
            });
            element(by.model('saleEdited.site')).element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                saleData.siteText = respond;
            });
            selectedOption(element(by.model('tariffParent'))).getText().then(function(respond) {
                saleData.parentTariffText = respond;
            });
            selectedOption(element(by.model('saleEdited.tariff'))).getText().then(function(respond) {
                saleData.tariffText = respond;
            });
            element(by.model('saleEdited.date')).getAttribute('value').then(function(respond) {
                saleData.dateText = respond;
            });
            element(by.model('saleEdited.count')).getAttribute('value').then(function(respond) {
                saleData.countText = respond;
            });
            element(by.model('saleEdited.activeFrom')).getAttribute('value').then(function(respond) {
                saleData.activeFromText = respond;
            });
            element(by.model('saleEdited.activeTo')).getAttribute('value').then(function(respond) {
                saleData.activeToText = respond;
            });
            element(by.model('saleEdited.cardAmount')).getAttribute('value').then(function(respond) {
                saleData.cardAmountText = respond;
            });
            element(by.model('saleEdited.amount')).getAttribute('value').then(function(respond) {
                saleData.amountText = respond;
            });
            element(by.model('saleEdited.siteAmount')).getAttribute('value').then(function(respond) {
                saleData.siteAmountText = respond;
            });
            element(by.model('saleEdited.info')).getAttribute('value').then(function(respond) {
                saleData.infoText = respond;
            });
            selectedOption(element(by.model('saleEdited.isActive'))).getText().then(function(respond) {
                saleData.isActiveText = respond;
            });

            element(by.id('saleEditSave')).click();

            element.all(salesSelector.column('sale.date')).get(0).getText().then(function(dateText) {
                expect(dateText.replace(regexpDate, '20$3-$2-$1')).toBe(saleData.dateText);
            });
            element.all(salesSelector.column('sale.dealer.')).get(0).getText().then(function(dealerText) {
                expect(dealerText).toBe(saleData.dealerText);
            });
            element.all(salesSelector.column('sale.site.')).get(0).getText().then(function(siteText) {
                expect(siteText).toBe(saleData.siteText);
            });
            element.all(salesSelector.column('sale.type')).get(0).getText().then(function(typeText) {
                expect(typeText).toBe('Расш');
            });
            element.all(salesSelector.column('sale.count')).get(0).getText().then(function(countText) {
                expect(countText).toBe(saleData.countText);
            });
            element.all(salesSelector.column('sale.activeFrom')).get(0).getText().then(function(activeFromText) {
                expect(activeFromText.replace(regexpDate, '20$3-$2-$1')).toBe(saleData.activeFromText);
            });
            element.all(salesSelector.column('sale.activeTo')).get(0).getText().then(function(activeToText) {
                expect(activeToText.replace(regexpDate, '20$3-$2-$1')).toBe(saleData.activeToText);
            });
            element.all(salesSelector.column('sale.amount')).get(0).getText().then(function(amountText) {
                expect(parseFloatRu(amountText)).toBe(parseFloat(saleData.amountText));
            });
            element.all(salesSelector.column('sale.siteAmount')).get(0).getText().then(function(siteAmountText) {
                expect(parseFloatRu(siteAmountText)).toBe(parseFloat(saleData.siteAmountText));
            });
            element.all(salesSelector.column('sale.isActive')).get(0).getText().then(function(isActiveText) {
                expect(isActiveText).toBe(saleData.isActiveText);
            });
            expect(element.all(by.id('SaleListRowAdd')).get(0).isDisplayed()).toBeTruthy();
            expect(element.all(by.id('SaleListRowExtra')).get(0).isDisplayed()).toBeFalsy();
            element(by.id('savedSaleListNotice')).getText().then(function(noticeText) {
                var dealerName = saleData.dealerText.replace(regexpIdName, '$2');
                var siteName = saleData.siteText.replace(regexpIdName, '$2');
                expect(noticeText).toBe('Сохранена продажа салона "' + dealerName + '" на сайте "' + siteName + '"');
            });

            element.all(by.id('SaleListRowEdit')).get(0).click();

            selectedOption(element(by.model('tariffParent'))).getText().then(function(parentTariffText) {
                expect(parentTariffText).toBe(saleData.parentTariffText);
            });
            selectedOption(element(by.model('saleEdited.tariff'))).getText().then(function(tariffText) {
                expect(tariffText).toBe(saleData.tariffText);
            });
            element(by.model('saleEdited.cardAmount')).getAttribute('value').then(function(cardAmountText) {
                expect(cardAmountText).toBe(saleData.cardAmountText);
            });
            element(by.model('saleEdited.info')).getAttribute('value').then(function(infoText) {
                expect(infoText).toBe(saleData.infoText);
            });
        });

        it('Создание доплаты', function() {
            var salesSelector = by.repeater('sale in sales');

            var preAmountText;
            element.all(salesSelector.column('sale.amount')).get(0).getText().then(function(respond) {
                preAmountText = respond;
            });

            var saleData = {};
            var saleExtras = element.all(by.id('SaleListRowExtra'));
            mapIsDisplayed(saleExtras).then(function(saleExtrasDisplayed) {
                var saleIdx = _.findIndex(saleExtrasDisplayed, function(saleExtraDisplayed) {
                    return saleExtraDisplayed; 
                });
                expect(saleIdx).not.toBe(-1);
                element.all(salesSelector.column('sale.activeFrom')).get(saleIdx).getText().then(function(respond) {
                    saleData.activeFromText = respond;
                });
                element.all(salesSelector.column('sale.activeTo')).get(saleIdx).getText().then(function(respond) {
                    saleData.activeToText = respond;
                });
                element.all(salesSelector.column('sale.isActive')).get(saleIdx).getText().then(function(respond) {
                    saleData.isActiveText = respond;
                });
                saleExtras.get(saleIdx).click();
            });

            browser.controlFlow().execute(function() {
                var newAmount = parseFloatRu(preAmountText) + 1;
                var amountElem = element(by.model('saleEdited.amount'));
                amountElem.clear();
                amountElem.sendKeys(newAmount.toString());

                var newSiteAmount = parseFloatRu(preAmountText);
                var siteAmountElem = element(by.model('saleEdited.siteAmount'));
                siteAmountElem.clear();
                siteAmountElem.sendKeys(newSiteAmount.toString());

                element(by.model('saleEdited.info')).sendKeys('выделение');
            });

            element(by.model('saleEdited.dealer')).element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                saleData.dealerText = respond;
            });
            element(by.model('saleEdited.site')).element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                saleData.siteText = respond;
            });
            element(by.model('saleEdited.date')).getAttribute('value').then(function(respond) {
                saleData.dateText = respond;
            });
            element(by.model('saleEdited.amount')).getAttribute('value').then(function(respond) {
                saleData.amountText = respond;
            });
            element(by.model('saleEdited.siteAmount')).getAttribute('value').then(function(respond) {
                saleData.siteAmountText = respond;
            });
            element(by.model('saleEdited.info')).getAttribute('value').then(function(respond) {
                saleData.infoText = respond;
            });

            element(by.id('saleEditSave')).click();

            element.all(salesSelector.column('sale.date')).get(0).getText().then(function(dateText) {
                expect(dateText.replace(regexpDate, '20$3-$2-$1')).toBe(saleData.dateText);
            });
            element.all(salesSelector.column('sale.dealer.')).get(0).getText().then(function(dealerText) {
                expect(dealerText).toBe(saleData.dealerText);
            });
            element.all(salesSelector.column('sale.site.')).get(0).getText().then(function(siteText) {
                expect(siteText).toBe(saleData.siteText);
            });
            element.all(salesSelector.column('sale.type')).get(0).getText().then(function(typeText) {
                expect(typeText).toBe('Доп');
            });
            element.all(salesSelector.column('sale.count')).get(0).getText().then(function(countText) {
                expect(countText).toBeFalsy();
            });
            element.all(salesSelector.column('sale.activeFrom')).get(0).getText().then(function(activeFromText) {
                expect(activeFromText).toBe(saleData.activeFromText);
            });
            element.all(salesSelector.column('sale.activeTo')).get(0).getText().then(function(activeToText) {
                expect(activeToText).toBe(saleData.activeToText);
            });
            element.all(salesSelector.column('sale.amount')).get(0).getText().then(function(amountText) {
                expect(parseFloatRu(amountText)).toBe(parseFloat(saleData.amountText));
            });
            element.all(salesSelector.column('sale.siteAmount')).get(0).getText().then(function(siteAmountText) {
                expect(parseFloatRu(siteAmountText)).toBe(parseFloat(saleData.siteAmountText));
            });
            element.all(salesSelector.column('sale.isActive')).get(0).getText().then(function(isActiveText) {
                expect(isActiveText).toBe(saleData.isActiveText);
            });
            expect(element.all(by.id('SaleListRowAdd')).get(0).isDisplayed()).toBeFalsy();
            expect(element.all(by.id('SaleListRowExtra')).get(0).isDisplayed()).toBeFalsy();
            element(by.id('savedSaleListNotice')).getText().then(function(noticeText) {
                var dealerName = saleData.dealerText.replace(regexpIdName, '$2');
                var siteName = saleData.siteText.replace(regexpIdName, '$2');
                expect(noticeText).toBe('Сохранена продажа салона "' + dealerName + '" на сайте "' + siteName + '"');
            });

            element.all(by.id('SaleListRowEdit')).get(0).click();

            element(by.model('saleEdited.info')).getAttribute('value').then(function(infoText) {
                expect(infoText).toBe(saleData.infoText);
            });
        });

        it('Активация и дезактивация карточек и расширений', function() {
            browser.get('admin.html#/salelist?archive=true&orders=-id&itemsPerPage=15');
            var sales = by.repeater('sale in sales');
            mapText(element.all(sales.column('sale.type'))).then(function(typeArr) {
                mapText(element.all(sales.column('sale.isActive'))).then(function(isActiveArr) {
                    var salesNoExport = 0;
                    var salesActivated = 0;
                    var salesDeactivated = 0;
                    var salesUnknown = 0;
                    _.forEach(isActiveArr, function(isActive, saleIdx) {
                        if (!_.contains(['Осн', 'Расш'], typeArr[saleIdx])) {
                            return;
                        }
                        element.all(sales.column('sale.isActive')).get(saleIdx).click();
                        browser.wait(function() {
                            return browser.switchTo().alert().then(
                                function() { return true; },
                                function() { return false; }
                            );
                        });
                        var alert = browser.switchTo().alert();
                        alert.getText().then(function(text) {
                            var saleParams;
                            if (text.match(/^Активация невозможна/)) {
                                expect(isActive).toBe("Н\/А");
                                alert.accept();
                                expect(element.all(sales.column('sale.isActive')).get(saleIdx).getText()).toBe("Н\/А");
                                ++salesNoExport;
                            } else if (saleParams = text.match(/Активировать продажу салона \"(.+)\" на сайте \"(.+)\"\?$/)) {
                                expect(isActive).toBe("Н\/А");
                                alert.accept();
                                expect(element.all(sales.column('sale.isActive')).get(saleIdx).getText()).toBe("А");
                                expect(element(by.binding("savedSaleListNotice")).getText()).toBe('Активирована продажа салона "' + saleParams[1] + '" на сайте "' + saleParams[2] + '"');
                                ++salesActivated;
                            } else if (saleParams = text.match(/^Дезактивировать продажу салона \"(.+)\" на сайте \"(.+)\"\?$/)) {
                                expect(isActive).toBe("А");
                                alert.accept();
                                expect(element.all(sales.column('sale.isActive')).get(saleIdx).getText()).toBe("Н\/А");
                                expect(element(by.binding("savedSaleListNotice")).getText()).toBe('Дезактивирована продажа салона "' + saleParams[1] + '" на сайте "' + saleParams[2] + '"');
                                ++salesDeactivated;
                            } else {
                                ++salesUnknown;
                            }
                        });
                    });
                    browser.controlFlow().execute(function() {
                        expect(salesNoExport).toBeTruthy();
                        expect(salesActivated).toBeTruthy();
                        expect(salesDeactivated).toBeTruthy();
                        expect(salesUnknown).toBeFalsy();
                    });
                });
            });
        });

        it('Изменение карточки', function() {
            var salesSelector = by.repeater('sale in sales');

            setSelect(element(by.model('patterns.type')), 1);

            var preAmountText;
            element.all(salesSelector.column('sale.amount')).get(0).getText().then(function(respond) {
                preAmountText = respond;
            });

            var saleData = {};
            element.all(by.id('SaleListRowAdd')).get(0).isDisplayed().then(function(respond) {
                saleData.addIsDisplayed = respond;
            });
            element.all(by.id('SaleListRowExtra')).get(0).isDisplayed().then(function(respond) {
                saleData.extraIsDisplayed = respond;
            });
            element.all(by.id('SaleListRowEdit')).get(0).click();

            browser.controlFlow().execute(function() {
                var newAmount = parseFloatRu(preAmountText) + 1;
                var amountElem = element(by.model('saleEdited.amount'));
                amountElem.clear();
                amountElem.sendKeys(newAmount.toString());
            });

            element(by.model('saleEdited.dealer')).element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                saleData.dealerText = respond;
            });
            element(by.model('saleEdited.site')).element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                saleData.siteText = respond;
            });
            selectedOption(element(by.model('saleEdited.tariff'))).getText().then(function(respond) {
                saleData.tariffText = respond;
            });
            element(by.model('saleEdited.date')).getAttribute('value').then(function(respond) {
                saleData.dateText = respond;
            });
            element(by.model('saleEdited.count')).getAttribute('value').then(function(respond) {
                saleData.countText = respond;
            });
            element(by.model('saleEdited.activeFrom')).getAttribute('value').then(function(respond) {
                saleData.activeFromText = respond;
            });
            element(by.model('saleEdited.activeTo')).getAttribute('value').then(function(respond) {
                saleData.activeToText = respond;
            });
            element(by.model('saleEdited.cardAmount')).getAttribute('value').then(function(respond) {
                saleData.cardAmountText = respond;
            });
            element(by.model('saleEdited.amount')).getAttribute('value').then(function(respond) {
                saleData.amountText = respond;
            });
            element(by.model('saleEdited.siteAmount')).getAttribute('value').then(function(respond) {
                saleData.siteAmountText = respond;
            });
            element(by.model('saleEdited.info')).getAttribute('value').then(function(respond) {
                saleData.infoText = respond;
            });
            selectedOption(element(by.model('saleEdited.isActive'))).getText().then(function(respond) {
                saleData.isActiveText = respond;
            });

            element(by.id('saleEditSave')).click();

            element.all(salesSelector.column('sale.date')).get(0).getText().then(function(dateText) {
                expect(dateText.replace(regexpDate, '20$3-$2-$1')).toBe(saleData.dateText);
            });
            element.all(salesSelector.column('sale.dealer.')).get(0).getText().then(function(dealerText) {
                expect(dealerText).toBe(saleData.dealerText);
            });
            element.all(salesSelector.column('sale.site.')).get(0).getText().then(function(siteText) {
                expect(siteText).toBe(saleData.siteText);
            });
            element.all(salesSelector.column('sale.type')).get(0).getText().then(function(typeText) {
                expect(typeText).toBe('Осн');
            });
            element.all(salesSelector.column('sale.count')).get(0).getText().then(function(countText) {
                expect(countText).toBe(saleData.countText);
            });
            element.all(salesSelector.column('sale.activeFrom')).get(0).getText().then(function(activeFromText) {
                expect(activeFromText.replace(regexpDate, '20$3-$2-$1')).toBe(saleData.activeFromText);
            });
            element.all(salesSelector.column('sale.activeTo')).get(0).getText().then(function(activeToText) {
                expect(activeToText.replace(regexpDate, '20$3-$2-$1')).toBe(saleData.activeToText);
            });
            element.all(salesSelector.column('sale.amount')).get(0).getText().then(function(amountText) {
                expect(parseFloatRu(amountText)).toBe(parseFloat(saleData.amountText));
            });
            element.all(salesSelector.column('sale.siteAmount')).get(0).getText().then(function(siteAmountText) {
                expect(parseFloatRu(siteAmountText)).toBe(parseFloat(saleData.siteAmountText));
            });
            element.all(salesSelector.column('sale.isActive')).get(0).getText().then(function(isActiveText) {
                expect(isActiveText).toBe(saleData.isActiveText);
            });
            element.all(by.id('SaleListRowAdd')).get(0).isDisplayed().then(function(isDisplayed) {
                expect(isDisplayed).toBe(saleData.addIsDisplayed);
            });
            element.all(by.id('SaleListRowExtra')).get(0).isDisplayed().then(function(isDisplayed) {
                expect(isDisplayed).toBe(saleData.extraIsDisplayed);
            });
            element(by.id('savedSaleListNotice')).getText().then(function(noticeText) {
                var dealerName = saleData.dealerText.replace(regexpIdName, '$2');
                var siteName = saleData.siteText.replace(regexpIdName, '$2');
                expect(noticeText).toBe('Сохранена продажа салона "' + dealerName + '" на сайте "' + siteName + '"');
            });

            element.all(by.id('SaleListRowEdit')).get(0).click();

            selectedOption(element(by.model('saleEdited.tariff'))).getText().then(function(tariffText) {
                expect(tariffText).toBe(saleData.tariffText);
            });
            element(by.model('saleEdited.cardAmount')).getAttribute('value').then(function(cardAmountText) {
                expect(cardAmountText).toBe(saleData.cardAmountText);
            });
            element(by.model('saleEdited.info')).getAttribute('value').then(function(infoText) {
                expect(infoText).toBe(saleData.infoText);
            });
        });

        it('Изменение расширения', function() {
            var salesSelector = by.repeater('sale in sales');

            setSelect(element(by.model('patterns.type')), 2);

            var preAmountText;
            element.all(salesSelector.column('sale.amount')).get(0).getText().then(function(respond) {
                preAmountText = respond;
            });

            var saleData = {};
            element.all(by.id('SaleListRowAdd')).get(0).isDisplayed().then(function(respond) {
                saleData.addIsDisplayed = respond;
            });
            element.all(by.id('SaleListRowExtra')).get(0).isDisplayed().then(function(respond) {
                saleData.extraIsDisplayed = respond;
            });

            element.all(by.id('SaleListRowEdit')).get(0).click();

            var tariffParentText;
            selectedOption(element(by.model('tariffParent'))).getText().then(function(tariffText) {
                tariffParentText = tariffText;
            });

            var tariffElem = element(by.model('saleEdited.tariff'));
            mapText(getSelectOptions(tariffElem)).then(function(options) {
                function tariffPrice(tariffText) {
                    return parseFloat(tariffText.replace(regexpTariff, '$1'));
                }
                var tariffIdx = _.findIndex(options, function(value) {
                    return !!value && tariffPrice(value) > tariffPrice(tariffParentText);
                })
                expect(tariffIdx).not.toBe(-1);
                setSelect(tariffElem, tariffIdx);
            });

            browser.controlFlow().execute(function() {
                var newAmount = parseFloatRu(preAmountText) + 1000;
                var amountElem = element(by.model('saleEdited.amount'));
                amountElem.clear();
                amountElem.sendKeys(newAmount.toString());
            });

            var saleData = {};
            element(by.model('saleEdited.dealer')).element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                saleData.dealerText = respond;
            });
            element(by.model('saleEdited.site')).element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                saleData.siteText = respond;
            });
            selectedOption(element(by.model('tariffParent'))).getText().then(function(respond) {
                saleData.parentTariffText = respond;
            });
            selectedOption(element(by.model('saleEdited.tariff'))).getText().then(function(respond) {
                saleData.tariffText = respond;
            });
            element(by.model('saleEdited.date')).getAttribute('value').then(function(respond) {
                saleData.dateText = respond;
            });
            element(by.model('saleEdited.count')).getAttribute('value').then(function(respond) {
                saleData.countText = respond;
            });
            element(by.model('saleEdited.activeFrom')).getAttribute('value').then(function(respond) {
                saleData.activeFromText = respond;
            });
            element(by.model('saleEdited.activeTo')).getAttribute('value').then(function(respond) {
                saleData.activeToText = respond;
            });
            element(by.model('saleEdited.cardAmount')).getAttribute('value').then(function(respond) {
                saleData.cardAmountText = respond;
            });
            element(by.model('saleEdited.amount')).getAttribute('value').then(function(respond) {
                saleData.amountText = respond;
            });
            element(by.model('saleEdited.siteAmount')).getAttribute('value').then(function(respond) {
                saleData.siteAmountText = respond;
            });
            element(by.model('saleEdited.info')).getAttribute('value').then(function(respond) {
                saleData.infoText = respond;
            });
            selectedOption(element(by.model('saleEdited.isActive'))).getText().then(function(respond) {
                saleData.isActiveText = respond;
            });

            element(by.id('saleEditSave')).click();

            element.all(salesSelector.column('sale.date')).get(0).getText().then(function(dateText) {
                expect(dateText.replace(regexpDate, '20$3-$2-$1')).toBe(saleData.dateText);
            });
            element.all(salesSelector.column('sale.dealer.')).get(0).getText().then(function(dealerText) {
                expect(dealerText).toBe(saleData.dealerText);
            });
            element.all(salesSelector.column('sale.site.')).get(0).getText().then(function(siteText) {
                expect(siteText).toBe(saleData.siteText);
            });
            element.all(salesSelector.column('sale.type')).get(0).getText().then(function(typeText) {
                expect(typeText).toBe('Расш');
            });
            element.all(salesSelector.column('sale.count')).get(0).getText().then(function(countText) {
                expect(countText).toBe(saleData.countText);
            });
            element.all(salesSelector.column('sale.activeFrom')).get(0).getText().then(function(activeFromText) {
                expect(activeFromText.replace(regexpDate, '20$3-$2-$1')).toBe(saleData.activeFromText);
            });
            element.all(salesSelector.column('sale.activeTo')).get(0).getText().then(function(activeToText) {
                expect(activeToText.replace(regexpDate, '20$3-$2-$1')).toBe(saleData.activeToText);
            });
            element.all(salesSelector.column('sale.amount')).get(0).getText().then(function(amountText) {
                expect(parseFloatRu(amountText)).toBe(parseFloat(saleData.amountText));
            });
            element.all(salesSelector.column('sale.siteAmount')).get(0).getText().then(function(siteAmountText) {
                expect(parseFloatRu(siteAmountText)).toBe(parseFloat(saleData.siteAmountText));
            });
            element.all(salesSelector.column('sale.isActive')).get(0).getText().then(function(isActiveText) {
                expect(isActiveText).toBe(saleData.isActiveText);
            });
            // element.all(by.id('SaleListRowAdd')).get(0).isDisplayed().then(function(isDisplayed) {
            //     expect(isDisplayed).toBe(saleData.addIsDisplayed);
            // });
            element.all(by.id('SaleListRowExtra')).get(0).isDisplayed().then(function(isDisplayed) {
                expect(isDisplayed).toBe(saleData.extraIsDisplayed);
            });
            element(by.id('savedSaleListNotice')).getText().then(function(noticeText) {
                var dealerName = saleData.dealerText.replace(regexpIdName, '$2');
                var siteName = saleData.siteText.replace(regexpIdName, '$2');
                expect(noticeText).toBe('Сохранена продажа салона "' + dealerName + '" на сайте "' + siteName + '"');
            });

            element.all(by.id('SaleListRowEdit')).get(0).click();

            selectedOption(element(by.model('tariffParent'))).getText().then(function(parentTariffText) {
                expect(parentTariffText).toBe(saleData.parentTariffText);
            });
            selectedOption(element(by.model('saleEdited.tariff'))).getText().then(function(tariffText) {
                expect(tariffText).toBe(saleData.tariffText);
            });
            element(by.model('saleEdited.cardAmount')).getAttribute('value').then(function(cardAmountText) {
                expect(cardAmountText).toBe(saleData.cardAmountText);
            });
            element(by.model('saleEdited.info')).getAttribute('value').then(function(infoText) {
                expect(infoText).toBe(saleData.infoText);
            });
        });

        it('Изменение доплаты', function() {
            var salesSelector = by.repeater('sale in sales');

            setSelect(element(by.model('patterns.type')), 3);

            var preAmountText;
            element.all(salesSelector.column('sale.amount')).get(0).getText().then(function(respond) {
                preAmountText = respond;
            });

            var saleData = {};
            element.all(salesSelector.column('sale.activeFrom')).get(0).getText().then(function(respond) {
                saleData.activeFromText = respond;
            });
            element.all(salesSelector.column('sale.activeTo')).get(0).getText().then(function(respond) {
                saleData.activeToText = respond;
            });
            element.all(salesSelector.column('sale.isActive')).get(0).getText().then(function(respond) {
                saleData.isActiveText = respond;
            });
            element.all(by.id('SaleListRowEdit')).get(0).click();

            browser.controlFlow().execute(function() {
                var newAmount = parseFloatRu(preAmountText) + 1;
                var amountElem = element(by.model('saleEdited.amount'));
                amountElem.clear();
                amountElem.sendKeys(newAmount.toString());
            });

            element(by.model('saleEdited.dealer')).element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                saleData.dealerText = respond;
            });
            element(by.model('saleEdited.site')).element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                saleData.siteText = respond;
            });
            element(by.model('saleEdited.date')).getAttribute('value').then(function(respond) {
                saleData.dateText = respond;
            });
            element(by.model('saleEdited.amount')).getAttribute('value').then(function(respond) {
                saleData.amountText = respond;
            });
            element(by.model('saleEdited.siteAmount')).getAttribute('value').then(function(respond) {
                saleData.siteAmountText = respond;
            });
            element(by.model('saleEdited.info')).getAttribute('value').then(function(respond) {
                saleData.infoText = respond;
            });

            element(by.id('saleEditSave')).click();

            element.all(salesSelector.column('sale.date')).get(0).getText().then(function(dateText) {
                expect(dateText.replace(regexpDate, '20$3-$2-$1')).toBe(saleData.dateText);
            });
            element.all(salesSelector.column('sale.dealer.')).get(0).getText().then(function(dealerText) {
                expect(dealerText).toBe(saleData.dealerText);
            });
            element.all(salesSelector.column('sale.site.')).get(0).getText().then(function(siteText) {
                expect(siteText).toBe(saleData.siteText);
            });
            element.all(salesSelector.column('sale.type')).get(0).getText().then(function(typeText) {
                expect(typeText).toBe('Доп');
            });
            element.all(salesSelector.column('sale.count')).get(0).getText().then(function(countText) {
                expect(countText).toBeFalsy();
            });
            element.all(salesSelector.column('sale.activeFrom')).get(0).getText().then(function(activeFromText) {
                expect(activeFromText).toBe(saleData.activeFromText);
            });
            element.all(salesSelector.column('sale.activeTo')).get(0).getText().then(function(activeToText) {
                expect(activeToText).toBe(saleData.activeToText);
            });
            element.all(salesSelector.column('sale.amount')).get(0).getText().then(function(amountText) {
                expect(parseFloatRu(amountText)).toBe(parseFloat(saleData.amountText));
            });
            element.all(salesSelector.column('sale.siteAmount')).get(0).getText().then(function(siteAmountText) {
                expect(parseFloatRu(siteAmountText)).toBe(parseFloat(saleData.siteAmountText));
            });
            element.all(salesSelector.column('sale.isActive')).get(0).getText().then(function(isActiveText) {
                expect(isActiveText).toBe(saleData.isActiveText);
            });
            expect(element.all(by.id('SaleListRowAdd')).get(0).isDisplayed()).toBeFalsy();
            expect(element.all(by.id('SaleListRowExtra')).get(0).isDisplayed()).toBeFalsy();
            element(by.id('savedSaleListNotice')).getText().then(function(noticeText) {
                var dealerName = saleData.dealerText.replace(regexpIdName, '$2');
                var siteName = saleData.siteText.replace(regexpIdName, '$2');
                expect(noticeText).toBe('Сохранена продажа салона "' + dealerName + '" на сайте "' + siteName + '"');
            });

            element.all(by.id('SaleListRowEdit')).get(0).click();

            element(by.model('saleEdited.info')).getAttribute('value').then(function(infoText) {
                expect(infoText).toBe(saleData.infoText);
            });
        });

        it('Удаление расширения', function() {
            setSelect(element(by.model('patterns.type')), 2);

            var totalItems;
            element(by.binding('{{totalItems}}')).getText().then(function(totalItemsText) {
                totalItems = _.parseInt(totalItemsText.replace(regexpTotalItems, '$1'));
            });

            var saleRemove;
            element.all(by.repeater('sale in sales')).get(0).getText().then(function(saleText) {
                saleRemove = saleText;
            });

            element.all(by.id('SaleListRowRemove')).get(0).click();

            var alertSaleParams;
            var alert = browser.switchTo().alert();
            alert.getText().then(function(alertText) {
                alertSaleParams = alertText.replace(regexpSaleName, '$1;$2');
                alert.accept();
            });

            var savedSaleListNoticeElem = element(by.id('savedSaleListNotice'));
            expect(savedSaleListNoticeElem.isDisplayed()).toBeTruthy();
            savedSaleListNoticeElem.getText().then(function(noticeText) {
                expect(noticeText.replace(regexpSaleName, '$1;$2')).toBe(alertSaleParams);
            });
            element.all(by.repeater('sale in sales')).get(0).getText().then(function(saleText) {
                expect(saleText).not.toBe(saleRemove);
            });
            element(by.binding('{{totalItems}}')).getText().then(function(totalItemsText) {
                expect(_.parseInt(totalItemsText.replace(regexpTotalItems, '$1'))).toBe(totalItems - 1);
            });
        });

        it('Удаление доплаты', function() {
            setSelect(element(by.model('patterns.type')), 3);

            var totalItems;
            element(by.binding('{{totalItems}}')).getText().then(function(totalItemsText) {
                totalItems = _.parseInt(totalItemsText.replace(regexpTotalItems, '$1'));
            });

            var saleRemove;
            element.all(by.repeater('sale in sales')).get(0).getText().then(function(saleText) {
                saleRemove = saleText;
            });

            element.all(by.id('SaleListRowRemove')).get(0).click();

            var alertSaleParams;
            var alert = browser.switchTo().alert();
            alert.getText().then(function(alertText) {
                alertSaleParams = alertText.replace(regexpSaleName, '$1;$2');
                alert.accept();
            });

            var savedSaleListNoticeElem = element(by.id('savedSaleListNotice'));
            expect(savedSaleListNoticeElem.isDisplayed()).toBeTruthy();
            savedSaleListNoticeElem.getText().then(function(noticeText) {
                expect(noticeText.replace(regexpSaleName, '$1;$2')).toBe(alertSaleParams);
            });
            element.all(by.repeater('sale in sales')).get(0).getText().then(function(saleText) {
                expect(saleText).not.toBe(saleRemove);
            });
            element(by.binding('{{totalItems}}')).getText().then(function(totalItemsText) {
                expect(_.parseInt(totalItemsText.replace(regexpTotalItems, '$1'))).toBe(totalItems - 1);
            });
        });

        it('Удаление карточки', function() {
            setSelect(element(by.model('patterns.type')), 1);

            var totalItems;
            element(by.binding('{{totalItems}}')).getText().then(function(totalItemsText) {
                totalItems = _.parseInt(totalItemsText.replace(regexpTotalItems, '$1'));
            });

            var saleRemove;
            element.all(by.repeater('sale in sales')).get(0).getText().then(function(saleText) {
                saleRemove = saleText;
            });

            element.all(by.id('SaleListRowRemove')).get(0).click();

            var alertSaleParams;
            var alert = browser.switchTo().alert();
            alert.getText().then(function(alertText) {
                alertSaleParams = alertText.replace(regexpSaleName, '$1;$2');
                alert.accept();
            });

            var savedSaleListNoticeElem = element(by.id('savedSaleListNotice'));
            expect(savedSaleListNoticeElem.isDisplayed()).toBeTruthy();
            savedSaleListNoticeElem.getText().then(function(noticeText) {
                expect(noticeText.replace(regexpSaleName, '$1;$2')).toBe(alertSaleParams);
            });
            element.all(by.repeater('sale in sales')).get(0).getText().then(function(saleText) {
                expect(saleText).not.toBe(saleRemove);
            });
            element(by.binding('{{totalItems}}')).getText().then(function(totalItemsText) {
                expect(_.parseInt(totalItemsText.replace(regexpTotalItems, '$1'))).toBe(totalItems - 1);
            });
        });
    });
});

describe('DealerSite App', function() {

    describe('Одиночный выбор значений, загружаемых с сервера', function() {
        beforeEach(function() {
            browser.get('admin.html#/dealersitelist');
        });

        it('заменяет в карточке дилера с помощью загружающего контрола', function() {
            element.all(by.id('DealerSiteListRowEdit')).get(0).click();

            var dealerElem = element(by.model('dealerSiteEdited.dealer'));
            var selectedElems = dealerElem.all(by.repeater('choice in _selectedChoices'));
            var searchElem = dealerElem.element(by.id('McomboSearchInput'));
            var dropElems = dealerElem.all(by.id('McomboDropChoiceItem'));
            var noResultsElem = dealerElem.element(by.css('.no-results'));

            // показывает контрол в исходном состоянии
            expect(selectedElems.count()).toBe(1);
            expect(searchElem.isDisplayed()).toBeTruthy();
            expect(searchElem.isEnabled()).toBeTruthy();
            expect(searchElem.getAttribute('value')).toBeFalsy();
            expect(dropElems.count()).toBeFalsy();
            expect(noResultsElem.isDisplayed()).toBeFalsy();

            // заполняет и показывает начальный список вариантов и ставит маркер на верхний
            searchElem.click();
            expect(dropElems.count()).toBeTruthy();
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeTruthy();
                });
            });
            expect(dropElems.count()).not.toBeLessThan(2);
            mapText(dropElems).then(function(dropTexts) {
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
            });

            // изменяет список вариантов
            mapText(dropElems).then(function(preDrops) {
                searchElem.sendKeys('3');
                mapText(dropElems).then(function(newDrops) {
                    expect(_.isEqual(newDrops, preDrops)).toBeFalsy();
                });
            });

            // выводит пустой список вариантов и надпись "Нет вариантов"
            searchElem.sendKeys('999');
            expect(dropElems.count()).toBeFalsy();
            expect(noResultsElem.isDisplayed()).toBeTruthy();

            // убирает надпись "Нет вариантов"
            searchElem.sendKeys(protractor.Key.BACK_SPACE + protractor.Key.BACK_SPACE + protractor.Key.BACK_SPACE);
            expect(dropElems.count()).toBeTruthy();
            expect(noResultsElem.isDisplayed()).toBeFalsy();

            // двигает маркер вниз и вверх в пределах списка
            mapText(dropElems).then(function(dropTexts) {
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
                searchElem.sendKeys(protractor.Key.ARROW_DOWN);
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[1]);
                });
                searchElem.sendKeys(protractor.Key.ARROW_UP);
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
                searchElem.sendKeys(protractor.Key.ARROW_UP);
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
            });

            // выбирает значение с помощью клавиатуры, скрывает список вариантов, очищает фильтр
            dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                searchElem.sendKeys(protractor.Key.ENTER);
                expect(selectedElems.count()).toBe(1);
                mapText(selectedElems).then(function(selectedTexts) {
                    expect(selectedTexts[0]).toBe(hoverText);
                });
            });
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeFalsy();
                });
            });
            expect(searchElem.getAttribute('value')).toBeFalsy();

            // удаляет значение с помощью мыши, не показывая список вариантов
            selectedElems.get(0).click();
            expect(selectedElems.count()).toBe(0);
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeFalsy();
                });
            });

            // показывает список вариантов и скрывает его по нажатию Esc
            searchElem.click();
            expect(dropElems.count()).toBeTruthy();
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeTruthy();
                });
            });
            searchElem.sendKeys(protractor.Key.ESCAPE);
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeFalsy();
                });
            });
        });
    });

    describe('Множественный выбор значений, загружаемых с сервера', function() {
        beforeEach(function() {
            browser.get('admin.html#/dealersitelist');
        });

        it('выбирает несколько дилеров с помощью загружающего контрола', function() {
            var dealerElem = element(by.model('patterns.dealers'));
            var selectedElems = dealerElem.all(by.repeater('choice in _selectedChoices'));
            var searchElem = dealerElem.element(by.id('McomboSearchInput'));
            var dropElems = dealerElem.all(by.id('McomboDropChoiceItem'));
            var noResultsElem = dealerElem.element(by.css('.no-results'));

            // показывает контрол в исходном состоянии
            expect(selectedElems.count()).toBe(0);
            expect(searchElem.isDisplayed()).toBeTruthy();
            expect(searchElem.isEnabled()).toBeTruthy();
            expect(searchElem.getAttribute('value')).toBeFalsy();
            expect(dropElems.count()).toBeFalsy();
            expect(noResultsElem.isDisplayed()).toBeFalsy();

            // заполняет и показывает начальный список вариантов и ставит маркер на верхний
            searchElem.click();
            expect(dropElems.count()).toBeTruthy();
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeTruthy();
                });
            });
            expect(dropElems.count()).not.toBeLessThan(2);
            mapText(dropElems).then(function(dropTexts) {
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
            });

            // изменяет список вариантов
            mapText(dropElems).then(function(preDrops) {
                searchElem.sendKeys('3');
                mapText(dropElems).then(function(newDrops) {
                    expect(_.isEqual(newDrops, preDrops)).toBeFalsy();
                });
            });

            // выводит пустой список вариантов и надпись "Нет вариантов"
            searchElem.sendKeys('999');
            expect(dropElems.count()).toBeFalsy();
            expect(noResultsElem.isDisplayed()).toBeTruthy();

            // убирает надпись "Нет вариантов"
            searchElem.sendKeys(protractor.Key.BACK_SPACE + protractor.Key.BACK_SPACE + protractor.Key.BACK_SPACE);
            expect(dropElems.count()).toBeTruthy();
            expect(noResultsElem.isDisplayed()).toBeFalsy();

            // двигает маркер вниз и вверх в пределах списка
            mapText(dropElems).then(function(dropTexts) {
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
                searchElem.sendKeys(protractor.Key.ARROW_DOWN);
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[1]);
                });
                searchElem.sendKeys(protractor.Key.ARROW_UP);
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
                searchElem.sendKeys(protractor.Key.ARROW_UP);
                dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                    expect(hoverText).toBe(dropTexts[0]);
                });
            });

            // выбирает значение с помощью клавиатуры, скрывает список вариантов, очищает фильтр
            dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                searchElem.sendKeys(protractor.Key.ENTER);
                expect(selectedElems.count()).toBe(1);
                mapText(selectedElems).then(function(selectedTexts) {
                    expect(selectedTexts[0]).toBe(hoverText);
                });
            });
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeFalsy();
                });
            });
            expect(searchElem.getAttribute('value')).toBeFalsy();

            // выбирает еще значение с помощью клавиатуры, скрывает список вариантов, очищает фильтр
            searchElem.click();
            dealerElem.element(by.css('.hover')).getText().then(function(hoverText) {
                searchElem.sendKeys(protractor.Key.ENTER);
                expect(selectedElems.count()).toBe(2);
                mapText(selectedElems).then(function(selectedTexts) {
                    expect(selectedTexts[1]).toBe(hoverText);
                });
            });
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeFalsy();
                });
            });
            expect(searchElem.getAttribute('value')).toBeFalsy();

            // удаляет значение с помощью мыши, не показывая список вариантов
            selectedElems.get(0).click();
            expect(selectedElems.count()).toBe(1);
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeFalsy();
                });
            });

            // показывает список вариантов и скрывает его по нажатию Esc
            searchElem.click();
            expect(dropElems.count()).toBeTruthy();
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeTruthy();
                });
            });
            searchElem.sendKeys(protractor.Key.ESCAPE);
            mapIsDisplayed(dropElems).then(function(isDisplayedArray) {
                _.forEach(isDisplayedArray, function(isDisplayed) {
                    expect(isDisplayed).toBeFalsy();
                });
            });
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
            expect(browser.getLocationAbsUrl()).toMatch(/#\/dealersite\?id=new/);
        });

        it('переходит по нижней кнопке добавления регистрации', function() {
            element.all(by.id('DealerSiteListAddDealerSiteDown')).get(0).click();
            expect(browser.getLocationAbsUrl()).toMatch(/#\/dealersite\?id=new/);
        });

        it('показывает знак сортировки и сортирует элементы', function() {
            function takeInt() {
                return _.parseInt(this);
            }

            function takeFloat() {
                return parseFloatRu(this);
            }

            function takeDate() {
                return this.replace(regexpDate, '20$3-$2-$1');
            }

            function takeId() {
                return _.parseInt(this.replace(regexpIdName,'$1'));
            }

            function takeString() {
                return this;
            }

            function setHeader(what, where) {
                var copy = header.slice(0, 5);
                copy.splice(where, 1, what);
                return copy;
            }

            var header = ['','','','',''];
            var columns = [
                {bind: 'dealer.id', type: 'Integers', valueFn: takeId},
                {bind: 'site.id', type: 'Integers', valueFn: takeId},
                {bind: 'externalId', type: 'Strings', valueFn: takeString},
                {bind: 'publicUrl', type: 'Strings', valueFn: takeString},
                {bind: 'isActive', type: 'Booleans', valueFn: function() {   // сортирует по id, а не по отображаемому наименованию
                    return [true, false][['Акт', 'Бло'].indexOf(this)];
                }}
            ]

            var sortableColumnsRef = element.all(by.id('DealerSiteListTableHeaderRef'));
            var sortableColumnsDir = element.all(by.id('DealerSiteListTableHeaderDir'));
            expect(mapText(sortableColumnsDir)).toEqual(header);
            _.forEach(header, function(value, idx) {
                sortableColumnsRef.get(idx).click();
                expect(mapText(sortableColumnsDir)).toEqual(setHeader('↓', idx));
                mapText(element.all(by.repeater('dealerSite in dealerSites').column('dealerSite.' + columns[idx].bind))).then(function(data) {
                    expect(_.invoke(data, columns[idx].valueFn)).toBeSortedArrayOf('Ascending' + columns[idx].type);
                });
                sortableColumnsRef.get(idx).click();
                expect(mapText(sortableColumnsDir)).toEqual(setHeader('↑', idx));
                mapText(element.all(by.repeater('dealerSite in dealerSites').column('dealerSite.' + columns[idx].bind))).then(function(data) {
                    expect(_.invoke(data, columns[idx].valueFn)).toBeSortedArrayOf('Descending' + columns[idx].type);
                });
            });
        });

        it('показывает реквизиты регистраций', function() {
            var dealerSites = by.repeater('dealerSite in dealerSites');
            element.all(dealerSites).count().then(function(count) {
                for(var i = count; i--; ) {
                    var dealerSite = dealerSites.row(i);
                    expect(element(dealerSite.column('dealerSite.dealer')).getText()).toMatch(regexpIdName);
                    expect(element(dealerSite.column('dealerSite.site')).getText()).toMatch(regexpIdName);
                    expect(element(dealerSite.column('dealerSite.externalId')).getText()).toMatchOrEmpty(/^\w+$/);
                    expect(element(dealerSite.column('publicUrlText')).getText()).toMatchOrEmpty(/^Ссылка$/);
                    expect(element(dealerSite.column('publicUrlText')).getAttribute('href')).toMatchOrEmpty(regexpUrl);
                    expect(element(dealerSite.column('dealerSite.isActive')).getText()).toMatch(/^(Акт|Бло)$/);
                }
            });
        });

        it('переходит к редактированию регистрации по ссылке в "изменить"', function() {
            element.all(by.id('DealerSiteListRowEdit')).get(0).click();
            expect(browser.getLocationAbsUrl()).toMatch(/#\/dealersite\?id=\d+/);
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

                setSelect(element(by.model('patterns.isActive')), 1);
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

                setSelect(element(by.model('patterns.isActive')), 1);
                expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 100$/);

                element(by.id('DealerSiteListFilterSetDefault')).click();
                expect(element(by.binding('{{totalItems}}')).getText()).toMatch(/ 900$/);
            }
        });
    });

    describe('Редактирование регистрации', function() {
        beforeEach(function() {
            browser.get('admin.html#/dealersitelist?sites=6&isActive=true&itemsPerPage=15');
            element.all(by.id('DealerSiteListRowEdit')).get(0).click();
            browser.waitForAngular();
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
            browser.get('admin.html#/dealersitelist?orders=-id');
        });

        it('Создание нового разрешения на экспорт, доступа и изменение координат', function() {
            var dealerSitesSelector = by.repeater('dealerSite in dealerSites');

            var dealerElem = element(by.id('DealerSiteListFilterDealers'));
            var dealerElemSearch = dealerElem.element(by.id('McomboSearchInput'));
            dealerElemSearch.click();
            dealerElemSearch.sendKeys('5');
            dealerElem.all(by.id('McomboDropChoiceItem')).get(2).click();

            var siteElem = element(by.id('DealerSiteListFilterSites'));
            var siteElemSearch = siteElem.element(by.id('McomboSearchInput'));
            siteElemSearch.click();
            siteElemSearch.sendKeys('19');
            siteElem.all(by.id('McomboDropChoiceItem')).get(0).click();

            expect(element.all(dealerSitesSelector).count()).toBe(0);
            element(by.id('DealerSiteListAddDealerSiteUp')).click();

            var editDealerElem = element(by.model('dealerSiteEdited.dealer'));
            var editDealerElemSearch = editDealerElem.element(by.id('McomboSearchInput'));
            editDealerElemSearch.click();
            editDealerElemSearch.sendKeys('5');
            editDealerElem.all(by.id('McomboDropChoiceItem')).get(2).click();

            var editSiteElem = element(by.model('dealerSiteEdited.site'));
            var editSiteElemSearch = editSiteElem.element(by.id('McomboSearchInput'));
            editSiteElemSearch.click();
            editSiteElemSearch.sendKeys('19');
            editSiteElem.all(by.id('McomboDropChoiceItem')).get(0).click();

            element(by.model('dealerSiteEdited.externalId')).sendKeys(randomMillion());
            element(by.model('dealerSiteEdited.publicUrl')).sendKeys('http://www.protractor.ru/' + randomMillion());
            element(by.model('dealerSiteLoginsEdited.site.login')).sendKeys(randomMillion());
            element(by.model('dealerSiteLoginsEdited.site.password')).sendKeys(randomMillion());
            element(by.model('userEdited.dealer.latitude')).clear();
            element(by.model('userEdited.dealer.latitude')).sendKeys(randomLatitude());
            element(by.model('userEdited.dealer.longitude')).clear();
            element(by.model('userEdited.dealer.longitude')).sendKeys(randomLongitude());

            var dealerSiteData = {};
            editDealerElem.element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                dealerSiteData.dealerText = respond;
            });
            editSiteElem.element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                dealerSiteData.siteText = respond;
            });
            element(by.model('dealerSiteEdited.externalId')).getAttribute('value').then(function(respond) {
                dealerSiteData.externalId = respond;
            });
            element(by.model('dealerSiteEdited.publicUrl')).getAttribute('value').then(function(respond) {
                dealerSiteData.publicUrl = respond;
            });
            element(by.model('dealerSiteLoginsEdited.site.login')).getAttribute('value').then(function(respond) {
                dealerSiteData.siteLogin = respond;
            });
            element(by.model('dealerSiteLoginsEdited.site.password')).getAttribute('value').then(function(respond) {
                dealerSiteData.sitePassword = respond;
            });
            selectedOption(element(by.model('dealerSiteEdited.isActive'))).getText().then(function(respond) {
                dealerSiteData.isActiveText = respond;
            });
            element(by.model('userEdited.dealer.latitude')).getAttribute('value').then(function(respond) {
                dealerSiteData.latitude = respond;
            });
            element(by.model('userEdited.dealer.longitude')).getAttribute('value').then(function(respond) {
                dealerSiteData.longitude = respond;
            });

            element(by.id('dealerSiteEditSave')).click();
            expect(element.all(dealerSitesSelector).count()).toBe(1);

            var dealerSite = element.all(dealerSitesSelector).get(0);
            dealerSite.element(by.binding('dealerSite.dealer')).getText().then(function(respond) {
                expect(respond).toBe(dealerSiteData.dealerText);
            });
            dealerSite.element(by.binding('dealerSite.site')).getText().then(function(respond) {
                expect(respond).toBe(dealerSiteData.siteText);
            });
            dealerSite.element(by.binding('dealerSite.externalId')).getText().then(function(respond) {
                expect(respond).toBe(dealerSiteData.externalId);
            });
            dealerSite.element(by.binding('publicUrlText(dealerSite)')).getText().then(function(respond) {
                expect(respond).toBe('Ссылка');
            });
            dealerSite.element(by.binding('publicUrlText(dealerSite)')).getAttribute('href').then(function(respond) {
                expect(respond).toBe(dealerSiteData.publicUrl);
            });
            dealerSite.element(by.binding('dealerSite.isActive')).getText().then(function(respond) {
                expect(respond).toBe(dealerSiteData.isActiveText);
            });
            expect(dealerSite.element(by.id('DealerSiteListRowEdit')).isDisplayed()).toBeTruthy();

            element(by.id('DealerSiteListNotice')).getText().then(function(noticeText) {
                var dealerName = dealerSiteData.dealerText.replace(regexpIdName, '$2');
                var siteName = dealerSiteData.siteText.replace(regexpIdName, '$2');
                expect(noticeText).toBe('Сохранена регистрация салона "' + dealerName + '" на сайте "' + siteName + '"');
            });

            element.all(by.id('DealerSiteListRowEdit')).get(0).click();

            element(by.model('dealerSiteLoginsEdited.site.login')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerSiteData.siteLogin);
            });
            element(by.model('dealerSiteLoginsEdited.site.password')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerSiteData.sitePassword);
            });
            element(by.model('userEdited.dealer.latitude')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerSiteData.latitude);
            });
            element(by.model('userEdited.dealer.longitude')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerSiteData.longitude);
            });
        });

        it('Изменение регистрационных данных и доступа', function() {
            var dealerSitesSelector = by.repeater('dealerSite in dealerSites');
            var dealerSiteData = {};

            var dealerSite = element.all(dealerSitesSelector).first();
            dealerSite.element(by.binding('dealerSite.dealer')).getText().then(function(respond) {
                dealerSiteData.dealerText = respond;
            });
            dealerSite.element(by.binding('dealerSite.site')).getText().then(function(respond) {
                dealerSiteData.siteText = respond;
            });

            var dealerElem = element(by.id('DealerSiteListFilterDealers'));
            var dealerElemSearch = dealerElem.element(by.id('McomboSearchInput'));
            dealerElemSearch.click().then(function() {
                dealerElemSearch.sendKeys(dealerSiteData.dealerText.replace(regexpIdName, '$1'));
            });
            dealerElem.all(by.id('McomboDropChoiceItem')).get(0).click();

            var siteElem = element(by.id('DealerSiteListFilterSites'));
            var siteElemSearch = siteElem.element(by.id('McomboSearchInput'));
            siteElemSearch.click().then(function() {
                siteElemSearch.sendKeys(dealerSiteData.siteText.replace(regexpIdName, '$1'));
            });
            siteElem.all(by.id('McomboDropChoiceItem')).get(0).click();

            expect(element.all(dealerSitesSelector).count()).toBe(1);

            element.all(by.id('DealerSiteListRowEdit')).get(0).click();

            element(by.model('dealerSiteEdited.externalId')).clear();
            element(by.model('dealerSiteEdited.externalId')).sendKeys(randomMillion());
            element(by.model('dealerSiteEdited.publicUrl')).clear();
            element(by.model('dealerSiteEdited.publicUrl')).sendKeys('http://www.protractor.ru/' + randomMillion());
            element(by.model('dealerSiteLoginsEdited.site.login')).clear();
            element(by.model('dealerSiteLoginsEdited.site.login')).sendKeys(randomMillion());
            element(by.model('dealerSiteLoginsEdited.site.password')).clear();
            element(by.model('dealerSiteLoginsEdited.site.password')).sendKeys(randomMillion());

            var dealerElem = element(by.model('dealerSiteEdited.dealer'));
            var siteElem = element(by.model('dealerSiteEdited.site'));

            var dealerSiteData = {};
            dealerElem.element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                dealerSiteData.dealerText = respond;
            });
            siteElem.element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                dealerSiteData.siteText = respond;
            });
            element(by.model('dealerSiteEdited.externalId')).getAttribute('value').then(function(respond) {
                dealerSiteData.externalId = respond;
            });
            element(by.model('dealerSiteEdited.publicUrl')).getAttribute('value').then(function(respond) {
                dealerSiteData.publicUrl = respond;
            });
            element(by.model('dealerSiteLoginsEdited.site.login')).getAttribute('value').then(function(respond) {
                dealerSiteData.siteLogin = respond;
            });
            element(by.model('dealerSiteLoginsEdited.site.password')).getAttribute('value').then(function(respond) {
                dealerSiteData.sitePassword = respond;
            });
            selectedOption(element(by.model('dealerSiteEdited.isActive'))).getText().then(function(respond) {
                dealerSiteData.isActiveText = respond;
            });

            element(by.id('dealerSiteEditSave')).click();

            element.all(dealerSitesSelector.column('dealerSite.dealer')).get(0).getText().then(function(respond) {
                expect(respond).toBe(dealerSiteData.dealerText);
            });
            element.all(dealerSitesSelector.column('dealerSite.site')).get(0).getText().then(function(respond) {
                expect(respond).toBe(dealerSiteData.siteText);
            });
            element.all(dealerSitesSelector.column('dealerSite.externalId')).get(0).getText().then(function(respond) {
                expect(respond).toBe(dealerSiteData.externalId);
            });
            element.all(dealerSitesSelector.column('publicUrlText(dealerSite)')).get(0).getText().then(function(respond) {
                expect(respond).toBe('Ссылка');
            });
            element.all(dealerSitesSelector.column('publicUrlText(dealerSite)')).get(0).getAttribute('href').then(function(respond) {
                expect(respond).toBe(dealerSiteData.publicUrl);
            });
            element.all(dealerSitesSelector.column('dealerSite.isActive')).get(0).getText().then(function(respond) {
                expect(respond).toBe(dealerSiteData.isActiveText);
            });
            expect(element.all(by.id('DealerSiteListRowEdit')).get(0).isDisplayed()).toBeTruthy();

            element(by.id('DealerSiteListNotice')).getText().then(function(noticeText) {
                var dealerName = dealerSiteData.dealerText.replace(regexpIdName, '$2');
                var siteName = dealerSiteData.siteText.replace(regexpIdName, '$2');
                expect(noticeText).toBe('Сохранена регистрация салона "' + dealerName + '" на сайте "' + siteName + '"');
            });

            element.all(by.id('DealerSiteListRowEdit')).get(0).click();

            element(by.model('dealerSiteLoginsEdited.site.login')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerSiteData.siteLogin);
            });
            element(by.model('dealerSiteLoginsEdited.site.password')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerSiteData.sitePassword);
            });
        });

        it('Очистка регистрационных данных и доступа и получение отказа в активации', function() {
            var dealerSitesSelector = by.repeater('dealerSite in dealerSites');
            var dealerSiteData = {};

            var dealerSite = element.all(dealerSitesSelector).first();
            dealerSite.element(by.binding('dealerSite.dealer')).getText().then(function(respond) {
                dealerSiteData.dealerText = respond;
            });
            dealerSite.element(by.binding('dealerSite.site')).getText().then(function(respond) {
                dealerSiteData.siteText = respond;
            });

            var dealerElem = element(by.id('DealerSiteListFilterDealers'));
            var dealerElemSearch = dealerElem.element(by.id('McomboSearchInput'));
            dealerElemSearch.click().then(function() {
                dealerElemSearch.sendKeys(dealerSiteData.dealerText.replace(regexpIdName, '$1'));
            });
            dealerElem.all(by.id('McomboDropChoiceItem')).get(0).click();

            var siteElem = element(by.id('DealerSiteListFilterSites'));
            var siteElemSearch = siteElem.element(by.id('McomboSearchInput'));
            siteElemSearch.click().then(function() {
                siteElemSearch.sendKeys(dealerSiteData.siteText.replace(regexpIdName, '$1'));
            });
            siteElem.all(by.id('McomboDropChoiceItem')).get(0).click();

            expect(element.all(dealerSitesSelector).count()).toBe(1);

            element.all(by.id('DealerSiteListRowEdit')).get(0).click();

            element(by.model('dealerSiteEdited.externalId')).clear();
            element(by.model('dealerSiteEdited.publicUrl')).clear();
            element(by.model('dealerSiteLoginsEdited.site.login')).clear();
            element(by.model('dealerSiteLoginsEdited.site.password')).clear();
            setSelect(element(by.model('dealerSiteEdited.isActive')), 1);

            var editDealerElem = element(by.model('dealerSiteEdited.dealer'));
            var editSiteElem = element(by.model('dealerSiteEdited.site'));

            var dealerSiteData = {};
            editDealerElem.element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                dealerSiteData.dealerText = respond;
            });
            editSiteElem.element(by.id('McomboSelectedItem_0')).getText().then(function(respond) {
                dealerSiteData.siteText = respond;
            });
            element(by.model('dealerSiteEdited.externalId')).getAttribute('value').then(function(respond) {
                dealerSiteData.externalId = respond;
            });
            element(by.model('dealerSiteEdited.publicUrl')).getAttribute('value').then(function(respond) {
                dealerSiteData.publicUrl = respond;
            });
            element(by.model('dealerSiteLoginsEdited.site.login')).getAttribute('value').then(function(respond) {
                dealerSiteData.siteLogin = respond;
            });
            element(by.model('dealerSiteLoginsEdited.site.password')).getAttribute('value').then(function(respond) {
                dealerSiteData.sitePassword = respond;
            });
            selectedOption(element(by.model('dealerSiteEdited.isActive'))).getText().then(function(respond) {
                dealerSiteData.isActiveText = respond;
            });

            element(by.id('dealerSiteEditSave')).click();

            element.all(dealerSitesSelector.column('dealerSite.dealer')).get(0).getText().then(function(respond) {
                expect(respond).toBe(dealerSiteData.dealerText);
            });
            element.all(dealerSitesSelector.column('dealerSite.site')).get(0).getText().then(function(respond) {
                expect(respond).toBe(dealerSiteData.siteText);
            });
            element.all(dealerSitesSelector.column('dealerSite.externalId')).get(0).getText().then(function(respond) {
                expect(respond).toBe(dealerSiteData.externalId);
            });
            element.all(dealerSitesSelector.column('publicUrlText(dealerSite)')).get(0).getText().then(function(respond) {
                expect(respond).toMatch(/^(Ссылка)?$/);
            });
            element.all(dealerSitesSelector.column('publicUrlText(dealerSite)')).get(0).getAttribute('href').then(function(respond) {
                expect(respond).toBe(dealerSiteData.publicUrl);
            });
            element.all(dealerSitesSelector.column('dealerSite.isActive')).get(0).getText().then(function(respond) {
                expect(respond).toBe(dealerSiteData.isActiveText);
            });
            expect(element.all(by.id('DealerSiteListRowEdit')).get(0).isDisplayed()).toBeTruthy();

            element(by.id('DealerSiteListNotice')).getText().then(function(noticeText) {
                var dealerName = dealerSiteData.dealerText.replace(regexpIdName, '$2');
                var siteName = dealerSiteData.siteText.replace(regexpIdName, '$2');
                expect(noticeText).toBe('Сохранена регистрация салона "' + dealerName + '" на сайте "' + siteName + '"');
            });

            element.all(dealerSitesSelector.column('dealerSite.isActive')).get(0).click();
            browser.wait(function() {
                return browser.switchTo().alert().then(
                    function() { return true; },
                    function() { return false; }
                );
            });
            var alert = browser.switchTo().alert();
            expect(alert.getText()).toMatch(/^Для разблокирования необходимо заполнить поля формы регистрации: (.+)/);
            browser.switchTo().alert().accept();

            element.all(by.id('DealerSiteListRowEdit')).get(0).click();

            element(by.model('dealerSiteLoginsEdited.site.login')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerSiteData.siteLogin);
            });
            element(by.model('dealerSiteLoginsEdited.site.password')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerSiteData.sitePassword);
            });
        });

        it('Сохранение и удаление доступа', function() {
            var dealerSitesSelector = by.repeater('dealerSite in dealerSites');
            var dealerSiteData = {};

            var dealerSite = element.all(dealerSitesSelector).first();
            dealerSite.element(by.binding('dealerSite.dealer')).getText().then(function(respond) {
                dealerSiteData.dealerText = respond;
            });
            dealerSite.element(by.binding('dealerSite.site')).getText().then(function(respond) {
                dealerSiteData.siteText = respond;
            });

            var dealerElem = element(by.id('DealerSiteListFilterDealers'));
            var dealerElemSearch = dealerElem.element(by.id('McomboSearchInput'));
            dealerElemSearch.click().then(function() {
                dealerElemSearch.sendKeys(dealerSiteData.dealerText.replace(regexpIdName, '$1'));
            });
            dealerElem.all(by.id('McomboDropChoiceItem')).get(0).click();

            var siteElem = element(by.id('DealerSiteListFilterSites'));
            var siteElemSearch = siteElem.element(by.id('McomboSearchInput'));
            siteElemSearch.click().then(function() {
                siteElemSearch.sendKeys(dealerSiteData.siteText.replace(regexpIdName, '$1'));
            });
            siteElem.all(by.id('McomboDropChoiceItem')).get(0).click();

            expect(element.all(dealerSitesSelector).count()).toBe(1);

            element(by.id('DealerSiteListRowEdit')).click();
            element(by.model('dealerSiteLoginsEdited.site.login')).clear();
            element(by.model('dealerSiteLoginsEdited.site.login')).sendKeys(randomMillion());
            element(by.model('dealerSiteLoginsEdited.site.password')).clear();
            element(by.model('dealerSiteLoginsEdited.site.password')).sendKeys(randomMillion());

            element(by.model('dealerSiteLoginsEdited.site.login')).getAttribute('value').then(function(respond) {
                dealerSiteData.siteLogin = respond;
            });
            element(by.model('dealerSiteLoginsEdited.site.password')).getAttribute('value').then(function(respond) {
                dealerSiteData.sitePassword = respond;
            });

            element(by.id('dealerSiteEditSave')).click();
            element(by.id('DealerSiteListRowEdit')).click();

            element(by.model('dealerSiteLoginsEdited.site.login')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerSiteData.siteLogin);
            });
            element(by.model('dealerSiteLoginsEdited.site.password')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerSiteData.sitePassword);
            });

            element(by.model('dealerSiteLoginsEdited.site.login')).clear();
            element(by.model('dealerSiteLoginsEdited.site.password')).clear();

            element(by.id('dealerSiteEditSave')).click();
            element(by.id('DealerSiteListRowEdit')).click();

            element(by.model('dealerSiteLoginsEdited.site.login')).getAttribute('value').then(function(respond) {
                expect(respond).toBeFalsy();
            });
            element(by.model('dealerSiteLoginsEdited.site.password')).getAttribute('value').then(function(respond) {
                expect(respond).toBeFalsy();
            });
        });

        it('Удаление разрешения на экспорт с сохранением доступа', function() {
            var dealerSitesSelector = by.repeater('dealerSite in dealerSites');
            var dealerSiteData = {};

            var dealerSite = element.all(dealerSitesSelector).first();
            dealerSite.element(by.binding('dealerSite.dealer')).getText().then(function(respond) {
                dealerSiteData.dealerText = respond;
            });
            dealerSite.element(by.binding('dealerSite.site')).getText().then(function(respond) {
                dealerSiteData.siteText = respond;
            });

            var dealerElem = element(by.id('DealerSiteListFilterDealers'));
            var dealerElemSearch = dealerElem.element(by.id('McomboSearchInput'));
            dealerElemSearch.click().then(function() {
                dealerElemSearch.sendKeys(dealerSiteData.dealerText.replace(regexpIdName, '$1'));
            });
            dealerElem.all(by.id('McomboDropChoiceItem')).get(0).click();

            var siteElem = element(by.id('DealerSiteListFilterSites'));
            var siteElemSearch = siteElem.element(by.id('McomboSearchInput'));
            siteElemSearch.click().then(function() {
                siteElemSearch.sendKeys(dealerSiteData.siteText.replace(regexpIdName, '$1'));
            });
            siteElem.all(by.id('McomboDropChoiceItem')).get(0).click();

            expect(element.all(dealerSitesSelector).count()).toBe(1);

            element(by.id('DealerSiteListRowEdit')).click();
            element(by.model('dealerSiteLoginsEdited.site.login')).clear();
            element(by.model('dealerSiteLoginsEdited.site.login')).sendKeys(randomMillion());
            element(by.model('dealerSiteLoginsEdited.site.password')).clear();
            element(by.model('dealerSiteLoginsEdited.site.password')).sendKeys(randomMillion());

            element(by.model('dealerSiteLoginsEdited.site.login')).getAttribute('value').then(function(respond) {
                dealerSiteData.siteLogin = respond;
            });
            element(by.model('dealerSiteLoginsEdited.site.password')).getAttribute('value').then(function(respond) {
                dealerSiteData.sitePassword = respond;
            });

            element(by.id('dealerSiteEditSave')).click();

            element(by.id('DealerSiteListRowDelete')).click();
            browser.wait(function() {
                return browser.switchTo().alert().then(
                    function() { return true; },
                    function() { return false; }
                );
            });
            browser.switchTo().alert().accept();

            expect(element.all(dealerSitesSelector).count()).toBe(0);

            element(by.id('DealerSiteListNotice')).getText().then(function(noticeText) {
                var dealerName = dealerSiteData.dealerText.replace(regexpIdName, '$2');
                var siteName = dealerSiteData.siteText.replace(regexpIdName, '$2');
                expect(noticeText).toBe('Удалена регистрация салона "' + dealerName + '" на сайте "' + siteName + '"');
            });

            element(by.id('DealerSiteListAddDealerSiteUp')).click();

            var editDealerElem = element(by.model('dealerSiteEdited.dealer'));
            var editDealerElemSearch = editDealerElem.element(by.id('McomboSearchInput'));
            editDealerElemSearch.click().then(function() {
                editDealerElemSearch.sendKeys(dealerSiteData.dealerText.replace(regexpIdName, '$1'));
            });
            editDealerElem.all(by.id('McomboDropChoiceItem')).get(0).click();

            var editSiteElem = element(by.model('dealerSiteEdited.site'));
            var editSiteElemSearch = editSiteElem.element(by.id('McomboSearchInput'));
            editSiteElemSearch.click().then(function() {
                editSiteElemSearch.sendKeys(dealerSiteData.siteText.replace(regexpIdName, '$1'));
            });
            editSiteElem.all(by.id('McomboDropChoiceItem')).get(0).click();

            element(by.model('dealerSiteLoginsEdited.site.login')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerSiteData.siteLogin);
            });
            element(by.model('dealerSiteLoginsEdited.site.password')).getAttribute('value').then(function(respond) {
                expect(respond).toBe(dealerSiteData.sitePassword);
            });
        });
    });
});

});