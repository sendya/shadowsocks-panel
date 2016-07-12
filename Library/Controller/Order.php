<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/05/02 2:42
 */


namespace Controller;

use Core\Template;
use Helper\Option;
use Model\User;
use Model\Order as MOrder;

/**
 * 订单系统
 * Class Order
 * @Authorization
 * @package Controller
 */
class Order
{
    public function index()
    {
        Template::putContext('user', User::getCurrent());
        Template::setView('panel/order');
    }

    public function lists()
    {
        Template::putContext('user', User::getCurrent());
        Template::setView('panel/order_lists');
    }

    /**
     * 创建订单
     *
     */
    public function create()
    {
        $user = User::getCurrent();
        $data['custom_plan_name'] = json_decode(Option::get('custom_plan_name'), true);
        $data['custom_transfer_level'] = json_decode(Option::get('custom_transfer_level'), true);
        $plan = strtoupper($_GET['plan']);
        $money = 0;
        switch ($plan) {
            case 'B':
                $money = 12;
                break;
            case 'C':
                $money = 20;
                break;
            case 'D':
                $money = 35;
                break;
            case 'VIP':
                $money = 50;
                break;
            case 'Z':
                $money = 50;
                break;
        }

        if(count(MOrder::getByUserId($user->uid)) > 0) {
            header("Location: /order/lists");
            exit();
        }

        $order = new MOrder();
        $order->userid = $user->uid;
        $order->createTime = time();
        $order->money = $money;
        $order->plan = $plan;
        $order->status = 0;
        $order->type = 0; // 类型： 0 - 购买套餐 1 - 账户金额充值 2 - 购买卡号
        $remark = $order->type==0?"购买套餐 ": $order->type==1?"金额充值 ":"购买卡号 ";
        $remark.= $plan . ', ' . $money . '元';
        $order->remark = $remark;
        $order->save();

        Template::putContext("order_id", $order->id);
        Template::putContext('transfer', $data['custom_transfer_level'][$plan]);
        Template::putContext('plan', $plan);
        Template::putContext('plan_name', $data['custom_plan_name'][$plan]);
        Template::putContext('money', $money);
        Template::putContext('user', $user);
        Template::setView('panel/order_create');

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