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
        global $user;
        $user = User::getInstance();
        if(!$user->uid) {
            Response::redirect('/Sign/login');
        }
        $user = $user->GetUserByEmail($user->email);
    }

    public static function getController()
    {
        return __FUNCTION__;
    }
}