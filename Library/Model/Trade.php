<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 10/23/2016 2:43 AM
 */

namespace Model;


use Core\Model;
use Core\Database as DB;

class Trade extends Model
{

    public $id;
    public $time;
    public $title;
    public $trade;
    public $name;
    public $amount;
    public $has_notify;

    public static function getByTrade($trade)
    {
        $stm = DB::sql('SELECT id, trade, has_notify FROM trade WHERE trade=?');
        $stm->bindValue(1, $trade);
        $stm->execute();
        return $stm->fetchObject(__CLASS__);
    }

}