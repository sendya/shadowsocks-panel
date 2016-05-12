<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Helper\Mailer;
use Helper\Stats;
use Model\Invite;
use Model\Mail;
use Model\User;
use Model\Message as MessageModel;

use Core\Template;
use Helper\Utils;
use Helper\Option;
use Helper\Encrypt;

class Auth
{

    public function index()
    {
        header("Location: /auth/login");
    }

    /**
     * Login
     *
     * @JSON
     */
    public function login()
    {
        /**
         * 1. 判断用户是否已经登录,
         *      若已经登录,则直接跳转到控制面板(仪表盘)中.
         * 2. 加载登录页面模板,进入登录页面.
         */
        $user = User::getCurrent();
        if ($user->uid) {
            header("Location:/member");
        } else {
            if (isset($_REQUEST['email']) && isset($_REQUEST['passwd'])) {
                $result = array('error' => 1, 'message' => '账户不存在啊喂!');
                $email = htmlspecialchars(trim($_REQUEST['email']));
                $passwd = htmlspecialchars(trim($_REQUEST['passwd']));
                $remember_me = htmlspecialchars(trim($_REQUEST['remember_me']));

                $user = User::getUserByEmail($email);

                if ($user) {
                    if ($user->verifyPassword($passwd)) {
                        $result['error'] = 0;
                        $result['message'] = '登录成功,即将跳转到 &gt;仪表盘';

                        $remember_me == 'week' ? $ext = 3600 * 24 * 7 : $ext = 3600;
                        $expire = time() + $ext;
                        $token = md5($user->uid . ":" . $user->email . ":" . $user->passwd . ":" . $expire . ":" . COOKIE_KEY);
                        setcookie("uid", base64_encode(Encrypt::encode($user->uid, ENCRYPT_KEY)), $expire, "/");
                        setcookie("expire", base64_encode(Encrypt::encode($expire, ENCRYPT_KEY)), $expire, "/");
                        setcookie("token", base64_encode(Encrypt::encode($token, ENCRYPT_KEY)), $expire, "/");

                        $_SESSION['currentUser'] = $user;
                    } else {
                        $result['message'] = "账户名或密码错误, 请检查后再试!";
                    }
                }

                return $result;
            } else {
                $data['globalMessage'] = MessageModel::getGlobalMessage();
                Template::setContext($data);
                Template::setView('panel/login');
            }
        }
    }

    /**
     * 锁屏
     * @JSON
     */
    public function lockScreen()
    {
        // TODO -- 这个功能可能会弃用
        // 2016-04-09
    }

    public function logout()
    {
        setcookie("uid", '', time() - 3600, "/");
        setcookie("expire", '', time() - 3600, "/");
        setcookie("token", '', time() - 3600, "/");
        $_SESSION['currentUser'] = null;
        header("Location:/");
    }

