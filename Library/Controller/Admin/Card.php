<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/4/13 23:47
 */


namespace Controller\Admin;
use Core\Template;
use Model\User;
use Model\Card as MCard;

/**
 * Class Cron
 * @Admin
 * @Authorization
 * @package Controller\Admin
 */
class Card {

    public function index() {

        Template::putContext('cardList', MCard::queryAll());
        Template::putContext('user', User::getCurrent());
        Template::setView("admin/card");
    }

    /**
     * @JSON
     * @return array
     */
    public function query() {
        return array('error' => 0, 'message' => 'success', 'card' => MCard::queryCardById(trim($_POST['id'])));
    }

    /**
     * 修改 和 新增 卡号
     *
     * @JSON
     */
    public function update() {
        // TODO modify or add card.
    }

    /**
     * 删除卡号
     * @JSON
     */
    public function delete() {
        MCard::queryCardById(trim($_POST['id']))->delete();
        return array('error' => 0, 'message' => 'success');
    }

}