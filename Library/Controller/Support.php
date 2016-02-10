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
        include Template::load('/home/Tos');
    }

    public function Help() {
        include Template::load('/home/help');
    }

}