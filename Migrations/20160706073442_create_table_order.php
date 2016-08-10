<?php

use Phinx\Db\Adapter\MysqlAdapter;
use Phinx\Migration\AbstractMigration;

class CreateTableOrder extends AbstractMigration
{
    public function change()
    {
        if ($this->hasTable("orders")) {
            $this->dropTable("orders");
        }

        $this->table("orders", array( 'comment' => '订单id'))
            ->addColumn('userId', 'integer', ['limit' => 11])
            ->addColumn('createTime', 'integer', ['limit' => 11])
            ->addColumn('type', 'integer', ['limit' => MysqlAdapter::INT_TINY])
            ->addColumn('status', 'integer', ['limit' => MysqlAdapter::INT_TINY])
            ->addColumn('plan', 'string', ['limit' => 4])
            ->addColumn('money', 'integer', ['limit' => 11])
            ->addColumn('remark', 'string', ['limit' => 100])
            ->addIndex(['id', 'status'],[])
            ->create();
    }
}
