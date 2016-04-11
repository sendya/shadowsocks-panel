<?php
/**
 * shadowsocks-panel
 * Add: 2016/4/6 10:40
 * Author: Sendya <18x@loacg.com>
 */

namespace Contactable;

/**
 * Interface IPay
 * 支付接口
 *
 * @package Contactable
 */
interface IPay {

    public function pay();

    public function status();
}