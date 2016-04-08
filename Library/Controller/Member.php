<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Util;
use Model\Invite;
use Model\Node;
use Model\User;

/**
 * Class Member
 * @Authorization
 * @package Controller
 */
class Member {

    public function Index() {

        $data['user'] = User::getCurrent();
        $data['serverCount'] = Node::getNodeCount();
        $data['openNode'] = 0;
        $data['allNode'] = 1;

        Template::setContext($data);
        Template::setView('panel/member');

    }

    public function Node() {
        global $user;
        $user = User::GetUserByUserId($user->uid);
        $nodes = Node::GetNodeArray(0);
        $nodeVip = Node::GetNodeArray(1);

        include Template::load("panel/node");
        //throw new Error("This page is not available" , 404);
    }

    /**
     *    Invite list
     *    2015.11.11 start
     */
    public function Invite() {
        global $user;
        $inviteList = Invite::GetInvitesByUid($user->uid, "0");

        include Template::load("panel/invite");

        //throw new Error("This page is not available", 404);
    }

    /**
     *    User info page,
     *    2015.11.12 start
     */
    public function Info() {
        global $user;

        include Template::load("panel/info");
    }

    public function ChangePassword() {
        global $user;
        $user = User::GetUserByUserId($user->uid);
        if($_POST['nowpwd'] != null && $_POST['pwd'] != null) {
            $result = array('error' => 1, 'message' => '密码修改失败.');
            $nowpwd = $_POST['nowpwd'];
            $pwd = $_POST['pwd'];
            if(!$user->verifyPassword($nowpwd)) { // 密码不正确
                $result['message'] = "旧密码错误！";
                echo json_encode($result);
                exit();
            }
            if($pwd == $nowpwd) {
                $result['message'] = "新密码不能和旧密码相同！";
                echo json_encode($result);
                exit();
            }
            if(strlen($pwd) < 6) {
                $result['message'] = "新密码不能少于6位！";
                echo json_encode($result);
                exit();
            }
            $user->savePassword($pwd);

            $result['error'] = 0;
            $result['message'] = "修改密码成功！";
            echo json_encode($result);
            exit();
        } else {
            include Template::load("panel/changePassword");
        }
    }

    public function ChangeSSPassword() {
        global $user;
        include Template::load("panel/changeSSPassword");
    }

    public function ChangeNickname() {
        global $user;

        include Template::load("panel/changeNickname");
    }

    public function ChangePlanLevel() {
        global $user;

        include Template::load("panel/changePlanLevel");
    }

    public function deleteMe() {
        global $user;

        $flag = $_POST['delete'];
        $result = array("code"=> 200, "hasError"=> true, "message"=> "请求错误");
        if($flag != null && $flag == '1'){
            $user = User::GetUserByUserId($user->uid);
            $rs = $user->deleteMe();
            if($rs) {
                setcookie("auth", '', time() - 3600, "/");
                setcookie("token", '', time() - 3600, "/");
                $result = array("code"=> 200, "hasError"=> false, "message"=> "您已经从本站消除所有记忆，将在 3秒 后执行世界初始化...<br/>祝您过得愉快。");
            }
        }

        echo json_encode($result);
        exit();
    }


    private static function fuckInt($number) {
        if ($number == null || $number == 0) return true;
        return false;
    }
}