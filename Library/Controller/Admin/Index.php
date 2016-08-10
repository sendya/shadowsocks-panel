<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use Core\Response;
use \Helper\Util;


/**
 * Class Index
 * @Admin
 * @Authorization
 * @package Controller\Admin
 */
class Index
{
    public function index()
    {
        Response::redirect('admin/home');
    }
}
