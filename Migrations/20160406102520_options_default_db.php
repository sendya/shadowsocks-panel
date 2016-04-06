<?php

use Phinx\Migration\AbstractMigration;

class OptionsDefaultDb extends AbstractMigration
{
    public function up()
    {
        $columns = ['k', 'v'];
        $options = [
            ['update_notification', '1'],
            ['version', 'v0.41']
        ];
        $table = $this->table("options");
        $table->insert($columns, $options);
        $table->saveData();
    }
}
