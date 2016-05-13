<?php
/**
 * shadowsocks-panel
 * Add: 2016/5/13 14:52
 * Author: Sendya <18x@loacg.com>
 */

namespace Helper;


class Http
{

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