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

}