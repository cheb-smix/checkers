# Порядок билда

1. npm run build
2. build/index.html > "/static/" to "static/"
3. build/static/css/*.css > "/static/" to "../"
4. build/static/js/main.*.chunk.js* > "/music/" to "music/"
5. copy build folder to cordova/www
6. cordova build

# TODO
3. Вариант по изящнее с неоновой консолью
6. Вести лог последних 20 ходов для отслеживания технического поражения (ничья если нет киллов, дамок не стало больше. если у обоих есть дамк(а/и))
7. Звуки
8. Придумать реализацию режима bluetooth вместо local
9. Фон страницы Home ?
-  Стоит вынести Modal
-  Стоит убрать тень пешек или использовать картиночки?

# Баги
- 20-30 fps - херовенько...
- Не всегда корректно отслеживаются возможные киллы дамок
- Плюс к этому эти киллы (в силу неотслеженности) не являются обязательными
- Дамка предпочитает отдаваться нежели выбрать выгодный ход (чаще всего это самая дальняя доступная клетка)
- Увеличение глубины анализа будущих ходов не дает результатов (т.к. берется один наиболее эффективный вариант, все они не прорабатываются в виду технической сложности и прямой зависимости от ограничений JS)

# Баги на проверке
-

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
 
