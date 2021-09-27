<?php

namespace checkers;

require_once "lib/Telegram.php";

use checkers\lib\Telegram;

class Builder
{
    private $buildonly = false;
    private $simulate = false;
    private $emulator = false;
    private $release = false;
    private $path = '';
    private $app = '';
    private $help = false;
    private $debug = false;
    private $telegram = false;
    private $silent = false;

    private $cordova_workfolder = '';
    private $dev_info_file = './.dev_info';
    private $workfolder_file = './.workfolder';
    private $dev_info = [
        "version" => [
            "major"     => 1,
            "minor"     => 3,
            "micro"     => 50,
            "build"     => 101,
        ],
        "lastUpdate"=> "",
    ];
    private $GLFOLDER = '';
    private $TMPFOLDER = '';
    private $GLFILES = [];

    private $errCnt = 0;

    public function __construct()
    {
        $this->loadDevInfo();

        foreach(getopt("", array_map(function($item) { return "$item::";}, array_keys(get_class_vars(get_class($this))))) as $k => $v) {
            if (isset($this->$k)) {
                if (gettype($this->$k) === "boolean") {
                    $this->$k = $v ? ($v == 'true') : ($v == '');
                } elseif (gettype($this->$k) === "integer") {
                    $this->$k = (int)$v;
                } else {
                    $this->$k = $v;
                }
            }
        }

        if ($this->help) {
            $this->printer("Flag\t\t| Description");
            $this->printer("--app\t\t| Use --app=checkers to specify app to build");
            $this->printer("--path\t\t| Use --path=/path/to/cordova to specify cordova workfolder to build");
            $this->printer("--release\t| Use --release to build a release version");
            $this->printer("--simulate\t| Use --simulate to simulate app after building");
            $this->printer("--emulator\t| Use --emulator to emulate app after building");
            $this->printer("--buildonly\t| Use --buildonly to skip ReactJS building steps and build current cordova project");
            $this->printer("--telegram\t| Use --telegram to get telegram bot updates");
            $this->printer("--silent\t| Use --silent to disable telegram informer for the build");
            exit;
        }

        if ($this->telegram) {
            print_r(Telegram::checkUpdates());
            exit;
        }
    }


    public function init()
    {
        set_error_handler("Builder::customError");

        // $this->printer("Build process initiated with next params: " . var_export((array)$this, true));

        if ($this->debug) exit;

        $this->checkWorkfolder();

        if (!$this->buildonly) {

            $this->dev_info["version"]["build"]++;
            if ($micro = (int)($this->dev_info["version"]["build"] / 300)) {
                $this->dev_info["version"]["build"] = $this->dev_info["version"]["build"] % 300;
                $this->dev_info["version"]["micro"] = $this->dev_info["version"]["micro"] + $micro;
            }
            if ($minor = (int)($this->dev_info["version"]["micro"] / 99)) {
                $this->dev_info["version"]["micro"] = $this->dev_info["version"]["micro"] % 99;
                $this->dev_info["version"]["minor"] = $this->dev_info["version"]["minor"] + $minor;
            }
            $this->dev_info["lastUpdate"] = date('Y-m-d H:i:s T');

            if ($this->app) {
                $this->rebuildForApp();
            }
            $this->mainSequence();
            $this->clearOldProject();
            $this->copyNewProject();
        }

        $this->mainCordovaBuild();
        $this->saveDevInfo();

        if ($this->app && !$this->buildonly) {
            $this->rollbackGameLogic();
        }

        $this->simulateProposal();

        if ($this->errCnt) $this->printer("Build sequence is failed with $this->errCnt errors!", "fail");
        else $this->printer("Build sequence is done!\n", "success");
    }




    private function loadDevInfo()
    {
        $this->dev_info = (file_exists($this->dev_info_file) && $dev_info = json_decode(file_get_contents($this->dev_info_file), true)) ? $dev_info : $this->dev_info;

        $this->cordova_workfolder = (file_exists($this->workfolder_file) && $cordova_workfolder = file_get_contents($this->workfolder_file)) ? $cordova_workfolder : $this->cordova_workfolder;
    }

    private function checkWorkfolder()
    {
        if ($this->path && strtolower(readline("Continue with cordova workfolder '$this->path'? ")) == "y") {
            $this->cordova_workfolder = $this->path;
        } else {
            if (!file_exists($this->workfolder_file)) {
                $this->cordova_workfolder = readline("Enter new cordova workfolder: ");
            }
        }

        if (strrpos($this->cordova_workfolder, "/www") >= strlen($this->cordova_workfolder) - 5) {
            $this->cordova_workfolder = str_replace("/www", "", $this->cordova_workfolder);
        }
        if (substr($this->cordova_workfolder, -1, 1) != "/") {
            $this->cordova_workfolder .= "/";
        }

        $this->printer("Cordova workfolder initiated at " . $this->cordova_workfolder, "info");
    }

