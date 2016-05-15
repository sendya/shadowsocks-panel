<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/3/21 21:11
 */


namespace Model;

use Core\Database as DB;
use Core\Model;

class Card extends Model
{

    public $id; // 主键
    public $card; // 卡号 不重复
    public $add_time;
    public $type; // 类型 0-套餐卡 1-流量卡 2-测试卡
    /**
     * 1. 为套餐卡时，此字段为套餐类型（单位A/B/C/D/VIP）
     * 2. 为流量卡时，此字段为流量大小（单位GB）
     * 3. 为测试卡时，此字段为测试时长（单位天）
     */
    public $info;
    public $expireTime; // 套餐有效期
    public $status; // 卡状态 0-失效 1-可用

    public static function queryAll($type = 0)
    {
        $sql = 'SELECT * FROM card ';
        if($type == 1) {
            $sql .= 'WHERE status=1 ';
        }
        $sql .= ' ORDER BY add_time';
        $st = DB::sql($sql);
        $st->execute();
        return $st->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }

    public static function queryCard($card)
    {
        $st = DB::sql("SELECT * FROM card WHERE card=:card");
        $st->bindValue(":card", $card, DB::PARAM_STR);
        $st->execute();
        return $st->fetchObject(__CLASS__);
    }

    public static function queryCardById($id)
    {
        $st = DB::sql("SELECT * FROM card WHERE id=:id ");
        $st->bindValue(":id", $id, DB::PARAM_INT);
        $st->execute();
        return $st->fetchObject(__CLASS__);
    }

    public function destroy()
    {
        $inTransaction = DB::getInstance()->inTransaction();
        if (!$inTransaction) {
            DB::getInstance()->beginTransaction();
        }
        $st = DB::sql("UPDATE card SET status=0 WHERE card=:card"); // 失效卡
        $st->bindValue(":card", $this->card, DB::PARAM_STR);
        $flag = $st->execute();
        if (!$inTransaction) {
            DB::getInstance()->commit();
        }
        return $flag;
    }
}