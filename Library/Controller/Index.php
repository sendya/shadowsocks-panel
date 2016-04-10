<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Template;

class Index {

    /**
     * 进入首页
     */
    public function index() {
        Template::setView('home/index');
    }

    public function test() {

        var_dump(\Model\User::getUserByUserId(2));

        var_dump($_SESSION['currentUser']);
        exit();
    }

}
