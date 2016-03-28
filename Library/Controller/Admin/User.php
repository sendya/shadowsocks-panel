<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use \Core\Template;

use Helper\Util;
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
        if($_POST['userId'] != null) {
            $rs = UserModel::delete($_POST['userId']);
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
                // 手动处理一下流量单位
                $us->transfer = $us->transfer / Util::GetGB();
                $us->flow_down = $us->flow_down / Util::GetGB();
                $us->payTime = date('Y-m-d H:i:s', $us->payTime);
                $us->expireTime = date('Y-m-d H:i:s', $us->expireTime);
                $result['error'] = 0;
                $result['data'] = $us;
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
        if($_POST['user_uid'] != null) {
            $us = UserModel::GetUserByUserId($_POST['user_uid']);
            if($us) {
                if($_POST['user_email'] != null) $us->email = $_POST['user_email'];
                if($_POST['user_nickname'] != null) $us->nickname = $_POST['user_nickname'];
                if($_POST['user_port'] != null) $us->port = $_POST['user_port'];
                if($_POST['user_sspwd'] != null) $us->sspwd = $_POST['user_sspwd'];
                if($_POST['user_plan'] != null) $us->plan = $_POST['user_plan'];
                if($_POST['user_invite_num'] != null) $us->invite_num = $_POST['user_invite_num'];
                if($_POST['user_transfer'] != null) $us->transfer = floatval($_POST['user_transfer']) * Util::GetGB();
                if($_POST['user_flow_up'] != null) $us->flow_up = $_POST['user_flow_up'] * Util::GetGB();
                if($_POST['user_enable'] != null) $us->enable = $_POST['user_enable']; // 是否启用该用户。该字段会强制用户无法链接到所有服务器！
                if($_POST['user_payTime'] != null) $us->payTime = strtotime($_POST['user_payTime']);
                if($_POST['user_expireTime'] != null) $us->expireTime = strtotime($_POST['user_expireTime']);
                $result['user'] =  $us;
                if($us->enable != 0 && $us->enable != 1) $us->enable=0;
                if($us->port!=null && $us->port!=0) {
                    $rs = UserModel::checkUserPortIsAvailable($us->port, $us->uid);
                    if($rs) {
                        $result = array("error" => 1, "message" => "端口{$rs->port}已被占用，请更换");
                        echo json_encode($result);
                        exit();
                    }
                }
                if(strlen($us->plan) > 4) {
                    $result = array("error" => 1, "message" => "账户等级最大字符4位");
                    echo json_encode($result);
                    exit();
                }
                if($_POST['user_password']!=null && $_POST['user_password']!='') { // change password
                    $us->savePassword(trim($_POST['user_password']));
                }
                $rs2 = $us->updateUser();
                if($rs2) {
                    $result['error'] = 0;
                    $result['message'] = '更新信息成功';
                } else {
                    $result['message'] = '出现未知错误，修改失败';
                }
            }
        }
        echo json_encode($result);
        exit();
    }
}