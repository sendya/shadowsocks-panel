<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use \Core\Template;

use \Model\User as UserModel;

class User extends AdminListener {
    public function index() {
        //throw new \Core\Error("user list", 505);
        global $user;
        $users = UserModel::GetUserArray();
        include Template::load('/admin/user');
    }
}