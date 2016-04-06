<?php

use Phinx\Migration\AbstractMigration;

class CronDefaultDb extends AbstractMigration
{
    public function up()
    {
        $rows = [
            [
                'id'     =>  'clearInviteOld',
                'enable' =>  0,
                'nextrun'=>  time(),
                'order'  =>  110
            ],[
                'id'     =>  'clearTransfer',
                'enable' =>  1,
                'nextrun'=>  time(),
                'order'  =>  10
            ],[
                'id'     =>  'daily',
                'enable' =>  0,
                'nextrun'=>  time(),
                'order'  =>  100
            ],[
                'id'     =>  'mail',
                'enable' =>  0,
                'nextrun'=>  time(),
                'order'  =>  80
            ],[
                'id'     =>  'stopExpireUser',
                'enable' =>  1,
                'nextrun'=>  time(),
                'order'  =>  30
            ],
        ];

        $this->insert('cron', $rows);
    }
}
