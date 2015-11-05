<?php
namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Listener;

class Member {
    
    public function index() {
        global $user;
        if(!Listener::checkLogin()) header("Location:/user/login");
            else
        include Template::load("panel/member");
        //throw new Error('目前无法访问 <b>仪表盘</b><br/>', 555);

    }
}