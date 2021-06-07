export class Localization
{
    react = null;

    language = 'auto';
    
    languages = {
        "en": ["en", "us", "gb"],
        "ru": ["ru", "et", "lt", "lv", "ka", "kz", "kk", "uk", "ua", "be"],
        "es": ["es", "mx", "ar"],
        "pt": ["pt"],
    };

    langpack = {
        en:{
            // Common
            langName:           "English",
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
            confirm:            "Confirm",
            finish:             "Finish",
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
            fanfarasSetting:    "Fanfare volume",
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
            emailText:          "E-mail",
            passwordText:       "Password",
            passwordConfirm:    "Reveal password",
            passwordsNotMatch:  "Passwords doesn`t match",
            signUpText:         "Sign Up",
            signInText:         "Sign In",
            signOutText:        "Sign Out",
            authText:           "Sign In",
            fieldRuleText1:     "Field «$»",
            fieldRuleText2:     " have to be $ length!",
            forgotPassword:     "Forgot password?",
            dontHaveAccount:    "Don't have account?",
            email4Instructions: "Check your email for further instructions",
            ressurectingPass:   "Recovery password",
            pincode:            "Pin code from message",
            pincodeText:        "Pin code",
            registerSuccess:    "You`ve been successfully registered! Please, confirm your registration by using a link in e-mail you recieved.",
            // Main
            whiteIsYours:       "Whites is yours",
            blackIsYours:       "Blacks is yours",
            yourTurnText:       "Your turn!",
            enemyTurnText:      "Waiting for an opponent`s next step",
            youveLostByTimeout: "You have been defeated for inaction",
            enemyLostByTimeout: "Opponent timed out. You won!",
            enemyQuit:          "Your opponent surrendered!",
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
            langName:           "Русский",
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
            confirm:            "Подтвердить",
            finish:             "Завершить",
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
            fanfarasSetting:    "Громкость фанфар",
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
            emailText:          "E-mail",
            passwordText:       "Пароль",
            passwordConfirm:    "Повторите пароль",
            passwordsNotMatch:  "Пароли не совпадают",
            signUpText:         "Регистрация",
            signInText:         "Войти",
            signOutText:        "Выйти из аккаунта",
            authText:           "Авторизация",
            fieldRuleText1:     "Поле «$»",
            fieldRuleText2:     " должно быть в диапазоне $ символов!",
            forgotPassword:     "Забыли пароль?",
            dontHaveAccount:    "Нет аккаунта?",
            email4Instructions: "Проверьте свою почту для получения дальнейших инструкций",
            ressurectingPass:   "Восстановление пароля",
            pincode:            "Введите пин-код из письма",
            pincodeText:        "Пин-код",
            registerSuccess:    "Вы успешно зарегистрировались! Пожалуйста, подтвердите свою регистрацию, перейдя по ссылке в полученном вами электронном письме.",
            // Main
            whiteIsYours:       "Вы играете белыми",
            blackIsYours:       "Вы играете чёрными",
            yourTurnText:       "Ваш ход",
            enemyTurnText:      "Ожидание хода противника",
            youveLostByTimeout: "Вам засчитано поражение за бездействие.",
            enemyLostByTimeout: "Противнику зачитано поражение за бездействие.",
            enemyQuit:          "Ваш противник сдался!",
            gameOverByTimeout:  "Завершение игры по таймауту",
            gameOverText:       "Игра окончена",
            youHaveToTakeMore:  "Вы должны взять больше!",
            youHaveToTake:      "Вы должны есть!",
            stepIsImpossible:   "Ход не возможен!",
            connected:          "Подключен",
            disconnected:       "Отключен",
            serversUnavailable: "Серверы не доступен",
            findAnewGame:       "Найти новую игру?",
        },




        es: {
            // Common
            langName: "Español",
            settingsText: "Configuración",
            returnDefaults: "por defecto",
            goBackText: "Atrás",
            closeText: "Cerrar",
            checkersGameName: "Damas",
            cornersGameName: "Esquinas",
            giveawayGameName: "Sorteo",
            chessGameName: "Ajedrez",
            gameText: "Juego",
            chooseGameText: "Elige un juego",
            cancelText: "Cancelar",
            quitTheGame: "Salir del juego",
            attention: "¡Atención!",
            levelText: "Nivel",
            homePageText: "menú Principal",
            secondsText: "sec.",
            noText: "No",
            yesText: "Sí",
            success: "¡Éxito!",
            error: "Error!",
            confirm: "Confirmar",
            finish: "Finalizar",
            // Home
            playWithBot: "Vs bot",
            playByBlueTooth: "Por BlueTooth",
            playOnlineGame: "en Línea",
            // Settings
            animationSetting: "Animación",
            animationLevel0: "sin animación",
            animationLevel1: "Simplificado",
            animationLevel2: "Extendido",
            difficultySetting: "la Complejidad del bot",
            difficultyLevel1: "Fácil",
            difficultyLevel2: "Medio",
            difficultyLevel3: "Difícil",
            soundSetting: "Volumen de los sonidos",
            fanfarasSetting: "volumen de fanfarria",
            musicSetting: "Volumen de la música",
            // Fanfaras
            congratulations: "¡Felicidades!",
            youCrashedOpponent: "has aplastado al oponente por un margen",
            youCorneredEnemy: "has atrapado al oponente en una esquina con un margen",
            wonOnlyOneChecker: "solo una pieza",
            won2to4checkers: "en $ Damas",
            won5andMoreCheckers: "tanto como $ Damas",
            regrets: "lo Sentimos",
            youLooseThisOne: "has perdido en este partido, resignado",
            lostOnlyOneChecker: "solo una pieza",
            lost2to4checkers: "en $ Damas",
            lost5andMoreCheckers: "en todo $ Damas",
            youveBeenCornered: "has perdido en este partido sin movimientos",
            noBadText: "¡no está mal!",
            betterThanNothing: "¡un Empate es mejor que una pérdida!",
            lastEnemyStep: "¡Casi ganas! Esperamos el movimiento decisivo del enemigo.",
            youveGotExpirience: "¡tienes $ puntos de experiencia!",
            youveLostExpirience: "has perdido $ puntos de experiencia.",
            continueWith: "Continuar con $",
            searchAnotherEnemy: "Encuentra a otro oponente",
            // Console
            searchingTheEnemy: "buscar al enemigo",
            approxWaitTime: "tiempo de espera Aproximado: $ seg.",
            playersOnServers: "Jugadores en servidores: $",
            playersInSearch: "Jugadores en la búsqueda: $",
            // App Header
            gameCloseWarning: "por salir del juego, se te contará la derrota",
            sureYouWannaQuit: "¿estás seguro de que quieres dejar el juego?",
            youllLooseIfYouQuit: "¡se te contará la derrota!",
            cancelSearchText: "¿Dejar de buscar? En los próximos $ sec. ¡es probable que haya un enemigo!",
            cancelSearchConfirm: "Dejar de buscar",
            expNeededForNextLvl: "Experiencia al siguiente nivel",
            totalGames: "juegos Totales",
            totalwons: "Victorias",
            totalLosts: "Derrotas",
            totalDraws: "Empates",
            totalMoves: "total de movimientos",
            totalHops: "total Hops",
            avgGameTime: "tiempo Promedio en el juego",
            avgGameMoves: "número Promedio de movimientos",
            avgGameHops :" número promedio de saltos",
            avgMoveHops: "Promedio de saltos por movimiento",
            // Sign in / Sing up
            displayName: "nombre para Mostrar",
            loginText: "Inicio de Sesión",
            emailText: "E-mail",
            passwordText: "Contraseña",
            passwordConfirm: "Repita la contraseña",
            passwordsNotMatch: "las Contraseñas no coinciden",
            signUpText: "Registro",
            signInText: "iniciar Sesión",
            signOutText: "Cerrar sesión",
            authText: "Autorización",
            fieldRuleText1: "Campo «$»",
            fieldRuleText2: "debe estar en el rango de $ caracteres!",
            forgotPassword: "¿Olvidó su contraseña?",
            dontHaveAccount: "¿No hay cuenta?",
            email4Instructions: "Revise su correo para obtener más instrucciones",
            ressurectingPass: "Recuperación de contraseña",
            pincode: "Ingrese el PIN del correo electrónico",
            pincodeText: "código PIN",
            registerSuccess: "¡te registraste con éxito! Confirme su registro haciendo clic en el enlace en el correo electrónico que recibió.",
            // Main
            whiteIsYours: "juegas blanco",
            blackIsYours: "juegas negro",
            yourTurnText: "Tu movimiento",
            enemyTurnText: "esperando el turno del enemigo",
            youveLostByTimeout: "usted cuenta la derrota por inacción.",
            enemyLostByTimeout: "al Enemigo se le Lee la derrota por inacción.",
            enemyQuit: "¡Tu oponente se rindió!",
            gameOverByTimeout: "Finalización del juego en tiempo de espera",
            gameOverText: "el Juego ha terminado",
            youHaveToTakeMore: "¡Tienes que tomar más!",
            youHaveToTake: "¡Tienes que comer!",
            stepIsImpossible: "¡el Movimiento no es posible!",
            connected: "Conectado",
            disconnected: "Desconectado",
            serversUnavailable: "los Servidores no están disponibles",
            findAnewGame: "¿Encontrar un nuevo juego?",
        },



        pt: {
            langName: "Português",
            settingsText: "definições",
            returnDefaults: "padrão",
            goBackText: "voltar",
            closeText: "Fechar",
            checkersGameName: "Damas",
            cornersGameName: "cantos",
            giveawayGameName: "oferta",
            chessGameName: "Xadrez",
            gameText: "jogo",
            chooseGameText: "escolha um jogo",
            cancelText: "cancelamento",
            quitTheGame: "sair do jogo",
            atenção: "atenção!",
            levelText: "nível",
            homePageText: "Menu Principal",
            secondsText: "sec.",
            noText: "não",
            yesText: "Sim",
            sucesso: "sucesso!",
            failed: "erro!",
            confirm: "confirmar",
            finish: "terminar",
            // Home
            playWithBot: "contra um bot",
            playByBlueTooth: "por BlueTooth",
            playOnlineGame: "Online",
            // Settings
            animationSetting: "animação",
            animationLevel0: "sem animação",
            animationLevel1: "simplificado",
            animationLevel2: "avançado",
            difficultySetting: "complexidade do bot",
            difficultyLevel1: "fácil",
            difficultyLevel2: "Médio",
            difficultyLevel3: "difícil",
            soundSetting: "volume dos sons",
            fanfarasSetting: "o volume da fanfarra",
            musicSetting: "volume da música",
            // Fanfaras
            congratulations: "Parabéns!",
            youCrashedOpponent: "você esmagou seu oponente por uma margem",
            youCorneredEnemy: "você apertou o oponente em um canto com uma brecha",
            wonOnlyOneChecker: "apenas um verificador",
            won2to4checkers: "em ш Damas",
            won5andMoreCheckers: "já em ш Damas",
            arrependimentos: "Lamentamos",
            youLooseThisOne: "você perdeu nesta festa, está atrasado",
            lostOnlyOneChecker: "apenas um verificador",
            lost2to4checkers: "em ш Damas",
            lost5andMoreCheckers: "em todo ш Damas",
            youveBeenCornered: "você perdeu neste jogo, sem movimentos",
            noBadText: "nada mal!",
            betterThanNothing: "um Empate é melhor que uma perda!",
            lastEnemyStep: "você quase ganhou! Esperamos o movimento decisivo do inimigo.",
            youveGotExpirience: "você tem очков pontos de experiência!",
            youveLostExpirience: "você perdeu очков pontos de experiência.",
            continueWith: "continuar com с",
            searchAnotherEnemy: "encontre outro oponente",
            // Console
            searchingTheEnemy: "encontrar um adversário",
            approxWaitTime: "tempo limite aproximado: сек seg.",
            playersOnServers: "jogadores nos servidores: play",
            playersInSearch: "Jogadores em busca de: $",
            // App Header
            gameCloseWarning: "você será derrotado ao sair do jogo",
            sureYouWannaQuit: "você tem certeza de que deseja deixar o jogo?",
            youllLooseIfYouQuit: "você será contado para a derrota!",
            cancelSearchText: "parar a pesquisa? Nos próximos $ s. é provável que haja um inimigo!",
            cancelSearchConfirm: "parar a pesquisa",
            expNeededForNextLvl: "experiência para o próximo nível",
            totalGames: "total de jogos",
            totalWons: "vitórias",
            totalLosts: "derrotas",
            totalDraws: "empates",
            totalMoves: "movimentos totais",
            totalHops: "total Hop",
            avgGameTime: "tempo médio de jogo",
            avgGameMoves: "número médio de movimentos",
            avgGameHops: "média de saltos",
            avgMoveHops: "média de saltos por movimento",
            // Sign in / Sing up
            displayName: "nome de exibição",
            loginText: "login",
            emailText: "E-mail",
            passwordText: "senha",
            passwordConfirm: "repita a senha",
            passwordsNotMatch: "as Senhas não correspondem",
            signUpText: "Inscrição",
            signInText: "iniciar sessão",
            signOutText: "sair da conta",
            authText: "autorização",
            fieldRuleText1: "campo «$»",
            fieldRuleText2: "deve estar em um intervalo de символов caracteres!",
            forgotPassword: "Esqueceu sua senha?",
            dontHaveAccount: "não tem conta?",
            email4Instructions: "verifique seu e-mail para obter mais instruções",
            ressurectingPass: "recuperação de senha",
            pincode: "digite o PIN do E-mail",
            pincodeText: "código PIN",
            registerSuccess: "você se registrou com sucesso! Por favor, confirme seu registro clicando no link no e-mail que você recebeu.",
            // Main
            whiteIsYours: "você joga branco",
            blackIsYours: "você está jogando Preto",
            yourTurnText: "sua vez",
            enemyTurnText: "aguardando a jogada do Oponente",
            youveLostByTimeout: "você é derrotado por inação.",
            enemyLostByTimeout: "o inimigo recebeu uma derrota por inação.",
            enemyQuit: "seu oponente desistiu!",
            gameOverByTimeout: "finalização do tempo limite",
            gameOverText: "o jogo acabou",
            youHaveToTakeMore: "você tem que tomar mais!",
            youHaveToTake: "você tem que comer!",
            stepIsImpossible: "o movimento não é possível!",
            conectado: "conectado",
            disconnected: "desativado",
            serversUnavailable: "servidores não disponíveis",
            findAnewGame: "encontrar um novo jogo?",
        }
    };

    stater = () => {

    }

    constructor()
    {
        let code = window.loft.settings.getSettings("language");

        if (!this.set(code)) {
            for (let i in navigator.languages) {
                if (this.set(navigator.languages[i])) break;
            }
        }

        if (this.language === 'auto') {
            this.set();
        }
    }

    setStater = (stater = () => {}) => {
        this.stater = stater;
    }

    set = (code = "en-US", auto = true) => {
        code = code.split('-').shift();
        for (let lang in this.languages) {
            if (code === lang || this.languages[lang].indexOf(code) >= 0) {

                this.language = lang;
                window.loft.settings.saveSetting("language", this.language);

                //if (!auto) window.location.reload();
                this.stater({
                    language: this.language
                })
                return true;
            }
        }
        return false;
    }

    getLanguage = () => {
        return this.language;
    }

    get = (key) => {
        let lng = typeof(this.langpack[this.language]) === "undefined" ? "en" : this.language;

        return typeof(this.langpack[lng][key]) === "undefined" ? key : this.langpack[lng][key];
    }
}

export default function Lang(key)
{
    return window.loft.localization.get(key);
}