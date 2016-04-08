<?php

use Phinx\Migration\AbstractMigration;
use Phinx\Db\Adapter\MysqlAdapter;

class MemberTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('member', ['id' => 'uid', 'signed' => true, 'comment' => '用户信息表']);
        $table->addColumn('email', 'string', ['limit' => 64])
            ->addColumn('nickname', 'string', ['limit' => 64])
            ->addColumn('password', 'string', ['limit' => 60])
            ->addColumn('sspwd', 'string', ['limit' => 32])
            ->addColumn('port', 'integer', ['limit' => 5, 'null' => true, 'signed' => true])
            ->addColumn('flow_up', 'integer', ['limit' => MysqlAdapter::INT_BIG, 'default' => 0])
            ->addColumn('flow_down', 'integer', ['limit' => MysqlAdapter::INT_BIG, 'default' => 0])
            ->addColumn('transfer', 'integer', ['limit' => MysqlAdapter::INT_BIG, 'default' => 0])
            ->addColumn('plan', 'string', ['limit' => 4, 'default' => 'A'])
            ->addColumn('enable', 'integer', ['limit' => MysqlAdapter::INT_TINY, 'default' => 1])
            ->addColumn('money', 'float', ['default' => 0.00, 'null' => true])
            ->addColumn('invite', 'string', ['limit' => 60])
            ->addColumn('invite_num', 'integer', ['default' => 0])
            ->addColumn('regDateLine', 'integer', ['null' => true])
            ->addColumn('lastConnTime', 'integer', ['null' => true])
            ->addColumn('lastCheckinTime', 'integer', ['null' => true])
            ->addColumn('lastFindPasswdTime', 'integer', ['null' => true])
            ->addColumn('lastFindPasswdCount', 'integer', ['limit' => MysqlAdapter::INT_TINY, 'null' => true])
            ->addColumn('forgePwdCode', 'string', ['limit' => 50, 'null' => true])
            ->addColumn('payTime', 'integer', ['default' => 0, 'comment' => '上次支付时间'])
            ->addColumn('expireTime', 'integer', ['default' => 0, 'comment' => '到期时间'])
            ->addIndex(['uid', 'email', 'port'],[])
            ->addIndex(['uid', 'flow_up', 'flow_down', 'transfer', 'enable'],[])
            ->create();
    }
}
