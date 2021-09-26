<?php
namespace checkers\lib;

require_once "lib/CURL.php";

class Telegram
{
    private static $telegram_hostname = "api.telegram.org";
    private static $telegram_bot_token = "2035859735:AAHc8AU3kh7aAx8e-RX-LGKMXQGv1-iSJdk";
    private static $silence_time = "21:00";
    private static $working_time = "08:00";
    private static $timezone = 0;

    const USER_LEVEL = 0;
    const ADMIN_LEVEL = 0;

    private static $admin_group = [
        [
            "name" => "Дмитрий Кротков",
            "username" => "krotkovd",
            "chat_id" => 673219984,
            "update_id" => 782292802,
        ],
    ];

    public static function sendAdminNotices($msg = "", $files = [])
    {
        foreach (self::$admin_group as $admin) {
            self::sendMessage($admin["chat_id"], $msg, $files, self::ADMIN_LEVEL);
        }
    }

    public static function sendMessage($chat_id = 0, $msg = "", $files = [], $level = self::USER_LEVEL)
    {
        if (!$chat_id || !$msg) return false;

        if ($level == self::ADMIN_LEVEL) {
            if (!in_array($chat_id, array_column(self::$admin_group, "chat_id"))) {
                return false;
            }
        }

        $data = [
            'chat_id'   => $chat_id,
            'text'      => $msg,
        ];

        $servertimezone = new \DateTime();
        $servertimezone = (int)preg_replace("/[^0-9\+\-]/", "", $servertimezone->getTimezone()->getName());

        $current_time = date("H:i", time() - $servertimezone * 3600);

        if ($current_time < self::$working_time || $current_time > self::$silence_time) {
            $data['disable_notification'] = true;
        }

        $response = CURL::init("https://" . self::$telegram_hostname . "/bot" . self::$telegram_bot_token . "/sendMessage", $data, "POST");

        if ($response and $response['ok']) {
            if ($files) {
                foreach ($files as $caption => $path) {
                    $data = [
                        'chat_id'   => $chat_id, 
                        'caption'   => $caption,
                    ];
                    $response = CURL::init("https://" . self::$telegram_hostname . "/bot" . self::$telegram_bot_token . "/sendDocument", $data, "POST", "json", [], [
                        "document" => $path
                    ]);
                    if (!$response or !$response['ok']) {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    }

    public static function checkUpdates()
    {
        $data = CURL::init("https://" . self::$telegram_hostname . "/bot" . self::$telegram_bot_token . "/getUpdates");

        $time = time();

        $json = [];

        if ($data) {
            if (isset($data['ok']) and $data['ok']) {
                if (isset($data['result']) and $data['result']) {
                    $data['result'] = array_reverse($data['result']);
                    foreach ($data['result'] as $d) {
                        $from = $d['message']['from'];
                        if ($d['message']['text'] == "/get_chat_id" && $d['message']['date'] > $time - 60 && $from['is_bot'] == false) {
                            $json = [
                                "success" => true,
                                "name" => $from['first_name'] . " " . $from['last_name'],
                                "username" => $from['username'],
                                "chat_id" => $from['id'],
                                "update_id" => $d['update_id']
                            ];
                            break;
                        }
                    }
                }
            }
        }

        if (!$json) {
            $json = [
                "success" => false,
                "response" => "No data recieved",
            ];
        }

        return $json;
    }
}