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

        var_dump(Invite::addInvite(1, 'A'));
        exit();
    }

}
