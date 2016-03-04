<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Template;
use Helper\Listener;
use Helper\Util;
use Helper\Encrypt;
use Model\Invite;
use Model\User;
use Helper\Mail;

class Auth {

    public function index() {

    }

    public function Login() {
        $controller = "Login";
        /**
         * 1. 判断用户是否已经登陆,
         *      若已经登陆,则直接跳转到控制面板(仪表盘)中.
         * 2. 加载登陆页面模板,进入登陆页面.
         */
        //throw new Error("Check Login :" . Listener::checkLogin(), 505);
        $user = User::getInstance();
        if ($user->uid) {
            header("Location:/Member");
        } else if (isset($_REQUEST['email']) && isset($_REQUEST['passwd'])) {
            $result = array('error' => 1, 'message' => '账户不存在啊喂!');
            $email = htmlspecialchars($_REQUEST['email']);
            $passwd = htmlspecialchars($_REQUEST['passwd']);
            $remember_me = htmlspecialchars($_REQUEST['remember_me']);

            $user = User::getInstance();
            $user = $user->GetUserByEmail($email);

            if ($user) {
                if ($user->verifyPassword($passwd)) {
                    $result['error'] = 0;
                    $result['message'] = '登陆成功,即将跳转到 &gt;仪表盘';

                    $remember_me == 'week' ? $ext = 3600 * 24 * 7 : $ext = 3600;
                    $token = $user->uid . "\t" . $user->email . "\t" . $user->nickname;
                    $token = Encrypt::encode($token, COOKIE_KEY);
                    $tokenOutTime = Encrypt::encode(time(), COOKIE_KEY);
                    setcookie("token", base64_encode($tokenOutTime), time() + $ext, "/");
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

    public function Lockscreen() {
        global $user;
        if (isset($_POST['email']) && isset($_POST['passwd'])) {
            $result = array("status" => 0, "message" => "验证失败");
            $passwd = htmlspecialchars($_POST['passwd']);
            $result['passwd'] = $passwd;
            $user = User::getInstance();
            $user = $user->GetUserByEmail($user->email);
            $result['obj'] = $user;
            if ($user->verifyPassword($passwd)) {
                Util::setToken();
                $result['status'] = 1;
                $result['message'] = "验证成功, 将跳转到 >> 仪表盘";
            } else {
                $result['message'] = "我跟你讲, 你密码错的在试2遍就给你锁了.";
            }

            echo json_encode($result);
            exit();
        } else {
            if (!\Helper\Listener::checkLogin()) {
                \Core\Response::redirect('/Auth/login');
                exit();
            }
            include Template::load('/panel/lockscreen');
        }
        exit();
    }

    public function logout() {
        setcookie("auth", '', time() - 3600, "/");
        setcookie("token", '', time() - 3600, "/");
        header("Location:/");
    }


    public function register() {
        $result = array('error' => 1, 'message' => '注册失败');
        $email = strtolower(trim($_POST['r_email']));
        $userName = trim($_POST['r_user_name']);
        $passwd = trim($_POST['r_passwd']);
        $repasswd = trim($_POST['r_passwd2']);
        $inviteCode = trim($_POST['r_invite']);
        $invite = Invite::GetInviteByInviteCode($inviteCode); //校验 invite 是否可用
        if ($invite->status != 0 || $invite == null || empty($invite)) {
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
            $user = new User();
            $user->email = $email;
            $user->nickname = $userName;
            $user->transfer = Util::GetGB() * TRANSFER; // 流量大小
            $user->invite = $inviteCode;
            $user->plan = $invite->plan;//将邀请码的账户类型设定到注册用户上.
            $user->regDateLine = time();
            $user->lastConnTime = $user->regDateLine;
            $user->sspwd = Util::GetRandomPwd();
            $user->insertToDB();
            if($invite->plan != 'A')
                $user->port = $user->uid;
            $invite->reguid = $user->uid;
            $invite->regDateLine = $user->regDateLine;
            $invite->status = 1; //-1过期 0-未使用 1-已用
            $invite->inviteIp = Util::GetUserIP();
            $invite->updateInvite();
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

    public function forgePwd() {
        $result = array('error' => 1, 'message' => '请求找回密码失败');

        if(isset($_POST['email']) && $_POST['email'] != '') {

            $user = User::GetUserByEmail($_POST['email']);
            if(!$user) {
                echo json_encode($result);
                exit();
            }
            $user->lastFindPasswdTime = time();
            if($user->lastFindPasswdCount != 0 && $user->lastFindPasswdCount > 2) {
                $result['message'] = '找回密码重试次数已达上限!';
                echo json_encode($result);
                exit();
            }

            $code = Util::GetRandomChar(10);

            $siteName = SITE_NAME;

            $content = <<<EOF
Dear {$user->nickname}:<br/>
Use this code to disable your password and access your {$siteName} account:<br/>
<br/>
Code: {$code}
<br/>
<br/>
Yours,
The {$siteName} Team
EOF;


            $mailResult = Mail::mail_send($user->email,  "[". SITE_NAME ."] Password Recovery", $content);
            $result['message'] = '验证代码已经发送到该注册邮件地址，请注意查收!';
            $result['error'] = 0;

        } else {
            include Template::load('/home/forgePwd');
            exit();
        }

        echo json_encode($result);
        exit();
    }

}