    /**
     * @JSON
     */
    public function register()
    {
        $result = array('error' => 1, 'message' => '注册失败');
        $email = strtolower(trim($_POST['r_email']));
        $userName = trim($_POST['r_user_name']);
        $passwd = trim($_POST['r_passwd']);
        $repasswd = trim($_POST['r_passwd2']);
        $inviteCode = trim($_POST['r_invite']);
        $invite = Invite::getInviteByInviteCode($inviteCode); //校验 invite 是否可用

        if ($invite->status != 0 || $invite == null || empty($invite)) {
            $result['message'] = '邀请码不可用';
        } else {
            if ($repasswd != $passwd) {
                $result['message'] = '两次密码输入不一致';
            } else {
                if (strlen($passwd) < 6) {
                    $result['message'] = '密码太短,至少8字符';
                } /* else if (strlen($userName) < 4) {
            $result['message'] = '昵称太短,至少2中文字符或6个英文字符';
        }*/ else {
                    if ($chkEmail = Utils::mailCheck($email)) {
                        $result['message'] = $chkEmail;
                    } else {
                        $user = new User();
                        $user->email = $email;
                        if ($userName == null) // 如果用户名没填写，则使用email当用户名
                        {
                            $userName = $email;
                        }
                        $userCount = Stats::countUser();

                        $user->nickname = $userName;

                        // LEVEL 从数据库中获取
                        $custom_transfer_level = json_decode(Option::get('custom_transfer_level'), true);

                        // 定义邀请码套餐与流量单位
                        $transferNew = Utils::GB * intval($custom_transfer_level[$invite->plan]);

                        $user->transfer = $transferNew;
                        $user->invite = $inviteCode;
                        $user->plan = $invite->plan;// 将邀请码的账户类型设定到注册用户上.
                        $user->regDateLine = time();
                        $user->lastConnTime = $user->regDateLine;
                        $user->sspwd = Utils::randomChar();
                        $user->payTime = time(); // 注册时支付时间
                        $user_test_day = Option::get('user_test_day') ?: 7;
                        $user->expireTime = time() + (3600 * 24 * intval($user_test_day)); // 到期时间
                        if($userCount>0) {
                            $user->enable = 0; // 停止账户
                        } else {
                            $user->enable = 1; // 第一个账户，默认设定为启用
                        }
                        $code = Utils::randomChar(10);
                        $forgePwdCode['verification'] = $code;
                        $forgePwdCode['time'] = time();
                        $user->forgePwdCode = json_encode($forgePwdCode);

                        $user->port = Utils::getNewPort(); // 端口号
                        $user->setPassword($passwd);
                        $user->save();

                        if($userCount>0) { // 需要验证的账户发送邮件
                            $mailer = Mailer::getInstance();
                            $mailer->toQueue(false);
                            $mail = new Mail();
                            $mail->to = $user->email;
                            $mail->subject = '[' . SITE_NAME . '] 新账户注册邮箱校验';
                            $mail->content = Option::get('custom_mail_verification_content');
                            $params = [
                                'code' => $code,
                                'nickname' => $user->nickname,
                                'email' => $user->email,
                                'useTraffic' => Utils::flowAutoShow($user->flow_up + $user->flow_down),
                                'transfer' => Utils::flowAutoShow($user->transfer),
                                'expireTime' => date('Y-m-d H:i:s', $user->expireTime),
                                'REGISTER_URL' => base64_encode($user->uid . "\t" . $forgePwdCode['verification'] . "\t" . $forgePwdCode['time'])
                            ];
                            $mail->content = Utils::placeholderReplace($mail->content, $params);
                            $mailer->send($mail);
                        }
                        $invite->reguid = $user->uid;
                        $invite->regDateLine = $user->regDateLine;
                        $invite->status = 1; // -1过期 0-未使用 1-已用
                        $invite->inviteIp = Utils::getUserIP();
                        $invite->save();

                        if (null != $user->uid && 0 != $user->uid) {
                            $result['error'] = 0;
                            $result['message'] = '注册成功，您需要验证邮箱后才能使用本站功能。';
                        }
                    }
                }
            }
        }
        return $result;
    }

    /**
     * 重发校验码
     * @JSON
     * @Authorization
     */
    public function resend()
    {
        if($_POST['auth'] == 'y') {
            $user = User::getCurrent();

            $code = Utils::randomChar(10);
            $forgePwdCode['verification'] = $code;
            $forgePwdCode['time'] = time();
            $user->forgePwdCode = json_encode($forgePwdCode);

            $mailer = Mailer::getInstance();
            $mailer->toQueue(false);
            $mail = new Mail();
            $mail->to = $user->email;
            $mail->subject = '[' . SITE_NAME . '] 新账户注册邮箱校验';
            $mail->content = Option::get('custom_mail_verification_content');
            $params = [
                'code' => $code,
                'nickname' => $user->nickname,
                'email' => $user->email,
                'useTraffic' => Utils::flowAutoShow($user->flow_up + $user->flow_down),
                'transfer' => Utils::flowAutoShow($user->transfer),
                'expireTime' => date('Y-m-d H:i:s', $user->expireTime),
                'REGISTER_URL' => base64_encode($user->uid . "\t" . $forgePwdCode['verification'] . "\t" . $forgePwdCode['time'])
            ];
            $mail->content = Utils::placeholderReplace($mail->content, $params);
            $mailer->send($mail);
            $user->save();
        }
        return array('error'=>0, 'message'=> '重新发送邮件成功。');
    }

