<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Helper;

class Util
{

    const KB = 1024, MB = 1048576, GB = 1073741824;

    public static function MailFormatCheck($chkMailAddress)
    {
        $pattern = "/^([0-9A-Za-z\\-_\\.]+)@([0-9a-z]+\\.[a-z]{2,3}(\\.[a-z]{2})?)$/i";
        if (!preg_match($pattern, $chkMailAddress))
            return "邮箱地址格式不正确";
        if (stristr($chkMailAddress, "qq.com") != false)
            return "该邮箱地址不被支持,请更换";
        if (\Model\User::GetUserByEmail($chkMailAddress) != false)
            return "邮箱地址已经被注册使用";
        return null;
    }

    public static function ToKB($value)
    {
        return $value / KB;
    }

    public static function ToMB($value)
    {
        return $value / MB;
    }

    public static function ToGB($value)
    {
        return $value / GB;
    }

    public static function FlowAutoShow($value)
    {
        if ($value > KB) {
            echo round($value / KB, 2);
            echo "GB";
        } else if ($value > MB) {
            echo round($value / MB, 2);
            echo "MB";
        } else if ($value > GB) {
            echo round($value / GB, 2);
            echo "KB";
        } else {
            echo round($value, 2);
            echo "";
        }
    }

    public static function CheckHtml($html)
    {
        $html = stripslashes($html);

        preg_match_all("/<([^<]+)>/is", $html, $ms);
        $searchs[] = '<';
        $replaces[] = '<';
        $searchs[] = '>';
        $replaces[] = '>';
        if ($ms[1]) {
            $allowtags = 'img|a|font|div|table|tbody|caption|tr|td|th|br
						|p|b|strong|i|u|em|span|ol|ul|li|blockquote
						|object|param|embed';//允许的标签
            $ms[1] = array_unique($ms[1]);
            foreach ($ms[1] as $value) {
                $searchs[] = "<" . $value . ">";
                $value = shtmlspecialchars($value);
                $value = str_replace(array('/', '/*'), array('.', '/.'), $value);
                $skipkeys = array(
                    'onabort', 'onactivate', 'onafterprint', 'onafterupdate',
                    'onbeforeactivate', 'onbeforecopy', 'onbeforecut',
                    'onbeforedeactivate', 'onbeforeeditfocus', 'onbeforepaste',
                    'onbeforeprint', 'onbeforeunload', 'onbeforeupdate',
                    'onblur', 'onbounce', 'oncellchange', 'onchange',
                    'onclick', 'oncontextmenu', 'oncontrolselect',
                    'oncopy', 'oncut', 'ondataavailable',
                    'ondatasetchanged', 'ondatasetcomplete', 'ondblclick',
                    'ondeactivate', 'ondrag', 'ondragend',
                    'ondragenter', 'ondragleave', 'ondragover',
                    'ondragstart', 'ondrop', 'onerror', 'onerrorupdate',
                    'onfilterchange', 'onfinish', 'onfocus', 'onfocusin',
                    'onfocusout', 'onhelp', 'onkeydown', 'onkeypress',
                    'onkeyup', 'onlayoutcomplete', 'onload',
                    'onlosecapture', 'onmousedown', 'onmouseenter',
                    'onmouseleave', 'onmousemove', 'onmouseout',
                    'onmouseover', 'onmouseup', 'onmousewheel',
                    'onmove', 'onmoveend', 'onmovestart', 'onpaste',
                    'onpropertychange', 'onreadystatechange', 'onreset',
                    'onresize', 'onresizeend', 'onresizestart',
                    'onrowenter', 'onrowexit', 'onrowsdelete',
                    'onrowsinserted', 'onscroll', 'onselect',
                    'onselectionchange', 'onselectstart', 'onstart',
                    'onstop', 'onsubmit', 'onunload', 'javascript',
                    'script', 'eval', 'behaviour', 'expression',
                    'style', 'class'
                );
                $skipstr = implode('|', $skipkeys);
                $value = preg_replace(array("/($skipstr)/i"), '.', $value);
                if (!preg_match("/^[/|s]?($allowtags)(s+|$)/is", $value)) {
                    $value = '';
                }
                $replaces[] = empty($value) ? '' : "<" . str_replace('"', '"', $value) . ">";
            }
        }
        $html = str_replace($searchs, $replaces, $html);

        $html = addslashes($html);
        return $html;
    }

    //获取随机字符串
    public static function GetRandomChar($length = 8)
    {
        // 密码字符集，可任意添加你需要的字符
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $char = '';
        for ($i = 0; $i < $length; $i++) {
            $char .= $chars[mt_rand(0, strlen($chars) - 1)];
        }
        return $char;
    }

    public static function GetRandomPwd()
    {
        return htmlspecialchars(GetRandomChar(8), ENT_QUOTES, 'UTF-8');
    }

    //Gravatar
    public static function GetGravatar( $email, $s = 80, $d = 'mm', $r = 'g', $img = false, $atts = array() ) {
        $host = array(
            '//gravatar0.ifdream.net/avatar/',
            '//www.gravatar.com/avatar/',
            '//cdn.css.net/avatar/',
            'http://ruby-china.org/',
            'http://gravatar.duoshuo.com/'
        ); // 前三个支持https
        $url = $host[2];
        $url .= md5( strtolower( trim( $email ) ) );
        $url .= "?s=$s&d=$d&r=$r";
        if ( $img ) {
            $url = '<img src="' . $url . '"';
            foreach ( $atts as $key => $val )
                $url .= ' ' . $key . '="' . $val . '"';
            $url .= ' />';
        }
        return $url;
    }

    // ----- get value
    public static function GetKB() {return KB;}
    public static function GetMB() {return MB;}
    public static function GetGB() {return GB;}

}
