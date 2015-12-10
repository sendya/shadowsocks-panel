<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Helper;


use Core\Database;

class Ana
{

    /**
     *
     * @return array ["userCount", "checkCount", "connCount"]
     */
    public static function getAnaCount() {
        $data = array();

        // user count
        $selectSQL = "SELECT count(*) FROM member";
        $statement = Database::prepare($selectSQL);
        $statement->execute();
        $userCount = $statement->fetch(\PDO::FETCH_NUM);
        $data['userCount'] = $userCount[0];
        // check user
        $statement = Database::prepare("SELECT count(*) FROM member WHERE lastCheckinTime > " . date('Y-m-d 00:00:00', time()));
        $statement->execute();
        $checkCount = $statement->fetch(\PDO::FETCH_NUM);
        $data['checkCount'] = $checkCount[0];

        $statement = Database::prepare("SELECT count(*) FROM member WHERE lastConnTime > " . time()-600);
        $statement->execute();
        $connCount = $statement->fetch(\PDO::FETCH_NUM);
        $data['connCount'] = $connCount[0];
        return $data;
    }

}