<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Core;

class Response
{
    /**
     * Redirect to current page via HTTP
     */
    public static function redirectToHttp()
    {
        if (!Request::isSecureRequest()) {
            return;
        }
        self::redirect('http://' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI']);
    }

    /**
     * HTTP 302 redirection
     * @param string $target TargetURL
     */
    public static function redirect($target)
    {
        $target = self::generateURL($target);
        Filter::redirect($target);
        header('Location: ' . $target);
        exit();
    }

    /**
     * Generate a url, check rewrite setting automatically
     * @param string $target Target URL
     * @return string
     */
    public static function generateURL($target)
    {
        if (strpos($target, '//') !== false) {
            return $target;
        }
        if (file_exists(ROOT_PATH . $target)) {
            return BASE_URL . $target;
        }
        if (defined('USE_REWRITE') && USE_REWRITE) {
            return BASE_URL . $target;
        }
        return BASE_URL . 'index.php/' . $target;
    }

    /**
     * Redirect to current page via HTTPS
     */
    public static function redirectToHttps()
    {
        if (!defined('HTTPS_SUPPORT') || !HTTPS_SUPPORT) {
            return;
        }
        if (Request::isSecureRequest()) {
            return;
        }
        self::redirect('https://' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI']);
    }
}
