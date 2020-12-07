<?php

echo "Initation of build process\n";

$argumentos = getArgs($argv);

if (isset($argumentos["path"]) && strtolower(readline("Continue with cordova workfolder '{$argumentos["path"]}'? ")) == "y") {

    $cordova_workfolder = $argumentos["path"];
    file_put_contents("./.cordova_workfolder", $cordova_workfolder);

} else {

    if (file_exists("./.cordova_workfolder")) {
        $cordova_workfolder = file_get_contents("./.cordova_workfolder");
    } else {
        $cordova_workfolder = readline("Enter new cordova workfolder: ");
        file_put_contents("./.cordova_workfolder", $cordova_workfolder);
    }

}

if (strrpos($cordova_workfolder, "/www") >= strlen($cordova_workfolder) - 5) {
    $cordova_workfolder = str_replace("/www", "", $cordova_workfolder);
}

echo "Cordova workfolder initiated at $cordova_workfolder\n";

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
        $content = str_replace('id="cordova">', 'id="cordova" src="cordova.js">', $content);
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
    echo "4. Rebuilding build/static/js/main.*.chunk.js*\n";
    $files = getFolderFilesByMask("./build/static/js/", "main.*.chunk.js*");
    foreach ($files as $i => $file) {
        $content = file_get_contents($file);
        $content = str_replace('"/music/', '"music/', $content);
        file_put_contents($file, $content);
    }
}


if (!isset($argumentos["steps"]) || stristr($argumentos["steps"], "5")) {
    echo "5. Removing subfolder of cordova/www/\n";
    $files = scandir("{$cordova_workfolder}www");
    foreach ($files as $i => $file) {
        if ($file != "." && $file != ".." && is_dir("{$cordova_workfolder}www" . DIRECTORY_SEPARATOR .$file) && !is_link("{$cordova_workfolder}www/$file"))
            rrmdir("{$cordova_workfolder}www" . DIRECTORY_SEPARATOR .$file);
    }
}


if (!isset($argumentos["steps"]) || stristr($argumentos["steps"], "6")) {
    echo "6. Copy build folder to cordova/www\n";
    echo `mv ./build ./www`;
    echo `cp -r ./www {$cordova_workfolder}`;
    echo `mv ./www ./build`;
}


if (!isset($argumentos["steps"]) || stristr($argumentos["steps"], "7")) {
    echo "7. Cordova build\n";
    $res = `cd {$cordova_workfolder}
    cordova build`;

    echo "$res\n";
    $res = explode($cordova_workfolder, $res);
    $res = str_replace("\n", "", array_pop($res));

    echo `cp {$cordova_workfolder}$res ./app-debug.apk`;
}




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
                    echo " - Removing folder " . $dir. DIRECTORY_SEPARATOR . $object ;
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