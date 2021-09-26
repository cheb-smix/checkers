<?php
namespace checkers\lib;

class CURL
{
    static $httpcode = 0;
    static $result;

    /**
     * @param $url
     * @param $params
     * @param $type
     * @param $dataType
     * @param $headers
     * @return bool|string
     */
    public static function init(
        string $url, 
        array $params = [], 
        string $type = "GET", 
        string $dataType = "json", 
        array $headers = [], 
        array $files = [],
        bool $redirectionEnabled = false
    )
    {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

        foreach ($files as $i => $file) {
            $params[gettype($i) == "integer" ? "file$i" : $i] = curl_file_create($file);
        }

        if ($type != "GET") {
            curl_setopt($curl, CURLOPT_POST, true);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $type == "JSON" ? json_encode($params) : $params);
            if ($type == "JSON") {
                $headers[] = "Content-Type: application/json";
            } elseif ($type == "FORM-DATA" || $files) {
                $headers[] = "Content-Type: multipart/form-data";
            }
        }

        if ($headers) curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        if ($redirectionEnabled) curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
        
        self::$result = curl_exec($curl);
        self::$httpcode = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        curl_close($curl);

        if ($dataType == "json") {
            try {
                self::$result = json_decode(self::$result, true) ?? self::$result;
            } catch (Exception $e) { }
        }

        return self::$result;
    }

    public static function code()
    {
        return self::$httpcode;
    }

    public static function body()
    {
        return self::$result;
    }
}