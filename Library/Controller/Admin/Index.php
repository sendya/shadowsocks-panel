<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use \Core\Template;
use \Model\User;
use \Model\Node;
use \Helper\Util;

class Index extends AdminListener {
    public function index() {
    	global $user;
    	

	include Template::load('/admin/index');
    }

    public function test() {
        global $user;

        include Template::load('/admin/test');
    }

}
