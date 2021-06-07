<?php

echo "Initation of build process\n";

$argumentos = getArgs($argv);
$dev_info_file = "./.dev_info";
$dev_info = (file_exists($dev_info_file) && $dev_info = json_decode(file_get_contents($dev_info_file), true)) ? $dev_info : [
    "version" => [
        "major"     => 1,
        "minor"     => 3,
        "micro"     => 50,
        "build"     => 101,
    ],
    "lastUpdate"=> "",
];

$cordova_workfolder = isset($dev_info["cordova_workfolder"]) ? $dev_info["cordova_workfolder"] : "";

if (isset($argumentos["path"]) && strtolower(readline("Continue with cordova workfolder '{$argumentos["path"]}'? ")) == "y") {

    $cordova_workfolder = $argumentos["path"];
    $dev_info["cordova_workfolder"] = $cordova_workfolder;

} else {

    if (!file_exists($dev_info_file)) {
        $cordova_workfolder = readline("Enter new cordova workfolder: ");
        $dev_info["cordova_workfolder"] = $cordova_workfolder;
    }

}

$dev_info["version"]["build"]++;
$dev_info["version"]["micro"] = 50 + floor(($dev_info["version"]["build"] - 100) / 10);
$dev_info["lastUpdate"] = date('l jS \of F Y H:i:s');


if (strrpos($cordova_workfolder, "/www") >= strlen($cordova_workfolder) - 5) {
    $cordova_workfolder = str_replace("/www", "", $cordova_workfolder);
}
if (substr($cordova_workfolder, -1, 1) != "/") {
    $cordova_workfolder .= "/";
}

$dev_info["cordova_workfolder"] = $cordova_workfolder;

echo "Cordova workfolder initiated at $cordova_workfolder\n";

if (isset($argumentos["app"])) {
    $app = $argumentos["app"];
    $className = strtoupper(substr($app, 0, 1)) . substr($app, 1);

    echo "0. Making ReactJS App Split for $app\n";
    
    $appFile = file_get_contents('./src/App.js');

    $appFile = preg_replace("/\/*('[a-z]+',)/", "//$1", $appFile);  // Removing old commented with new commenting of all apps
    $appFile = preg_replace("/\/*('$app',)/", "$1", $appFile, 1);      // Uncomment for app we build

    $appFile = preg_replace("/\/*import ([a-zA-Z]+ from \"\.\/Components\/Gameslogic\/[a-z]+\";)/", "//import $1", $appFile);   // Removing old commented with new commenting of all apps
    $appFile = preg_replace("/\/*import ($className from \"\.\/Components\/Gameslogic\/$app\";)/", "import $1", $appFile, 1); // Uncomment for app we build

    // $appFile = preg_replace("/\/*const /", "//const ", $appFile);   // Removing old commented with new commenting of all apps
    // $appFile = preg_replace("/\/*const $className/", "const $className", $appFile); // Uncomment for app we build

    $appFile = preg_replace("/\/*(<Route   path='\/[a-z]+')/", "//$1", $appFile); // Removing old commented with new commenting of all apps
    $appFile = preg_replace("/\/*(<Route   path='\/$app')/", "$1", $appFile, 1);

    file_put_contents('./src/App.js', $appFile);

    $GLFOLDER = realpath('./src/Components/Gameslogic');
    $TMPFOLDER = realpath('../');
    $FILES = scandir($GLFOLDER);
    foreach ($FILES as $file) if (stristr($file, '.js') and $file != "$app.js") rename("$GLFOLDER/$file", "$TMPFOLDER/$file");
}

if (!isset($argumentos["steps"]) || stristr($argumentos["steps"], "1")) {
    echo "1. Building ReactJS App\n";
    echo `npm run build`;
}

if (!isset($argumentos["steps"]) || stristr($argumentos["steps"], "2")) {
    echo "2. Rebuilding build/index.html\n";
    $files = getFolderFilesByMask("./build/", "index.html");
    foreach ($files as $i => $file) {
        $content = file_get_contents($file);
        $content = str_replace("/static/", "static/", $content);
        $content = str_replace('id="cordova-scr">', 'id="cordova-scr" src="cordova.js">', $content);
        $content = str_replace('id="version">', 'id="version">' . implode(".", $dev_info["version"]) . " " . $dev_info["lastUpdate"], $content);
        file_put_contents($file, $content);
    }
}


