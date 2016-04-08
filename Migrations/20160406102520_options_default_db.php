<?php

use Phinx\Migration\AbstractMigration;

class OptionsDefaultDb extends AbstractMigration
{
    public function up()
    {
        $options = [
            [
                'k'     =>  'update_notification',
                'v'     =>  '1'
            ],[
                'k'     =>  'version',
                'v'     =>  'v0.41'
            ],[
                'k'     =>  'current_port',
                'v'     =>  '5000'
            ],[
                'k'     =>  'user_test_day',
                'v'     =>  '7'
            ],[
                'k'     =>  'check_transfer_min',
                'v'     =>  '10'
            ],[
                'k'     =>  'check_transfer_max',
                'v'     =>  '50'
            ],[
                'k'     =>  'custom_plan_name',
                'v'     =>  '{"A":"\u514d\u8d39\u7528\u6237","B":"\u666e\u901a\u7528\u6237","C":"\u9ad8\u7ea7\u7528\u6237","D":"\u8d85\u7ea7\u7528\u6237","VIP":"\u7279\u6743\u4f1a\u5458"}'
            ]
        ];

        $this->insert('options', $options);
    }
}
