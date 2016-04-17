<?php
/**
 * Created by PhpStorm.
 * User: Sendya
 * Date: 2016/3/26
 * Time: 23:53
 */

namespace Controller;

use Helper\CronTab;
use Helper\Util;

class Cron
{


    public function index()
    {
        define('ENABLE_CRON', true);
        define('CLEAN_TRANSFER', true);

        $cron = new CronTab();
        $cron->run();

        echo 'ok';
        exit();
    }

}