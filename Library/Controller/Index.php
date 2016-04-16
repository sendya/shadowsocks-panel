<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Database;
use Core\Template;
use Helper\Mailer\Smtp;
use Helper\Utils;
use Model\Mail;

class Index {

    /**
     * 进入首页
     */
    public function index() {
        Template::setView('home/index');
    }

    public function test() {

        $mail = new Smtp();
        $message = new Mail();

        $message->address = "yladmxa@qq.com";
        $message->content = "text content";
        $message->subject = "mail title.";

        $aaa = $mail->send($message);
        print_r($aaa);
    }

}
