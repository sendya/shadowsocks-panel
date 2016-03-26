<?php
/**
 * Created by PhpStorm.
 * User: Sendya
 * Date: 2016/3/27
 * Time: 3:23
 */

namespace Helper\Cron;


interface ICron {

    public function run();
    public function getStep();

}