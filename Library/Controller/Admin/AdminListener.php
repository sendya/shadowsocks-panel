<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use Core\Response;
use Helper\Message;
use Model\User;
use Model\UserPower;

class AdminListener extends \Helper\Listener {

    public function __construct() {
        global $user;
        $user = User::getInstance();
        if (!$user->uid || !UserPower::verifyPower($user->uid)) {
            Message::show("嘿~你没有权限来这个是非之地哟", '/auth/login', 3);
        }

        $user = $user->GetUserByEmail($user->email);
    }
	
}