<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/05/02 2:42
 */


namespace Controller;

use Core\Template;
use Model\User;

/**
 * 订单系统
 * Class Order
 * @package Controller
 */
class Order
{
    public function index()
    {
        Template::putContext('user', User::getCurrent());
        Template::setView('panel/order');
    }

    /**
     * 创建订单
     *
     */
    public function create()
    {

    }

    /**
     * 更新订单
     */
    public function update()
    {

    }

    /**
     * 删除订单
     */
    public function delete()
    {

    }

    /**
     * 订单API接收回调 消息通知
     *
     */
    public function notice()
    {
        
    }

}