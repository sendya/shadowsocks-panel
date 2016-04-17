<?php
/**
 * Created by PhpStorm.
 * User: Sendya
 * Date: 2016/3/27
 * Time: 0:12
 */

namespace Helper;

use Helper\Setting;
use Core\Database as DB;

class CronTab
{

    private $now;
    private $cronId;

    function __construct()
    {
        $this->now = time();
    }

    /**
     * @return string|void
     */
    public function run()
    {
        if (!defined('ENABLE_CRON')) {
            return;
        }

        $next = $this->getNextRun();
        if ($next != null) {
            $this->cronId = $next->id;
            $cl = ucfirst($this->cronId);
            $cl = "\\Helper\\Cron\\{$cl}";
            $obj = new $cl;
            $obj->run();
            $this->setNextRun($obj->getStep());
        }
    }

    private function getNextRun()
    {

        $st = DB::sql("SELECT * FROM cron WHERE nextrun<{$this->now} AND enable=1 ORDER BY `order` LIMIT 0,1");
        $st->execute();
        return $st->fetchObject(__CLASS__);
    }

    private function setNextRun($step)
    {
        $inTransaction = DB::getInstance()->inTransaction();
        if (!$inTransaction) {
            DB::getInstance()->beginTransaction();
        }
        $st = DB::sql("UPDATE cron SET nextrun={$step} WHERE id='{$this->cronId}'");
        $rs = $st->execute();
        if (!$inTransaction) {
            DB::getInstance()->commit();
        }
        return $rs;
    }

    private function start($name)
    {


    }

    private function stop()
    {

    }

    private function add()
    {

    }

    private function remove()
    {

    }

    private function disable()
    {

    }

    private function restart()
    {

    }
}