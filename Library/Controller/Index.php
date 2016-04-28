<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Template;
use Helper\Mailer;
use Helper\Option;
use Helper\Utils;
use Model\Mail;
use Model\Node;

class Index
{

    /**
     * 进入首页
     */
    public function index()
    {
        Template::setView('home/index');
    }

    public function test()
    {

    }
}
