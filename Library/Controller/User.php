<?php
namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Encrypt;
use Helper\Listener;

/**
 * User Controller
 * Author: Sendya
 */

class User {

    public function login() {

        /**
         * 1. 判断用户是否已经登陆,
         *      若已经登陆,则直接跳转到控制面板(仪表盘)中.
         * 2. 加载登陆页面模板,进入登陆页面.
         */
        if(Listener::checkLogin()) {
            header("Location:/member");
        } else if(isset($_REQUEST['email']) && isset($_REQUEST['passwd'])) {
            $result = array('error'=> 1, 'message'=> '账户名或密码错误, 请检查后再试!');
            $email = htmlspecialchars($_REQUEST['email']);
            $passwd = htmlspecialchars($_REQUEST['passwd']);
            $remember_me = htmlspecialchars($_REQUEST['remember_me']);
            $user = \Model\User::GetUserByEmail('18x@mloli.com');
            if($user) {
                if($user->verifyPassword($passwd)) {
                    $result['error'] = 0;
                    $result['message'] = '登陆成功,即将跳转到 &gt;仪表盘';

                    $token = $user->uid . "|" . $passwd;

                    $token = Encrypt::encode($token , COOKIE_KEY);
                    $remember_me=='week' ? $ext=3600*24*7 : $ext=3600;
                    setcookie("token",base64_encode($token), time()+$ext, "/");
                }
            }
            echo json_encode($result);
            exit();
        } else {
            include Template::load('/panel/login');
        }
    }

    public function logout() {
        setcookie("token",'', time()-3600, "/");
        header("Location:/");
    }


    public function register() {
      $result = array('error'=> 1, 'message'=> '注册失败');
      $email = strtolower($_GET['r_email']);
      $userName = $_POST['r_user_name'];
      $passwd = $_POST['r_passwd'];
      $repasswd = $_POST['r_passwd2'];
      $code = $_POST['r_invite'];

      if($chkEmail = \Helper\Util::MailFormatCheck($email)) {
        $result['message'] = $chkEmail;
      } else {
        
      }

      echo json_encode($result);
      exit();
    }
}
