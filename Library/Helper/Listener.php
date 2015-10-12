<?php
/**
 * KK SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Helper;

use Core\Error;

class Listener {
    
    public static function checkLogin() {
        $token = $_COOKIE['token'];
        if(!empty($token)) {
            $token = Encrypt::decode(base64_decode($token), COOKIE_KEY); // Decode
            list($uid, $password) = explode("|", $token);
            if(!isset($uid) && !isset($password)) {
                return false;
            }
            $user = \Model\User::GetUserByUserId($uid);
            if($user->verifyPassword($password)) {
                return true;
            }
        }
        return false;
    }
    
}