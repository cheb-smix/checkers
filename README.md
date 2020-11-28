# Порядок билда

1. npm run build
2. build/index.html > "/static/" to "static/"
3. build/static/css/*.css > "/static/" to "../"
4. build/static/js/main.*.chunk.js* > "/music/" to "music/"
5. copy build folder to cordova/www
6. cordova build

# TODO
1. Проблема анимации сокрушительного хода бота
2. Звуки
3. Ввести локализацию (минимум русский и английский + возможность делать больше переводов)
7. Стоит вынести Modal
8. Придумать реализацию режима bluetooth вместо local
9. Фон страницы Home ?

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
+ Решение проблемы рендеринга неоновой консоли на смартфонах
+ Решение проблемы рендеринга rampage и вынос его за пределы неонконсоли
+ Убраны лишние тени
+ Отслеживание 15 ходов технического поражения
+ CSS-рендеринг шашек заменён на картинки
+ Анимация сокрушительного хода