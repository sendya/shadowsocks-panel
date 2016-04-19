<?php

use Phinx\Migration\AbstractMigration;

class MailQueue extends AbstractMigration
{
    public function change()
    {
        $this->table("mail_queue", array('comment' => '邮件发送列队'))
            ->addColumn('to', 'string', ['limit' => 255, 'comment' => '接收用户邮箱'])
            ->addColumn('subject', 'string', ['limit' => 255, 'comment' => '标题'])
            ->addColumn('content', 'text', ['comment' => '邮件内容'])
            ->create();
    }
}
