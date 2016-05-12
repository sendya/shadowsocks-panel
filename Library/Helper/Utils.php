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
        $negative = false;
        if ($value < 0) {
            $negative = true;
            $value = abs(intval($value));
        }
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
        if ($negative) {
            $str = '-' . $str;
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

    /**
     * 发送 HTTP 状态码
     * http://httpstatus.es/
     * http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
     * http://zh.wikipedia.org/wiki/HTTP%E7%8A%B6%E6%80%81%E7%A0%81
     * @param integer $code 状态码
     * @return void
     */
    public static function send_http_status($code)
    {
        static $_status = array(
            // Informational 1xx
            100 => 'Continue',              // Client should continue with request
            101 => 'Switching Protocols',   // Server is switching protocols
            102 => 'Processing',            // Server has received and is processing the request
            103 => 'Checkpoint',            // resume aborted PUT or POST requests
            122 => 'Request-URI Too Long',  // URI is longer than a maximum of 2083 characters
            // Success 2xx
            200 => 'OK',                              // standard response for successful HTTP requests
            201 => 'Created',                         // request has been fulfilled; new resource created
            202 => 'Accepted',                        // request accepted, processing pending
            203 => 'Non-Authoritative Information',   // request processed, information may be from another source
            204 => 'No Content',                      // request processed, no content returned
            205 => 'Reset Content',                   // request processed, no content returned, reset document view
            206 => 'Partial Content',                 // partial resource return due to request header
            207 => 'Multi-Status',                    // XML, can contain multiple separate responses
            208 => 'Already Reported',                // results previously returned
            226 => 'IM Used',                         // request fulfilled, reponse is instance-manipulations
            // Redirection 3xx
            300 => 'Multiple Choices',                // multiple options for the resource delivered
            301 => 'Moved Permanently',               // this and all future requests directed to the given URI
            //302 => 'Moved Temporarily',
            302 => 'Found',                           // temporary response to request found via alternative URI
            303 => 'See Other',                       // permanent response to request found via alternative URI
            304 => 'Not Modified',                    // resource has not been modified since last requested
            305 => 'Use Proxy',                       // content located elsewhere, retrieve from there
            // 306 is deprecated but reserved
            306 => 'Switch Proxy',                    // subsequent requests should use the specified proxy
            307 => 'Temporary Redirect',              // connect again to different URI as provided
            308 => 'Permanent Redirect',              // connect again to a different URI using the same method
            // Client Error 4xx
            400 => 'Bad Request',                     // request cannot be fulfilled due to bad syntax
            401 => 'Unauthorized',                    // authentication is possible but has failed
            402 => 'Payment Required',                // payment required, reserved for future use
            403 => 'Forbidden',                       // server refuses to respond to request
            404 => 'Not Found',                       // requested resource could not be found
            405 => 'Method Not Allowed',              // request method not supported by that resource
            406 => 'Not Acceptable',                  // content not acceptable according to the Accept headers
            407 => 'Proxy Authentication Required',   // client must first authenticate itself with the proxy
            408 => 'Request Timeout',                 // server timed out waiting for the request
            409 => 'Conflict',                        // request could not be processed because of conflict
            410 => 'Gone',                            // resource is no longer available and will not be available again
            411 => 'Length Required',                 // request did not specify the length of its content
            412 => 'Precondition Failed',             // server does not meet request preconditions
            413 => 'Request Entity Too Large',        // request is larger than the server is willing or able to process
            414 => 'Request-URI Too Long',            // URI provided was too long for the server to process
            415 => 'Unsupported Media Type',          // server does not support media type
            416 => 'Requested Range Not Satisfiable', // client has asked for unprovidable portion of the file
            417 => 'Expectation Failed',              // server cannot meet requirements of Expect request-header field
            418 => 'I\'m a teapot',                   // I'm a teapot
            419 => 'Authentication Timeout',
            420 => 'Method Failure',
            421 => 'Enhance Your Calm',
            422 => 'Unprocessable Entity',
            423 => 'Locked',
            424 => 'Failed Dependency',
            425 => 'Unordered Collection',
            426 => 'Upgrade Required',
            428 => 'Precondition Required',
            429 => 'Too Many Requests',
            431 => 'Request Header Fields Too Large',
            440 => 'Login Timeout',
            444 => 'No Response',
            449 => 'Retry With',
            450 => 'Blocked by Windows Parental Controls',
            451 => 'Wrong Exchange Server',
            494 => 'Request Header Too Large',
            495 => 'Cert Error',
            496 => 'No Cert',
            497 => 'HTTP to HTTPS',
            499 => 'Client Closed Request',
            // Server Error 5xx
            500 => 'Internal Server Error',           // generic error message
            501 => 'Not Implemented',                 // server does not recognise method or lacks ability to fulfill
            502 => 'Bad Gateway',                     // server received an invalid response from upstream server
            503 => 'Service Unavailable',             // server is currently unavailable
            504 => 'Gateway Timeout',                 // gateway did not receive response from upstream server
            505 => 'HTTP Version Not Supported',      // server does not support the HTTP protocol version
            506 => 'Variant Also Negotiates',
            507 => 'Insufficient Storage',
            508 => 'Loop Detected',
            509 => 'Bandwidth Limit Exceeded',
            510 => 'Not Extended',
            511 => 'Network Authentication Required',
            520 => 'Origin Error',
            522 => 'Connection timed out',
            523 => 'Proxy Declined Request',
            524 => 'A timeout occurred',
            598 => 'Network read timeout error',
            599 => 'Network connect timeout error'
        );
        if (isset($_status[$code]) && !headers_sent()) {
            header('HTTP/1.1 '.$code.' '.$_status[$code]);
            header('Status:'.$code.' '.$_status[$code]); // 确保FastCGI模式下正常
            return true;
        }
        return false;
    }

    /**
     * 对邮件占位符进行替换
     * 支持：
     * <pre>
     *      {SITE_NAME} : 站点名称
     *      {nickname}  : 当前用户名称
     *      {email}     : 用户电子邮件
     *      {code}      : 验证码
     *      {newPassword}: 新密码
     *      {useTraffic}: 已用流量
     *      {transfer}  : 总流量
     *      {expireTime}: 到期时间
     *      {REGISTER_URL}: 注册校验链接
     * </pre>
     * @param $content
     * @param $params array
     * @return string
     */
    public static function placeholderReplace($content, $params)
    {
        if($params['REGISTER_URL']!=null) {
            $url = BASE_URL . 'auth/verification?verification=' . urlencode($params['REGISTER_URL']);
            $params['REGISTER_URL'] = "<a href=\"{$url}\" target=\"_blank\" title=\"点击校验您的账户并完成注册！\">{$url}</a>";
        }
        // 替换
        $content = str_replace(
            ['{SITE_NAME}', '{nickname}', '{email}', '{code}', '{newPassword}', '{useTraffic}', '{transfer}', '{expireTime}', '{REGISTER_URL}'],
            [SITE_NAME, $params['nickname'], $params['email'], $params['code'], $params['newPassword'], $params['useTraffic'], $params['transfer'], $params['expireTime'], $params['REGISTER_URL']],
            $content);

        return $content;
    }


    public static function getShortName(&$class)
    {
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