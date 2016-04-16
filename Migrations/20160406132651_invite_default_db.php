<?php

use Phinx\Migration\AbstractMigration;

class InviteDefaultDb extends AbstractMigration
{
    public function up()
    {
        $rows = [
            [
                'uid' => -1, 'dateLine' => time(), 'expiration' => 10, 'inviteIp' => '127.0.0.1', 'invite' => '334ab1a9fbc19b4c688ca7fd5f8f9ffa', 'regDateLine' => 0, 'plan' => 'VIP', 'status' => 0
            ],[
                'uid' => 1, 'dateLine' => time(), 'expiration' => 10, 'inviteIp' => '127.0.0.1', 'invite' => '0914e68a1527352c5c6ccee132e303eb', 'regDateLine' => 0, 'plan' => 'VIP', 'status' => 0
            ]
        ];
        $this->insert('invite', $rows);
    }
}
