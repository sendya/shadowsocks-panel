<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller;

use \Core\Template;
use \Helper\Listener;

use \Model\Invite as InviteModel;

class Invite extends Listener {

    public function index() {
        $inviteList = \Model\Invite::GetInvitesByUid(-1);

        include Template::load('/home/invite');
    }

    public function userAddInvite() {
        global $user;
        $result = array('error' => 1, 'message' => '添加邀请码失败');
        if(!$user) {
            $result = array('error' => 1, 'message' => '没有权限');
        }
        if($user->getFlow() > 10) {

            $invite = InviteModel::addInvite($user->uid);
            if($invite!=null) {
                $result = array('error' => 0, 'message' => '添加成功，邀请码为：' . $invite . " ,您可以稍后在列表内查看到您新增的邀请码");
            }
        } else {
            $result = array('error' => 1, 'message' => '您的流量不足');
        }
        echo json_encode($result);
        exit();
    }


}