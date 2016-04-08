<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Database;
use Core\Error;
use Core\Template;
use Helper\Encrypt;
use Helper\Option;
use Helper\Utils;
use Model\Invite;

class Index {

    /**
     * 进入首页
     */
    public function index() {
        Template::setView('home/index');
    }

    public function test() {
        $planNames = [
            'A'    =>  '免费用户',
            'B'    =>  '普通用户',
            'C'    =>  '高级用户',
            'D'    =>  '超级用户',
            'VIP'  =>  '特权会员'
        ];
        Option::set('custom_plan_name', json_encode($planNames));

    }

}
