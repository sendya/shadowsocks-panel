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
        $transferLevel = [
            'A'     =>  10,
            'B'     =>  50,
            'C'     =>  150,
            'D'     =>  300,
            'VIP'   =>  500
        ];
        Option::set('custom_transfer_level', json_encode($transferLevel));

    }

}
