<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Core;

class Request
{
    /**
     * Detect base url whether it is not defined
     * @return string Base URL of this forum
     */
    public static function autoDetectBaseURL()
    {
        if (!defined('BASE_URL')) {
            $protocol = self::isSecureRequest() ? 'https' : 'http';
            $host = $_SERVER['SERVER_NAME'];
            $subFolder = str_replace('index.php', '', $_SERVER['SCRIPT_NAME']);
            define('BASE_URL', "{$protocol}://{$host}{$subFolder}");
        }
        return BASE_URL;
    }

    /**
     * Check whether this is a request via HTTPS
     * @return bool True if is HTTPS request
     */
    public static function isSecureRequest()
    {
        if (!defined('IS_HTTPS_REQUEST')) {
            define('IS_HTTPS_REQUEST', ($_SERVER['HTTPS'] && $_SERVER['HTTPS'] != 'off'));
        }
        return IS_HTTPS_REQUEST;
    }

    /**
     * Get request path from server header
     * @return string Path
     */
    public static function getRequestPath()
    {
        if ($_SERVER['PATH_INFO']) {
            $path = trim($_SERVER['PATH_INFO'], '/');
        } else {
            list($path) = explode('?', $_SERVER['REQUEST_URI']);
            $folder = str_replace('/index.php', '', $_SERVER['PHP_SELF']);
            $path = str_replace($folder, '', $path);
        }
        return $path;
    }
}