<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Listener;
use Helper\Util;
use Model\Invite;
use Model\Node;

class Member extends Listener {
    
    public function Index() {
        global $user;
        $controller = __FUNCTION__;
        $serverCount = \Model\Node::GetNodeCount();

        $flow = $user->flow_up + $user->flow_down;//已用
        $usedflow = Util::FlowAutoShow($user->transfer - $flow);//剩余可用
        $user_100 = 0;
        if(!Member::fuckInt($flow) || !Member::fuckInt($user->transfer)){
            $user_100 = round($flow / $user->transfer, 2)*100;
        }
        if($user_100 == 0) $user_100 = 1;
        $all_transfer = Util::FlowAutoShow($user->transfer);//共有流量
        $flow = round($flow / Util::GetMB(), 2);
        $checkin = false;//是否可以签到
        $checkinTime = date("m-d h:i", $user->lastCheckinTime);
        if((time() - 3600*24) < $user->lastCheckinTime) $checkin = true;

        include Template::load("panel/member");
    }
    //2015.11.10 start
    public function Node() {
        global $user;
        $controller = __FUNCTION__;

        $nodes = Node::GetNodeArray(0);
        $nodeVip = Node::GetNodeArray(1);

        include Template::load("panel/node");
    	//throw new Error("This page is not available" , 404);
    }

    /**
     *	Invite list 
     *	2015.11.11 start
     */
    public function Invite() {
        global $user;
        $controller = __FUNCTION__;
        $inviteList = Invite::GetInvitesByUid($user->id, 0);
        include Template::load("panel/invite");

    	//throw new Error("This page is not available", 404);
    }

    /**
     *	User info page,
     *	2015.11.12 start
     */
    public function Info() {
        global $user;
        $controller = __FUNCTION__;

        include Template::load("panel/info");
    }

    public function ChangePassword() {
        global $user;
        $controller = __FUNCTION__;

        include Template::load("panel/changePassword");
    }

    public function ChangeSSPassword() {
        global $user;
        $controller = __FUNCTION__;

        include Template::load("panel/changeSSPassword");
    }

    public function ChangeNickname() {
        global $user;
        $controller = __FUNCTION__;

        include Template::load("panel/changeNickname");
    }

    public function ChangePlanLevel() {
        global $user;
        $controller = __FUNCTION__;

        include Template::load("panel/changePlanLevel");
    }




    private static function fuckInt($number) {
        if($number == null || $number == 0) return true;
        return false;
    }
}