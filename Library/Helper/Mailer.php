<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/4/16 21:56
 */


namespace Helper;

use Core\Error;
use Model\Mail;

final class Mailer
{

    private static $available;

    private $queued = false; // 立即发送或加入发送列队，由系统计划任务发送

    private static $_instance;

    public static function getInstance()
    {
        if (!(self::$_instance instanceof self)) {
            self::$_instance = new self;
        }
        return self::$_instance;
    }

    public function __construct()
    {
        self::$available = Option::get("MAIL_AVAILABLE");
    }

    public function send(Mail $mail)
    {
        if (self::$available) {

            if ($this->queued) { // 如果是发送到列队，则将邮件插入到邮件列队表
                $mail->save();
                return true;
            } else {
                $ul = ucfirst(self::$available);
                $class = "\\Helper\\Mailer\\{$ul}";
                $mailer = new $class;
                $result = $mailer->send($mail);
                if ($result) {
                    return true;
                }
                return false;
            }
        } else {
            throw new Error("Mail Exception: CLASS " . self::$available . " not available");
        }
        return false;
    }

    public function toQueue($bool, $flag = false)
    {
        $this->queued = $bool;
        if(!$flag) {
            Option::set('mail_queue', $bool===true?1:0);
        } else {
            Option::set('mail_queue', 1);
        }
    }
}