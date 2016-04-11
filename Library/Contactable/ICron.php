<?php
/**
 * shadowsocks-panel
 * Add: 2016/3/27 9:39
 * Author: Sendya <18x@loacg.com>
 */
namespace Contactable;


interface ICron {

    /** Cron 的运行方法 */
    public function run();

    /** 返回下次执行时间 */
    public function getStep();

}