    /**
     * 校验
     *
     */
    public function verification()
    {
        if($_GET['verification']!=null) {
            $list = explode("\t", base64_decode($_GET['verification']));

            if(count($list)>2) {
                $user = User::getUserByUserId($list[0]);
                $verification = trim($list[1]);
                $json = json_decode($user->forgePwdCode, true);
                $userVerificationCode = $json['verification'];
                $verifyTime = intval($json['time']);
                $baseURL = BASE_URL . 'auth/login';
                if($userVerificationCode == $verification && ($verifyTime+1800)>time()) {

                    $mailer = Mailer::getInstance();
                    $mailer->toQueue(true, true);
                    $mail = new Mail();
                    $mail->to = $user->email;
                    $mail->subject = '[' . SITE_NAME . '] 账户注册并校验成功通知';
                    $mail->content = Option::get('custom_mail_register_content');
                    $params = [
                        'nickname' => $user->nickname,
                        'email' => $user->email,
                        'useTraffic' => Utils::flowAutoShow($user->flow_up + $user->flow_down),
                        'transfer' => Utils::flowAutoShow($user->transfer),
                        'expireTime' => date('Y-m-d H:i:s', $user->expireTime),
                    ];
                    $mail->content = Utils::placeholderReplace($mail->content, $params);
                    $mailer->send($mail);

                    $user->enable = 1;
                    $user->forgePwdCode = null;
                    $user->save();

                    $html = <<<EOF
<!DOCTYPE html>
<html lang="zh-cmn-Hans">
<head>

<meta charset="utf-8">
<title>邮箱校验成功 - 账户注册</title>

<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="HandheldFriendly" content="true">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />

</head>
<body>
<p>校验成功，感谢您的注册。您现在可以使用本站所有服务了。</p>
<p style="color: #999; font-size: 12px;"><a href="{$baseURL}">3秒后跳转到登录页</a></p>
<script>setTimeout("window.location.href = '/auth/login#login';", 3000);</script>
</body>
</html>
EOF;
                    echo $html;
                    exit();
                }
            }

            $html = <<<EOF
<!DOCTYPE html>
<html lang="zh-cmn-Hans">
<head>

<meta charset="utf-8">
<title>邮箱校验失败 - 账户注册</title>

<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="HandheldFriendly" content="true">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />

</head>
<body>
<p>校验失败，校验时间超时或校验码不对。</p>
<p style="color: #999; font-size: 12px;"><a href="{$baseURL}">3秒后跳转到登录页</a></p>
<script>setTimeout("window.location.href = '/auth/login#login';", 3000);</script>
</body>
</html>
EOF;
            echo $html;
            exit();
        }
    }

