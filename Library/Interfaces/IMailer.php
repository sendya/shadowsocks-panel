<?php

/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/3/26 16:18
 */
namespace Interfaces;

use Model\Mail;

/**
 * 邮件发送接口
 *
 * instanceof
 * Interface Mailer
 */
interface IMailer
{
    public function isAvailable();

    /** 发送方法 */
    public function send(Mail $mail);


}