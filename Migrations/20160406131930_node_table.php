<?php

use Phinx\Migration\AbstractMigration;
use Phinx\Db\Adapter\MysqlAdapter;

class NodeTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('node', ['comment' => '节点表']);
        $table->addColumn('name', 'string', ['limit' => 50])
            ->addColumn('type', 'integer', ['limit' => MysqlAdapter::INT_TINY, 'default' => 0, 'comment' => '类型 0 普通节点, 1 VIP节点'])
            ->addColumn('server', 'string')
            ->addColumn('method', 'string', ['limit' => 32])
            ->addColumn('info', 'string', ['null' => true])
            ->addColumn('status', 'string', ['limit' => 32, 'default' => '可用', 'comment' => '节点状态描述'])
            ->addColumn('order', 'integer', ['default' => 1])
            ->create();
    }
}
