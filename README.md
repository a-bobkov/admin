# Реализация клиента для кабинета MaxPoster

## Установка и настрока

1. Скопировать код из репозитория
```
git clone git@github.com:avorobiev/maxposter_frontend.git
cd maxposter_frontend
```

2. Развернуть зависимости проекта
```
npm install
```

3. Установить средство для запуска e2e-тестов
```
npm install -g protractor
webdriver-manager update

если не установлен JDK, то установить его (http://www.oracle.com/technetwork/java/javase/downloads/index.html) и 
включить в переменную PATH каталог с java.exe (я включил C:\Windows\SysWOW64)

перед запуском e2e-тестов необходимо запускать сервер:
webdriver-manager start

```

4. Скопировать конфиги и адаптировать их под локальные условия

```
cp config/karma.conf.js-distrib config/karma.conf.js
cp config/protractor.conf.js-distrib config/protractor.conf.js
```