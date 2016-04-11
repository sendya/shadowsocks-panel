<?php

use Phinx\Migration\AbstractMigration;

class OptionsDefaultDbUpdate extends AbstractMigration
{
    public function change()
    {
        // $val = '{"A":"\\u514d\\u8d39\\u7528\\u6237","B":"\\u666e\\u901a\\u7528\\u6237","C":"\\u9ad8\\u7ea7\\u7528\\u6237","D":"\\u8d85\\u7ea7\\u7528\\u6237","VIP":"\\u7279\\u6743\\u4f1a\\u5458",,"Z":"\\u56fa\\u5b9a\\u6d41\\u91cf\\u5957\\u9910"}';
        // $this->execute("UPDATE options SET `v`='" . $val . "' WHERE `k`='custom_plan_name'");
    }
}
