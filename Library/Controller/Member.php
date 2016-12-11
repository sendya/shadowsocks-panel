<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/11/9 14:18
 */


namespace Controller;


use Core\Template;

class Member
{
    /**
     * @RequireLogin
     * @Route /member
     */
    public function home()
    {
        Template::setView("Panel/member");
    }

}