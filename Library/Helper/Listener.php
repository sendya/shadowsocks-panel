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
        $user = User::getInstance();

        if(!$user) {
            return true;
        }
        return false;
    }
    
}