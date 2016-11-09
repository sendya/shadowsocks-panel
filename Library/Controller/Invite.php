<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/11/9 14:21
 */


namespace Controller;


class Invite
{
    /**
     * @RequireLogin
     * @Route /invite
     */
    public function home()
    {

    }

    /**
     * @RequireLogin
     * @JSON
     * @Route /invite/create.json
     */
    public function create()
    {

    }

    /**
     * @JSON
     * @RequireLogin
     * @DynamicRoute /invite/{any}/delete.json
     * @param $code string Invite code
     */
    public function delete($code)
    {

    }

}