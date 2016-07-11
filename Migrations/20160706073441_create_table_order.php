<?php

use Phinx\Migration\AbstractMigration;

class CreateTableOrder extends AbstractMigration
{
    public function change()
    {
        $this->table("orders", array( 'comment' => '订单id'))
            ->addColumn('createTime', 'integer', ['limit' => 1])
            ->addColumn('nextrun', 'integer', ['limit' => 11])
            ->addColumn('status', 'integer', ['limit' => 1])
            ->addIndex(['id', 'nextrun'],[])
            ->create();
    }
}
