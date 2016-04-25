<?php
/**
 * shadowsocks-panel
 * Add: 2016/4/8 13:03
 * Author: Sendya <18x@loacg.com>
 */

namespace Helper;

use Core\Database as DB;

class Option
{

    public $k;
    public $v;

    private static $list;

    function __construct()
    {
        if (!self::$list) {
            self::$list = self::init();
        }
        return self::$list;
    }

    public static function get($k)
    {

        if (self::$list) {
            if (self::$list[$k]) {
                return self::$list[$k];
            }
        }

        /*        if($GLOBALS['OPTIONS']!=null) {
                    if($GLOBALS['OPTIONS'][$k]!=null)
                        return $GLOBALS['OPTIONS'][$k];
                }*/

        $querySQL = "SELECT k, v FROM options WHERE k=?";
        $statement = DB::getInstance()->prepare($querySQL);
        $statement->bindValue(1, $k);
        $statement->execute();
        $opt = $statement->fetchObject(__CLASS__);
        return $opt->v;
    }

    public static function set($k, $v)
    {

        $sql = "UPDATE options SET v=:v WHERE k=:k";
        if (Option::get($k) == null) {
            $sql = "INSERT INTO options(k, v) VALUES(:k, :v)";
        }

        $inTransaction = DB::getInstance()->inTransaction();
        if (!$inTransaction) {
            DB::getInstance()->beginTransaction();
        }
        $statement = DB::getInstance()->prepare($sql);
        $statement->bindParam(":k", $k);
        $statement->bindParam(":v", $v);
        $statement->execute();
        if (!$inTransaction) {
            DB::getInstance()->commit();
        }
        self::$list = self::init();
    }

    public static function delete($k)
    {
        $sql = "DELETE FROM options WHERE k=:k";
        $statement = DB::getInstance()->prepare($sql);
        $statement->bindParam(":k", $k);
        $statement->execute();
    }

    public static function init()
    {
        $stn = DB::getInstance()->prepare("SELECT k, v FROM options");
        $stn->execute();
        $opt = $stn->fetchAll(DB::FETCH_UNIQUE | DB::FETCH_COLUMN);
        // $GLOBALS['OPTIONS'] = $opt;
        self::$list = $opt;
        return $opt;
    }

    public static function getOptions()
    {
        if (!self::$list) {
            self::$list = self::init();
        }
        return self::$list;
    }
}