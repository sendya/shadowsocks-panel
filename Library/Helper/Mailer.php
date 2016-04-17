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

    public function __construct()
    {
        self::$available = Option::get("MAIL_AVAILABLE");
    }

    public static function send(Mail $mail)
    {

        if (self::$available) {
            $ul = ucfirst(self::$available);
            $class = "\\Helper\\Mailer\\{$ul}";
            $mailer = new $class;
            $mailer->send($mail);
        } else {
            throw new Error("Mail Exception: CLASS " . self::$available . " not available");
        }
    }

}