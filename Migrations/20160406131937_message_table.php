<?php

use Phinx\Migration\AbstractMigration;

class MessageTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('message', ['comment' => '系统消息表']);
        $table->addColumn('content', 'string', ['limit' => 512, 'null' => true])
            ->addColumn('pushTime', 'integer', ['default' => 0])
            ->addColumn('addTime', 'integer', ['default' => 0])
            ->addColumn('pushUsers', 'string', ['limit' => 500,'null' => true, 'default' => '-1', 'comment' => '消息推送给用户，空或 -1将推送给所有用户'])
            ->addColumn('type', 'integer', ['default' => 0, 'comment' => '消息类型：-3 套餐处说明 -2 系统公告 -1 重复推送，0 正常消息，大于0 推送次数'])
            ->addColumn('pushEndTime', 'integer', ['default' => 0])
            ->addColumn('order', 'integer', ['default' => 1])
            ->create();
    }
}
