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

    public function __construct()
    {
        self::$available = Option::get("MAIL_AVAILABLE");
    }

    public function send(Mail $mail)
    {
        if (self::$available) {
            $ul = ucfirst(self::$available);
            $class = "\\Helper\\Mailer\\{$ul}";
            $mailer = new $class;
            $result = $mailer->send($mail);
            if ($result) {
                return true;
            }
            return false;
        } else {
            throw new Error("Mail Exception: CLASS " . self::$available . " not available");
        }
        return false;
    }

    public function toQueue($bool)
    {
        $this->queued = $bool;
    }

    /*
     * ---------------------------------------------------------

       Smtp config = array(
            "server" => "smtp.exmail.qq.com",
            'from' => '游宅网社区 <no-reply@loacg.com>',
            "address" => "no-reply@loacg.com",
            "smtp_name" => "no-reply@loacg.com",
            "smtp_pass" => "lO^Nf&4x"
        );

     * ---------------------------------------------------------
     */
}