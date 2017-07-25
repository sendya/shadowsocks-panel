<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller;

use \Core\Template;

use Helper\Utils;
use Model\User;
use \Model\Invite as InviteModel;


class Invite
{

    public function index()
    {
        $inviteList = InviteModel::getInviteArray(-1);
        Template::setView('Xenon/panel/home_invite');
        Template::putContext('inviteList', $inviteList);
    }

    /**
     * 生成邀请码，必要权限检查
     *
     * @JSON
     * @Authorization
     */
    public function create()
    {
        $user = User::getUserByUserId(User::getCurrent()->uid);

        $result = array('error' => 1, 'message' => '创建邀请码失败，您没有再次创建邀请码的次数了。当然，你可以用流量购买次数。(10GB/个)');

        if ($user->invite_num > 0) {
            $invite = InviteModel::addInvite($user->uid, 'A', false);
            $result = array(
                'error' => 0,
                'message' => '创建邀请码成功，刷新后可见',
                'invite_num' => $user->invite_num - 1,
                'invite' => $invite
            );
            $user->invite_num = $user->invite_num - 1;
            $user->save();
        }

        return $result;
    }

    /**
     * 购买邀请码，必要权限检查
     *
     * @JSON
     * @Authorization
     * @return array
     */
    public function buy()
    {
        $user = User::getUserByUserId(User::getCurrent()->uid);
        $result = array('error' => 1, 'message' => '购买失败，至少需要20GB流量才能购买邀请码。');
        $transfer = Utils::GB * 10;
        // update by github.com/BorLee
        // 1abd9e6be7bfd7e3b1e9f34acd357fa7fa29923c
        if ($user->transfer > ($transfer * 2) && $user->transfer-$user->getUseTransfer() > $transfer) {
            $user->transfer = $user->transfer - $transfer;
            $user->invite_num = $user->invite_num + 1;
            $user->save();
            $result = array('error' => 0, 'message' => '购买成功，扣除手续费10GB流量', 'invite_num' => $user->invite_num);
        }
        return $result;
    }

}
