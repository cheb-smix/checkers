# Порядок билда

1. npm run build
2. build/index.html > "/static/" to "static/"
3. build/static/css/*.css > "/static/" to "../"
4. copy build folder to cordova/www
5. cordova build

# Баги

- React-router не работает в cordova
- Не всегда корректно отслеживаются возможные киллы дамок
- + К этому эти киллы (в силу неотслеженности) не являются обязательными
- Бот постоянно ходит дамкой (вести лог использования дамок?)
- Увеличение глубины анализа будущих ходов не дает результатов

# TODO
- Обработка патов