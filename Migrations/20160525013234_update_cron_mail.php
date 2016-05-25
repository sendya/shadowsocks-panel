<?php

use Phinx\Migration\AbstractMigration;

class UpdateCronMail extends AbstractMigration
{
    public function change()
    {
        $this->execute("UPDATE `cron` SET remark='[系统]邮件列队，每分钟执行', `system`=1, enable=1 WHERE `id`='mail'");
    }
}
