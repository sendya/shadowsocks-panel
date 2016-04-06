<?php

use Phinx\Migration\AbstractMigration;

class CronDefaultDb extends AbstractMigration
{
    public function up()
    {
        $columns = ['id', 'enable', 'nextrun', 'order'];
        $rows = [
            [
                'clearInviteOld', 0, time(), 110
            ], [
                'clearTransfer', 1, time(), 10
            ], [
                'daily', 0, time(), 100
            ], [
                'mail', 0, time(), 80
            ], [
                'stopExpireUser', 1, time(), 30
            ]
        ];

        $table = $this->table('cron');
        $table->insert($columns, $rows)
            ->save();
    }
}
