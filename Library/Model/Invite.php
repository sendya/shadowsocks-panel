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

    public $id;//邀请码id
    public $uid; //邀请码归属用户uid
    public $dateLine;//创建该 invite 时间
    public $expiration;//invite 有效期 (单位:天)
    public $inviteIp;//invite 创建者ip
    public $invite;//邀请码 ( create index)
    public $reguid;//使用该邀请码注册的用户uid
    public $regDateLine;//使用该 invite 时间
    public $status;//invite状态 (0-未使用, 1-已用, -1过期)

    /**
     * Get a invite by invite
     * @param $email string Email address
     * @return User
     */
    public static function GetInviteById($id)
    {
        $statement = Database::prepare("SELECT * FROM invite WHERE id=?");
        $statement->bindValue(1, $id);
        $statement->execute();
        $statement->setFetchMode(\PDO::FETCH_CLASS, '\\Model\\Invite');
        return $statement->fetch(\PDO::FETCH_CLASS);
    }

    public static function GetInvitesByUid($uid, $status)
    {
        $inviteList = null;
        $selectSQL = "SELECT * FROM invite WHERE 1=1 ";
        if (isset($uid) && "-1" != $uid) $selectSQL .= "AND uid={$uid} ";
        if (isset($status) && "" != $status) $selectSQL .= "AND status={$status} ";
        $selectSQL .= "ORDER BY dateLine DESC";

        try {
            $statement = Database::prepare($selectSQL);
            $statement->execute();
            $inviteList = $statement->fetchAll(\PDO::FETCH_CLASS, '\\Model\\Invite');
        } catch (\PDOException $e) {
            $e->getMessage();
        }
        return $inviteList;
    }


    /**
     * 取总邀请码数
     * @return mixed
     */
    public static function GetInvitesCount()
    {
        $inviteCount = 0;
        try {
            $statement = Database::prepare("SELECT count(*) FROM invite");
            $statement->execute();
            $inviteCount = $statement->fetch(\PDO::FETCH_NUM);
        } catch (\PDOException $e) {
            $e->getMessage();
        }
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
        $statement->bindValue(':dateLine', $this->dateLine, \PDO::PARAM_STR);
        $statement->bindValue(':expiration', $this->expiration, \PDO::PARAM_INT);
        $statement->bindValue(':inviteIp', $this->inviteIp, \PDO::PARAM_STR);
        $statement->bindValue(':invite', $this->invite, \PDO::PARAM_STR);
        $statement->bindValue(':reguid', $this->reguid, \PDO::PARAM_STR);
        $statement->bindValue(':regDateLine', $this->regDateLine, \PDO::PARAM_STR);
        $statement->bindValue(':status', $this->status, \PDO::PARAM_INT);
        $statement->execute();
        $this->id = Database::lastInsertId();
        if (!$inTransaction) {
            Database::commit();
        }
        return $this->id;
    }

    public static function deleteInvite($codeId)
    {
        try {
            $statement = Database::prepare("DELETE * FROM invite WHERE id=:id");
            $statement->bindValue(':id', $codeId, \PDO::PARAM_INT);
            Database::commit();
        } catch (\PDOException $e) {
            Database::rollBack();
            $e->getMessage();
        }
    }

    public function updateInvite()
    {
        $statement = null;
        try {
            $statement = Database::prepare("UPDATE invite SET expiration=0,
				`reguid`=:reguid, `regDateLine`=:regDateLine, `status`=:status WHERE id=:id");
            $statement->bindValue(':reguid', $this->reguid, \PDO::PARAM_INT);
            $statement->bindValue(':regDateLine', $this->regDateLine, \PDO::PARAM_STR);
            $statement->bindValue(':status', $this->status, \PDO::PARAM_INT);
            $statement->execute();
            Database::commit();
        } catch (\PDOException $e) {
            //$statement->rollBack();
            Database::rollBack();
            $e->getMessage();
        }
    }


}
