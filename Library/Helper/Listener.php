<?php
/**
 * KK SS-Panel
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
        if($user->uid) {
            return true;
        }
        return false;
    }

    public function __construct() {
        header('Location: /user/login');
        global $user;
        $user = User::getInstance();
        if(!$user->uid) {
            Response::redirect('/user/login');
        }
        $user = $user->GetUserByEmail($user->email);
    }
    
}