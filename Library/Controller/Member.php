<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Option;
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
class Member
{

    /**
     * 主页面 仪表盘
     */
    public function index()
    {
        $user = User::getUserByUserId(User::getCurrent()->uid);
        $data['user'] = $user;

        $data['online'] = Stats::countOnline();
        $data['userCount'] = Stats::countUser();
        $data['useUserCount'] = Stats::countUseUser(); // 使用过服务的用户数
        $data['checkCount'] = Stats::countSignUser();
        $data['onlineNum'] = 0.00; // default online number.
        if ($data['online'] !== 0 && $data['userCount'] !== 0) {
            $data['onlineNum'] = round($data['online'] / $data['userCount'], 2) * 100;
        }

        $data['allTransfer'] = Utils::flowAutoShow($user->transfer);
        $data['useTransfer'] = $user->flow_up + $user->flow_down; // round(() / Utils::mb(), 2);
        $data['slaTransfer'] = Utils::flowAutoShow($user->transfer - $data['useTransfer']);
        $data['pctTransfer'] = 0.00;
        if (is_numeric($data['useTransfer']) && $data['useTransfer'] > 0 && is_numeric($user->transfer) && $user->transfer > 0) {
            $data['pctTransfer'] = round($data['useTransfer'] / $user->transfer, 2) * 100;
        }
        $data['useTransfer'] = Utils::flowAutoShow($data['useTransfer'], 1);
        $tmp = explode(" ", $data['useTransfer']);
        $data['useTransfer'] = $tmp[0];
        $data['useTransferUnit'] = count($tmp) > 1 ? $tmp[1] : 'KB';
        $data['systemTransfer'] = round(Stats::countTransfer() / Utils::gb(), 2); // 全部用户产生的流量

        $data['checkedTime'] = date('m-d H:i', $user->lastCheckinTime);
        $data['lastOnlineTime'] = date('Y-m-d H:i:s', $user->lastConnTime);
        $data['checked'] = strtotime(date('Y-m-d 00:00:00', time())) > strtotime(date('Y-m-d H:i:s',
                $user->lastCheckinTime));
        $data['userIp'] = Utils::getUserIP();

        // Message
        $data['globalMessage'] = Message::getGlobalMessage();

        Template::setContext($data);
        Template::setView('panel/member');

    }

