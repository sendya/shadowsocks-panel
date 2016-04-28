<?php

use Phinx\Db\Adapter\MysqlAdapter;
use Phinx\Migration\AbstractMigration;

class CreateTable extends AbstractMigration
{
    public function change()
    {
        $this->table("cron", array('id' => false, 'comment' => '计划任务', 'primary_key' => ['id']))
            ->addColumn('id', 'string', ['limit' => 40])
            ->addColumn('enable', 'integer', ['limit' => 1])
            ->addColumn('nextrun', 'integer', ['limit' => 11])
            ->addColumn('order', 'integer', ['limit' => 1])
            ->addIndex(['id', 'nextrun'],[])
            ->create();

        $this->table("admin", array('comment' => '管理员权限表'))
            ->addColumn('uid', 'integer', ['limit' => 11, 'comment' => '用户id'])
            ->create();

        $this->table("options", array('id' => false, 'comment' => '系统设置', 'primary_key' => ['k']))
            ->addColumn('k', 'string', ['limit' => 64])
            ->addColumn('v', 'string', ['limit' => 1500, 'null' => true])
            ->addIndex(['k'], ['unique' => true])
            ->create();

        $this->table("invite", array('comment' => '邀请码'))
            ->addColumn('uid', 'integer', ['limit' => 10, 'default' => -1])
            ->addColumn('dateLine', 'integer', ['limit' => 11, 'default' => 0])
            ->addColumn('expiration', 'integer', ['limit' => 3])
            ->addColumn('inviteIp', 'string', ['limit' => 32, 'null' => true])
            ->addColumn('invite', 'string', ['limit' => 60])
            ->addColumn('reguid', 'integer', ['limit' => 10, 'null' => true])
            ->addColumn('regDateLine', 'integer', ['limit' => 11, 'default' => 0])
            ->addColumn('plan', 'string', ['limit' => 4, 'default' => 'A'])
            ->addColumn('status', 'integer', ['limit' => MysqlAdapter::INT_TINY, 'comment' => '-1过期 0-未使用 1-已用'])
            ->addIndex(['invite'], ['unique' => true])
            ->addIndex(['invite', 'uid'], [])
            ->create();

        $this->table('node', ['comment' => '节点表'])
            ->addColumn('name', 'string', ['limit' => 50])
            ->addColumn('type', 'integer', ['limit' => MysqlAdapter::INT_TINY, 'default' => 0, 'comment' => '类型 0 普通节点, 1 VIP节点'])
            ->addColumn('server', 'string')
            ->addColumn('method', 'string', ['limit' => 32])
            ->addColumn('info', 'string', ['null' => true])
            ->addColumn('status', 'string', ['limit' => 32, 'default' => '可用', 'comment' => '节点状态描述'])
            ->addColumn('order', 'integer', ['default' => 1])
            ->create();

        $this->table('member', ['id' => 'uid', 'signed' => true, 'comment' => '用户信息表'])
            ->addColumn('email', 'string', ['limit' => 64])
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

        $this->table('message', ['comment' => '系统消息表'])
            ->addColumn('content', 'string', ['limit' => 512, 'null' => true])
            ->addColumn('pushTime', 'integer', ['default' => 0])
            ->addColumn('addTime', 'integer', ['default' => 0])
            ->addColumn('pushUsers', 'string', ['limit' => 500,'null' => true, 'default' => '-1', 'comment' => '消息推送给用户，空或 -1将推送给所有用户'])
            ->addColumn('type', 'integer', ['default' => 0, 'comment' => '消息类型：-3 套餐处说明 -2 系统公告 -1 重复推送，0 正常消息，大于0 推送次数'])
            ->addColumn('pushEndTime', 'integer', ['default' => 0])
            ->addColumn('order', 'integer', ['default' => 1])
            ->addColumn('enable', 'integer', ['default' => 0, 'limit' => MysqlAdapter::INT_TINY])
            ->addIndex(['id', 'type'],[])
            ->create();

        $this->table('card', ['comment' => '卡片表（套餐卡/流量卡）'])
            ->addColumn('card', 'string', ['limit'=> 60, 'comment'=> '卡号，不重复'])
            ->addColumn('add_time', 'integer', ['null'=> true])
            ->addColumn('type', 'integer', ['limit'=> MysqlAdapter::INT_TINY, 'default'=> 0, 'comment'=> '类型 0-套餐卡 1-流量卡 2-测试卡'])
            ->addColumn('info', 'string', ['limit'=> 256])
            ->addColumn('pram1', 'string', ['comment'=> '保留字段', 'null'=> true])
            ->addColumn('status', 'integer', ['limit'=> MysqlAdapter::INT_TINY, 'default'=> 1, 'comment'=> '卡状态 0-失效 1-可用'])
            ->addIndex(['card'],['unique'=> true])
            ->addIndex(['id', 'card'],[])
            ->create();

        $this->table("mail_queue", array('comment' => '邮件发送列队'))
            ->addColumn('to', 'string', ['limit' => 255, 'comment' => '接收用户邮箱'])
            ->addColumn('subject', 'string', ['limit' => 255, 'comment' => '标题'])
            ->addColumn('content', 'text', ['comment' => '邮件内容'])
            ->create();

    }
}
