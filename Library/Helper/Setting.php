<?php
/**
 * Project: SS-Panel
 * Author: Sendya <18x@loacg.com>
 * Date: 2016/3/4 18:43
 */

namespace Helper;

use Core\Database;

class Setting
{
    public $k;
    public $v;
    public static $__cache;

    const CONFIG_FILE = DATA_PATH . "Config.php";
    const CACHE_FILE = DATA_PATH . "_CACHE.php";

    function __construct() {
        if(!self::$__cache) {
            self::$__cache = '';
        }
    }

    public static function get($k) {

        $querySQL = "SELECT k, v FROM setting WHERE k=?";
        $statement = Database::prepare($querySQL);
        $statement->bindValue(1, $k);
        $statement->execute();
        $statement->setFetchMode(\PDO::FETCH_CLASS, '\\Helper\\Setting');
        return $statement->fetch(\PDO::FETCH_CLASS);
    }

    public static function set($k, $v) {

        $sql = "UPDATE setting SET v=:v WHERE k=:k";
        if(Setting::Get($k) == null) {
            $sql = "INSERT INTO setting(k, v) VALUES(:k, :v)";
        }
        $inTransaction = Database::inTransaction();
        if (!$inTransaction) {
            Database::beginTransaction();
        }
        $statement = Database::prepare($sql);
        $statement->bindParam(":k", $k);
        $statement->bindParam(":v", $v);
        $statement->execute();
        if (!$inTransaction) {
            Database::commit();
        }
    }


    public static function CreateKey() {
        $iv = mcrypt_create_iv(
            mcrypt_get_iv_size(MCRYPT_CAST_256, MCRYPT_MODE_CFB),
            MCRYPT_DEV_RANDOM);
        return $iv;
    }

    public static function GetConfig($k) {
        if (!file_exists(self::CONFIG_FILE)) return false;
        $str = file_get_contents(self::CONFIG_FILE);
        $config = preg_match("/define\\('" . preg_quote($k) . "', '(.*)'\\);/", $str, $res);
        return $res[1];
    }

    public static function SetConfig($k, $v) {
        if (!file_exists(self::CONFIG_FILE)) return false;
        $str = file_get_contents(self::CONFIG_FILE);

        $str2 = preg_replace("/define\\('" . preg_quote($k) . "', '(.*)'\\);/",
            "define('" . preg_quote($k) . "', '" . $v . "');", $str);

        file_put_contents(self::CONFIG_FILE, $str2);
    }

}