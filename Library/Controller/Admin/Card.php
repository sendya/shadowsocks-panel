<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/4/13 23:47
 */


namespace Controller\Admin;

use Core\Template;
use Helper\Utils;
use Model\User;
use Model\Card as MCard;

/**
 * Class Cron
 * @Admin
 * @Authorization
 * @package Controller\Admin
 */
class Card
{

    const API_KEY = 'adsmgu-+58iq[wpeoi^#5-+&^#@%2563DS.-+6GDQW784';

    public function index()
    {

        Template::putContext('cardList', MCard::queryAll());
        Template::putContext('user', User::getCurrent());
        Template::setView("admin/card");
    }

    /**
     * @JSON
     * @return array
     */
    public function query()
    {
        return array('error' => 0, 'message' => 'success', 'card' => MCard::queryCardById(trim($_POST['id'])));
    }

    /**
     * 修改 和 新增 卡号
     *
     * @JSON
     */
    public function update()
    {
        $result = array('error' => 1, 'message' => '请求错误');
        $user = User::getCurrent();
        if ($_POST['card_no'] != null && $_POST['card'] != null) { // 修改
            $cardId = intval(trim($_POST['card']));
            $card = MCard::queryCardById($cardId);
            if (!$card) {
                return $result;
            }

            $card->type = intval(trim($_POST['card_type']));
            $card->info = htmlspecialchars(trim($_POST['card_info']));
            $card->status = intval(trim($_POST['card_status']));
            $card->expireTime = intval(trim($_POST['card_exp']));
            $card->save();
            $card->add_time = date("Y-m-d H:i:s", $card->add_time);
            if($card->type == 0) {
                $card->type = "套餐卡";
            } elseif ($card->type == 1) {
                $card->type = "流量卡";
            } elseif ($card->type == 2) {
                $card->type = "试用延期卡";
            } elseif ($card->type == 3) {
                $card->type = "余额卡";
            }

            $card->status = $card->status == 1 ? "未用" : "已用";
            $result['error'] = 0;
            $result['message'] = "修改卡号成功。";
            $result['card'] = $card;
            return $result;
        } else { // 新增

            $number = 1;
            if ($_POST['card_num'] != null) {
                $number = intval(trim($_POST['card_num']));
            }
            $cardList = array();
            for ($i = 0; $i < $number; ++$i) {
                $cardStr = substr(hash("sha256", $user->uid . Utils::randomChar(10)) . time(), 1, 26);
                $card = new MCard();
                $card->add_time = time();
                $card->card = $cardStr;
                $card->type = intval(trim($_POST['card_type']));
                $card->info = htmlspecialchars(trim($_POST['card_info']));
                $card->expireTime = intval(trim($_POST['card_exp']));
                $card->status = 1;
                $card->save();
                $card->add_time = date("Y-m-d H:i:s", $card->add_time);
                if($card->type == 0) {
                    $card->type = "套餐卡";
                } elseif ($card->type == 1) {
                    $card->type = "流量卡";
                } elseif ($card->type == 2) {
                    $card->type = "试用延期卡";
                } elseif ($card->type == 3) {
                    $card->type = "余额卡";
                }

                $card->status = $card->status == 1 ? "未用" : "已用";
                $cardList[] = $card;
            }
            $result['error'] = 0;
            $result['message'] = "新增卡号成功，共 {$number} 个。";
            $result['card'] = $cardList;
            return $result;
        }
    }

    /**
     * 删除卡号
     * @JSON
     */
    public function delete()
    {
        MCard::queryCardById(trim($_POST['id']))->delete();
        return array('error' => 0, 'message' => '删除成功');
    }

}