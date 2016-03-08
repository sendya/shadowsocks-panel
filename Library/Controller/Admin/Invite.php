<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use \Core\Template;

use \Model\Invite as InviteModel;

/**
 * Controller: 邀请码
 */
class Invite extends AdminListener {

    public function index() {
        //throw new \Core\Error("user list", 505);
        global $user;
        $users = UserModel::GetUserArray();
        include Template::load('/admin/invite');
    }

    /**
     * 添加一个邀请码
     */
    public function add() {
				global $user;
				$result = array('error'=> 0, 'message'=> '添加成功');
				$plan = 'A';
				$inviteNumber = 1;
				if($_POST['plan'] != null) {
					$plan = $_POST['plan'];
				}
				if($_POST['number'] != null) {
					$inviteNumber = $_POST['number'];
				}
				if($inviteNumber > 1) {
					for($i=0; $i<$inviteNumber;$i++){
						InviteModel::addInvite($user->uid, $plan);
					}
				} else {
					InviteModel::addInvite($user->uid, $plan);
				}
    		
    		echo json_encode($result);
    		exit();
    }

    public function delete() {
    	global $user;
    	$result = array('error'=> -1, 'message'=> '删除失败');

    	if($_POST['invite'] != null) {
    		InviteModel::deleteInvite($_POST['invite']);
    		$result = array('error'=> 0, 'message'=> '删除成功');
    	}

			echo json_encode($result);
			exit();
    }

    public function update() {
    	// TODO --	
    }

}