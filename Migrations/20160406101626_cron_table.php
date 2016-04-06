<?php

use Phinx\Migration\AbstractMigration;

class CronTable extends AbstractMigration
{
    public function change()
    {
        $this->table("cron", array('id' => false, 'comment' => '计划任务', 'primary_key' => ['id']))
            ->addColumn('id', 'string', ['limit' => 40])
            ->addColumn('enable', 'integer', ['limit' => 1])
            ->addColumn('nextrun', 'integer', ['limit' => 11])
            ->addColumn('order', 'integer', ['limit' => 1])
            ->addIndex(['id', 'nextrun'],[])
            ->create();
    }
}
