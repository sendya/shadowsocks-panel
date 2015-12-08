<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Helper;

use Model\User;
use Core\Response;

class Listener {
    
    public static function checkLogin() {
        global $user;
        $user = User::getInstance();
        if(!$user->uid) {
            return false;
        }
        return true;
    }

    public function __construct() {
        global $user, $tokenOut;
        $user = User::getInstance();
        if(!$user->uid) {
            Response::redirect('/Auth/login');
        }
        $tokenOut = (time() - Encrypt::decode(base64_decode(@$_COOKIE['token'])));
        if($tokenOut > 3600 && strstr(\Core\Request::getRequestPath(),'lockscreen') == false) {
            $token = Encrypt::encode(time(), COOKIE_KEY);
            setcookie("token",base64_encode($token), time()+3600*24*7, "/");
            Response::redirect('/Auth/lockscreen');
        }

        $user = $user->GetUserByEmail($user->email);
    }

    public static function getController()
    {
        return __FUNCTION__;
    }
}