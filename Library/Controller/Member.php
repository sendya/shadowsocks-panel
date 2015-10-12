<?php
namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Listener;

class Member {
    
    public function index() {
        if(!Listener::checkLogin()) header("Location:/");
            else
        include Template::load("panel2/member");  
        //throw new Error('目前无法访问 <b>仪表盘</b>', 555);
    }
    
}