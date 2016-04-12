<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use \Core\Template;

use \Model\Invite as InviteModel;
use \Model\UserPower as UserPowerModel;

/**
 * Controller: 邀请码
 */
class Invite extends AdminListener {

    public function inviteList() {
        //throw new \Core\Error("user list", 505);
        global $user;

		$inviteList = InviteModel::GetInviteArray(0);

        include Template::load('/admin/invite');
    }

	public function inviteOldList() {
		global $user;

		$inviteList = InviteModel::GetInviteArray(1);
		include Template::load('/admin/invite');
	}

    /**
     * 添加一个邀请码
     */
    public function add() {
		global $user;
		$result = array('error'=> 0, 'message'=> '添加成功，刷新可见');
		$plan = 'A';
		$type = -1;
		$userPowerId = 5000;
		$inviteNumber = 1;
		if($_POST['plan'] != null) {
			$plan = $_POST['plan'];
		}
		if($_POST['type'] != null) {
			$type = $_POST['type'];
		}
		if($_POST['number'] != null) {
			$inviteNumber = $_POST['number'];
		}
		$userPowerId = UserPowerModel::GetPowerById(1);
		if($type != -1) {
			$type = $userPowerId
		}
		if($inviteNumber > 1) {
			for($i=0; $i<$inviteNumber;$i++){
				InviteModel::addInvite($type, $plan);
			}
		} else {
			InviteModel::addInvite($type, $plan);
		}
		$result['inviteNumber'] = $inviteNumber;
		$result['plan'] = $plan;

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

	public function query() {
		global $user;
		$result = array('error'=> -1, 'message'=> 'Request failed');

		if($_POST['invite'] != null) {
			$invite = InviteModel::GetInviteByInviteCode(trim($_POST['invite']));
			if($invite != null) {
				$result = array('error'=> 0, 'message'=> 'success');
				$invite->dateLine = date('Y-m-d', $invite->dateLine);
				$result['data'] = $invite;
			}
		}
		echo json_encode($result);
		exit();
	}

    public function update() {
		global $user;
		$result = array('error'=> -1, 'message'=> 'Request failed');

		if($_POST['invite'] != null) {
			$invite = InviteModel::GetInviteByInviteCode(trim($_POST['invite']));
			if($invite != null) {
				$invite->dateLine = strtotime($_POST['add_time1'] + " " + $_POST['add_time2']);
				$invite->expiration = $_POST['expiration'];
				$invite->plan = $_POST['plan'];
				$rs = $invite->updateInvite();
				if($rs > 0) {
					$result = array('error'=> 0, 'message'=> '更新邀请码成功');
				}

			}
		}
		echo json_encode($result);
		exit();
    }

}