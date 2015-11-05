<?php
/**
 * KK SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Helper;

use Model\User;

class Listener {
    
    public static function checkLogin() {
        global $user;
        $cookie = $_COOKIE['auth'];
        if(!empty($cookie)) {
            $auth = new User();
            list($auth->uid, $auth->email, $auth->nickname) = explode("\t", Encrypt::decode(base64_decode($cookie), COOKIE_KEY));
            if(!isset($auth) || $auth->uid == '' || $auth->email=='') {
                return false;
            }

            $user = User::GetUserByEmail($auth->email);
            if($user->uid == $auth->uid) {
                return true;
            }
        }
        return false;
    }
    
}