    /**
     * 节点页面
     */
    public function node()
    {
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
    public function invite()
    {
        $data['user'] = User::getUserByUserId(User::getCurrent()->uid);
        $data['inviteList'] = Invite::getInvitesByUid($data['user']->uid, "0");

        Template::setContext($data);
        Template::setView("panel/invite");
    }

    /**
     *    User info page,
     *    2015.11.12 start
     */
    public function info()
    {
        Template::putContext('user', User::getCurrent());
        Template::setView("panel/info");
    }

    /**
     * 修改 网站登录密码
     * @JSON
     * @throws Error
     */
    public function changePassword()
    {
        $user = User::getUserByUserId(User::getCurrent()->uid);

        if ($_POST['nowpwd'] != null && $_POST['pwd'] != null) {
            $result = array('error' => 1, 'message' => '密码修改失败.');
            $nowpwd = $_POST['nowpwd'];
            $pwd = $_POST['pwd'];
            if (!$user->verifyPassword($nowpwd)) { // 密码不正确
                $result['message'] = "旧密码错误！";
                return $result;
            }
            if ($pwd == $nowpwd) {
                $result['message'] = "新密码不能和旧密码相同！";
                return $result;
            }
            if (strlen($pwd) < 6) {
                $result['message'] = "新密码不能少于6位！";
                return $result;
            }
            $user->setPassword(htmlspecialchars($pwd));
            $user->save();
            $_SESSION['currentUser'] = null;

            $result['error'] = 0;
            $result['message'] = "修改密码成功, 请重新登录";
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
    public function changeSSPwd()
    {
        $user = User::getUserByUserId(User::getCurrent()->uid);

        if ($_POST['sspwd'] != null) {
            $ssPwd = trim($_POST['sspwd']);
            if ($_POST['sspwd'] == '1') {
                $ssPwd = Utils::randomChar(8);
            }
            $user->sspwd = $ssPwd;
            $user->save();
            $_SESSION['currentUser'] = $user;
            $result = array('error' => 0, 'message' => '修改SS连接密码成功', 'sspwd' => $ssPwd);
            return $result;
        } else {
            Template::putContext('user', $user);
            Template::setView("panel/changeSSPassword");
        }
    }

    /**
     * 修改 昵称
     * @JSON
     * @throws Error
     */
    public function changeNickname()
    {
        $user = User::getCurrent();
        if ($_POST['nickname'] != null) {

            $user = User::getUserByUserId($user->uid);
            $user->nickname = htmlspecialchars(trim($_POST['nickname']));
            $user->save();
            $_SESSION['currentUser'] = $user;
            return array('error' => 0, 'message' => '修改昵称成功，刷新页面或重新登录生效。');
        } else {
            Template::putContext('user', $user);
            Template::setView("panel/changeNickname");
        }
    }

    /**
     * 修改 自定义加密方式
     * @JSON
     * @throws Error
     */
    public function changeMethod()
    {
        $user = User::getCurrent();
        if ($_POST['method'] != null) {
            $method = null;
            if($_POST['method'] != '-1') {
                $method = htmlspecialchars(trim($_POST['method']));
            }
            $user = User::getUserByUserId($user->uid);
            $user->method = $method;
            $user->save();
            $_SESSION['currentUser'] = $user;
            return array('error' => 0, 'message' => '修改加密方式成功，全部节点同步大约5分钟内生效。');
        } else {
            $nodeList = Node::getSupportCustomMethodArray();
            Template::putContext('user', $user);
            Template::putContext('nodeList', $nodeList);
            Template::setView("panel/changeMethod");
        }
    }

    /**
     * 升级面板 Plan
     * @JSON
     * @throws Error
     */
    public function changePlan()
    {
        Template::putContext('user', User::getUserByUserId(User::getCurrent()->uid));
        Template::setView("panel/changePlanLevel");
    }

    /**
     * 首页的 升级套餐 button
     * @JSON
     */
    public function updatePlan()
    {
        $user = User::getUserByUserId(User::getCurrent()->uid);

        $custom_transfer_level = json_decode(Option::get('custom_transfer_level'), true);

        $result = array('error' => 1, 'message' => '升级账户类型失败.');
        switch ($user->plan) {
            case 'A':
                if ($user->money >= 15) {
                    $user->money = $user->money - 15; // 扣除15 升级到B套餐
                    $user->plan = 'B';
                    $user->transfer = Utils::GB * intval($custom_transfer_level['B']);
                    $user->save();
                    $_SESSION['currentUser'] = $user;
                    $result['error'] = 0;
                    $result['message'] = '升级成功，您的当前等级为';
                } else {
                    $result['message'] = '升级失败，您的余额不足';
                }
                break;
            case 'B':
                if ($user->money >= 25) {
                    $user->money = $user->money - 25;//扣除15 升级到B套餐
                    $user->plan = 'C';
                    $user->transfer = Utils::GB * intval($custom_transfer_level['C']);
                    $user->save();
                    $_SESSION['currentUser'] = $user;
                    $result['error'] = 0;
                    $result['message'] = '升级成功，您的当前等级为';
                } else {
                    $result['message'] = '升级失败，您的余额不足';
                }
                break;
            case 'C':
                if ($user->money >= 40) {
                    $user->money = $user->money - 40;//扣除15 升级到B套餐
                    $user->plan = 'D';
                    $user->transfer = Utils::GB * intval($custom_transfer_level['D']);
                    $user->save();
                    $_SESSION['currentUser'] = $user;
                    $result['error'] = 0;
                    $result['message'] = '升级成功，您的当前等级为';
                } else {
                    $result['message'] = '升级失败，您的余额不足';
                }
                break;
            case 'VIP':
                $result['error'] = 0;
                $result['message'] = '卧槽，你不给肛凭什么给你 GM账户';
                break;
            default:
                $result['message'] = '请求失败，不知道服务器娘哪里出问题了喵。';
                break;
        }

        $result['level'] = Utils::planAutoShow($user->plan);
        return $result;

    }

    /**
     * @JSON
     * @return array
     * @throws Error
     */
    public function buyTransfer()
    {
        $user = User::getCurrent();
        if (!$user) {
            throw new Error('login timeout', 405);
        }
        $user = User::getUserByUserId($user->uid);
        if (($user->transfer - $user->getUseTransfer()) > Utils::GB * 10) {
            throw new Error('流量还很充足，无需购买临时流量', 200);
        }
        if ($user->money <= 0) {
            throw new Error('您的余额不足，无法购买', 200);
        }
        if($user->expireTime <= time()) {
            throw new Error('告诉你一个秘密，你的账号已经到期了，到期账户是无法购买流量的。你需要先续期哟 (●\'◡\'●)', 200);
        }
        $user->money--;
        $user->flow_down = $user->flow_down - Utils::GB;
        $user->enable = 1;
        $user->save();
        $_SESSION['currentUser'] = $user; // 将用户信息更新到 session 中.
        return array('useTransfer' => Utils::flowAutoShow($user->getUseTransfer()), 'slaTransfer' => Utils::flowAutoShow($user->transfer - $user->getUseTransfer()), 'money' => $user->money, 'message' => '系统发动功力，将您之前使用的流量减去了 1GB。现在你可以继续使用了');
    }

    public function actCard()
    {
        Template::putContext('user', User::getUserByUserId(User::getCurrent()->uid));
        Template::setView('panel/actCard');
    }

    /**
     * @JSON
     * @return array
     */
    public function expireDate()
    {

        $user = User::getUserByUserId(User::getCurrent()->uid);
        $expireTime = date('Y-m-d H:i:s', $user->expireTime);
        return array('error' => 0, 'message' => '您的到期时间：' . $expireTime, 'expireTime' => $expireTime);
    }

    /**
     * 签到
     *
     * @JSON
     */
    public function checkIn()
    {
        $user = User::getCurrent();
        $result = array('error' => 1, 'message' => '签到失败或已签到。');
        if ($user->lastCheckinTime <= strtotime(date('Y-m-d 00:00:00', time()))) {
            $user = User::getUserByUserId($user->uid);
            $user->lastCheckinTime = time();
            $checkinTransfer = rand(intval(Option::get('check_transfer_min')),
                    intval(Option::get('check_transfer_max'))) * Utils::MB;
            $user->transfer = $user->transfer + $checkinTransfer;
            $_SESSION['currentUser'] = $user;
            $user->save();
            $result['time'] = date("m-d H:i:s", $user->lastCheckinTime);
            $result['message'] = '签到成功, 获得' . Utils::flowAutoShow($checkinTransfer) . ' 流量';
            $result['error'] = 0;

        } else {
            $result['message'] = '你已经在 ' . date('Y-m-d H:i:s', $user->lastCheckinTime) . " 时签到过.";
        }
        return $result;
    }

    /**
     * 删除自己的账户（在本站彻底清空自己注册的账户）
     *
     * @JSON
     * @return array
     */
    public function deleteMe()
    {
        $user = User::getCurrent();

        $flag = $_POST['delete'];
        $result = array('error' => 1, "message" => "请求错误");
        if ($flag != null && $flag == '1') {
            $user->delete();
            $result = array("error" => 0, "message" => "您已经从本站消除所有记忆，将在 3秒 后执行世界初始化...<br/>祝您过得愉快。");
            $_SESSION['currentUser'] = null;
            setcookie("uid", '', time() - 3600, "/");
            setcookie("expire", '', time() - 3600, "/");
            setcookie("token", '', time() - 3600, "/");
        }

        return $result;
    }
}