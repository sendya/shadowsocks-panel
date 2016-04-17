<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Core;

class Router extends DefaultRouter
{
    function __construct()
    {
        if (!defined('KK_START')) {
            define('KK_START', microtime(true));
        }
    }

    public static function execTime()
    {
        return round(microtime(true) - KK_START, 4);
    }
}
