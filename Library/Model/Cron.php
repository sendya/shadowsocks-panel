<?php
/**
 * shadowsocks-panel
 * Add: 2016/4/8 9:39
 * Author: Sendya <18x@loacg.com>
 */

namespace Model;


use Core\Database as DB;
use Core\Model;

class Cron extends Model {

    public $id;
    public $enable;
    public $nextRun;
    public $order;

    public static function getCronArray() {
        $st = DB::sql("SELECT id, enable, nextrun, `order` FROM cron");
        $st->execute();
        return $st->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }
}