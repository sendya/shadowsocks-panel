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

        $iv = new Invite();
        $iv->expiration = 10;
        $iv->dateLine = time();
        $iv->regDateLine = time();
        $iv->plan = 'A';
        $iv->status = 1;
        $iv->inviteIp = '127.0.0.1';
        $iv->reguid = 1;
        $iv->invite = md5(Utils::randomChar()."1");
        $iv->save();

    }

}
