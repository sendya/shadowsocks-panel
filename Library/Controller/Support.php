<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Template;

class Support {
    public function index() {
        exit();
    }

    public function Tos() {
        Template::setView('home/Tos');
    }

    public function Help() {
        Template::setView('home/help');
    }

}