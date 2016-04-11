<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/4/9 3:18
 */


namespace Model;

use Core\Database as DB;
use Core\Model;

/**
 * Class Message
 * @table message
 * @package Model
 */
class Message extends Model {

    public $id;
    public $content; //内容
    public $pushTime =0; //推送时间
    public $addTime =0; //添加时间
    public $pushUsers; //推送用户 为空或-1值推送给所有用户 指定用户，使用json格式,例子{1,3,4,5,6,7,10,11}
    public $type = 0; //消息类型： 0 正常消息(推送一次后将不会再次提示) 1 重复推送消息
    public $pushEndTime =0; //结束推送时间
    public $order = 0;
    public $enable = 0;


    /**
     * Get message by id
     * @param $id
     * @return mixed
     */
    public static function getMessageById($id) {
        $stn = DB::getInstance()->prepare("SELECT * FROM message WHERE id=?");
        $stn->bindValue(1, $id, DB::PARAM_INT);
        $stn->execute();
        return $stn->fetchObject(__CLASS__);
    }

    /**
     * Get push message array by end time.
     * @param int $pushEndTime
     * @return array
     */
    public static function getPushMessage($pushEndTime = 0) {
        if ($pushEndTime == 0)
            $pushEndTime = time();
        $stn = DB::getInstance()->prepare("SELECT * FROM message WHERE pushEndTime>?");
        $stn->bindValue(1, $pushEndTime, DB::PARAM_INT);
        $stn->execute();
        return $stn->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }

    /**
     * Get push message by userId
     * @param string $userId
     * @return array
     */
    public static function getMessageByUid($userId = '-1') {
        $stn = DB::getInstance()->prepare("SELECT * FROM message WHERE LOCATE(?, pushUsers)>0 AND pushEndTime>? ORDER BY id ASC");
        $stn->bindValue(1, $userId, DB::PARAM_STR);
        $stn->bindValue(2, time(), DB::PARAM_INT);
        $stn->execute();
        return $stn->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }

    /**
     * Get global message
     * @return array
     */
    public static function getGlobalMessage() {
        $stn = DB::getInstance()->prepare("SELECT * FROM `message` WHERE pushUsers=-2 AND `id` BETWEEN 1 AND 4 ORDER BY id ASC");
        $stn->execute();
        return $stn->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }

    /**
     * Delete push time out message
     * @return bool
     */
    public static function deleteOuttimeMessage() {
        $inTransaction = DB::getInstance()->inTransaction();
        if (!$inTransaction) DB::getInstance()->beginTransaction();
        $statement = DB::getInstance()->prepare("DELETE FROM `message` WHERE pushEndTime< :pushEndTime");
        $statement->bindValue(':pushEndTime', time(), DB::PARAM_INT);
        $result = $statement->execute();
        if (!$inTransaction) DB::getInstance()->commit();
        return $result;
    }

    /**
     * Delete message by id
     * @param $id
     * @return bool
     */
    public static function deleteMessageById($id) {
        $inTransaction = DB::getInstance()->inTransaction();
        if (!$inTransaction) DB::getInstance()->beginTransaction();
        $statement = DB::getInstance()->prepare("DELETE FROM `message` WHERE id=:id");
        $statement->bindValue(':id', $id, DB::PARAM_INT);
        $result = $statement->execute();
        if (!$inTransaction) DB::getInstance()->commit();
        return $result;
    }
}