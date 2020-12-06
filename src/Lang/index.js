import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
    en:{
        // Common
        settingsText:       "Settings",
        returnDefaults:     "Default",
        goBackText:         "Back",
        closeText:          "Close",
        checkersGameName:   "Checkers",
        cornersGameName:    "Corners",
        giveawayGameName:   "Giveaway",
        chessGameName:      "Chess",
        gameText:           "Game",
        chooseGameText:     "Choose a game",
        cancelText:         "Cancel",
        quitTheGame:        "Quit the game",
        attention:          "Attention!",
        levelText:          "Level",
        homePageText:       "Home",
        secondsText:        "sec.",
        noText:             "No",
        yesText:            "Yes",
        success:            "Success!",
        failed:             "Failed!",
        // Home
        playWithBot:        "Versus Bot",
        playByBlueTooth:    "BlueTooth Game",
        playOnlineGame:     "Online",
        // Settings
        animationSetting:   "Animation",
        animationLevel0:    "No animation",
        animationLevel1:    "Simplified",
        animationLevel2:    "Extended",
        difficultySetting:  "Bot`s difficulty",
        difficultyLevel1:   "Easy",
        difficultyLevel2:   "Medium",
        difficultyLevel3:   "Hard",
        soundSetting:       "Sounds volume",
        musicSetting:       "Music volume",
        // Fanfaras
        congratulations:    "Congratulations!",
        youCrashedOpponent: "You won this one by a margin",
        youCorneredEnemy:   "You cornered your opponent by a margin",
        wonOnlyOneChecker:  " of one checker",
        won2to4checkers:    " of $ checkers",
        won5andMoreCheckers:" of $ checkers",
        regrets:            "Sorry, but",
        youLooseThisOne:    "You have lost this game with",
        lostOnlyOneChecker: " one checker behind",
        lost2to4checkers:   " $ checkers behind",
        lost5andMoreCheckers:" $ checkers behind",
        youveBeenCornered:  "You have been cornered by your enemy.",
        noBadText:          "Not bad!",
        betterThanNothing:  "Draw is better than losing!",
        lastEnemyStep:      "You`re almost won! Waiting for an opponent`s last step.",
        youveGotExpirience: "You earned $ exp!",
        youveLostExpirience:"You`ve lost $ exp.",
        continueWith:       "Continue with $",
        searchAnotherEnemy: "Find another opponent",
        // Console
        searchingTheEnemy:  "Searching an opponent",
        approxWaitTime:     "Estimated waiting time: $ sec.",
        playersOnServers:   "Players on servers: $",
        playersInSearch:    "Players in search: $",
        // App Header
        gameCloseWarning:   "You will be considered defeated for leaving the game",
        sureYouWannaQuit:   "Are you sure that you want to leave?",
        youllLooseIfYouQuit:"You will be considered defeated!",
        cancelSearchText:   "Stop searching? In the next $ sec. the enemy is likely to be found!",
        cancelSearchConfirm:"Stop searching",
        expNeededForNextLvl:"Exp to the next level",
        totalGames:         "Games total",
        totalWons:          "Victories",
        totalLosts:         "Defeats",
        totalDraws:         "Draws",
        totalMoves:         "Steps total",
        totalHops:          "Hops total",
        avgGameTime:        "Game`s average time",
        avgGameMoves:       "Steps average",
        avgGameHops:        "Hops average",
        avgMoveHops:        "Hops per step average",
        // Sign in / Sing up
        displayName:        "Display name",
        loginText:          "Login",
        passwordText:       "Password",
        passwordConfirm:    "Reveal password",
        passwordsNotMatch:  "Passwords doesn`t match",
        signUpText:         "Sign Up",
        signInText:         "Sign In",
        signOutText:        "Sign Out",
        authText:           "Sign In",
        fieldRuleText1:     "Field «$»",
        fieldRuleText2:     " have to be $ length!",
        // Main
        whiteIsYours:       "Whites is yours",
        blackIsYours:       "Blacks is yours",
        yourTurnText:       "Your turn!",
        enemyTurnText:      "Waiting for an opponent`s next step",
        youveLostByTimeout: "You have been defeated for inaction",
        enemyLostByTimeout: "Opponent timed out. You won!",
        gameOverByTimeout:  "Game over by timeout",
        gameOverText:       "Game over",
        youHaveToTakeMore:  "You have to capture more!",
        youHaveToTake:      "You have to capture enemy!",
        stepIsImpossible:   "Step is impossible!",
        connected:          "Connected",
        disconnected:       "Disconnected",
        serversUnavailable: "Servers unavailable",
        findAnewGame:       "Search for a new game?",
    },
    ru: {
        // Common
        settingsText:       "Настройки",
        returnDefaults:     "По умолчанию",
        goBackText:         "Назад",
        closeText:          "Закрыть",
        checkersGameName:   "Шашки",
        cornersGameName:    "Уголки",
        giveawayGameName:   "Поддавки",
        chessGameName:      "Шахматы",
        gameText:           "Игра",
        chooseGameText:     "Выберите игру",
        cancelText:         "Отмена",
        quitTheGame:        "Выйти из игры",
        attention:          "Внимание!",
        levelText:          "Уровень",
        homePageText:       "Главное меню",
        secondsText:        "сек.",
        noText:             "Нет",
        yesText:            "Да",
        success:            "Успешно!",
        failed:             "Ошибка!",
        // Home
        playWithBot:        "Против бота",
        playByBlueTooth:    "По BlueTooth",
        playOnlineGame:     "Онлайн",
        // Settings
        animationSetting:   "Анимация",
        animationLevel0:    "Без анимации",
        animationLevel1:    "Упрощенная",
        animationLevel2:    "Расширенная",
        difficultySetting:  "Сложность бота",
        difficultyLevel1:   "Легко",
        difficultyLevel2:   "Средне",
        difficultyLevel3:   "Сложно",
        soundSetting:       "Громкость звуков",
        musicSetting:       "Громкость музыки",
        // Fanfaras
        congratulations:    "Поздравляем!",
        youCrashedOpponent: "Вы разбили противника с отрывом",
        youCorneredEnemy:   "Вы зажали противника в угол с отрывом",
        wonOnlyOneChecker:  " всего на одну шашку",
        won2to4checkers:    " в $ шашки",
        won5andMoreCheckers:" аж на $ шашек",
        regrets:            "Сожалеем",
        youLooseThisOne:    "Вы проиграли в этой партии, отстав",
        lostOnlyOneChecker: " всего на одну шашку",
        lost2to4checkers:   " на $ шашки",
        lost5andMoreCheckers:" на целых $ шашек",
        youveBeenCornered:  "Вы проиграли в этой партии, оставшись без ходов",
        noBadText:          "Неплохо!",
        betterThanNothing:  "Ничья лучше проигрыша!",
        lastEnemyStep:      "Вы почти выиграли! Ожидаем решающий ход противника.",
        youveGotExpirience: "Вы получили $ очков опыта!",
        youveLostExpirience:"Вы потеряли $ очков опыта.",
        continueWith:       "Продолжить с $",
        searchAnotherEnemy: "Найти другого противника",
        // Console
        searchingTheEnemy:  "Поиск противника",
        approxWaitTime:     "Примерное время ожидания: $ сек.",
        playersOnServers:   "Игроков на серверах: $",
        playersInSearch:    "Игроков в поиске: $",
        // App Header
        gameCloseWarning:   "За выход из игры Вам будет засчитано поражение",
        sureYouWannaQuit:   "Вы уверены в том, что хотите покинуть игру?",
        youllLooseIfYouQuit:"Вам будет засчитано поражение!",
        cancelSearchText:   "Прекратить поиск? В ближайшие $ сек. противник вероятнее всего найдется!",
        cancelSearchConfirm:"Прекратить поиск",
        expNeededForNextLvl:"Опыта до следующего уровня",
        totalGames:         "Всего игр",
        totalWons:          "Побед",
        totalLosts:         "Поражений",
        totalDraws:         "Ничьих",
        totalMoves:         "Всего ходов",
        totalHops:          "Всего хопов",
        avgGameTime:        "Среднее время в игре",
        avgGameMoves:       "Среднее кол-во ходов",
        avgGameHops:        "Среднее кол-во хопов",
        avgMoveHops:        "Среднее хопов на ход",
        // Sign in / Sing up
        displayName:        "Отображаемое имя",
        loginText:          "Логин",
        passwordText:       "Пароль",
        passwordConfirm:    "Повторите пароль",
        passwordsNotMatch:  "Пароли не совпадают",
        signUpText:         "Регистрация",
        signInText:         "Войти",
        signOutText:        "Выйти из аккаунта",
        authText:           "Авторизация",
        fieldRuleText1:     "Поле «$»",
        fieldRuleText2:     " должно быть в диапазоне $ символов!",
        // Main
        whiteIsYours:       "Вы играете белыми",
        blackIsYours:       "Вы играете чёрными",
        yourTurnText:       "Ваш ход",
        enemyTurnText:      "Ожидание хода противника",
        youveLostByTimeout: "Вам засчитано поражение за бездействие.",
        enemyLostByTimeout: "Противнику зачитано поражение за бездействие.",
        gameOverByTimeout:  "Завершение игры по таймауту",
        gameOverText:       "Игра окончена",
        youHaveToTakeMore:  "Вы должны взять больше!",
        youHaveToTake:      "Вы должны есть!",
        stepIsImpossible:   "Ход не возможен!",
        connected:          "Подключен",
        disconnected:       "Отключен",
        serversUnavailable: "Серверы не доступен",
        findAnewGame:       "Найти новую игру?",
    }
});

export default function Lang(key)
{
    return strings[key];
}