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
use Helper\Key;

class Index {
    
    /**
     * 进入首页
     */
    public function index() {

        include Template::load('/home/index');
        //throw new \Core\Error("Coming Soon..<br/>", 233);
    }

}
