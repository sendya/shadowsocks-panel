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
class Updater
{

    const UPDATE_SERVER = 'https://update.loacg.com/';
    const CHECK = 'check.json?method=sspanel';

    private static $_instance;
    private static $isCheck = false;

    public static function getInstance()
    {
        if (!(self::$_instance instanceof self)) {
            self::$_instance = new self;
        }
        return self::$_instance;
    }

    public function check()
    {
        if (self::$isCheck) {
            return false;
        }
        if (User::getCurrent()->isAdmin()) {
            $current_version = Option::get("version");
            $git_current_version = file_get_contents(DATA_PATH.'version.lock');
            // 从 update.loacg.com 服务器上获取版本变化
            $response = self::doGet(self::UPDATE_SERVER . self::CHECK, array("Cookie: ver:" . $current_version));

            if ($response != null) {
                $response = json_decode($response, true);
                $data = $response['data'];
                $online_version = $data['version'];
                if ($data['download_url'] != null) {

                }
                $message = "";
                if ($data['message'] != null) {
                    $message = $data['message'];
                }
                self::$isCheck = true;

                if ($current_version != $online_version) {
                    if($git_current_version == $online_version) {
                        Option::set("version", $git_current_version);
                        return false;
                    }
                    if ($message == "") {
                        $message = "发现新版本 " . $online_version . " , 可以前往Github下载更新(本消息仅管理员可接收到)";
                    }
                    return htmlspecialchars($message);
                }
            }
        }
        return false;
    }


    public static function fileCheck()
    {
        $channel = Option::get('channel') == 'dev' ?: 'stable';
        $current_version = Option::get("version");
        $data = self::doGet(self::UPDATE_SERVER . "file.json?channel={$channel}&ver={$current_version}");
        if(!$data) return -1; // 请求更新服务器失败
        $data = json_decode($data, true);
        $file_list = $data['list'];
        if (!$file_list) return -2; // 更新服务器文件列表为空

        $err_file = $list = array();
        foreach($file_list as $file) {
            $path = $file['path'];
            $hash = $file['hash'];
            $file_hash = md5_file(ROOT_PATH."{$path}");
            if ($file_hash != $hash){
                $err_file[] = array($path, $hash);
                $list[] = $path;
            }
        }
        if(!$list) return 0; // 无文件更新

        Option::set('new_version', 1);
        sort($list);
        sort($err_file);

        Downloader::save('kk_updater', $err_file);
        Downloader::save('need_download', $err_file);
        return $list;
    }

    public static function doGet($url, $header)
    {
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
        } else {
            return false;
        }
    }

    public static function doPost()
    {

    }
}