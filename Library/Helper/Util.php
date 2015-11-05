<?php
/**
 * KK SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Helper;

class Util {

    public static function MailFormatCheck($chkMailAddress) {
      $pattern = "/^([0-9A-Za-z\\-_\\.]+)@([0-9a-z]+\\.[a-z]{2,3}(\\.[a-z]{2})?)$/i";
      if(!preg_match($pattern, $chkMailAddress))
        return "邮箱地址格式不正确";
      if(stristr($chkMailAddress, "qq.com")!=false)
        return "该邮箱地址不被支持,请更换";
      if(\Model\User::GetUserByEmail($chkMailAddress)!=false)
        return "邮箱地址已经被注册使用";
      return null;
    }


}
