<?php
namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Listener;
use Helper\Util;

class Member extends Listener {
    
    public function index() {
        global $user;
        $controller = "Member";
        $serverCount = \Model\Node::GetNodeCount();

        //已用
        $flow = $user->flow_up + $user->flow_down;
        //剩余可用
        $usedflow = Util::FlowAutoShow($user->transfer - $flow);
        $user_100 = round($flow / $user->transfer, 2)*100;
        if($user_100 == 0) $user_100 = 1;
        //共有流量
        $all_transfer = Util::FlowAutoShow($user->transfer);
        $flow = round($flow / Util::GetMB(), 2);


        include Template::load("panel/member");
        //throw new Error('目前无法访问 <b>仪表盘</b><br/>', 555);

    }
    //2015.11.10 start
    public function NodeList() {

    	throw new Error("This page is not available", 505);
    }

    /**
     *	Invite list 
     *	2015.11.11 start
     */
    public function Invite() {

    	throw new Error("This page is not available", 505);
    }

    /**
     *	User info page,
     *	2015.11.12 start
     */
    public function Info() {
    	
    	throw new Error("This page is not available", 505);
    }
}