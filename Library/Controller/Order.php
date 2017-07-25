<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/05/02 2:42
 */


namespace Controller;

use Core\Model;
use Core\Template;
use Helper\Logger;
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
        Template::setView('Xenon/panel/order');
    }

    public function lists()
    {
        Template::putContext('user', User::getCurrent());
        Template::setView('Xenon/panel/order_lists');
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

        if(count(MOrder::getByUserId($user->uid)) > 3) {
            header("Location: /order/lists");
            exit();
        }


        $order = new MOrder();
        $order->uid = $user->uid;
        $order->createTime = time();
        $order->money = $money;
        $order->plan = $plan;
        $order->status = 0;
        $order->type = 0; // 类型： 0 - 购买套餐 1 - 账户金额充值 2 - 购买卡号
        $remark = $order->type==0?"购买套餐 ": $order->type==1?"金额充值 ":"购买卡号 ";
        $remark.= $plan . ', ' . $money . '元';
        $order->remark = $remark;
        $order->save(Model::SAVE_INSERT);

        Template::putContext("order_id", $order->id);
        Template::putContext('transfer', $data['custom_transfer_level'][$plan]);
        Template::putContext('plan', $plan);
        Template::putContext('plan_name', $data['custom_plan_name'][$plan]);
        Template::putContext('money', $money);
        Template::putContext('user', $user);
        Template::setView('Xenon/panel/order_create');

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
        if (isset($_POST['pay_success']) && $_POST['pay_success'] == '1') {
            // 支付成功
            $order_id = $_POST['order_id']; // 回调通知时，我们通知对方的参数

            $order = MOrder::getById($order_id);
            if (!$order) {
                Logger::getInstance()->warn('订单 ' . $order_id . ' 不存在.');
                exit();
            }

            $order->status = 1; // 支付成功的标识
            // Order 表还缺少记录支付时间，支付金额类型 : CNY, JPY, USD... 流水号等支付回调时的参数

            $user = User::getUserByUserId($order->uid); // 获取到购买用户
            $user->plan = $order->plan; //

            $custom_transfer_level = json_decode(Option::get('custom_transfer_level'), true); // 格式化 json 为数组
            $transfer = $custom_transfer_level[$order->plan];
            $user->transfer = $transfer; // 这里设置 plan 对应流量

            $user->flow_up = 0; // 这里是清空使用量，看情况而定义
            $user->flow_down = 0;

            $user-save();
            $order->save();
            // 这个方法必须加事物，不然保存失败就出问题了。
        }
    }

}