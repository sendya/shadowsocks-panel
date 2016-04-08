<?php
/**
 * shadowsocks-panel
 * Add: 2016/4/8 13:03
 * Author: Sendya <18x@loacg.com>
 */

namespace Helper;

use Core\Database as DB;

class Option {

    public $k;
    public $v;

    public static function get($k) {

        $querySQL = "SELECT k, v FROM options WHERE k=?";
        $statement = DB::getInstance()->prepare($querySQL);
        $statement->bindValue(1, $k);
        $statement->execute();
        $opt = $statement->fetchObject(__CLASS__);
        return $opt->v;
    }

    public static function set($k, $v) {

        $sql = "UPDATE options SET v=:v WHERE k=:k";
        if(Option::get($k) == null) {
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
    }
}