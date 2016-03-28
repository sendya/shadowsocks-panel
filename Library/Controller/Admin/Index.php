<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use \Core\Template;
use \Model\User;
use \Model\Node;
use \Helper\Util;
use \Helper\Ana;
use Helper\Mail;
use Helper\Message;

class Index extends AdminListener {
    public function index() {
        global $user;

        $flow_num10 = Ana::dataUsage(0);
        $flow_num30 = Ana::dataUsage(1);
        $flow_num100 = Ana::dataUsage(2);
        $flow_max = Ana::dataUsage(3);
        $userCount = Ana::GetUserCount();

        include Template::load('/admin/index');
    }

    public function mailTest() {
        global $user;
        $content = <<<EOF
Hey guy, here's test mail
EOF;

        Mail::mail_send($user->email,  "[". SITE_NAME ."] Mail test", $content);
        Message::show("测试邮件已经发送到你的邮箱", '/admin', 6);
    }

    public function test() {
        global $user;

        include Template::load('/admin/test');
    }


}
