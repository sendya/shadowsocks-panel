<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Model;

use Core\Database;

class UserPower
{
    public $id;
    public $uid;// user id

    /**
     * Get a user power by id
     * @param $id
     * @return mixed
     */
    public static function GetPowerById($id) {
        $statement = Database::prepare("SELECT * FROM user_power WHERE id=?");
        $statement->bindValue(1, $id);
        $statement->execute();
        $statement->setFetchMode(\PDO::FETCH_CLASS, '\\Model\\UserPower');
        return $statement->fetch(\PDO::FETCH_CLASS);
    }

    /**
     * Get a user power by user id
     * @param $uid
     * @return mixed
     */
    public static function GetPowerByUid($uid) {
        $statement = Database::prepare("SELECT * FROM user_power WHERE uid=?");
        $statement->bindValue(1, $uid);
        $statement->execute();
        $statement->setFetchMode(\PDO::FETCH_CLASS, '\\Model\\UserPower');
        return $statement->fetch(\PDO::FETCH_CLASS);
    }

    public static function verifyPower($uid) {
        $statement = Database::prepare("SELECT count(*) FROM user_power WHERE uid=?");
        $statement->bindValue(1, $uid);
        $statement->execute();
        $count = $statement->fetch(\PDO::FETCH_NUM);
        return $count[0];
    }

    public function insert() {
        $inTransaction = Database::inTransaction();
        if (!$inTransaction) {
            Database::beginTransaction();
        }
        $statement = Database::prepare("INSERT INTO user_power SET `uid`=:uid");
        $statement->bindValue(':uid', $this->uid, \PDO::PARAM_INT);
        $statement->execute();
        $this->uid = Database::lastInsertId();
        if (!$inTransaction) {
            Database::commit();
        }
        return $this->uid;
    }

    public function update() {
        $inTransaction = Database::inTransaction();
        if (!$inTransaction) {
            Database::beginTransaction();
        }
        $statement = Database::prepare("UPDATE user_power SET `uid`=:uid WHERE id=:id");
        $statement->bindValue(':uid', $this->uid, \PDO::PARAM_INT);
        $statement->bindValue(':id', $this->id, \PDO::PARAM_INT);
        $statement->execute();
        $this->uid = Database::lastInsertId();
        $statement->execute();
        if (!$inTransaction) {
            Database::commit();
        }
    }

}