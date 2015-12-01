<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Template;
use Helper\Util;
use Helper\Encrypt;
use Helper\Listener;
use Model\Invite;
use Model\User as UserModel;

class Auth {

    public function index()
    {

    }

    public function Login()
    {
        $controller = "Login";
        /**
         * 1. 判断用户是否已经登陆,
         *      若已经登陆,则直接跳转到控制面板(仪表盘)中.
         * 2. 加载登陆页面模板,进入登陆页面.
         */
        //throw new Error("Check Login :" . Listener::checkLogin(), 505);

        if (Listener::checkLogin()) {
            header("Location:/Member");
        } else if (isset($_REQUEST['email']) && isset($_REQUEST['passwd'])) {
            $result = array('error' => 1, 'message' => '账户不存在啊喂!');
            $email = htmlspecialchars($_REQUEST['email']);
            $passwd = htmlspecialchars($_REQUEST['passwd']);
            $remember_me = htmlspecialchars($_REQUEST['remember_me']);

            $user = UserModel::getInstance();
            $user = $user->GetUserByEmail($email);

            if ($user) {
                if ($user->verifyPassword($passwd)) {
                    $result['error'] = 0;
                    $result['message'] = '登陆成功,即将跳转到 &gt;仪表盘';

                    $token = $user->uid . "\t" . $user->email . "\t" . $user->nickname;
                    $token = Encrypt::encode($token, COOKIE_KEY);
                    $remember_me == 'week' ? $ext = 3600 * 24 * 7 : $ext = 3600;
                    setcookie("auth", base64_encode($token), time() + $ext, "/");
                } else {
                  $result['message'] = "账户名或密码错误, 请检查后再试!";
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
        $email = strtolower($_POST['r_email']);
        $userName = $_POST['r_user_name'];
        $passwd = $_POST['r_passwd'];
        $repasswd = $_POST['r_passwd2'];
        $inviteCode = $_POST['r_invite'];
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
            $user = new UserModel();
            $user->email = $email;
            $user->nickname = $userName;
            $user->transfer = Util::GetGB() * TRANSFER; // 流量大小
            $user->invite = $inviteCode;
            $user->regDateLine = time();
            $user->sspwd = Util::GetRandomPwd();
            $user->insertToDB();
            $user->port = $user->uid;
            $user->updateUser();
            $user->savePassword($passwd);

            if (null != $user->uid && 0 != $user->uid) {
                $result['error'] = 0;
                $result['message'] = '注册成功';
            }
        }

        echo json_encode($result);
        exit();
    }


}
