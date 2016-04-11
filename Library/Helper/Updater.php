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
        // TODO -- 从 update.loacg.com 服务器上获取版本变化
        $response = self::doGet(UPDATE_SERVER, 'GET', array('version' => 'check', 'async' => true));
        $online_version = $response['version'];
        if($response['download_url']!=null) {

        }
        if($current_version != $online_version) {
            // 有新更新
            return true;
        }
        return false;
    }

    public static function doGet() {

    }

    public static function doPost() {

    }
}