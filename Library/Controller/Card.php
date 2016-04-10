<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/3/21 22:32
 */


namespace Controller;

use Core\Template;
use Model\Card as CardModel;

/**
 * Class Card
 * @Authorization
 * @package Controller
 */
class Card {

    /**
     * 激活(使用)卡号
     * @JSON
     */
    public function activation() {
        // -- TODO:: 套餐卡使用
        return array('error' => 0, 'message' => '该功能无法使用');
    }

}