    private function rebuildForApp()
    {
        $className = strtoupper(substr($this->app, 0, 1)) . substr($this->app, 1);

        $this->printer("Making ReactJS App Split for " . $this->app, "info");
        
        $appFile = file_get_contents('./src/App.js');

        $appFile = preg_replace("/\/*('[a-z]+',)/", "//$1", $appFile);      // Removing old commented with new commenting of all apps
        $appFile = preg_replace("/\/*('$this->app',)/", "$1", $appFile, 1); // Uncomment for app we build

        $appFile = preg_replace("/\/*import ([a-zA-Z]+ from \"\.\/Components\/Gameslogic\/[a-z]+\";)/", "//import $1", $appFile);   // Removing old commented with new commenting of all apps
        $appFile = preg_replace("/\/*import ($className from \"\.\/Components\/Gameslogic\/$this->app\";)/", "import $1", $appFile, 1); // Uncomment for app we build

        // $appFile = preg_replace("/\/*const /", "//const ", $appFile);   // Removing old commented with new commenting of all apps
        // $appFile = preg_replace("/\/*const $className/", "const $className", $appFile); // Uncomment for app we build

        $appFile = preg_replace("/\/*(<Route   path='\/[a-z]+')/", "//$1", $appFile); // Removing old commented with new commenting of all apps
        $appFile = preg_replace("/\/*(<Route   path='\/$this->app')/", "$1", $appFile, 1);

        file_put_contents('./src/App.js', $appFile);

        $this->GLFOLDER = realpath('./src/Components/Gameslogic');
        $this->TMPFOLDER = realpath('../');
        $this->GLFILES = scandir($this->GLFOLDER);
        foreach ($this->GLFILES as $file) {
            if (stristr($file, '.js') and $file != "$this->app.js") {
                rename("$this->GLFOLDER/$file", "$this->TMPFOLDER/$file");
            }
        }
    }

    private function mainSequence()
    {
        $this->printer("Building ReactJS App", "info");
        $this->printer(`npm run build`);

        $this->printer("Rebuilding build/index.html", "info");
        $files = $this->getFolderFilesByMask("./build/", "index.html");
        foreach ($files as $i => $file) {
            $content = file_get_contents($file);
            $content = str_replace("/static/", "static/", $content);
            $content = str_replace('id="cordova-scr">', 'id="cordova-scr" src="cordova.js">', $content);
            $content = preg_replace('/(<meta name="app-internal-version" content=)"([^"]+)/', '$1"' . implode(".", $this->dev_info["version"]), $content);
            $content = preg_replace('/(<meta name="app-internal-last-update" content=)"([^"]+)/', '$1"' . $this->dev_info["lastUpdate"], $content);
            
            if ($content) file_put_contents($file, $content);
        }

        $this->printer("Rebuilding build/static/css/*.css", "info");
        $files = $this->getFolderFilesByMask("./build/static/css/", "*.css");
        foreach ($files as $i => $file) {
            $content = file_get_contents($file);
            $content = str_replace("/static/", "../", $content);
            if ($content) file_put_contents($file, $content);
        }

        $this->printer("Rebuilding build/static/js/main.*.chunk.js", "info");
        $files = $this->getFolderFilesByMask("./build/static/js/", "main.*.chunk.js");
        foreach ($files as $i => $file) {
            $content = file_get_contents($file);
            $content = str_replace("window.loft.device={}", 'window.loft.device=device', $content);
            if ($content) file_put_contents($file, $content);
        }
    }

    private function clearOldProject()
    {
        $this->printer("Removing subfolder of cordova/www/", "info");
        $files = scandir("{$this->cordova_workfolder}www");
        foreach ($files as $i => $file) {
            if ($file != "." && $file != ".." && is_dir("{$this->cordova_workfolder}www" . DIRECTORY_SEPARATOR . $file) && !is_link("{$this->cordova_workfolder}www/$file")) {
                $this->rrmdir("{$this->cordova_workfolder}www" . DIRECTORY_SEPARATOR .$file);
            }
        }
    }

    private function copyNewProject()
    {
        $this->printer("Copy build folder to cordova/www", "info");
        $this->printer(`mv ./build ./www`);
        $this->printer(`cp -r ./www {$this->cordova_workfolder}`);
        $this->printer(`mv ./www ./build`);
    }

