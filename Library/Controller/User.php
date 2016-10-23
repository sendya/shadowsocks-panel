<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller;

use Core\Template;
use Model\User as MUser;
use Model\Invite;
use Model\Node;

/**
 * Class User
 * @Authorization
 * @package Controller
 */
class User
{

    /**
     *    User info page,
     *    2015.11.12 start
     */
    public function info()
    {
        $user = MUser::getUserByUserId(MUser::getCurrent()->uid);
        $json = json_decode($user->forgePwdCode, true);
        $flag = true;
        if(!$json || $json['verification']==null) {
            $flag= false;
        }
        Template::putContext('enable_status', $user->enable == 1 ? '启用' : '停用');
        Template::putContext('is_verification', $flag);
        Template::putContext('user', $user);
        Template::setView("panel/info");
    }

    /**
     *    Invite list
     *    2015.11.11 start
     */
    public function invite()
    {
        $data['user'] = MUser::getUserByUserId(MUser::getCurrent()->uid);
        $data['inviteList'] = Invite::getInvitesByUid($data['user']->uid, "0");

        Template::setContext($data);
        Template::setView("panel/invite");
    }

    /**
     *    renew & update plan
     *    2016.07.12 start
     */
    public function renew()
    {
        Template::putContext('user', MUser::getUserByUserId(MUser::getCurrent()->uid));
        Template::setView("panel/renew");
    }

    /**
     * 修改 网站登录密码
     * @JSON
     * @throws Error
     */
    public function password()
    {
        $user = MUser::getUserByUserId(MUser::getCurrent()->uid);

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
            Template::setView("panel/change_password");
        }
    }

    /**
     * 修改 昵称
     * @JSON
     * @throws Error
     */
    public function nickname()
    {
        $user = MUser::getCurrent();
        if ($_POST['nickname'] != null) {

            $user = MUser::getUserByUserId($user->uid);
            $user->nickname = htmlspecialchars(trim($_POST['nickname']));
            $user->save();
            $_SESSION['currentUser'] = $user;
            return array('error' => 0, 'message' => '修改昵称成功，刷新页面或重新登录生效。');
        } else {
            Template::putContext('user', $user);
            Template::setView("panel/change_nickname");
        }
    }

    /**
     * 修改 自定义加密方式
     * @JSON
     * @throws Error
     */
    public function method()
    {
        $user = MUser::getCurrent();
        if ($_POST['method'] != null) {
            $method = null;
            if($_POST['method'] != '-1') {
                $method = htmlspecialchars(trim($_POST['method']));
            }
            $user = MUser::getUserByUserId($user->uid);
            $user->method = $method;
            $user->save();
            $_SESSION['currentUser'] = $user;
            return array('error' => 0, 'message' => '修改加密方式成功，全部节点同步大约5分钟内生效。');
        } else {
            $nodeList = Node::getSupportCustomMethodArray();
            Template::putContext('user', $user);
            Template::putContext('nodeList', $nodeList);
            Template::setView("panel/change_method");
        }
    }

    /**
     * 重新检查账户 启用/停用 状态
     * 如果符合启用状态，则将账户调整为 启用
     *
     * @JSON
     */
    public function checkEnable()
    {
        $user = MUser::getCurrent();
        if ($user->getUseTransfer() < $user->transfer && $user->expireTime > time()) {
            $user->enable = 1;
        } else {
            $user->enable = 0;
        }
        if ($user->isAdmin()) {
            $user->enable = 1;
        }
        $user->save();

        return array('enable' => $user->enable, 'message' => '状态检测完毕');
    }

}