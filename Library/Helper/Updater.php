<?php
/**
 * shadowsocks-panel
 * Add: 2016/4/6 16:02
 * Author: Sendya <18x@loacg.com>
 */

namespace Helper;

/**
 * shadowsocks-panel 在线更新
 *
 * Class Updater
 * @package Helper
 */
class Updater {

    const UPDATE_SERVER = 'https://update.loacg.com/';

    public static function check() {
        $current_version = Option::get("version");

        $online_version = "v0.41"; // 从 update.loacg.com 服务器上获取版本变化

        if($current_version != $online_version) {
            // 有新更新
            return true;
        }
        return false;
    }
}