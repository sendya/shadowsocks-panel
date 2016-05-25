<?php

use Phinx\Db\Adapter\MysqlAdapter;
use Phinx\Migration\AbstractMigration;

class UpdateVersion113 extends AbstractMigration
{
    public function change()
    {
        $cron_table = $this->table('cron');
        $cron_column = $cron_table->hasColumn('system');
        if(!$cron_column) {
            $cron_table->addColumn('system', 'integer', ['after'=> 'enable', 'limit' => MysqlAdapter::INT_TINY, 'default'=> 0, 'comment' => '0-普通 1-系统']);
        }
        $cron_column = $cron_table->hasColumn('remark');
        if(!$cron_column) {
            $cron_table->addColumn('remark', 'string', ['after'=> 'enable', 'limit' => 100, 'null' => true, 'comment' => '计划任务备注说明']);
        }
        $cron_table->update();

        $this->execute("DELETE FROM `cron` WHERE `id` = 'clearInviteOld'");
        $this->execute("DELETE FROM `cron` WHERE `id` = 'clearLogs'");

        $rows = [['id' => 'clearLogs', 'enable' => 1, 'system' => 0, 'remark' => '清理系统无用数据', 'nextrun' => time(), 'order' => 110]];
        $this->insert('cron', $rows);

        $this->execute("UPDATE `cron` SET remark='[系统]邮件列队，每分钟执行', `system`=1, enable=1 WHERE `id`='mail'");
        $this->execute("UPDATE `cron` SET remark='自动停止超流/到期用户' WHERE `id`='stopExpireUser'");
        $this->execute("UPDATE `cron` SET remark='每月首自动清零使用流量' WHERE `id`='clearTransfer'");

        $option = [
             [
                'k'     =>  'custom_mail_verification_content',
                'v'     =>  '您好<br/>欢迎您在 {SITE_NAME} 注册账户，请点击以下链接确认您的账户并完成注册：<br/>{REGISTER_URL}<br/><br/>Yours, The {SITE_NAME} Team'
            ]
        ];
        $this->execute("DELETE FROM `options` WHERE `k`='custom_mail_verification_content'");
        $this->insert('options', $option);

    }
}
