<?php
/**
 * KK Offline Downloader
 * System Message Class
 * Author: kookxiang <r18@ikk.me>
 */
namespace Helper;
use Core\Response;
use Core\Template;
class Message
{
    /**
     * Show text and redirect to another page
     * @param string $text Content
     * @param string $link Target page
     * @param int $timeout Time before redirect
     */
    public static function show($text, $link = null, $timeout = 3)
    {
        $link = Response::generateURL($link);
        include Template::load('Misc/Redirect');
        exit();
    }
}
