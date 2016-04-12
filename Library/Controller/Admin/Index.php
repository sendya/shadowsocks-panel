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
use \Helper\Stats;
use Helper\Mail;
use Helper\Message;

/**
 * Class Index
 * @Admin
 * @Authorization
 * @package Controller\Admin
 */
class Index {

    public function index() {
        $data['user'] = User::getCurrent();
        $data['flow_num10'] = Stats::dataUsage(0);
        $data['flow_num30'] = Stats::dataUsage(1);
        $data['flow_num100'] = Stats::dataUsage(2);
        $data['flow_max'] = Stats::dataUsage(3);
        $data['userCount'] = Stats::countUser();
        Template::setContext($data);
        Template::setView('admin/index');
    }

    public function mailTest() {
        $user = User::getCurrent();
        $content = <<<EOF
Hey guy, here's test mail
EOF;

        Mail::mail_send($user->email,  "[". SITE_NAME ."] Mail test", $content);
        Message::show("测试邮件已经发送到你的邮箱", '/admin', 4);
    }

}
