<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller;


use Core\Response;

class Admin {
    public function index() {
        Response::redirect("/Admin/user");
    }
}