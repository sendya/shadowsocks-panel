<?php
/**
 * shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 12/5/2016 4:38 PM
 */

namespace Helper;


class Utils
{

    public static function download($url, $path) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $binary = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'FAILED! ' . curl_error($ch) . PHP_EOL;
            curl_close($ch);
            return false;
        }
        $fp = fopen($path, 'wb');
        fputs($fp, $binary);
        fclose($fp);
        curl_close($ch);
        return true;
    }

    /**
     * 拷贝目录
     * @param $src
     * @param $dst
     * @return bool
     */
    public static function copydir($src, $dst)
    {
        $dir = opendir($src);
        if (!$dir) {
            return false;
        }
        if (!is_dir($src)) {
            if (!mkdir($dst)) {
                return false;
            }
        }
        while (false !== ($file = readdir($dir))) {
            if (($file != '.') && ($file != '..')) {
                if (is_dir($src . '/' . $file)) {
                    if (!Utils::copydir($src . '/' . $file, $dst . '/' . $file)) {
                        return false;
                    }
                } else {
                    if (!copy($src . '/' . $file, $dst . '/' . $file)) {
                        return false;
                    }
                }
            }
        }
        closedir($dir);
        return true;
    }

    public static function del_dir($dir)
    {
        $dh = @opendir($dir);
        while ($file = @readdir($dh)) {
            if ($file != "." && $file != "..") {
                $full_path = $dir . "/" . $file;
                if (!is_dir($full_path)) {
                    @unlink($full_path);
                } else {
                    Utils::del_dir($full_path);
                }
            }
        }
        @closedir($dh);
        if (@rmdir($dir)) {
            return true;
        } else {
            return false;
        }
    }
}