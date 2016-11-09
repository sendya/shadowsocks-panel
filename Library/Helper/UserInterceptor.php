<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/11/9 10:44
 */


namespace Helper;


use Core\IFilter;
use Model\User;

class UserInterceptor implements IFilter
{

    private static function requireLogin()
    {
        if (!User::getCurrent()) {
            Message::show('User.Messages.RequireLogin', 'Auth/Login');
        }
    }

    private static function requireAdmin()
    {
        self::requireLogin();
        if (!User::getCurrent()->isAdmin()) {
            Message::show('User.Messages.RequireAdmin', 'Member/');
        }
    }

    public function preRoute(&$path)
    {

    }

    public function afterRoute(&$className, &$method)
    {
        $reflection = new ReflectionMethod($className, $method);
        $markers = ReflectionHelper::parseDocComment($reflection);
        if ($markers['RequireLogin']) {
            self::requireLogin();
        }
        if ($markers['RequireAdmin']) {
            self::requireAdmin();
        }
    }

    public function preRender()
    {

    }

    public function afterRender()
    {

    }

    public function redirect(&$targetUrl)
    {

    }

}