    /**
     * @JSON
     * @throws \Core\Error
     */
    public function forgePwd()
    {
        $result = array('error' => 1, 'message' => '请求找回密码失败，请刷新页面重试。');
        $siteName = SITE_NAME;

        if (isset($_POST['email']) && $_POST['email'] != '') {

            $user = User::getUserByEmail(htmlspecialchars(trim($_POST['email'])));
            if (!$user) {
                return $result;
            }

            if($user->enable == 0) {
                $verify_code = json_decode($user->forgePwdCode, true)['verification'];
                if($verify_code!=null) {
                    $result['message'] = '您的账户还未进行邮箱校验，请校验完毕后再试!';
                    return $result;
                }
            }

            $user->lastFindPasswdTime = time();
            if ($user->lastFindPasswdCount != 0 && $user->lastFindPasswdCount > 2) {
                $result['message'] = '找回密码重试次数已达上限!';
                return $result;
            }

            $code = Utils::randomChar(10);
            $forgePwdCode['code'] = $code;
            $forgePwdCode['time'] = time();

            $user->forgePwdCode = json_encode($forgePwdCode);
            $content = Option::get('custom_mail_forgePassword_content');
            $params = [
                'code'      => $code,
                'nickname'  => $user->nickname,
                'email'     => $user->email,
                'useTraffic'=> Utils::flowAutoShow($user->flow_up+$user->flow_down),
                'transfer'  => Utils::flowAutoShow($user->transfer),
                'expireTime'=> date('Y-m-d H:i:s', $user->expireTime)
            ];
            $content = Utils::placeholderReplace($content, $params);

            $mailer = Mailer::getInstance();
            $mail = new \Model\Mail();
            $mail->to = $user->email;
            $mail->subject = "[" . SITE_NAME . "] Password Recovery";
            $mail->content = $content;
            $mailer->toQueue(true); // 添加到邮件列队
            $isOk = $mailer->send($mail);

            $user->save();

            $result['uid'] = $user->uid;
            if ($isOk) {
                $result['message'] = '验证代码已经发送到该注册邮件地址，请注意查收!<br/>请勿关闭本页面，您还需要验证码来验证您的账户所有权才可重置密码！！';
                $result['error'] = 0;
            } else {
                $result['message'] = '邮件发送失败, 请联系管理员检查邮件系统设置！';
                $result['error'] = 1;
            }


            return $result;
        } else {
            if ($_POST['code'] != '' && $_POST['uid'] != '') {
                $uid = $_POST['uid'];
                $code = trim($_POST['code']);
                $user = User::GetUserByUserId(trim($uid));
                $forgePwdCode = json_decode($user->forgePwdCode, true);

                // forgePwdCode.length > 1 且 验证码一样 且 时间不超过600秒(10分钟)
                if (count($forgePwdCode) > 1 && $forgePwdCode['code'] == $code && (time() - intval($forgePwdCode['time'])) < 600) {
                    $newPassword = Utils::randomChar(10);
                    $user->setPassword($newPassword);

                    $user->lastFindPasswdCount = 0;
                    $user->lastFindPasswdTime = 0;
                    $user->save();

                    $content = Option::get('custom_mail_forgePassword_content_2');
                    $params = [
                        'code'      => $code,
                        'newPassword'=> $newPassword,
                        'nickname'  => $user->nickname,
                        'email'     => $user->email,
                        'useTraffic'=> Utils::flowAutoShow($user->flow_up+$user->flow_down),
                        'transfer'  => Utils::flowAutoShow($user->transfer),
                        'expireTime'=> date('Y-m-d H:i:s', $user->expireTime)
                    ];
                    $content = Utils::placeholderReplace($content, $params);

                    $mailer = Mailer::getInstance();
                    $mail = new \Model\Mail();
                    $mail->to = $user->email;
                    $mail->subject = "[" . SITE_NAME . "] Your new Password";
                    $mail->content = $content;
                    $mailer->toQueue(true); // 添加到邮件列队
                    $isOk = $mailer->send($mail);
                    if ($isOk) {
                        $result['message'] = '新密码已经发送到该账户邮件地址，请注意查收!<br/> 并且请在登录后修改密码！';
                        $result['error'] = 0;
                    } else {
                        $result['message'] = '邮件发送失败, 请联系管理员检查邮件系统设置！';
                        $result['error'] = 1;
                    }


                } else {
                    $result['message'] = '验证码已经超时或者 验证码填写不正确。请再次确认';
                    $result['error'] = -1;
                }
                return $result;
            } else {
                Template::putContext('user', User::getCurrent());
                Template::setView('home/forgePwd');
            }
        }

        return $result;
    }

}
