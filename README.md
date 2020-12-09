# Installations
- Install ReactJS
- Run "composer install"
- Install Cordova, Java (JRE), SDK (for simulations), (maybe Android Studio, maybe Gradle)
- Install cordova-plugin-device and cordova-plugin-whitelist
- Set android:usesCleartextTraffic="true" at android manifest
- Configure config.xml
- Add platforms (android, ios)
- Install cordova-simulate (sudo npm install -g cordova-simulate)
- Cordova-simulate usage: simulate --device=Nexus10 --dir=<DIR> --target=opera

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
php build.php (workfolder=...) (steps=1234567)
## Варианты запуска автобубилдера:
- php build.php steps=12348   # Сборка реакта и копирование в cordova без удаления старых файлов с заменой на новые без билда cordova для дебага в cordova-simulate
- php build.php steps=9       # Сборка только в cordova уже имеющегося в рабочей папке проекта


# TODO
0. Нужны звуки: Rampage.
0. Реализация WS на consik/yii2-websocket в одном проекте вместе с API
1. Вынести авторизацию / регистрацию / вход / аккаунт в отдельный компонент ? Чтобы не дублировать ? Или не стоит?
2. Вынести сокет в глобаль?
3. Локализация API (либо заблаговременно подготовленные здесь ответы API)
4. Вывести опыт в видное место
5. Придумать реализацию режима bluetooth вместо local
6. Кидать приглашения по сети по никнейму
7. Отключить поворот экрана

-  Отрендерить нормальную иконку!
-  Реклама
-  Реализация в уголках схожей логики анализа будущих ходов как и в шашках.
-  Правила игры с локализацией
-  Испанский язык? Португальский? Немецкий? Французский? Китайский? Итальянский?
-  cordova-plugin-vibration?
-  https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-network-information/index.html
-  Оптимизация RAMPAGE 
-  Внутриигровая валюта?
-  Скины ?) Лол

# Баги
- Бот иногда предпочитает сожрать одну чем две
- Для сокетов стало быть - https://www.npmjs.com/package/cordova-plugin-websocket (вряд ли)
- Увеличение глубины анализа будущих ходов дает слишком предсказуемый результат - бот играет агрессивно, но по одной шашке

# Баги/Фичи на проверке
- Ajax теперь проходит в cordova!
- Авторизация и сохранение куки осуществляется!

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










# Cordova config

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
