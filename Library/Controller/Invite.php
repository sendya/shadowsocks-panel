<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller;

use \Core\Template;

class Invite {

    public function index() {
        $inviteList = \Model\Invite::GetInvitesByUid(-1);

        include Template::load('/home/invite');
    }

}