<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Template;
use Model\User;

class Ticket
{
    public function index()
    {
        Template::putContext('user', User::getCurrent());
        Template::setView('panel/ticket');
    }
}