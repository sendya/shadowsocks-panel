<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use \Model\User;

class AdminListener extends \Helper\Listener {


    public function __construct() {
        global $user;
        $user = User::getInstance();
        if (!$user->uid || !\Model\UserPower::verifyPower($user->uid)) {
            Response::redirect('/Auth/login');
        }

        $user = $user->GetUserByEmail($user->email);
    }
	
}