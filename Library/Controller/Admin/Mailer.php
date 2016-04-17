<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/4/16 23:58
 */


namespace Controller\Admin;


use Core\Template;
use Model\User;

class Mailer
{

    public function index()
    {

        $data['user'] = User::getCurrent();
        Template::setContext($data);
        Template::setView('admin/mailer');
    }

}