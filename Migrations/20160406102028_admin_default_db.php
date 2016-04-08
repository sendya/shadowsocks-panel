<?php

use Phinx\Migration\AbstractMigration;

class AdminDefaultDb extends AbstractMigration
{
    public function up()
    {
        $rows = [
            [
                'id'   => 1,
                'uid'  => 1
            ]
        ];

        $this->insert('admin', $rows);
    }
}
