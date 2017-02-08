<?php

use Phinx\Db\Adapter\MysqlAdapter;
use Phinx\Migration\AbstractMigration;

class UpdateFix extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('orders');
        $table->renameColumn('userId', 'uid');
        $table->save();
    }
}
