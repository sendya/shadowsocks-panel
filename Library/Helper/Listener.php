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
            Response::redirect('/auth/login');
        }
        if (LOCKSCREEN) { // check LOACKSCREEN define
            if (!empty(@$_COOKIE['token'])) {
                $token = Util::getToken();
                if ($token > 3600 && stristr(\Core\Request::getRequestPath(), 'lockscreen') == false) {
                    Response::redirect('/auth/lockscreen');
                } else {
                    Util::setToken();
                }
            } else {
                Response::redirect('/auth/lockscreen');
            }
        }

        $user = User::GetUserByUserId($user->uid);
        if(!$user) {
            setcookie("auth", '', time() - 3600, "/");
            setcookie("token", '', time() - 3600, "/");
            Response:redirect('/auth/login');
        }
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
