<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Response;
use Core\Template;
use Model\User;

/**
 * Class Support
 * @package Controller
 */
class Support
{
    public function index()
    {
        exit();
    }

    /**
     * 工单系统
     * @Authorization
     */
    public function ticket()
    {
        Template::putContext('user', User::getCurrent());
        Template::setView('Xenon/panel/ticket');
    }

    public function tos()
    {
        Template::setView('Xenon/panel/Tos');
    }

    public function help()
    {
        Response::redirect("http://www.ishadowsocks.org/");
    }

}