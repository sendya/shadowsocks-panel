<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Stats;
use Helper\Util;
use Helper\Utils;
use Model\Invite;
use Model\Message;
use Model\Node;
use Model\User;

/**
 * Class Member
 * @Authorization
 * @package Controller
 */
class Member {

    /**
     * 主页面
     */
    public function index() {
        $user = User::getUserByUserId(User::getCurrent()->uid);
        $data['user'] = $user;

        $data['online'] = Stats::countOnline();
        $data['userCount'] = Stats::countUser()!=null?:0;
        $data['useUserCount'] = Stats::countUseUser(); // 使用过服务的用户数
        $data['checkCount'] = Stats::countSignUser();
        $data['onlineNum'] = 0.00; // default online number.
        if($data['online']!==0 && $data['userCount']!==0)
            $data['onlineNum'] = round($data['online']/$data['userCount'],2)*100;

        $data['allTransfer'] = Utils::flowAutoShow($user->transfer);
        $data['useTransfer'] = $user->flow_up + $user->flow_down; // round(() / Utils::mb(), 2);
        $data['slaTransfer'] = Utils::flowAutoShow($user->transfer - $data['useTransfer']);
        $data['pctTransfer'] = 0.00;
        if(is_numeric($data['useTransfer']) && is_numeric($user->transfer)) {
            $data['pctTransfer'] = round($data['useTransfer'] / $user->transfer, 2) * 100;
        }
        $data['useTransfer'] = Utils::flowAutoShow($data['useTransfer'], 1);
        $tmp = explode(" ", $data['useTransfer']);
        $data['useTransfer'] = $tmp[0];
        $data['useTransferUnit'] = count($tmp)>1?$tmp[1]:'KB';
        $data['systemTransfer'] = round(Stats::countTransfer() / Utils::gb(), 2); // 全部用户产生的流量

        $data['checkedTime'] = date('m-d H:i', $user->lastCheckinTime);
        $data['lastOnlineTime'] = date('Y-m-d H:i:s', $user->lastConnTime);
        $data['checked'] = strtotime(date('Y-m-d 00:00:00', time())) > strtotime(date('Y-m-d H:i:s', $user->lastCheckinTime));
        $data['userIp'] = Utils::getUserIP();

        $data['user']->plan = Utils::planAutoShow($user->plan);

        // Message
        $data['globalMessage'] = Message::getGlobalMessage();

        Template::setContext($data);
        Template::setView('panel/member');

    }

    /**
     * 节点页面
     */
    public function node() {
        $data['user'] = User::getCurrent();
        $data['nodes'] = Node::getNodeArray(0);
        $data['nodeVip'] = Node::getNodeArray(1);

        Template::setContext($data);
        Template::setView("panel/node");
    }

    /**
     *    Invite list
     *    2015.11.11 start
     */
    public function invite() {
        global $user;
        $inviteList = Invite::GetInvitesByUid($user->uid, "0");

        include Template::load("panel/invite");

        //throw new Error("This page is not available", 404);
    }

    /**
     *    User info page,
     *    2015.11.12 start
     */
    public function info() {

        Template::putContext('user', User::getCurrent());
        Template::setView("panel/info");
    }

    /**
     * 修改 网站登陆密码
     * @JSON
     * @throws Error
     */
    public function changePassword() {
        $user = User::getUserByUserId(User::getCurrent()->uid);

        if($_POST['nowpwd'] != null && $_POST['pwd'] != null) {
            $result = array('error' => 1, 'message' => '密码修改失败.');
            $nowpwd = $_POST['nowpwd'];
            $pwd = $_POST['pwd'];
            if(!$user->verifyPassword($nowpwd)) { // 密码不正确
                $result['message'] = "旧密码错误！";
                return $result;
            }
            if($pwd == $nowpwd) {
                $result['message'] = "新密码不能和旧密码相同！";
                return $result;
            }
            if(strlen($pwd) < 6) {
                $result['message'] = "新密码不能少于6位！";
                return $result;
            }
            $user->setPassword(htmlspecialchars($pwd));

            $result['error'] = 0;
            $result['message'] = "修改密码成功！";
            return $result;
        } else {
            Template::putContext('user', $user);
            Template::setView("panel/changePassword");
        }
    }

    /**
     * 修改 SS连接密码
     * @JSON
     * @throws Error
     */
    public function changeSSPassword() {
        Template::putContext('user', User::getCurrent());
        Template::setView("panel/changeSSPassword");
    }

    /**
     * 修改 昵称
     * @JSON
     * @throws Error
     */
    public function changeNickname() {
        $user = User::getCurrent();


        Template::putContext('user', $user);
        Template::setView("panel/changeNickname");
    }

    /**
     * 升级面板 Plan
     * @JSON
     * @throws Error
     */
    public function updatePlan() {
        $user = User::getCurrent();


        Template::putContext('user', $user);
        Template::setView("panel/changePlanLevel");
    }

    /**
     * 删除自己的账户（在本站彻底清空自己注册的账户）
     *
     * @JSON
     * @return array
     */
    public function deleteMe() {
        $user = User::getCurrent();

        $flag = $_POST['delete'];
        $result = array('error' => 1, "message"=> "请求错误");
        if($flag != null && $flag == '1'){
            $rs = $user->deleteMe();
            if($rs) {
                setcookie("auth", '', time() - 3600, "/");
                setcookie("token", '', time() - 3600, "/");
                $result = array("code"=> 200, "hasError"=> false, "message"=> "您已经从本站消除所有记忆，将在 3秒 后执行世界初始化...<br/>祝您过得愉快。");
            }
        }

        return $result;
    }


    private static function fuckInt($number) {
        if ($number == null || $number == 0) return true;
        return false;
    }
}