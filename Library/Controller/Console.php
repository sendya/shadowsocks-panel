<?php
namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Listener;
use Helper\Util;

class Console extends Listener {
    
    public function index() {
        global $user;
        $controller = "Console";
        $serverCount = \Model\Node::GetNodeCount();


        $flow = $user->flow_up + $user->flow_down;//已用
        $usedflow = Util::FlowAutoShow($user->transfer - $flow);//剩余可用
        $user_100 = round($flow / $user->transfer, 2)*100;
        if($user_100 == 0) $user_100 = 1;
        $all_transfer = Util::FlowAutoShow($user->transfer);//共有流量
        $flow = round($flow / Util::GetMB(), 2);
        $checkin = false;//是否可以签到
        $checkinTime = date("Y-m-d h:i", $user->lastCheckinTime);
        if((time() - 3600*24) < $user->lastCheckinTime) $checkin = true;

        include Template::load("panel/member");
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