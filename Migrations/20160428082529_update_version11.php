<?php

use Helper\Utils;
use Phinx\Db\Adapter\MysqlAdapter;
use Phinx\Migration\AbstractMigration;

class UpdateVersion11 extends AbstractMigration
{
	public function change()
	{
        $table = $this->table('cron');
        $table->addColumn('system', 'integer', ['after'=> 'enable', 'limit' => MysqlAdapter::INT_TINY, 'default'=> 0, 'comment' => '0-普通 1-系统']);
        $table->addColumn('remark', 'string', ['after'=> 'enable', 'limit' => 100, 'null' => true, 'comment' => '计划任务备注说明']);
        $table->update();

        // 2016-04-28 update version - by Sendya
        $option = [
        	['k'=>'version', 'v'=>'v1.10'],
        	['k'=>'SYSTEM_API_KEY', 'v'=> password_hash(Utils::randomChar(12) . time(), PASSWORD_BCRYPT)]
        ];

        $this->execute("DELETE FROM `options` WHERE `k` = 'version'");
        $this->insert('options', $option);

        $this->execute("DELETE FROM `cron` WHERE `id` = 'clearInviteOld'");
        $rows = [['id' => 'clearLogs', 'enable' => 1, 'system' => 0, 'remark' => '清理系统无用数据', 'nextrun' => time(), 'order' => 110]];
        $this->insert('cron', $rows);

        $this->execute("UPDATE `cron` SET remark='[系统]邮件列队，每分钟执行', `system`=1 WHERE `id`='mail'");
        $this->execute("UPDATE `cron` SET remark='自动停止超流/到期用户' WHERE `id`='stopExpireUser'");
        $this->execute("UPDATE `cron` SET remark='每月首自动清零使用流量' WHERE `id`='clearTransfer'");
	}
}
