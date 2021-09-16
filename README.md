# Installations
- Install ReactJS
- Run `npm install`
- Run `sudo npm install -g cordova` to install cordova (To create a new project you can use `cordova create hello com.example.hello HelloWorld`)
- Clone git@github.com:cheb-smix/checkers_cordova_project.git
- [Outdated] Install plugins (cordova plugin add): 
    - [Outdated] cordova-plugin-device
    - [Outdated] cordova-plugin-whitelist
    - [Outdated] cordova-plugin-network-information
    - [Outdated] cordova-plugin-vibration
    - [Outdated] cordova-plugin-screen-orientation
- Use `cordova platform add android` to add android platform (the above-mentioned plugins will be installed automatically)
- Use `sudo apt install android-sdk` to install Android SDK
- Install java using `sudo apt install openjdk-8-jdk`
- Set java using `sudo update-alternatives --config javac` (set it to /usr/lib/jvm/java-8-openjdk-amd64/bin/javac)
- Learn how to install that on https://android.tutorials24x7.com/blog/how-to-install-android-sdk-tools-on-ubuntu-20-04
- Download cmdline-tools from https://developer.android.com/studio?pkg=tools#downloads
- Unzip it to `~/android-sdk/cmdline-tools/tools`
- Get platform-tools from https://developer.android.com/studio/releases/platform-tools
- Unzip it to `~/android-sdk/platform-tools`
- Get Gradle from https://gradle.org/releases/
    - `sudo mkdir /opt/gradle`
    - `sudo unzip -d /opt/gradle gradle-7.2-bin.zip`
- Edit `~/.bashrc`:
    export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
    export ANDROID_SDK_ROOT=~/android-sdk
    export PATH=${ANDROID_SDK_ROOT}/platform-tools:/opt/gradle/gradle-7.2/bin:${ANDROID_SDK_ROOT}/cmdline-tools/tools:${ANDROID_SDK_ROOT}/cmdline-tools/tools/bin:${PATH}
- Run `source ~/.bashrc`
- Run `sdkmanager --update`
- Run `sdkmanager "build-tools;29.0.2"` for Android Build Tools installation
- You can use `sdkmanager --list` to get list of installed and available packages
- [Outdated] Set android:usesCleartextTraffic="true" at android manifest 
- [Outdated] Configure config.xml
- Install cordova-simulate (`sudo npm install -g cordova-simulate`)
- Cordova-simulate usage: `simulate --device=Nexus10 --dir=<DIR> --target=opera`

# Порядок подписания приложения
- Отличное описание: https://habr.com/ru/post/324350/
- `cordova build --release` to build a release app version
- `keytool -genkey -v -keystore checkers.keystore -alias checkers -keyalg RSA -keysize 2048 -validity 10000` to generate keystore file
- `jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore checkers.keystore ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk checkers` to sign apk
- `zipalign -v 4 ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk checkers.apk` to optimize apk

