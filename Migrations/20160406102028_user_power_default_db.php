<?php

use Phinx\Migration\AbstractMigration;

class UserPowerDefaultDb extends AbstractMigration
{
    public function up()
    {
        $columns = ['id', 'uid'];
        $rows = [
            [1, 1]
        ];

        $table = $this->table('user_power');
        $table->insert($columns, $rows)
            ->save();
    }
}
