<?php

use Phinx\Migration\AbstractMigration;

class UserPowerDefaultDb extends AbstractMigration
{
    public function up()
    {
        $rows = [
            [
                'id'   => 1,
                'uid'  => 1
            ]
        ];

        $this->insert('user_power', $rows);
    }
}