    private function mainCordovaBuild()
    {
        $this->printer("Cordova build", "info");

        $options = [ $this->emulator ? "--emulator" : "--device" ];

        if ($this->release) {
            $appFileName = "app-release.aab";
            $options[] = "--release";
        } else {
            $appFileName = "app-debug.apk";
        }

        $options = implode(' ', $options);

        $res = `
            cd {$this->cordova_workfolder}
            cordova run android --buildConfig {$options}
        `;

        $this->printer($res);

        $res = explode($this->cordova_workfolder, $res);
        $res = array_pop($res);
        $res = explode("\n", $res);
        $res = array_shift($res);

        $this->printer("Copiing to project folder", "info");
        $this->printer("cp {$this->cordova_workfolder}$res ./{$appFileName}", "console");
        $this->printer(`cp {$this->cordova_workfolder}$res ./{$appFileName}`);

        if (!$this->silent) {
            $this->printer("Sending file via Telegram", "success");
            Telegram::sendAdminNotices("New version " . implode(".", $this->dev_info["version"]) . " has been built " . $this->dev_info["lastUpdate"], ["v" . implode(".", $this->dev_info["version"]) => $this->cordova_workfolder . $res]);
        }
    }

    private function saveDevInfo()
    {
        if ($this->dev_info) file_put_contents($this->dev_info_file, json_encode($this->dev_info));
        if ($this->cordova_workfolder) file_put_contents($this->workfolder_file, $this->cordova_workfolder);
    }

    private function rollbackGameLogic()
    {
        $this->printer("Returning gamelogic", "info");

        $this->GLFILES = scandir($this->TMPFOLDER);
        foreach ($this->GLFILES as $file) {
            if (stristr($file, '.js') and $file != "$this->app.js") {
                rename("$this->TMPFOLDER/$file", "$this->GLFOLDER/$file");
            }
        }

        $appFile = file_get_contents('./src/App.js');

        $appFile = preg_replace("/\/*('[a-z]+',)/", "$1", $appFile);   
        $appFile = preg_replace("/\/*import ([a-zA-Z]+ from \"\.\/Components\/Gameslogic\/[a-z]+\";)/", "import $1", $appFile);
        $appFile = preg_replace("/\/*(<Route   path='\/[a-z]+')/", "$1", $appFile);

        if ($appFile) file_put_contents('./src/App.js', $appFile);
    }

    private function simulateProposal()
    {
        $this->printer("NOW YOU CAN SIMULATE YOUR APP USING FOLLOWING CMD:", "info");
        $this->printer("simulate --device=Nexus10 --dir=$this->cordova_workfolder --target=opera\n", "console");

        if ($this->simulate) {
            $this->printer(`simulate --device=Nexus10 --dir=$this->cordova_workfolder --target=opera`);
        }
    }

    private function getFolderFilesByMask($folder, $mask)
    {
        $files = `find $folder -name "$mask"`;
        $files = explode("\n", $files);
        array_pop($files);
        return $files;
    }

    private function rrmdir($dir)
    { 
        if (is_dir($dir)) { 
            $objects = scandir($dir);
            foreach ($objects as $object) { 
                if ($object != "." && $object != "..") { 
                    if (is_dir($dir. DIRECTORY_SEPARATOR .$object) && !is_link($dir."/".$object)) {
                        $this->rrmdir($dir. DIRECTORY_SEPARATOR .$object);
                    } else {
                        $this->printer(" - Removing file " . $dir. DIRECTORY_SEPARATOR . $object) ;
                        if (!unlink($dir. DIRECTORY_SEPARATOR .$object)) {
                            $this->printer("FAILED!", "fail");
                        }
                    }
                } 
            }
            $this->printer(" - Removing folder $dir", "info");

            if (!rmdir($dir)) {
                $this->printer("FAILED!", "fail");
            }
        } 
    }

    private function printer($s, $style = "")
    {
        // https://misc.flogisoft.com/bash/tip_colors_and_formatting

        $colors = [
            "error"         => "\n\e[97;5;1;101m",
            "fail"          => "\e[91;1;107m",
            "warning"       => "\e[93;1m",
            "info"          => "\e[36m",
            "success"       => "\e[92m",
            "console"       => "\e[96m",
            "default"       => "\e[0m",
        ];

        if ($style) {
            if (!isset($colors[$style])) {
                $style = "default";
            }
            echo $colors[$style];

            if ($style == "error" or $style == "fail") $this->errCnt++;
        }
        echo $s;
        if ($style) echo $colors["default"];
        echo "\n";
    }

    private function customError($errno, $errstr, $errfile, $errline)
    {
        $this->errCnt++;
        $this->printer("Error: [$errno]", "error");
        $this->printer("$errstr in '$errfile' on line №$errline.", "fail");
    }
}

$builder = new Builder();
$builder->init();