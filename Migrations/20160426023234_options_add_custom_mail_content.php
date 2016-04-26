<?php

use Phinx\Migration\AbstractMigration;

class OptionsAddCustomMailContent extends AbstractMigration
{
    public function up()
    {
        // 2016-04-26 add custom mail content.
        $option = [
            [
                'k'     =>  'custom_mail_stop_expire_content',
                'v'     =>  '您的账户已用流量 {useTraffic}, 账户到期时间为 {expireTime} 已经被停止使用<br/><br/>Yours, The {SITE_NAME} Team'
            ], [
                'k'     =>  'custom_mail_forgePassword_content',
                'v'     =>  'Dear {nickname}:<br/>Use this code to disable your password and access your {SITE_NAME} account:<br/>(这个验证码是用于停止您当前 {SITE_NAME} 所在账户的旧密码):<br/><br/>Code: {code}<br/><br/><b>请将验证码在找回密码页面输入才能确认重置密码！</b><br/>Yours,The {SITE_NAME} Team'
            ],[
                'k'     =>  'custom_mail_forgePassword_content_2',
                'v'     =>  'Dear {nickname}:<br/>Here\'s your new password<br/>(这是你的新密码)<br/><br/>Password: {newPassWord}<br/><br/><b>ATTENTION: PLEASE CHANGE THE PASSWORD AND DELETE THIS EMAIL IMMEDIATELY ALTER LOG IN YOUR ACCOUNT FOR SECURITY PURPOSES.</b><b>请在登录后立即修改密码，并且删除此邮件.</b><br/><br/>Yours, The {SITE_NAME} Team'
            ], [
                'k'     =>  'custom_mail_register_content',
                'v'     =>  'Dear {nickname}:<br/>this is your registration email for {SITE_NAME} Service.<br/><br/>Yours, The {SITE_NAME} Team'
            ]
        ];

        $this->execute("DELETE FROM `options` WHERE `k` LIKE '%custom_mail_%'");
        $this->insert('options', $option);
    }
}
