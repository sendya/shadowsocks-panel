<?php

use Phinx\Migration\AbstractMigration;
use Phinx\Db\Adapter\MysqlAdapter;

class CardTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('card', ['comment' => '卡片表（套餐卡/流量卡）']);
        $table->addColumn('card', 'string', ['limit'=> 60, 'comment'=> '卡号，不重复'])
            ->addColumn('add_time', 'integer', ['null'=> true])
            ->addColumn('type', 'integer', ['limit'=> MysqlAdapter::INT_TINY, 'default'=> 0, 'comment'=> '类型 0-套餐卡 1-流量卡 2-测试卡'])
            ->addColumn('info', 'string', ['limit'=> 256])
            ->addColumn('pram1', 'string', ['comment'=> '保留字段', 'null'=> true])
            ->addColumn('status', 'integer', ['limit'=> MysqlAdapter::INT_TINY, 'default'=> 1, 'comment'=> '卡状态 0-失效 1-可用'])
            ->addIndex(['card'],['unique'=> true])
            ->addIndex(['id', 'card'],[])
            ->create();
    }
}
