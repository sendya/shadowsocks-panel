<?php

/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/3/26 16:18
 */
namespace Contactable;

use Model\Mail as MailModel;

/**
 * 邮件发送接口
 * 怎么发送，使用什么方法自行继承并实现相应功能
 *
 * Interface Mailer
 */
interface Mailer {

    /** 是否可以 */
    public function isAvailable();

    /** 发送方法 */
    public function send(MailModel $mail);

    /** 邮件发送测试 */
    public function test();

}