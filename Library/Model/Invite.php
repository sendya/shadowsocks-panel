<?php
/**
 * SS-Panel
 * A simple bulletin board system
 * Author: Sendya <18x@mloli.com>
 */

namespace Model;

use Core\Database;

class Invite
{

    public $uid; //邀请码归属用户uid   -1代表公共邀请码
    public $dateLine;//创建该 invite 时间 mysql:datetime
    public $expiration;//invite 有效期 (单位:天)
    public $inviteIp;//invite 创建者ip
    public $invite;//邀请码 ( create index) pk
    public $reguid;//使用该邀请码注册的用户uid
    public $regDateLine;//使用该 invite 时间 mysql:datetime
    public $plan; //Invite type
    public $status;//invite状态 (0-未使用, 1-已用, -1过期)

    /**
     *  Get invites by uid
     *  @param $uid int, user id
     *  @param $status int, invite code status (0-Available, 1-unavailable, -1Expired)
     */
    public static function GetInvitesByUid($uid, $status)
    {
        $inviteList = null;
        $selectSQL = "SELECT * FROM invite WHERE 1=1 ";
        if (isset($uid) && "-1" != $uid) $selectSQL .= "AND uid={$uid} ";
        if (isset($status) && "" != $status) $selectSQL .= "AND status={$status} ";
        $selectSQL .= "ORDER BY dateLine DESC";
        $statement = Database::prepare($selectSQL);
        $statement->execute();
        $inviteList = $statement->fetchAll(\PDO::FETCH_CLASS, '\\Model\\Invite');
        return $inviteList;
    }

    /**
     * Get a invite object by invite
     * @param $invite string Invite code
     * @return Invite
     */
    public static function GetInviteByInvite($invite)
    {
        $statement = Database::prepare("SELECT * FROM invite WHERE ivite=?");
        $statement->bindValue(1, $invite);
        $statement->execute();
        $statement->setFetchMode(\PDO::FETCH_CLASS, '\\Model\\Invite');
        return $statement->fetch(\PDO::FETCH_CLASS);
    }

    /**
     * 取总邀请码数
     * @return mixed
     */
    public static function GetInvitesCount()
    {
        $inviteCount = 0;
        $statement = Database::prepare("SELECT count(*) FROM invite");
        $statement->execute();
        $inviteCount = $statement->fetch(\PDO::FETCH_NUM);
        return $inviteCount[0];
    }

    public function insertToDB()
    {
        $inTransaction = Database::inTransaction();
        if (!$inTransaction) {
            Database::beginTransaction();
        }
        $statement = Database::prepare("INSERT INTO invite SET uid=:uid, dateLine=:dateLine, expiration=:expiration, inviteIp=:inviteIp, invite=:invite, reguid=:reguid, regDateLine=:regDateLine, status=:status");
        $statement->bindValue(':uid', $this->uid, \PDO::PARAM_INT);
        $statement->bindValue(':dateLine', $this->dateLine, \PDO::PARAM_INT);
        $statement->bindValue(':expiration', $this->expiration, \PDO::PARAM_INT);
        $statement->bindValue(':inviteIp', $this->inviteIp, \PDO::PARAM_STR);
        $statement->bindValue(':invite', $this->invite, \PDO::PARAM_STR);
        $statement->bindValue(':reguid', $this->reguid, \PDO::PARAM_INT);
        $statement->bindValue(':regDateLine', $this->regDateLine, \PDO::PARAM_INT);
        $statement->bindValue(':status', $this->status, \PDO::PARAM_INT);
        $statement->execute();
        if (!$inTransaction) {
            Database::commit();
        }
        return $this->invite;
    }

    public static function deleteInvite($invite)
    {
        $statement = Database::prepare("DELETE * FROM invite WHERE invite=:invite");
        $statement->bindValue(':invite', $invite, \PDO::PARAM_STR);
        Database::commit();
    }

    public function updateInvite()
    {
        $statement = null;
        $statement = Database::prepare("UPDATE invite SET expiration=:expiration,
			`reguid`=:reguid, `regDateLine`=:regDateLine, `status`=:status WHERE invite=:invite");
        $statement->bindValue(':expiration', $this->expiration, \PDO::PARAM_INT);
        $statement->bindValue(':reguid', $this->reguid, \PDO::PARAM_INT);
        $statement->bindValue(':regDateLine', $this->regDateLine, \PDO::PARAM_INT);
        $statement->bindValue(':status', $this->status, \PDO::PARAM_INT);
        $statement->bindValue(':invite', $this->invite, \PDO::PARAM_STR);
        $statement->execute();
        Database::commit();
    }
}
