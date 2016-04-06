<?php

use Phinx\Migration\AbstractMigration;

class NodeDefaultDb extends AbstractMigration
{
    public function up()
    {
        $rows = [
            [
                'name' => 'Suki-S1', 'type' => 0, 'server' => 'server1.shadowsocks.org', 'method' => 'aes-128-cfb', 'info' => '节点说明', 'order' => 1
            ],[
                'name' => 'Suki-S2', 'type' => 1, 'server' => 'server1.shadowsocks.org', 'method' => 'aes-256-cfb', 'info' => 'VIP节点', 'order' => 1
            ]
        ];
        $this->insert('node', $rows);
    }
}
