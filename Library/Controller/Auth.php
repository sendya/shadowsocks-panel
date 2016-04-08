<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Model\Invite;
use Model\User;

use Core\Template;
use Helper\Message;
use Helper\Utils;
use Helper\Option;

class Auth {

    public function index() {
        header("Location: /auth/login");
    }

    /**
     * Login
     *
     * @JSON
     */
    public function login() {
        /**
         * 1. 判断用户是否已经登陆,
         *      若已经登陆,则直接跳转到控制面板(仪表盘)中.
         * 2. 加载登陆页面模板,进入登陆页面.
         */
        $user = User::getCurrent();
        if ($user->uid) {
            header("Location:/member");
        } else if (isset($_REQUEST['email']) && isset($_REQUEST['passwd'])) {
            $result = array('error' => 1, 'message' => '账户不存在啊喂!');
            $email = htmlspecialchars($_REQUEST['email']);
            $passwd = htmlspecialchars($_REQUEST['passwd']);
            $remember_me = htmlspecialchars($_REQUEST['remember_me']);

            $user = User::getUserByEmail($email);

            if ($user) {
                if ($user->verifyPassword($passwd)) {
                    $result['error'] = 0;
                    $result['message'] = '登陆成功,即将跳转到 &gt;仪表盘';

                    $remember_me == 'week' ? $ext = 3600 * 24 * 7 : $ext = 3600;

                    $_SESSION['currentUser'] = $user;
                } else {
                    $result['message'] = "账户名或密码错误, 请检查后再试!";
                }
            }

            return $result;
        } else {
            Template::setView('panel/login');
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
            if(!$user) {
                setcookie("auth", '', time() - 3600, "/");
                setcookie("token", '', time() - 3600, "/");
                $result['message'] = "账户不存在. 请手动退回到登录页";
                echo json_encode($result);
                exit();
            }
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
                \Core\Response::redirect('/auth/login');
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

    /**
     * @JSON
     */
    public function register() {
        $result = array('error' => 1, 'message' => '注册失败');
        $email = strtolower(trim($_POST['r_email']));
        $userName = trim($_POST['r_user_name']);
        $passwd = trim($_POST['r_passwd']);
        $repasswd = trim($_POST['r_passwd2']);
        $inviteCode = trim($_POST['r_invite']);
        $invite = Invite::getInviteByInviteCode($inviteCode); //校验 invite 是否可用
        if ($invite->status != 0 || $invite == null || empty($invite)) {
            $result['message'] = '邀请码不可用';
        } else if ($repasswd != $passwd) {
            $result['message'] = '两次密码输入不一致';
        } else if (strlen($passwd) < 6) {
            $result['message'] = '密码太短,至少8字符';
        } /* else if (strlen($userName) < 4) {
            $result['message'] = '昵称太短,至少2中文字符或6个英文字符';
        }*/ else if ($chkEmail = Utils::mailCheck($email)) {
            $result['message'] = $chkEmail;
        } else {
            $user = new User();
            $user->email = $email;
            if($userName == null) // 如果用户名没填写，则使用email当用户名
                $userName = $email;

            $user->nickname = $userName;

            // LEVEL 从数据库中获取
            $transferLevel = [
                'A'     =>  10,
                'B'     =>  50,
                'C'     =>  150,
                'D'     =>  300,
                'VIP'   =>  500
            ];

            // 定义邀请码套餐与流量单位
            $transferNew = Utils::gb() * $transferLevel[$invite->plan];

            $user->transfer = $transferNew;
            $user->invite = $inviteCode;
            $user->plan = $invite->plan;// 将邀请码的账户类型设定到注册用户上.
            $user->regDateLine = time();
            $user->lastConnTime = $user->regDateLine;
            $user->sspwd = Utils::randomChar();
            $user->payTime = time(); // 注册时支付时间
            $user_test_day = Option::get('user_test_day')?: 0;
            $user->expireTime = time() + (3600 * 24 * intval($user_test_day)); // 到期时间

            $user->port = Utils::getNewPort(); // 端口号
            $user->setPassword($passwd);
            $user->save();

            $invite->reguid = $user->uid;
            $invite->regDateLine = $user->regDateLine;
            $invite->status = 1; // -1过期 0-未使用 1-已用
            $invite->inviteIp = Utils::getUserIP();
            $invite->save();

            if (null != $user->uid && 0 != $user->uid) {
                $result['error'] = 0;
                $result['message'] = '注册成功';
            }
        }
        return $result;
    }

    public function forgePwd() {
        $result = array('error' => 1, 'message' => '请求找回密码失败');
        $siteName = SITE_NAME;

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
            $user->forgePwdCode = $code;

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

            $user->updateUser();

            $result['uid'] = $user->uid;
            $result['message'] = '验证代码已经发送到该注册邮件地址，请注意查收!';
            $result['error'] = 0;

        } else if($_POST['code'] != '' && $_POST['uid'] != '') {
            $uid = $_POST['uid'];
            $code = trim($_POST['code']);
            $user = User::GetUserByUserId(trim($uid));
            if($user->forgePwdCode == $code) {
                $newPassword = Util::GetRandomChar(10);
                $user->savePassword($newPassword);

                $user->lastFindPasswdCount = 0;
                $user->lastFindPasswdTime = 0;
                $user->updateUser();

                $content = <<<EOF
Dear {$user->nickname}:<br/>
Here's your new password<br/>
<br/>
Password: {$newPassword}
<br/>
<br/>
<b>ATTENTION: PLEASE CHANGE THE PASSWORD AND DELETE THIS EMAIL IMMEDIATELY ALTER LOG IN YOUR ACCOUNT FOR SECURITY PURPOSES.</b>
<br/>
<br/>
Yours, The {$siteName} Team
EOF;


                $mailResult = Mail::mail_send($user->email,  "[". SITE_NAME ."] Your new Password", $content);

                $result['message'] = '新密码已经发送到该账户邮件地址，请注意查收!<br/> 并且请在登陆后修改密码！';
                $result['error'] = 0;

            } else {
                $result['message'] = '验证码不正确。请确认';
                $result['error'] = -1;
            }

        } else {
            include Template::load('/home/forgePwd');
            exit();
        }

        echo json_encode($result);
        exit();
    }

}
