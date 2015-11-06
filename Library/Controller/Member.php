<?php
namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Listener;

class Member extends Listener {
    
    public function index() {
        global $user;
        $controller = "Member";
        include Template::load("panel/member");
        //throw new Error('目前无法访问 <b>仪表盘</b><br/>', 555);

    }
}