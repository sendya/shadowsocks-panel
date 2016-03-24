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

    public function test() {
        global $user;

        include Template::load('/admin/test');
    }

}
