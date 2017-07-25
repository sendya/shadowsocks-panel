<?php
/**
 * shadowsocks-panel
 * Add: 2016/03/27 03:50
 * Author: Sendya <18x@loacg.com>
 */
namespace Helper\Cron;

use Interfaces\ICron;
use Core\Database;

/**
 * 计划任务 - Clear Logs
 * 定时清理系统内的无用数据..
 *
 * @package Helper\Cron
 */
class ClearLogs implements ICron
{

    const STEP = 86400; // 1天执行一次

    public function run()
    {
        // 清理一个月前的数据
        $mon = time()-2592000;
        $stn = Database::sql('DELETE FROM `card` WHERE add_time<? AND status=0');
        $stn->bindValue(1, $mon, Database::PARAM_INT);
        $stn->execute();

        $stn = Database::sql("DELETE FROM `invite` WHERE dateLine<? AND status=1");
        $stn->bindValue(1, $mon, Database::PARAM_INT);
        $stn->execute();
    }

    public function getStep()
    {
        return time() + self::STEP;
    }
}