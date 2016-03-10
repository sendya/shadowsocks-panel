<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use \Core\Template;

use \Model\User as UserModel;

class User extends AdminListener {

    public function index() {
        //throw new \Core\Error("user list", 505);
        global $user;
        $users = UserModel::GetUserArray();
        include Template::load('/admin/user');
    }

    public function delete() {
        global $user;

        $result = array("error" => 1, "message" => "Request failed");
        if($_POST['uid'] != null) {
            $rs = UserModel::delete($_POST['uid']);
            if($rs) {
                $result['error'] = 0;
                $result['message'] = '删除账户成功！';
            }
        }
        echo json_encode($result);
        exit();
    }

    public function query() {
        global $user;

        $result = array("error" => 1, "message" => "Request failed");
        if($_POST['uid'] != null) {
            $us = UserModel::GetUserByUserId($_POST['uid']);
            if($us) {
                $result['error'] = 0;
                $result['message'] = 'Success';
            }
        }
        echo json_encode($result);
        exit();
    }

    // TODO -- 加班没空,本周末写
    public function modify() {
        global $user;

        $result = array("error" => 1, "message" => "Request failed");
        if($_POST['uid'] != null) {
            $us = UserModel::GetUserByUserId($_POST['uid']);
            if($us) {
                if($_POST['user_email'] != null) $us->email = $_POST['user_email'];
                if($_POST['user_nickname'] != null) $us->nickname = $_POST['user_nickname'];
                if($_POST['user_port'] != null) $us->port = $_POST['user_port'];
                if($_POST['user_sspwd'] != null) $us->sspwd = $_POST['user_sspwd'];
                if($_POST['user_plan'] != null) $us->plan = $_POST['user_plan'];
                if($_POST['user_inviteNumber'] != null) $us->invite_num = $_POST['user_inviteNumber'];
                if($_POST['user_transfer'] != null) $us->transfer = $_POST['user_transfer'];
                if($_POST['user_flow_up'] != null) $us->flow_up = $_POST['user_flow_up'];
                if($_POST['user_enable'] != null) $us->enable = $_POST['user_enable']; // 是否启用该用户。该字段会强制用户无法链接到所有服务器！
            }
        }
    }
}