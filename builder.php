<?php

class Builder
{
    private $buildOnly = false;
    private $simulate = false;
    private $release = false;
    private $path = '';
    private $app = '';

    private $cordova_workfolder = '';
    private $dev_info_file = './.dev_info';
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
    }

    public function init()
    {
        $this->printer("Build process initiated with next params: " . var_export((array)$this, true));

        $this->checkWorkfolder();
        $this->rebuildForApp();
        $this->mainSequence();
        $this->clearOldProject();
        $this->copyNewProject();
        $this->mainCordovaBuild();
        $this->saveDevInfo();
        $this->rollbackGameLogic();
        $this->simulateProposal();

        $this->printer("Build sequence is done!");
    }

    private function loadDevInfo()
    {
        $this->dev_info = (file_exists($this->dev_info_file) && $dev_info = json_decode(file_get_contents($this->dev_info_file), true)) ? $dev_info : $this->dev_info;

        $this->cordova_workfolder = isset($this->dev_info["cordova_workfolder"]) ? $this->dev_info["cordova_workfolder"] : "";
    }

    private function checkWorkfolder()
    {
        if ($this->path && strtolower(readline("Continue with cordova workfolder '$this->path'? ")) == "y") {
            $this->cordova_workfolder = $this->path;
        } else {
            if (!file_exists($this->dev_info_file)) {
                $this->cordova_workfolder = readline("Enter new cordova workfolder: ");
            }
        }

        if (strrpos($this->cordova_workfolder, "/www") >= strlen($this->cordova_workfolder) - 5) {
            $this->cordova_workfolder = str_replace("/www", "", $this->cordova_workfolder);
        }
        if (substr($this->cordova_workfolder, -1, 1) != "/") {
            $this->cordova_workfolder .= "/";
        }

        $this->printer("Cordova workfolder initiated at " . $this->cordova_workfolder);
        $this->dev_info["cordova_workfolder"] = $this->cordova_workfolder;
    }

    private function rebuildForApp()
    {
        if (!$this->app) return;

        $className = strtoupper(substr($this->app, 0, 1)) . substr($this->app, 1);

        $this->printer("Making ReactJS App Split for " . $this->app);
        
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
        $FILES = scandir($GLFOLDER);
        foreach ($FILES as $file) if (stristr($file, '.js') and $file != "$this->app.js") rename("$this->GLFOLDER/$file", "$this->TMPFOLDER/$file");
    }

    private function mainSequence()
    {
        if ($this->buildOnly) return;

        $this->printer("Building ReactJS App");
        $this->printer(`npm run build`);

        $this->printer("Rebuilding build/index.html");
        $files = $this->getFolderFilesByMask("./build/", "index.html");
        foreach ($files as $i => $file) {
            $content = file_get_contents($file);
            $content = str_replace("/static/", "static/", $content);
            $content = str_replace('id="cordova-scr">', 'id="cordova-scr" src="cordova.js">', $content);
            $content = str_replace('<script>', '<script>const version = ' . implode(".", $dev_info["version"]) . ", const lastUpdate = '" . $dev_info["lastUpdate"] . "';", $content);
            file_put_contents($file, $content);
        }

        $this->printer("Rebuilding build/static/css/*.css");
        $files = $this->getFolderFilesByMask("./build/static/css/", "*.css");
        foreach ($files as $i => $file) {
            $content = file_get_contents($file);
            $content = str_replace("/static/", "../", $content);
            file_put_contents($file, $content);
        }

        $this->printer("Rebuilding build/static/js/main.*.chunk.js");
        $files = $this->getFolderFilesByMask("./build/static/js/", "main.*.chunk.js");
        foreach ($files as $i => $file) {
            $content = file_get_contents($file);
            $content = str_replace("window.loft.device={}", "window.loft.device=device", $content);
            file_put_contents($file, $content);
        }
    }

    private function clearOldProject()
    {
        if ($this->buildOnly) return;

        $this->printer("Removing subfolder of cordova/www/");
        $files = scandir("{$this->cordova_workfolder}www");
        foreach ($files as $i => $file) {
            if ($file != "." && $file != ".." && is_dir("{$this->cordova_workfolder}www" . DIRECTORY_SEPARATOR . $file) && !is_link("{$this->cordova_workfolder}www/$file")) {
                $this->rrmdir("{$this->cordova_workfolder}www" . DIRECTORY_SEPARATOR .$file);
            }
        }
    }

    private function copyNewProject()
    {
        if ($this->buildOnly) return;

        $this->printer("Copy build folder to cordova/www");
        $this->printer(`mv ./build ./www`);
        $this->printer(`cp -r ./www {$this->cordova_workfolder}`);
        $this->printer(`mv ./www ./build`);
    }

    private function mainCordovaBuild()
    {
        $this->printer("Cordova build");

        $res = `cd {$this->cordova_workfolder}
        cordova build`;

        $this->printer($res);

        $res = explode($this->cordova_workfolder, $res);
        $res = str_replace("\n", "", array_pop($res));

        $this->printer(`cp {$this->cordova_workfolder}$res ./app-debug.apk`);
    }

    private function saveDevInfo()
    {
        file_put_contents($this->dev_info_file, json_encode($this->dev_info));
    }

    private function rollbackGameLogic()
    {
        if (!$this->app) return;

        $this->printer("Returning gamelogic");

        foreach ($FILES as $file) if (stristr($file, '.js') and $file != "$this->app.js") rename("$this->TMPFOLDER/$file", "$this->GLFOLDER/$file");

        $appFile = preg_replace("/\/*('[a-z]+',)/", "$1", $appFile);   
        $appFile = preg_replace("/\/*import ([a-zA-Z]+ from \"\.\/Components\/Gameslogic\/[a-z]+\";)/", "import $1", $appFile);
        $appFile = preg_replace("/\/*(<Route   path='\/[a-z]+')/", "$1", $appFile);

        file_put_contents('./src/App.js', $appFile);
    }

    private function simulateProposal()
    {
        $this->printer("NOW YOU CAN SIMULATE YOUR APP USING FOLLOWING CMD:");
        $this->printer("simulate --device=Nexus10 --dir=$this->cordova_workfolder --target=opera\n");

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
                            $this->printer("FAILED!");
                        }
                    }
                } 
            }
            $this->printer(" - Removing folder $dir");

            if (!rmdir($dir)) {
                $this->printer("FAILED!");
            }
        } 
    }

    private function printer($s)
    {
        echo $s;
        echo "\n";
    }
}

$builder = new Builder();
$builder->init();