<?php

use Phinx\Db\Adapter\MysqlAdapter;
use Phinx\Migration\AbstractMigration;

class UpdateTo1193 extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('node');
        $column = $table->hasColumn('ratio');
        if(!$column) {
            $table->addColumn('ratio', 'integer', ['limit' => MysqlAdapter::INT_TINY, 'default' => 1, 'comment' => '节点流量倍率']);
            $table->save();
        }
    }
}
