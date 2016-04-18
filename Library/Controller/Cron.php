<?php
/**
 * Created by PhpStorm.
 * User: Sendya
 * Date: 2016/3/26
 * Time: 23:53
 */

namespace Controller;

use Core\Request;
use Helper\CronTab;
use Helper\Util;

class Cron
{


    public function index()
    {
        $isSecureRequest = Request::isSecureRequest();
        $host = $_SERVER['SERVER_NAME'];
        $fp = fsockopen($host, $isSecureRequest? 443 : 80, $errno, $errstr,5);
        fputs($fp,"GET ".BASE_URL."cron/run");
        fclose($fp);
        echo 'ok';
        exit();
    }

    public function run() {
        define('ENABLE_CRON', true);
        define('CLEAN_TRANSFER', true);
        $cron = new CronTab();
        $cron->run();
    }

}