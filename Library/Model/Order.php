<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/7/12 03:02
 */

namespace Model;

use Core\Database as DB;
use Core\Model;

/**
 * Class Order
 * @Table orders
 * @package Model
 */
class Order extends Model
{

    public $id;
    public $userId;
    public $createTime;
    public $type; // 类型： 0 - 购买套餐 1 - 账户金额充值 2 - 购买卡号
    public $status;
    public $plan;
    public $money;
    public $remark;

    /**
     * get order info by id
     * @param $id
     * @return mixed
     */
    public static function getById($id)
    {
        $stm = DB::sql("SELECT * FROM `orders` WHERE `id`=?");
        $stm->bindValue(1, $id, DB::PARAM_INT);
        $stm->execute();
        return $stm->fetchObject(DB::FETCH_CLASS, __CLASS__);
    }

    public static function getByUserId($userid)
    {
        $stm = DB::sql("SELECT * FROM `orders` WHERE `userid`=? AND status = 0");
        $stm->bindValue(1, $userid, DB::PARAM_INT);
        $stm->execute();
        return $stm->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }
}