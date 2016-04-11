<?php

use Phinx\Migration\AbstractMigration;

class CardDefaultDb extends AbstractMigration
{
    public function up()
    {
        $rows = [
            [
                'card'      =>  '0dba460855d8562294c1f761dd477014',
                'add_time'  =>  time(),
                'type'      =>  '0',
                'info'      =>  'B',
                'status'    =>  1
            ],[
                'card'      =>  'd1aa89e8002275fa586501ddbe77b4b0',
                'add_time'  =>  time(),
                'type'      =>  '1',
                'info'      =>  '100',
                'status'    =>  1
            ]
        ];

        $this->insert('card', $rows);

    }
}