if (!isset($argumentos["steps"]) || stristr($argumentos["steps"], "3")) {
    echo "3. Rebuilding build/static/css/*.css\n";
    $files = getFolderFilesByMask("./build/static/css/", "*.css");
    foreach ($files as $i => $file) {
        $content = file_get_contents($file);
        $content = str_replace("/static/", "../", $content);
        file_put_contents($file, $content);
    }
}


if (!isset($argumentos["steps"]) || stristr($argumentos["steps"], "4")) {
    echo "4. Rebuilding build/static/js/main.*.chunk.js\n";
    $files = getFolderFilesByMask("./build/static/js/", "main.*.chunk.js");
    foreach ($files as $i => $file) {
        $content = file_get_contents($file);
        $content = str_replace("window.loft.device={}", "window.loft.device=device", $content);
        file_put_contents($file, $content);
    }
}

// steps 5,6 are free to use


if (!isset($argumentos["steps"]) || stristr($argumentos["steps"], "7")) {
    echo "7. Removing subfolder of cordova/www/\n";
    $files = scandir("{$cordova_workfolder}www");
    foreach ($files as $i => $file) {
        if ($file != "." && $file != ".." && is_dir("{$cordova_workfolder}www" . DIRECTORY_SEPARATOR .$file) && !is_link("{$cordova_workfolder}www/$file"))
            rrmdir("{$cordova_workfolder}www" . DIRECTORY_SEPARATOR .$file);
    }
}


if (!isset($argumentos["steps"]) || stristr($argumentos["steps"], "8")) {
    echo "8. Copy build folder to cordova/www\n";
    echo `mv ./build ./www`;
    echo `cp -r ./www {$cordova_workfolder}`;
    echo `mv ./www ./build`;
}


if (!isset($argumentos["steps"]) || stristr($argumentos["steps"], "9")) {
    echo "9. Cordova build\n";
    $res = `cd {$cordova_workfolder}
    cordova build`;

    echo "$res\n";
    $res = explode($cordova_workfolder, $res);
    $res = str_replace("\n", "", array_pop($res));

    echo `cp {$cordova_workfolder}$res ./app-debug.apk`;
}


file_put_contents($dev_info_file, json_encode($dev_info));


if (isset($argumentos["app"])) {
    echo "0. Returning gamelogic\n";
    foreach ($FILES as $file) if (stristr($file, '.js') and $file != "$app.js") rename("$TMPFOLDER/$file", "$GLFOLDER/$file");

    $appFile = preg_replace("/\/*('[a-z]+',)/", "$1", $appFile);  
    //$appFile = preg_replace("/\/*const /", "const ", $appFile);  
    $appFile = preg_replace("/\/*import ([a-zA-Z]+ from \"\.\/Components\/Gameslogic\/[a-z]+\";)/", "import $1", $appFile);
    $appFile = preg_replace("/\/*(<Route   path='\/[a-z]+')/", "$1", $appFile);

    file_put_contents('./src/App.js', $appFile);
}


echo "NOW YOU CAN SIMULATE YOUR APP USING FOLLOWING CMD:\n";
echo "simulate --device=Nexus10 --dir=$cordova_workfolder --target=opera\n\n";


function getFolderFilesByMask($folder, $mask)
{
    $files = `find $folder -name "$mask"`;
    $files = explode("\n", $files);
    array_pop($files);
    return $files;
}

function rrmdir($dir)
{ 
    if (is_dir($dir)) { 
        $objects = scandir($dir);
        foreach ($objects as $object) { 
            if ($object != "." && $object != "..") { 
                if (is_dir($dir. DIRECTORY_SEPARATOR .$object) && !is_link($dir."/".$object)) {
                    rrmdir($dir. DIRECTORY_SEPARATOR .$object);
                } else {
                    echo " - Removing file " . $dir. DIRECTORY_SEPARATOR . $object ;
                    echo unlink($dir. DIRECTORY_SEPARATOR .$object) ? "\n" : " - FAILED\n"; 
                }
            } 
        }
        echo " - Removing folder $dir";
        echo rmdir($dir) ? "\n" : " - FAILED\n"; 
    } 
}

function getArgs($argv)
{
    array_shift($argv);
    $a = [];
    foreach ($argv as $arg) {
        $arg = explode("=", $arg);
        $a[$arg[0]] = $arg[1] ?? "";
    }
    return $a;
}