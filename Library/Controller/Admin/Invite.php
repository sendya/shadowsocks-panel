<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use \Core\Template;

use Model\Invite as InviteModel;
use Model\User;
use Helper\Option;

/**
 * Controller: 邀请码
 * @Admin
 * @Authorization
 * @package Controller\Admin
 */
class Invite {

    public function inviteList() {
     	$data['user'] = User::getCurrent();
		$data['inviteList'] = InviteModel::getInviteArray(0);
		$data['planList'] = json_decode(Option::get('custom_plan_name'), true);
		array_splice($data['planList'], -1,1); // 移除 Z(固定流量套餐)
		Template::setContext($data);
        Template::setView('admin/invite');
    }

	public function inviteOldList() {
		$data['user'] = User::getCurrent();
		$data['inviteList'] = InviteModel::getInviteArray(1);
		$data['planList'] = json_decode(Option::get('custom_plan_name'), true);
		array_splice($data['planList'], -1,1);
		Template::setContext($data);
		Template::setView('admin/invite');
	}

    /**
     * 添加一个邀请码
	 * @JSON
     */
    public function update() {
		$result = array('error'=> -1, 'message'=> 'Request failed');
		$user = User::getCurrent();
		if($_POST['invite'] == null) {
			$result = array('error'=> 0, 'message'=> '添加成功，刷新可见');
			$plan = 'A';
			$add_uid = -1;
			$inviteNumber = 1;
			if($_POST['plan'] != null) {
				$plan = $_POST['plan'];
			}
			if($_POST['add_uid'] != null) {
				$add_uid = trim($_POST['add_uid']);
				if($add_uid != $user->uid && $add_uid != -1) {
					if(!User::getUserByUserId($add_uid)) {
						$result['error'] = 1;
						$result['message'] = "此UID: ". $add_uid . " 的用户不存在，添加失败";
						return $result;
					}

				}
			}
			if($_POST['number'] != null) {
				$inviteNumber = $_POST['number'];
			}
			if($inviteNumber > 1) {
				for($i=0; $i<$inviteNumber;$i++){
					InviteModel::addInvite($add_uid, $plan);
				}
			} else {
				InviteModel::addInvite($add_uid, $plan);
			}
			$result['inviteNumber'] = $inviteNumber;
			$result['plan'] = $plan;

		} else {
			if($_POST['invite'] != null) {
				$invite = InviteModel::getInviteByInviteCode(trim($_POST['invite']));
				if($invite != null) {
					$invite->dateLine = time(); // TODO -- 前端时间获取
					$invite->expiration = $_POST['expiration'];
					$invite->plan = $_POST['plan'];
					$invite->save();
					$result = array('error'=> 0, 'message'=> '更新邀请码成功');
				}
			}
		}
		return $result;
    }

	/**
	 * @JSON
	 * @return array
	 */
    public function delete() {
    	$result = array('error'=> -1, 'message'=> '删除失败');
    	if($_POST['id'] != null) {
			$id = intval(trim($_POST['id']));
    		$invite =  InviteModel::getInviteById($id);
			$invite->delete();
    		$result = array('error'=> 0, 'message'=> '删除成功', 'id' => $_POST['id']);
    	}

		return $result;
    }

	/**
	 * @JSON
	 */
	public function query() {
		$result = array('error'=> -1, 'message'=> 'Request failed');

		if($_POST['id'] != null) {
			$invite = InviteModel::getInviteById(intval(trim($_POST['id'])));
			if($invite != null) {
				$result = array('error'=> 0, 'message'=> 'success');
				$invite->dateLine = date('Y-m-d', $invite->dateLine);
				$result['invite'] = $invite;
			}
		}
		return $result;
	}

}