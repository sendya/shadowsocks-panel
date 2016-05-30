<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use \Core\Template;

use Helper\Utils;
use Model\Invite as InviteModel;
use Model\User;
use Helper\Option;

/**
 * Controller: 邀请码
 * @Admin
 * @Authorization
 * @package Controller\Admin
 */
class Invite
{

    public function inviteList()
    {
        $data['user'] = User::getCurrent();
        $data['inviteList'] = InviteModel::getInviteArray(0);
        $data['planList'] = json_decode(Option::get('custom_plan_name'), true);
        array_splice($data['planList'], -1, 1); // 移除 Z(固定流量套餐)
        Template::setContext($data);
        Template::setView('admin/invite');
    }

    public function inviteOldList()
    {
        $data['user'] = User::getCurrent();
        $data['inviteList'] = InviteModel::getInviteArray(1);
        $data['planList'] = json_decode(Option::get('custom_plan_name'), true);
        array_splice($data['planList'], -1, 1);
        Template::setContext($data);
        Template::setView('admin/invite');
    }

    /**
     * 添加一个邀请码
     * @JSON
     */
    public function update()
    {
        $result = array('error' => -1, 'message' => 'Request failed');
        $user = User::getCurrent();
        if ($_POST['invite'] == null) {
            $result = array('error' => 0, 'message' => '添加成功，刷新可见');
            $plan = 'A';
            $add_uid = -1;
            $inviteNumber = 1;
            if ($_POST['plan'] != null) {
                $plan = $_POST['plan'];
            }
            if ($_POST['add_uid'] != null) {
                $add_uid = trim($_POST['add_uid']);
                if ($add_uid != $user->uid && $add_uid != -1) {
                    if (!User::getUserByUserId($add_uid)) {
                        $result['error'] = 1;
                        $result['message'] = "此UID: " . $add_uid . " 的用户不存在，添加失败";
                        return $result;
                    }

                }
            }
            if ($_POST['number'] != null) {
                $inviteNumber = $_POST['number'];
            }
            if ($inviteNumber > 1) {
                for ($i = 0; $i < $inviteNumber; $i++) {
                    InviteModel::addInvite($add_uid, $plan);
                }
            } else {
                InviteModel::addInvite($add_uid, $plan);
            }
            $result['inviteNumber'] = $inviteNumber;
            $result['plan'] = $plan;

        } else {
            if ($_POST['invite'] != null) {
                $invite = InviteModel::getInviteByInviteCode(trim($_POST['invite']));
                if ($invite != null) {
                    $invite->dateLine = time();
                    $invite->expiration = $_POST['expiration'];
                    $invite->plan = $_POST['plan'];
                    $invite->save();
                    $result = array('error' => 0, 'message' => '更新邀请码成功');
                }
            }
        }
        return $result;
    }

    /**
     * @JSON
     * @return array
     */
    public function delete()
    {
        $result = array('error' => -1, 'message' => '删除失败');
        if ($_POST['id'] != null) {
            $id = intval(trim($_POST['id']));
            $invite = InviteModel::getInviteById($id);
            $invite->delete();
            $result = array('error' => 0, 'message' => '删除成功', 'id' => $_POST['id']);
        }
        return $result;
    }

    /**
     * @JSON
     */
    public function query()
    {
        $result = array('error' => -1, 'message' => 'Request failed');

        if ($_POST['id'] != null) {
            $invite = InviteModel::getInviteById(intval(trim($_POST['id'])));
            if ($invite != null) {
                $result = array('error' => 0, 'message' => 'success');
                $invite->dateLine = date('Y-m-d', $invite->dateLine);
                $result['invite'] = $invite;
            }
        }
        return $result;
    }

    /**
     * 导出邀请码
     */
    public function export()
    {
        $invites = InviteModel::getInviteArray(0);
        $file_name = '邀请码列表_' . time() . '.csv';
        $data = 'id,邀请码,邀请码等级,创建时间,状态'. "\n";
        foreach ($invites as $invite) {
            $data .= $invite->id . ',' . $invite->invite . ',' . Utils::planAutoShow($invite->plan) . '(' . $invite->plan  . '),' . date('Y-m-d H:i:s', $invite->dateLine) . ',' . '可用' . "\n";
        }
        header("Content-type:text/csv;charset=utf-8");
        header("Content-Disposition:attachment;filename=".$file_name);
        header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
        header('Expires:0');
        header('Pragma:public');
        $data = iconv('utf-8','gb2312',$data);
        echo $data;
        exit();
    }
}