# Порядок билда

1. npm run build
2. build/index.html > "/static/" to "static/"
3. build/static/css/*.css > "/static/" to "../"
4. build/static/js/main.*.chunk.js* > "/music/" to "music/"
5. copy build folder to cordova/www
6. cordova build

# TODO
2. Звуки
3. Ввести локализацию (минимум русский и английский + возможность делать больше переводов)
4. Вывести опыт в видное место
5. Внутриигровая валюта?
5. Скины ?) Лол
6. Открыть апи хотя бы для AJAX, хотя бы чтоб регистрироваться и логиниться
6. Автологин по device_id (не выйдет... реализуемо только по localStorage)
7. Стоит вынести Modal
8. Придумать реализацию режима bluetooth вместо local
9. Реклама
-  Реализация в уголках схожей логики анализа будущих ходов как и в шашках.

# Баги
- Увеличение глубины анализа будущих ходов не дает результатов (т.к. берется один наиболее эффективный вариант, все они не прорабатываются в виду технической сложности и прямой зависимости от ограничений JS)

# Баги на проверке
- Проблема анимации сокрушительного хода бота
- Оптимизация RAMPAGE

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