# Порядок билда
1. npm run build
2. build/index.html > "/static/" to "static/"
3. build/static/css/*.css > "/static/" to "../"
4. build/static/js/main.*.chunk.js > "window.loft.device={}" to "window.loft.device=device"
5. (free to use action)
6. (free to use action)
7. remove folders in cordova/www/ (music, static, sound)
8. copy build folder to cordova/www
9. cordova build

# Запуск автобубилдера (При первом запуске запросит рабочую папку cordova)
php build.php (workfolder=...) (steps=1234567) (app=corners)
## Варианты запуска автобубилдера:
- php build.php steps=12348   # Сборка реакта и копирование в cordova без удаления старых файлов с заменой на новые без билда cordova для дебага в cordova-simulate
- php build.php steps=9       # Сборка только в cordova уже имеющегося в рабочей папке проекта
- php build.php app=corners   # Сборка отдельного приложения (checkers, corners)

# TODO
0. Делать свои достижения или все таки переходить на гугло-гейм-сервисы
0. Предлагать обновление приложения (забирать метку из конфига, управлять меткой из админки)
0. Разделение способов подключения к онлайну и наследование Connection -> Ajax , Socket , Bluetooth
1. Исключить возможность играть с самим собой
2. Локализация API (либо заблаговременно подготовленные здесь ответы API)
3. Продолжать развивать тему вебсокетов!!!

-  Вывести опыт в видное место
-  Приглашения по сети по никнейму
-  Предусмотреть разделение по приложениям на уровне сборки cordova (манифесты и прочее)
-  Отрендерить нормальную иконку!
-  Реклама
-  Правила игры с локализацией
-  Немецкий? Французский? Китайский? Итальянский?
-  Оптимизация RAMPAGE 
-  Внутриигровая валюта?
-  Скины ?) Лол
-  Вынести сокет в глобаль?
-  Для сокетов стало быть - https://www.npmjs.com/package/cordova-plugin-websocket (вряд ли, скорей всего нативно)

# Баги
- Слушатель события onBackButton не работает

# Баги/Фичи на проверке
- Фанфары не включаются в онлайне

# Выполнено / исправлено
+ Заставка
+ Страница Home
+ Улучшение роутинга (без перезагрузки страниц)
+ Доп. анимации
+ Страница Home Link вместо button + стилизация
+ Отдельная страница settings
+ Сохранение mode в usersettings
+ Редизайн кнопок
+ Внедрение музыки
+ Переключение режима игры в соответствии с mode
+ React-router теперь работает в cordova
+ Понижение эффективности хода в 2 раза при отсутствии киллов у дамки (Бот постоянно ходил дамкой)
+ Обработка патов
+ Математические функции перенесены в Math
+ Решение проблемы плавности анимации ходов
+ Решение проблемы ходов бота без анимации
+ Алгоритм обязательного доедания починен
+ Дамки перестали становиться обычными шашками
+ Подсвечивание обязательного хода и поедаемых шашек
+ Решение проблемы рендеринга неоновой консоли на смартфонах
+ Решение проблемы рендеринга rampage и вынос его за пределы неонконсоли
+ Убраны лишние тени
+ Отслеживание 15 ходов технического поражения
+ CSS-рендеринг шашек заменён на картинки
+ Анимация сокрушительного хода
+ Корректировки анимации ходов
+ Корректировки логики ходов бота дамками и расстановки приоритетов
+ Алгоритм упреждения взятия шашки
+ Повышение FPS засчет отказа от text-shadow и box-shadow
+ Дебаг анимации ходов в уголках, приведение к общему методу
+ Новый метод рекурсивного анализа будущих ходов
+ Корректировки анимации ходов
+ Корректировки рандомизации стартовых цветов, порядка ходов, разворота доски
+ Приоритет угловых ячеек
+ Реализована локализация и возможность добавления других языков
+ Правки в отображении Fanfaras и AppHeader
+ Замена инпутов на компонент button
+ Добавление английского языка
+ Modal вынесен в главный App, где может быть передан и использован во всех роутах
+ Выбор игры в главном меню
+ Сохранение выбора игры в localStorage
+ API v2 на Yii2 
+ Реструктуризация бэкенда
+ Автобилдер приложения
+ Device Info теперь приходит
+ Внедрение авторизации по uuid
+ В свёрнутом состоянии воспроизведение музыки теперь приостанавливается
+ Проблема анимации сокрушительного хода бота решена
+ Ajax вынесен в отдельный инструмент
+ Роутинг вынесен в отдельный функционал
+ Кнопка назад на главной странице теперь закрывает приложение
+ Modal теперь закрывается при переходах
+ Звуки добавлены в геймплей
+ Некоторые переменные вынесены в глобаль для упрощения зависимостей и уменьшения количества вызовов одного и того же
+ Звуки добавлены в глобаль для предотвращения повторных загрузок
+ Для звуков реализована ленивая загрузка
+ Добавлены звуки эпик-хода и фанфар
+ Небольшая реструктуризация настроек
+ Добавлена автозапись версии
+ DeviceInfo снова работает. Ajax починен. Авторизация и кукирование работают.
+ Запись девайсов и закрепление за пользователем
+ Запрос конфига перенесен в index. Главный рендер теперь стартует от событий deviceReady или DOMLoaded
+ Вынесение авторизации в отдельный функционал
+ Проверка соединения
+ Прикручена вибрация
+ Главный рендер теперь стартует после проверки соединения и получения конфига
+ Прикручена регистрация, конфирмация, восстановление пароля
+ Хэширование пароля перед отправкой
+ Авторизация теперь запоминается на устройстве
+ Поворот экрана отключен
+ Взаимодействие с бэкендом по AJAX налажено
+ Дамки больше глючат
+ Ходы на бэкенде как-никак проверяются
+ Шашки в онлайне испаряются при свернутой игре... (это уже причуды JS, вернее ограничение анимации)
+ Таймаут запросов
+ Подключение соперников в Ajax происходит стабильно, необходимо лишь устаканить завершение игры
+ Бот иногда предпочитает сожрать одну чем две. Не баг, а фича правил русских шашек (выбор за игроком)
+ Билд отдельных приложений осуществлен
+ ВебСокет в одном проекте с апи реализован, необходимо развитие темы
+ Игра с ботом теперь фиксируется на бэкенде
+ Переобсчет коэффициента происходит
+ Переосмыслен расчет эффективности хода, прекращена его пересылка из приложения
+ Реализован буфер хода бота
+ Анимация завершения игры и начисления очков
+ Кеширование конфига
+ Багфикс использования хода из буфера 
+ Графики и круговые прогресс-бары
+ Редизайн фанфар
+ Алгоритм просчета возможных ходов окончательно продублирован
+ Обмен полями kills и path между FE и BE окончен
+ Таймер оставшегося времени хода сделан более видным 
+ Взятия шашек дамками теперь более жесткое и работает адекватно
+ Дебаг двойного клика по полю
+ Починка сохранения настроек
+ Починка страницы настроек
+ Добавление поля языка в настройки
+ Статистика игрока выведена из стэйтов в глобаль




# Cordova config
```xml
<?xml version='1.0' encoding='utf-8'?>
<widget id="ru.smixsoft.checkers" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>Checkers</name>
    <description>
        Checkers Giveaway Corners Checkmates 4 in 1
    </description>
    <author email="admin@smix-soft.ru" href="https://smix-soft.ru">
        SmixSoft
    </author>
    <content src="index.html" />
    <!--access origin="http://192.168.31.168/*"/>
    <access origin="http://192.168.31.168:3333/*"/>
    <access origin="http://smix-soft.ru/*"/>
    <access origin="https://smix-soft.ru/*"/-->
    <access origin="" />
    <!--allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    <allow-intent href="tel:*" />
    <allow-intent href="sms:*" />
    <allow-intent href="mailto:*" />
    <allow-intent href="geo:*" /-->
    <allow-navigation href="http://*/*" />
    <allow-navigation href="https://*/*" />
    <allow-navigation href="data:*" />
    <plugin name="cordova-plugin-device" spec="^2.0.3" />
    <plugin name="cordova-plugin-whitelist" spec="^1.3.4" />
    <platform name="android">
        <allow-intent href="market:*" />
    </platform>
    <platform name="ios">
        <allow-intent href="itms:*" />
        <allow-intent href="itms-apps:*" />
    </platform>
    <icon src="checker.png" />
</widget>
```
