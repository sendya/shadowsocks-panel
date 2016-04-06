<?php

use Phinx\Migration\AbstractMigration;

class OptionsTable extends AbstractMigration
{
    public function change()
    {
        $this->table("options", array('id' => false, 'comment' => '系统设置', 'primary_key' => ['k']))
            ->addColumn('k', 'string', ['limit' => 64])
            ->addColumn('v', 'string', ['limit' => 64, 'null' => true])
            ->addIndex(['k'], ['unique' => true])
            ->create();
    }
}
