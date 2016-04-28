<?php

use Phinx\Db\Adapter\MysqlAdapter;
use Phinx\Migration\AbstractMigration;

class TableUpdate extends AbstractMigration
{
    public function change()
    {

        $table = $this->table('member');
        $table->addColumn('method', 'string', ['after'=> 'port', 'limit'=>32, 'null'=>true]);
        $table->update();

        $table = $this->table('node');
        $table->addColumn('custom_method', 'integer', ['after'=> 'status', 'limit' => MysqlAdapter::INT_TINY, 'default'=> 0, 'comment' => '0-不可自定义 1-可自定义']);
        $table->update();
    }
}
