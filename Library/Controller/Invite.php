<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller;

use \Core\Template;
use \Helper\Listener;

use \Model\Invite as InviteModel;

class Invite {

    public function index() {
        // $inviteList = \Model\Invite::GetInvitesByUid(-1);
        $inviteList = \Model\Invite::GetInviteArray(0);

        include Template::load('/home/invite');
    }

}