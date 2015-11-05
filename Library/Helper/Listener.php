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
        global $user, $uid;
        $token = $_COOKIE['auth'];
        if(!empty($token)) {
            $token = Encrypt::decode(base64_decode($token), COOKIE_KEY); // Decode
            list($uid, $email, $nickname) = explode("\t", $token);
            if(!isset($uid) && !isset($nickname) && !isset($email)) {
                return false;
            }
            $user = \Model\User::GetUserByUserId($uid);
            if($user->uid == $uid && $user->email == $email) {
                return true;
            }
        }
        return false;
    }
    
}