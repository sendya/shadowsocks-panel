<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Helper;

use Core\Filter;
use Core\I18N;
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
        Template::setView('Misc/Redirect');
        if (is_array($text)) {
            array_unshift($text, $text[0]);     // Set fallback string
            Template::putContext('text', call_user_func_array(array('I18N', 'parse'), $text));
        } else {
            Template::putContext('text', I18N::parse($text, $text));
        }
        Template::putContext('timeout', $timeout);
        Template::putContext('link', $link === null ? null : Response::generateURL($link));
        Filter::preRender();
        Template::render();
        Filter::afterRender();
        exit();
    }
}
