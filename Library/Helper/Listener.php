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

    public function __construct() {
        global $user;
        $user = User::getInstance();
        if (!$user->uid) {
            Response::redirect('/Auth/login');
        }
        if (LOCKSCREEN) { // check LOACKSCREEN define
            if (!empty(@$_COOKIE['token'])) {
                $token = Util::getToken();
                if ($token > 3600 && stristr(\Core\Request::getRequestPath(), 'lockscreen') == false) {
                    Response::redirect('/Auth/lockscreen');
                }
            } else {
                Response::redirect('/Auth/lockscreen');
            }
        }

        $user = $user->GetUserByEmail($user->email);
    }

    public static function checkLogin() {
        global $user;
        $user = User::getInstance();
        if (!$user->uid) {
            return false;
        }
        return true;
    }

}
