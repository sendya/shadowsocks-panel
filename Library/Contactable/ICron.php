<?php
/**
 * Created by PhpStorm.
 * User: Sendya
 * Date: 2016/3/27
 * Time: 3:23
 */

namespace Contactable;


interface ICron {

    /** Cron 的运行方法 */
    public function run();

    /** 返回下次执行时间 */
    public function getStep();

}