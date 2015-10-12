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
            $result = array('error'=> 1, 'message'=> 'error');
            $email = htmlspecialchars($_REQUEST['email']);
            $passwd = htmlspecialchars($_REQUEST['passwd']);
            $remember_me = htmlspecialchars($_REQUEST['remember_me']);
            $user = \Model\User::GetUserByEmail('18x@mloli.com');
            if($user) {
                if($user->verifyPassword($passwd)) {
                    $result['error'] = 0;
                    $result['message'] = 'success';
                    
                    $token = $user->uid . "|" . $passwd;
                    
                    $token = Encrypt::encode($token , COOKIE_KEY);
                    $remember_me=='week' ? $ext=3600*24*7 : $ext=3600;
                    setcookie("token",base64_encode($token), time()+$ext, "/");
                }
            }
            echo json_encode($result);
            exit();
        } else {
            include Template::load('panel2/login');
        }
    }
    
    public function logout() {
        setcookie("token",'', time()-3600, "/");
        header("Location:/");
    }
}