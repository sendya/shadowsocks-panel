<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;


use Core\Error;
use Helper\Option;
use Helper\Utils;
use Model\Invite;
use Model\User;

/**
 * Class Form
 * @Authorization
 * @package Controller
 */
class Form {
    const PLAN_A = 'A', PLAN_B = 'B', PLAN_C = 'C', PLAN_D = 'D', PLAN_VIP = 'VIP';

    public function index() {
        throw new Error("This is an empty page", 404);
    }

    public function ChangeNickname() {
        global $user;
        $result = array('error' => 1, 'message' => '修改失败');
        $nickname = trim($_POST['nickname']);

        if ('' != $nickname) {
            $user = User::GetUserByUserId($user->uid);
            $user->nickname = $nickname;
            $user->updateUser();
            $result = array('error' => 0, 'message' => '修改成功');
        }

        echo json_encode($result);
        exit();
    }

    public function changeSSPwd() {
        global $user;
        $result = array('error' => 1, 'message' => '修改失败');
        $sspwd = trim(($_POST['sspwd']));
        if ('' == $sspwd || $sspwd == null)
            $sspwd = Util::GetRandomPwd();

        $user = User::GetUserByUserId($user->uid);
        $user->sspwd = $sspwd;
        $user->updateUser();
        $result = array('error' => 0, 'message' => '修改SS连接密码成功', 'sspwd' => $sspwd);

        echo json_encode($result);
        exit();
    }

    public function UpdatePlan() {
        global $user;
        $result = array('error' => 1, 'message' => '升级账户类型失败.');

        switch ($user->plan) {
            case self::PLAN_A:

                if ($user->money >= 15) {
                    $user->money = $user->money - 15;//扣除15 升级到B套餐
                    $user->plan = self::PLAN_B;
                    $user->transfer = Util::GetGB() * 100;
                    $user->updateUser();
                    $result['error'] = 0;
                    $result['message'] = '升级成功，您的当前等级为';
                } else {
                    $result['message'] = '升级失败，您的余额不足';
                }
                break;
            case self::PLAN_B:
                if ($user->money >= 25) {
                    $user->money = $user->money - 25;//扣除15 升级到B套餐
                    $user->plan = self::PLAN_C;
                    $user->transfer = Util::GetGB() * 200;
                    $user->updateUser();
                    $result['error'] = 0;
                    $result['message'] = '升级成功，您的当前等级为';
                } else {
                    $result['message'] = '升级失败，您的余额不足';
                }
                break;
            case self::PLAN_C:
                if ($user->money >= 40) {
                    $user->money = $user->money - 40;//扣除15 升级到B套餐
                    $user->plan = self::PLAN_D;
                    $user->transfer = Util::GetGB() * 500;
                    $user->updateUser();
                    $result['error'] = 0;
                    $result['message'] = '升级成功，您的当前等级为';
                } else {
                    $result['message'] = '升级失败，您的余额不足';
                }
                break;
            case self::PLAN_VIP:
                $result['error'] = 0;
                $result['message'] = '卧槽，你不给肛凭什么给你VIP';
                break;
            default:
                $result['message'] = '不知道服务器娘哪里出问题了喵.请求失败';
                break;
        }

        echo json_encode($result);
        exit();
    }

    /**
     * 签到
     * @JSON
     */
    public function checkIn() {
        $user = User::getUserByUserId(User::getCurrent()->uid);
        $result = array('error' => 1, 'message' => '');
        if ($user->lastCheckinTime <= strtotime(date('Y-m-d 00:00:00', time())) )
        {
            $checkinTransfer = rand(Option::get('check_transfer_min'), Option::get('check_transfer_max')) * Utils::mb();
            $user->lastCheckinTime = time();
            $user->transfer = $user->transfer + $checkinTransfer;
            $user->save();
            $result['user'] = $user;
            $result['time'] = date("m-d H:i:s", $user->lastCheckinTime);
            $result['message'] = '签到成功, 获得' . Utils::flowAutoShow($checkinTransfer) . ' 流量';
        } else {
            $result['message'] = '你已经在 ' . date('Y-m-d H:i:s', $user->lastCheckinTime) . " 时签到过.";
        }
        echo json_encode($result);
        exit();
    }

    public function buyInvite() {
        global $user;
        $user = User::GetUserByUserId($user->uid);
        $tr = 10 * Util::GetGB();
        $result = array('error' => 1, 'message' => '购买失败，至少需要20GB流量才能购买邀请码。');
        if ($user->transfer > ($tr*2)) {
            $user->transfer = $user->transfer - $tr;
            $user->invite_num = $user->invite_num + 1;
            $user->updateUser();
            $result = array('error' => 0, 'message' => '购买成功，扣除手续费10GB流量', 'invite_num' => $user->invite_num);
        }
        echo json_encode($result);
        exit();
    }

    public function addInvite() {
        global $user;
        $user = User::GetUserByUserId($user->uid);
        $result = array('error' => 1, 'message' => '创建邀请码失败，您没有再次创建邀请码的次数了。当然，你可以用流量购买次数。(10GB/个)');
        if ($user->invite_num > 0) {
            $user->invite_num = $user->invite_num-1;
            $user->updateUser();
            Invite::addInvite($user->uid, 'A');
            $result = array('error' => 0, 'message' => '创建邀请码成功，刷新后可见', 'invite_num' => $user->invite_num);
        }

        echo json_encode($result);
        exit();
    }

    public function userAddInvite() {
        global $user;
        $result = array('error' => 1, 'message' => '添加邀请码失败');
        if (!$user) {
            $result = array('error' => 1, 'message' => '没有权限');
        }
        if ($user->getFlow() > 10) {

            $invite = InviteModel::addInvite($user->uid);
            if ($invite != null) {
                $result = array('error' => 0, 'message' => '添加成功，邀请码为：' . $invite . " ,您可以稍后在列表内查看到您新增的邀请码");
            }
        } else {
            $result = array('error' => 1, 'message' => '您的流量不足');
        }
        echo json_encode($result);
        exit();
    }

}