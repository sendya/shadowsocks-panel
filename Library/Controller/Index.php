<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Controller;

use Core\Template;

class Index
{
    /**
     * @Home
     * @Route /Index
     */
    function index()
    {
        Template::setView("Home/index");
    }

}
