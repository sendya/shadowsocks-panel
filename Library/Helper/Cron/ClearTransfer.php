<?php
/**
 * shadowsocks-panel
 * Add: 2016/03/27 17:13
 * Author: Sendya <18x@loacg.com>
 */

namespace Helper\Cron;

use Contactable\ICron;

use Core\Database as DB;

/**
 * 计划任务 - ClearTransfer
 * 每月 1号 重置所有用户流量
 *
 * @package Helper\Cron
 */
class ClearTransfer implements ICron
{

    public function run()
    {
        $resetDate = '1';
        $date = date("d", time());
        if ($date == $resetDate) {

            $inTransaction = DB::getInstance()->inTransaction();
            if (!$inTransaction) {
                DB::getInstance()->beginTransaction();
            }
            $st = DB::sql("UPDATE member SET flow_up=0, flow_down=0 WHERE `enable`=1 AND `plan`!='Z'");
            $st->execute();
            if (!$inTransaction) {
                DB::getInstance()->commit();
            }
        }
        return false;
    }

    public function getStep()
    {
        return strtotime(date('Y-m-01 00:00:01', strtotime("1 month"))); // 下个月
    }
}