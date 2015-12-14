<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Helper;

class Key {

    public static function CreateKey() {
        $iv = mcrypt_create_iv(
            mcrypt_get_iv_size(MCRYPT_CAST_256, MCRYPT_MODE_CFB),
            MCRYPT_DEV_RANDOM);
        return $iv;
    }

    public static function GetConfig($cname) {
        $file = DATA_PATH . "Config.php";
        if (!file_exists($file)) return false;

        $config = preg_match("/define\('" . preg_quote($cname) . "', '(.*)'\);/", $str, $res);
        return $res[1];
    }

    public static function SetConfig($cname, $value) {
        $file = DATA_PATH . "Config.php";
        if (!file_exists($file)) return false;
        $str = file_get_contents($file);

        $str2 = preg_replace("/define\('" . preg_quote($cname) . "', '(.*)'\);/",
            "define('" . preg_quote($cname) . "', '" . $value . "');", $str);

        file_put_contents($file, $str2);
    }
}