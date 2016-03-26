<?php

/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/3/26 16:18
 */

/**
 * 邮件发送接口
 * 怎么发送，使用什么方法自行继承并实现相应功能
 *
 * Interface Mailer
 */
interface Mailer {

    public function isAvailable();

    public function send();


}