<?php
/**
 * shadowsocks-panel
 * Add: 2016/4/8 9:39
 * Author: Sendya <18x@loacg.com>
 */

namespace Model;


use Core\Database as DB;
use Core\Model;

class Cron extends Model
{

    public $id;
    public $enable;
    public $system; // 是否为系统任务 0-false 1-true
    public $remark;
    public $nextrun;
    public $order;

    public static function getCronArray()
    {
        $st = DB::sql("SELECT id, enable, system, remark, nextrun, `order` FROM cron");
        $st->execute();
        return $st->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }

    public static function getNextRun()
    {
        $now = time();
        $st = DB::sql("SELECT * FROM cron WHERE nextrun<{$now} AND enable=1 ORDER BY `order` LIMIT 0,1");
        $st->execute();
        return $st->fetchObject(__CLASS__);
    }

    public static function setNextRun($cronId, $step)
    {
        $inTransaction = DB::getInstance()->inTransaction();
        if (!$inTransaction) {
            DB::getInstance()->beginTransaction();
        }
        $st = DB::sql("UPDATE cron SET nextrun=? WHERE id=?");
        $st->bindValue(1, $step, DB::PARAM_INT);
        $st->bindValue(2, $cronId, DB::PARAM_STR);
        $st->execute();
        if (!$inTransaction) {
            DB::getInstance()->commit();
        }
    }
}