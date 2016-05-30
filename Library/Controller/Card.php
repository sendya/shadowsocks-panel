<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/3/21 22:32
 */


namespace Controller;

use Core\Template;
use Helper\Option;
use Helper\Utils;
use Model\Card as Mcard;
use Model\User;

/**
 * Class Card
 * @Authorization
 * @package Controller
 */
class Card
{

    /**
     * 激活(使用)卡号
     * @JSON
     */
    public function activation()
    {

        $user = User::getUserByUserId(User::getCurrent()->uid);

        $result = array('error' => 1, 'message' => '该卡已经被使用或不存在。');
        if ($_POST['actCard'] != null) {
            $actCard = htmlspecialchars(trim($_POST['actCard']));
            $card = Mcard::queryCard($actCard);
            if (!$card || !$card->status) {
                return $result;
            }

            $custom_transfer_level = json_decode(Option::get('custom_transfer_level'), true);
            $custom_transfer_repeat = json_decode(Option::get('custom_transfer_repeat'), true);

            /* 0-套餐卡 1-流量卡 2-测试卡 3-余额卡 */
            if ($card->type == 0) {

                if ($user->plan == 'Z' && $user->transfer > ($user->flow_up + $user->flow_down)) {
                    $result['message'] = '您的流量套餐尚未使用完毕。无法转换到 ' . Utils::planAutoShow($card->info) . ' 套餐';
                    return $result;
                }
                $user->plan = $card->info;
                $user->transfer = Utils::GB * intval($custom_transfer_level[$user->plan]);
                $user->payTime = time();
                if (($user->flow_up + $user->flow_down) < $user->transfer) {
                    $user->enable = 1;
                } else {
                    $user->enable = 0;
                }
                $cardDay = 31;
                if (is_numeric($card->expireTime)) {
                    $cardDay = intval($card->expireTime);
                }
                if ($user->expireTime < time() && !$custom_transfer_repeat) {
                    $user->expireTime = time() + (3600 * 24 * $cardDay); // 到期时间
                } else {
                    $user->expireTime = $user->expireTime + (3600 * 24 * $cardDay); // 到期时间
                }
                $result['message'] = '您的账户已升级到 ' . Utils::planAutoShow($user->plan) . ' ,共有流量 ' . Utils::flowAutoShow($user->transfer) . ', 已用 ' . Utils::flowAutoShow($user->flow_down + $user->flow_up) . ', 到期时间：' . date('Y-m-d H:i:s',
                        $user->expireTime);
            } elseif ($card->type == 1) {
                if ($user->plan == 'Z') {
                    $user->transfer += intval($card->info) * Utils::GB; // 如果之前是 流量 套餐，则递增
                } else {
                    $user->transfer = intval($card->info) * Utils::GB; // 如果之前是 普通套餐，则清空总流量并设定新流量
                    $user->flow_up = 0;
                    $user->flow_down = 0;
                }
                if (($user->flow_up + $user->flow_down) < $user->transfer) {
                    $user->enable = 1;
                } else {
                    $user->enable = 0;
                }
                $user->plan = 'Z'; // 强制设定为Z
                $user->expireTime = strtotime("+1 year"); // 账户可用时间增加一年
                $result['message'] = '您的账户已经激活固定流量套餐，共有流量' . Utils::flowAutoShow($user->transfer) . ' ,该流量到期时间 ' . date('Y-m-d H:i:s',
                        $user->expireTime) . ', 感谢您的使用（注意：流量使用完毕前无法通过套餐卡转换为套餐包月用户）';

            } elseif ($card->type == 2) {


                $user_test_day = Option::get('user_test_day') ?: 7;

                if ($user->plan != 'A') {
                    return array('error' => 1, 'message' => '喂喂，你不是测试账户诶? 没办法帮你续命。');
                }
                $user->plan = 'A';
                $user->payTime = time();
                if ($user->expireTime < time()) {
                    $user->expireTime = time() + (3600 * 24 * intval($user_test_day)); // 到期时间
                } else {
                    $user->expireTime = $user->expireTime + (3600 * 24 * intval($user_test_day)); // 到期时间
                }
                $user->transfer = Utils::GB * intval($custom_transfer_level[$user->plan]);
                $user->flow_down = 0;
                $user->flow_up = 0;
                $user->enable = 1;
                $result['message'] = '您的账户已经激活测试套餐，共有流量' . Utils::flowAutoShow($user->transfer) . ' ,到期时间 ' . date('Y-m-d H:i:s',
                        $user->expireTime) . ', 感谢您的使用';
            } elseif ($card->type == 3) {
                // 余额卡
                $user->money += intval($card->info);
                $user->save();
                $result['message'] = '余额充值成功，您当前余额为 ' . $user->money . ' 元';
            }
            $card->destroy(); // 将此卡片禁止
            $user->save();
            $_SESSION['currentUser'] = $user; // 将用户信息更新到 session 中.

        }

        return $result;
    }

}