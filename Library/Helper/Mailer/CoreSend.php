<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/4/16 23:28
 */


namespace Helper\Mailer;


use Contactable\IMailer;
use Model\Mail;

/**
 * PHP 内置 邮件发送
 *
 * Class CoreSend
 * @package Helper\Mailer
 */
class CoreSend implements IMailer{

    public function send(Mail $mail) {
        // TODO: Implement send() method.
    }

}