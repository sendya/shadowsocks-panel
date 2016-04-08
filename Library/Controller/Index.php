<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Encrypt;

class Index {

    /**
     * 进入首页
     */
    public function index() {
        Template::setView('home/index');
    }

    public function test() {

    }

}
