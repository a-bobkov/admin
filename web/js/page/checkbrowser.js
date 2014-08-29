// from http://stackoverflow.com/questions/5916900/detect-version-of-browser
navigator.sayswho= (function(){
    var ua = navigator.userAgent;
    var tem;
    var M = ua.match(/(yabrowser(?=\/))\/?\s*([\d\.]+)/i) || ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d\.]+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+(\.\d+)?)/g.exec(ua) || [];
        return ['MSIE',(tem[1] || '')];
    }
    M= M[2]? [M[1], M[2]]:[navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
    return M;
})();
browserData = {
    Chrome: { versionRequired: 36, updateLink: 'https://support.google.com/chrome/answer/95414?hl=ru' },
    Firefox: { versionRequired: 31, updateLink: 'https://support.mozilla.org/ru/kb/obnovlenie-firefox-do-poslednej-versii' },
    YaBrowser: { versionRequired: 14, updateLink: 'http://pc-knowledge.ru/content/kak-obnovit-yandex-brauzer' },
    Safari: { versionRequired: 7 },
    Opera: { versionRequired: 23 },
    MSIE: { versionRequired: 11 },
}[navigator.sayswho[0]];
if (parseInt(navigator.sayswho[1]) < browserData.versionRequired) {
    function getCookie(name) {
        var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    if (!getCookie('browserReminder')) {
        if (['Chrome', 'Firefox', 'YaBrowser', 'Safari'].indexOf(navigator.sayswho[0]) !== -1) {
            document.getElementById('recommendedAction1').innerHTML = document.getElementById('recommendedAction2').innerHTML = 'обновить версию вашего браузера до <b>' + browserData.versionRequired + '</b>';
            if (browserData.updateLink) {
                document.getElementById('actionInstruction').innerHTML = 'Для получения инструкции по обновлению, пожалуйста, перейдите по ' + '<a href="' + browserData.updateLink + '" title="Инструкция по обновлению браузера">ссылке</a>';
            }
        } else {
            document.getElementById('recommendedAction1').innerHTML = document.getElementById('recommendedAction2').innerHTML = 'использовать для работы с MaxPoster браузер <b>Chrome</b>';
            document.getElementById('actionInstruction').innerHTML = 'Для его установки, пожалуйста, перейдите по <a href="https://www.google.ru/intl/ru/chrome/browser/" title="Установка браузера Chrome">ссылке</a>';
        }
        document.getElementById('emailReference').innerHTML = '<a href="mailto:info@maxposter.ru?subject=Версия браузера (' + navigator.sayswho[0] + ' ' + navigator.sayswho[1] + ')"><b>info@maxposter.ru</b></a>';
        document.getElementById('browserReminder').style.display = "block";
    }
}

