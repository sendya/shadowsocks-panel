<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/3/21 21:11
 */


namespace Model;

use \Core\Database as DB;

class Card {

    public $id;
    public $card;
    public $add_time;
    public $type;
    public $status;

    public static function QueryCard($card) {
        $st = DB::prepare("SELECT * FROM card WHERE card=:card");
        $st->bindValue(":card", $card, \PDO::PARAM_STR);
        $st->execute();
        $st->setFetchMode(\PDO::FETCH_CLASS, '\\Model\\Card');
        return $st->fetch(\PDO::FETCH_CLASS);
    }

    public static function QueryCardById($id) {
        $st = DB::prepare("SELECT * FROM card WHERE id=:id");
        $st->bindValue(":id", $id, \PDO::PARAM_INT);
        $st->execute();
        $st->setFetchMode(\PDO::FETCH_CLASS, '\\Model\\Card');
        return $st->fetch(\PDO::FETCH_CLASS);
    }

    public static function delete($param) {
        $sqlParam = "DELETE FROM card WHERE card=:card";
        $st = DB::prepare($sqlParam);
        $st->bindValue(":card", $param, \PDO::PARAM_STR);
        $rs = $st->execute();
        return $rs;
    }

    public function insertToDB() {
        $inTransaction = DB::inTransaction();
        if (!$inTransaction) {
            DB::beginTransaction();
        }
        $st = DB::prepare("INSERT INTO card SET card=:card, add_time=:add_time, `type`=:type, status=:status");
        $st->bindValue(":card", $this->card, \PDO::PARAM_STR);
        $st->bindValue(":add_time", $this->add_time, \PDO::PARAM_INT);
        $st->bindValue(":type", $this->type, \PDO::PARAM_INT);
        $st->bindValue(":status", $this->status, \PDO::PARAM_INT);
        $st->execute();
        $this->id = DB::lastInsertId();
        if (!$inTransaction) {
            DB::commit();
        }
        return $this->id;
    }

    public function update() {
        $inTransaction = DB::inTransaction();
        if (!$inTransaction) {
            DB::beginTransaction();
        }
        $st = DB::prepare("UPDATE card SET card=:card, add_time=:add_time, `type`=:type, status=:status WHERE id:id");
        $st->bindValue(":card", $this->card, \PDO::PARAM_STR);
        $st->bindValue(":add_time", $this->add_time, \PDO::PARAM_INT);
        $st->bindValue(":type", $this->type, \PDO::PARAM_INT);
        $st->bindValue(":status", $this->status, \PDO::PARAM_INT);
        $st->bindValue(":id", $this->id, \PDO::PARAM_INT);
        $flag = $st->execute();

        if (!$inTransaction) {
            DB::commit();
        }
        return $flag;
    }

    public static function destroy($card) {
        $inTransaction = DB::inTransaction();
        if (!$inTransaction) {
            DB::beginTransaction();
        }
        $st = DB::prepare("UPDATE card SET status=0 WHERE card=:card"); // 失效卡
        $st->bindValue(":card", $card, \PDO::PARAM_STR);
        $flag = $st->execute();
        if(!$inTransaction)
            DB::commit();
        return $flag;
    }
}