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
        $inviteList = InviteModel::GetInviteArray(-1);
        Template::setView('home/invite');
        Template::putContext('inviteList', $inviteList);
    }

}
