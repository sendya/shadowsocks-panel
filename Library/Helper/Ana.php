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
     * Get all user count
     * @return int
     */
    public static function GetUserCount() {

        $selectSQL = "SELECT count(*) FROM member";
        $statement = Database::prepare($selectSQL);
        $statement->execute();
        $userCount = $statement->fetch(\PDO::FETCH_NUM);
        return $userCount[0]==null ? 0 : $userCount[0];
    }

    /**
     * Get today user checkin
     * @return int
     */
    public static function GetCheckUserCount() {

        $statement = Database::prepare("SELECT count(*) FROM member WHERE lastCheckinTime > " . date('Y-m-d 00:00:00', time()));
        $statement->execute();
        $checkCount = $statement->fetch(\PDO::FETCH_NUM);
        return $checkCount[0]==null ? 0 : $checkCount[0];
    }

    /**
     * Get now conn user
     * @return int
     */
    public static function GetConnCount() {

        $statement = Database::prepare("SELECT count(*) FROM member WHERE lastConnTime > " . time()-600);
        $statement->execute();
        $connCount = $statement->fetch(\PDO::FETCH_NUM);
        return $connCount[0]==null ? 0 : $connCount[0];
    }

    /**
     * Get transfer for all
     * @return mixed
     */
    public static function GetTransfer4All() {

        $selectSQL = "SELECT (sum(flow_up) + sum(flow_down)) AS transferAll  FROM member";
        $statement = Database::prepare($selectSQL);
        $statement->execute();
        $transfer = $statement->fetch(\PDO::FETCH_NUM);
        $transfer = $transfer[0]==null ? 0 : $transfer[0];
        return $transfer;
    }

    /**
     * Get use user count
     * @return int
     */
    public static function GetUseUserCount() {

        $statement = Database::prepare("SELECT count(*) FROM member WHERE lastConnTime > 0");
        $statement->execute();
        $count =$statement->fetch(\PDO::FETCH_NUM);
        return $count[0]==null ? 0 : $count[0];
    }

}