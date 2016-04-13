<?php
/**
 * shadowsocks-panel
 * Add: 2016/4/6 16:02
 * Author: Sendya <18x@loacg.com>
 */

namespace Helper;
use Model\User;

/**
 * shadowsocks-panel 在线更新
 *
 * Class Updater
 * @package Helper
 */
class Updater {

    const UPDATE_SERVER = 'https://update.loacg.com/';
    const CHECK =   'check.json?method=sspanel';

    private static $_instance;
    private static $isCheck = false;

    public static function getInstance() {
        if(!(self::$_instance instanceof self))
            self::$_instance = new self;
        return self::$_instance;
    }

    public function check() {
        if(self::$isCheck)
            return false;
        $current_version = Option::get("version");
        // 从 update.loacg.com 服务器上获取版本变化
        $response = self::doGet(self::UPDATE_SERVER . self::CHECK, array("Cookie: ver:". $current_version));

        if($response!=null) {
            $response = json_decode($response, true);
            $data = $response['data'];
            $online_version = $data['version'];
            if($data['download_url']!=null) {

            }
            $message = "";
            if($data['message']!=null) {
                $message = $data['message'];
            }
            self::$isCheck = true;
            if($current_version != $online_version && User::getCurrent()->isAdmin()) {
                if($message=="")
                    $message = "发现新版本 " . $online_version . " , 可以前往Github下载更新(本消息仅管理员可接收到)";

                return htmlspecialchars($message);
            }
        }
        return false;
    }

    public static function doGet($url, $header) {
        $refer = BASE_URL;
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // 跳过证书检查
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, true);  // 从证书中检查SSL加密算法是否存在
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
        curl_setopt($ch, CURLOPT_REFERER, $refer);
        $cexecute = curl_exec($ch);
        curl_close($ch);

        if ($cexecute) {
            return $cexecute;
        }else{
            return false;
        }
    }

    public static function doPost() {

    }
}