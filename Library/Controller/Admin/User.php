<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use \Core\Template;

use Helper\Option;
use Helper\PageData;
use Helper\Util;
use Helper\Utils;
use \Model\User as UserModel;

/**
 * Class User
 * @Admin
 * @Authorization
 * @package Controller\Admin
 */
class User
{

    public function index()
    {
        $data['user'] = UserModel::getCurrent();
        $data['users'] = UserModel::getUserList();
        $data['planList'] = json_decode(Option::get('custom_plan_name'), true);
        Template::setContext($data);
        Template::setView('admin/user');
    }

    /**
     * @JSON
     */
    public function getList()
    {
        $pageData = new PageData('member', "ORDER BY uid",
            ['uid', 'port', 'email', 'nickname', 'plan', 'flow_up', 'flow_down', 'transfer', 'expireTime']);
        $pageData->execute();
        Template::setContext($pageData->getContext());
    }

    /**
     * @JSON
     * @throws \Core\Error
     */
    public function delete()
    {
        $result = array("error" => 1, "message" => "Request failed");
        if ($_POST['userId'] != null) {
            $user = UserModel::getUserByUserId(intval($_POST['userId']));
            if ($user) {
                $user->delete();
            }
            $result['error'] = 0;
            $result['message'] = '删除账户成功！';
        }
        return $result;
    }

    /**
     * @JSON
     */
    public function query()
    {
        $result = array("error" => 1, "message" => "Request failed");
        if ($_POST['uid'] != null) {
            $us = UserModel::getUserByUserId(trim($_POST['uid']));
            if ($us) {
                // 手动处理一下流量单位
                $us->transfer = $us->transfer / Utils::GB;
                $us->flow_down = ($us->flow_up + $us->flow_down) / Utils::GB;
                $us->payTime = date('Y-m-d H:i:s', $us->payTime);
                $us->expireTime = date('Y-m-d H:i:s', $us->expireTime);
                $result['error'] = 0;
                $result['user'] = $us;
                $result['admin'] = $us->isAdmin();
                $result['message'] = 'Success';
            }
        }
        return $result;
    }

    /**
     * 设置管理员权限
     * @Admin
     * @Authorization
     * @JSON
     */
    public function setAdmin()
    {
        if (!$_POST['uid']) {
            $user = UserModel::getUserByUserId(intval($_POST['uid']));
            if ($user && !$user->isAdmin()) {
                $user->setAdmin(); // 设定用户的admin权限。
                return array('error' => 0, 'message' => '用户：' . $user->nickname . ' 已经成为管理员。');
            }
        }
        return array('error' => 1, 'message' => '添加管理员失败，可能没有此uid的用户。');
    }

    /**
     * 修改用户信息
     * @JSON
     */
    public function update()
    {

        $result = array("error" => 1, "message" => "Request failed");
        if ($_POST['user_uid'] != null) {
            $us = UserModel::getUserByUserId(trim($_POST['user_uid']));
            if ($us) {
                if ($_POST['user_email'] != null) {
                    $us->email = $_POST['user_email'];
                }
                if ($_POST['user_nickname'] != null) {
                    $us->nickname = $_POST['user_nickname'];
                }
                if ($_POST['user_port'] != null) {
                    $us->port = $_POST['user_port'];
                }
                if ($_POST['user_sspwd'] != null) {
                    $us->sspwd = $_POST['user_sspwd'];
                }
                if ($_POST['user_plan'] != null) {
                    $us->plan = $_POST['user_plan'];
                }
                if ($_POST['user_invite_num'] != null) {
                    $us->invite_num = $_POST['user_invite_num'];
                }
                if ($_POST['user_transfer'] != null) {
                    $us->transfer = floatval($_POST['user_transfer']) * Utils::GB;
                }
                if ($_POST['user_flow_down'] != null) {
                    $us->flow_down = floatval($_POST['user_flow_down']) * Utils::GB;
                    $us->flow_up = 0;
                }
                if ($_POST['user_enable'] != null) {
                    $us->enable = intval($_POST['user_enable']);
                } // 是否启用该用户。该字段会强制用户无法链接到所有服务器！
                if ($_POST['user_payTime'] != null) {
                    $us->payTime = strtotime($_POST['user_payTime']);
                }
                if ($_POST['user_expireTime'] != null) {
                    $us->expireTime = strtotime($_POST['user_expireTime']);
                }

                if ($us->enable != 0 && $us->enable != 1) {
                    $us->enable = 0;
                }
                if ($us->port != null && $us->port != 0) {
                    $rs = UserModel::checkUserPortIsAvailable($us->port, $us->uid);
                    if ($rs) {
                        $result = array("error" => 1, "message" => "端口{$rs->port}已被占用，请更换");
                        return $result;
                    }
                }
                if ($_POST['user_password'] != null && $_POST['user_password'] != '') { // change password
                    $us->setPassword(trim($_POST['user_password']));
                }
                $us->save();
                if ($_POST['user_isAdmin'] != null) { // 如果选中了管理员，设置管理员的值
                    $us->setAdmin($_POST['user_isAdmin']);
                }

                $result['error'] = 0;
                $result['message'] = '更新信息成功';
                $us->plan = Utils::planAutoShow($us->plan);
                $us->transfer = Utils::flowAutoShow($us->transfer);
                $us->flow_down = ($us->flow_up + $us->flow_down) / Utils::GB;
                $us->payTime = date('Y-m-d H:i:s', $us->payTime);
                $us->expireTime = date('Y-m-d H:i:s', $us->expireTime);

                $result['user'] = $us;
            }
        }
        return $result;
    }

}