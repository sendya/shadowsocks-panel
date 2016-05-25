<?php
/**
 * shadowsocks-panel
 * Add: 2016/03/26 23:53
 * Author: Sendya <18x@loacg.com>
 */


namespace Controller;

use Helper\CronTab;

class Cron
{

    public function index()
    {
        define('ENABLE_CRON', true);
        echo 'ok';
    }

    function __destruct()
    {
        flush();
        ob_end_flush();
        $cron = new CronTab();
        $cron->run();
    }
}