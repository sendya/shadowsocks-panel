<?php
namespace Controller;

use Core\Template;
use Helper\Util;
use Helper\Encrypt;
use Helper\Listener;
use Model\Invite;
use Model\User as Userm;

/**
 * User Controller
 * Author: Sendya
 */
class User
{

    public function login()
    {

        /**
         * 1. 判断用户是否已经登陆,
         *      若已经登陆,则直接跳转到控制面板(仪表盘)中.
         * 2. 加载登陆页面模板,进入登陆页面.
         */
        if (Listener::checkLogin()) {
            header("Location:/member");
        } else if (isset($_REQUEST['email']) && isset($_REQUEST['passwd'])) {
            $result = array('error' => 1, 'message' => '账户名或密码错误, 请检查后再试!');
            $email = htmlspecialchars($_REQUEST['email']);
            $passwd = htmlspecialchars($_REQUEST['passwd']);
            $remember_me = htmlspecialchars($_REQUEST['remember_me']);
            $user = Userm::GetUserByEmail($email);
            $result['passwd2'] = $user->getPassword();
            if ($user) {
                if ($user->verifyPassword($passwd)) {
                    $result['error'] = 0;
                    $result['message'] = '登陆成功,即将跳转到 &gt;仪表盘';

                    $token = $user->uid . "\t" . $user->email . "\t" . $user->nickname;

                    $token = Encrypt::encode($token, COOKIE_KEY);
                    $remember_me == 'week' ? $ext = 3600 * 24 * 7 : $ext = 3600;
                    setcookie("auth", base64_encode($token), time() + $ext, "/");
                }
            }

            echo json_encode($result);
            exit();
        } else {
            include Template::load('/panel/login');
        }
    }

    public function logout()
    {
        setcookie("auth", '', time() - 3600, "/");
        header("Location:/");
    }


    public function register()
    {
        $result = array('error' => 1, 'message' => '注册失败');
        $email = strtolower($_GET['r_email']);
        $userName = $_GET['r_user_name'];
        $passwd = $_GET['r_passwd'];
        $repasswd = $_GET['r_passwd2'];
        $inviteCode = $_GET['r_invite'];
        $invite = Invite::GetInviteByInvite($inviteCode); //校验 invite 是否可用
        if ($invite->status != 0) {
            $result['message'] = '邀请码不可用';
        } else if ($repasswd != $passwd) {
            $result['message'] = '两次密码输入不一致';
        } else if (strlen($passwd) < 8) {
            $result['message'] = '密码太短,至少8字符';
        } else if (strlen($userName) < 4) {
            $result['message'] = '昵称太短,至少2中文字符或6个英文字符';
        } else if ($chkEmail = Util::MailFormatCheck($email)) {
            $result['message'] = $chkEmail;
        } else {
            $user = new Userm();
            $user->email = $email;
            $user->nickname = $userName;
            $user->transfer = Util::GetGB() * TRANSFER; // 流量大小
            $user->invite = $inviteCode;
            $user->regDateLine = time();
            $user->insertToDB();
            $user->savePassword($passwd);

            if (0 != $result['uid'] && null != $result['uid']) {
                $result['error'] = 0;
                $result['message'] = '注册成功';
            }
        }

        echo json_encode($result);
        exit();
    }

    public function nickname()
    {
        $result = array('error' => 1, 'message' => '修改失败');
        $uid = trim($_POST['uid']);
        $user_cookie = explode('\t', Encrypt::decode(base64_decode($_COOKIE['auth']), COOKIE_KEY));
        $nickname = trim($_POST['nickname']);

        if ('' != $nickname && $uid == $user_cookie[0] && $nickname == $user_cookie[2]) {
            $user = Userm::GetUserByUserId($uid);
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
            $user = Userm::GetUserByUserId($uid);
            $user->sspwd = $sspwd;
            $user->updateUser();
            $result = array('error' => 1, 'message' => '修改SS连接密码成功');
        }

        echo json_encode($result);
        exit();
    }
}
