<?php
/**
 * shadowsocks-panel
 * Add: 2016/4/8 11:44
 * Author: Sendya <18x@loacg.com>
 */

namespace Helper;

use Model\User;
use Helper\Option;
use ReflectionObject;

class Utils
{

    const KB = 1024, MB = 1048576, GB = 1073741824;

    /**
     * 邮件地址检测
     * @param $address
     * @return null|string
     */
    public static function mailCheck($address)
    {
        $pattern = "/^[A-Za-z0-9-_.+%]+@[A-Za-z0-9-.]+\\.[A-Za-z]{2,4}$/";
        if (!preg_match($pattern, $address)) {
            return "邮箱地址格式不正确";
        }
        /*
        if (is_numeric(stristr($chkMailAddress, "qq.com")))
            return "该邮箱地址不被支持,请更换";
        */
        if (User::getUserByEmail($address) != false) {
            return "邮箱地址已经被注册使用";
        }
        return null;
    }

    /**
     * 获取下一个端口号
     * @return mixed
     */
    public static function getNewPort()
    {
        $current_port = Option::get('current_port');
        Option::set('current_port', intval($current_port) + 1);
        return $current_port;
    }

    /**
     * Gravatar pic
     * @param $email
     * @param int $s
     * @param string $d
     * @param string $r
     * @param bool $img
     * @param array $atts
     * @return string
     */
    public static function gravatar($email, $s = 128, $d = 'mm', $r = 'g', $img = false, $atts = array())
    {
        $host = array(
            '//gravatar0.ifdream.net/avatar/',
            '//www.gravatar.com/avatar/',
            'https://gravatar.css.network/avatar/',
            'http://ruby-china.org/',
            'http://gravatar.duoshuo.com/',
            'https://gravatar.lug.ustc.edu.cn/avatar/'
        ); // 前三个支持https
        $url = $host[5];
        $url .= md5(strtolower(trim($email)));
        $url .= "?s=$s&d=$d&r=$r";
        if ($img) {
            $url = '<img src="' . $url . '"';
            foreach ($atts as $key => $val) {
                $url .= ' ' . $key . '="' . $val . '"';
            }
            $url .= ' />';
        }
        return $url;
    }

    /**
     * 获取随机字符串
     * @param int $length
     * @return string
     */
    public static function randomChar($length = 8)
    {
        // 密码字符集，可任意添加你需要的字符
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $char = '';
        for ($i = 0; $i < $length; $i++) {
            $char .= $chars[mt_rand(0, strlen($chars) - 1)];
        }
        return $char;
    }

    /**
     * 获取客户端IP地址
     * @return string
     */
    public static function getUserIP()
    {
        if (getenv("HTTP_CLIENT_IP")) {
            $ip = getenv("HTTP_CLIENT_IP");
        } else {
            if (getenv("HTTP_X_FORWARDED_FOR")) {
                $ip = getenv("HTTP_X_FORWARDED_FOR");
            } else {
                if (getenv("REMOTE_ADDR")) {
                    $ip = getenv("REMOTE_ADDR");
                } else {
                    $ip = "127.0.0.1";
                }
            }
        }
        return $ip;
    }

    /**
     * 账户类型显示自定义名称
     *
     * @param $plan
     * @return string
     */
    public static function planAutoShow($plan)
    {
        // planNames 从数据库中获取
        $planNames = json_decode(Option::get('custom_plan_name'), true);
        $planName = $planNames[$plan];
        if ($planName == '') {
            $planName = '测试账户';
        }
        return $planName;
    }

    /**
     * 计划任务显示状态
     *
     * @param $enabled
     * @param $nextrun
     */
    public static function cronStatus($enabled, $nextrun)
    {
        if ($enabled) { // 1
            if ($nextrun < (time() - 60)) {
                echo '运行完毕';
            } else {
                if ($nextrun < (time() + 60) && $nextrun > time()) {
                    echo '即将运行';
                } else {
                    if ($nextrun < (time() + 600) && $nextrun > time()) {
                        echo '等待运行';
                    } else {
                        echo '尚未运行';
                    }
                }
            }
        } else {
            echo '停用';
        }
    }

    /**
     * 流量单位
     *
     * @param $value
     * @param int $type
     * @return float|string
     */
    public static function flowAutoShow($value, $type = 1)
    {
        if ($value > self::GB) {
            $str = round($value / self::GB, 2);
            if ($type) {
                $str .= " GB";
            }
        } else {
            if ($value > self::MB) {
                $str = round($value / self::MB, 2);
                if ($type) {
                    $str .= " MB";
                }
            } else {
                if ($value > self::KB) {
                    $str = round($value / self::KB, 2);
                    if ($type) {
                        $str .= " KB";
                    }
                } else {
                    $str = round($value, 2);
                    $str .= "";
                }
            }
        }
        return $str;
    }

    public static function menuActive($link = "", $args = "")
    {
        $requestPath = \Core\Request::getRequestPath();
        $controllerName = ucfirst(substr($requestPath, strrpos($requestPath, "/")));
        if (strpos($link, '|') !== false) {
            $links = explode('|', $link);
            $arg = "";
            for ($i = 0; $i < count($links); $i++) {
                if (stripos($controllerName, $links[$i]) !== false) {
                    $arg = 'active ' . $args;
                    break;
                }
            }
            return $arg;
        }

        if (stripos($controllerName, $link) !== false) {
            return 'active ' . $args;
        } else {
            return "";
        }
    }


    public static function getShortName(&$class) {
        $reflection = new ReflectionObject($class);
        return $reflection->getShortName();
    }

    /* get & set */
    public static function toKB($value)
    {
        return $value / self::KB;
    }

    public static function toMB($value)
    {
        return $value / self::MB;
    }

    public static function toGB($value)
    {
        return $value / self::GB;
    }

    public static function kb()
    {
        return self::KB;
    }

    public static function mb()
    {
        return self::MB;
    }

    public static function gb()
    {
        return self::GB;
    }
}