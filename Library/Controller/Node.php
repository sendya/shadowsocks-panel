<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/11/9 14:31
 */


namespace Controller;


use Core\Template;

class Node
{
    /**
     * @RequireLogin
     * @Route /node
     */
    public function home()
    {

    }

    /**
     * @JSON
     * @RequireLogin
     * @DynamicRoute /node/{int}/info
     * @param $nodeId
     */
    public function info($nodeId)
    {

    }

    /**
     * @JSON
     * @RequireAdmin
     * @DynamicRoute /node/{int}/delete
     * @param $nodeId
     */
    public function delete($nodeId)
    {

    }

    /**
     * @RequireAdmin
     * @Route /node/create
     */
    public function create()
    {
        Template::setView("Node/create");
    }

    /**
     * @JSON
     * @RequireAdmin
     * @Route /node/create.json
     */
    public function doCreate()
    {

    }

}