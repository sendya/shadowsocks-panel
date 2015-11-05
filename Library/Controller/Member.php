<?php
namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Listener;

class Member {
    
    public function index() {
        echo Listener::checkLogin();
        /*
        if(!Listener::checkLogin()) header("Location:/");
            else
        //include Template::load("panel/member");
        throw new Error('目前无法访问 <b>仪表盘</b><br/>', 555);
        */
    }
}