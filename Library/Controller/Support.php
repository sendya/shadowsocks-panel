<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

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
        Template::setView('panel/ticket');
    }

    public function tos()
    {
        Template::setView('panel/Tos');
    }

    public function help()
    {
        Template::setView('panel/help');
    }

}