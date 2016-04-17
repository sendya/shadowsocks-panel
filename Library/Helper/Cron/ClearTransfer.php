<?php
/**
 * Created by PhpStorm.
 * User: Sendya
 * Date: 2016/3/27
 * Time: 3:19
 */

namespace Helper\Cron;

use Contactable\ICron;

use Core\Database;

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
        // $resetDate = Setting::get('reset_date');
        $resetDate = '1';
        $date = date("d", time());
        if ($date == $resetDate) {

            $inTransaction = DB::getInstance()->inTransaction();
            if (!$inTransaction) {
                DB::getInstance()->beginTransaction();
            }
            $st = DB::sql("UPDATE member SET flow_up=0, flow_down=0");
            $rs = $st->execute();
            if (!$inTransaction) {
                DB::getInstance()->commit();
            }
            return $rs;
        }
        return false;
    }

    public function getStep()
    {
        return strtotime(date('Y-m-01 00:00:00', strtotime("1 month"))); // 下个月
    }
}