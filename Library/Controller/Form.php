<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;


class Form
{

    public function ChangeNickname()
    {
        $result = array('error' => 1, 'message' => '修改失败');
        $uid = trim($_POST['uid']);
        $user_cookie = explode('\t', Encrypt::decode(base64_decode($_COOKIE['auth']), COOKIE_KEY));
        $nickname = trim($_POST['nickname']);

        if ('' != $nickname && $uid == $user_cookie[0] && $nickname == $user_cookie[2]) {
            $user = UserModel::GetUserByUserId($uid);
            $user->nickname = $nickname;
            $user->updateUser();
            $result = array('error' => 0, 'message' => '修改成功');
        }

        echo json_encode($result);
        exit();
    }

    public function ChangeSSPwd()
    {
        $result = array('error' => 1, 'message' => '修改失败');
        $uid = trim($_GET['uid']);
        $user_cookie = explode('\t', Encrypt::decode(base64_decode($_COOKIE['auth']), COOKIE_KEY));
        $sspwd = trim(($_GET['sspwd']));
        if ('' == $sspwd || null == $sspwd) $sspwd = Util::GetRandomPwd();
        if ($uid == $user_cookie[0]) {
            $user = UserModel::GetUserByUserId($uid);
            $user->sspwd = $sspwd;
            $user->updateUser();
            $result = array('error' => 1, 'message' => '修改SS连接密码成功');
        }

        echo json_encode($result);
        exit();
    }

}