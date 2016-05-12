<?php

use Phinx\Migration\AbstractMigration;

class UpdateVersion113 extends AbstractMigration
{
    public function change()
    {
        $option = [
            [   'k'     =>  'version',
                'v'     =>  'v1.10'
            ], [
                'k'     =>  'custom_mail_verification_content',
                'v'     =>  '您好<br/>欢迎您在 {SITE_NAME} 注册账户，请点击以下链接确认您的账户并完成注册：<br/>{REGISTER_URL}<br/><br/>Yours, The {SITE_NAME} Team'
            ]
        ];
        $this->execute("DELETE FROM `options` WHERE `k` = 'version'");
        $this->execute("DELETE FROM `options` WHERE `k`='custom_mail_verification_content'");
        $this->insert('options', $option);

    }
}
