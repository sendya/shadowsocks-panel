<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: kookxiang <r18@ikk.me>
 */
namespace Model;

use Core\Database;
use Helper\Encrypt;

class User {
    const ENCRYPT_TYPE_DEFAULT = 0;
    const ENCRYPT_TYPE_ENHANCE = 1;

    public $uid; //user id (主键)
    public $email;//电子邮件  (主键)
    public $nickname;//昵称,没卵用
    private $password = 'default';//Fuck password
    public $sspwd;// ss连接密码
    public $port;// ss端口
    public $flow_up = 0;//上传流量
    public $flow_down = 0;//下载流量
    public $transfer;//总流量
    public $plan = 'A';//账户类型
    public $enable = 1;//是否启用SS 0不启用 1启用
    public $money = 0;//狗屁用都没的 $
    public $invite = '';//注册所用的邀请码
    public $invite_num = 0;//用户拥有的邀请码
    public $regDateLine = 0;//注册时间
    public $lastConnTime = 0;//上次使用时间
    public $lastCheckinTime = 0;//上次签到时间
    public $lastFindPasswdTime = 0;//上次找回密码时间 (找回密码时间和次数仅用作限制3次或?次后禁止找回)
    public $lastFindPasswdCount = 0;//找回密码次数
    public $forgePwdCode;

    public $gravatar;

    public static $instance;

    /**
     * Get current user object
     * @return User
     */
    public static function getInstance() {
        if (!self::$instance) {
            self::$instance = new self();
            $cookie = Encrypt::decode(base64_decode($_COOKIE['auth']), COOKIE_KEY);
            if ($cookie) {
                list(self::$instance->uid, self::$instance->email, self::$instance->nickname) = explode("\t", $cookie);
            }
        }
        return self::$instance;
    }

    /*
    public function __construct() {
        $cookie = Encrypt::decode(base64_decode($_COOKIE['auth']), COOKIE_KEY);
        if ($cookie) {
            list($this->uid, $this->email, $this->nickname) = explode("\t", $cookie);
        }
    }
    */

    /**
     * Get a user by email
     * @param $email string Email address
     * @return User
     */
    public static function GetUserByEmail($email) {
        $statement = Database::prepare("SELECT * FROM member WHERE email=?");
        $statement->bindValue(1, $email);
        $statement->execute();
        $statement->setFetchMode(\PDO::FETCH_CLASS, '\\Model\\User');
        return $statement->fetch(\PDO::FETCH_CLASS);
    }

    /**
     * Get a user by UserId
     * @param $userId int UserID
     * @return User
     */
    public static function GetUserByUserId($userId) {
        $statement = Database::prepare("SELECT * FROM member WHERE uid=?");
        $statement->bindValue(1, $userId, \PDO::PARAM_INT);
        $statement->execute();
        $statement->setFetchMode(\PDO::FETCH_CLASS, '\\Model\\User');
        return $statement->fetch(\PDO::FETCH_CLASS);
    }

    /**
     * Get User array
     * @param $type
     * @return User[]
     */
    public static function GetUserArray() {
        $userList = null;
        $selectSQL = "SELECT * FROM member ORDER BY uid";
        $statement = Database::prepare($selectSQL);
        $statement->execute();
        $userList = $statement->fetchAll(\PDO::FETCH_CLASS, '\\Model\\User');
        return $userList;
    }

    /**
     * Insert current user into database
     * @return int Auto-generated UserID for this user
     */
    public function insertToDB() {
        $inTransaction = Database::inTransaction();
        if (!$inTransaction) {
            Database::beginTransaction();
        }
        $statement = Database::prepare("INSERT INTO member SET email=:email, `password`=:pwd, sspwd=:sspwd, `port`=:port, nickname=:nickname,
            `flow_up`=:flow_up, `flow_down`=:flow_down, transfer=:transfer, plan=:plan, `enable`=:enable, invite=:invite, regDateLine=:regDateLine");
        $statement->bindValue(':email', $this->email, \PDO::PARAM_STR);
        $statement->bindValue(':pwd', $this->password, \PDO::PARAM_STR);
        $statement->bindValue(':sspwd', $this->sspwd, \PDO::PARAM_STR);
        $statement->bindValue(':port', $this->port, \PDO::PARAM_INT);
        $statement->bindValue(':nickname', $this->nickname, \PDO::PARAM_STR);
        $statement->bindValue(':flow_up', $this->flow_up, \PDO::PARAM_INT);
        $statement->bindValue(':flow_down', $this->flow_down, \PDO::PARAM_INT);
        $statement->bindValue(':transfer', $this->transfer, \PDO::PARAM_INT);
        $statement->bindValue(':plan', $this->plan, \PDO::PARAM_STR);
        $statement->bindValue(':enable', $this->enable, \PDO::PARAM_INT);
        $statement->bindValue(':invite', $this->invite, \PDO::PARAM_INT);
        $statement->bindValue(':regDateLine', $this->regDateLine, \PDO::PARAM_INT);

        $statement->execute();
        $this->uid = Database::lastInsertId();
        if (!$inTransaction) {
            Database::commit();
        }
        return $this->uid;
    }

    /**
     * Verify whether the given password is correct
     * @param string $password Password needs to verify
     * @return bool Whether the password is correct
     */
    public function verifyPassword($password) {
        list($hashedPassword, $encryptType) = explode('T', $this->password);
        if ($encryptType == self::ENCRYPT_TYPE_DEFAULT) {
            return $hashedPassword == md5(ENCRYPT_KEY . md5($password) . ENCRYPT_KEY);
        } elseif ($encryptType == self::ENCRYPT_TYPE_ENHANCE) {
            $salt = substr(md5($this->uid . $this->email . ENCRYPT_KEY), 8, 16);
            return $hashedPassword == substr(md5(md5($password) . $salt), 0, 30);
        }
        return false;
    }

    /**
     * Save new password
     * @param string $password New password
     */
    public function savePassword($password) {
        $salt = substr(md5($this->uid . $this->email . ENCRYPT_KEY), 8, 16);
        $this->password = substr(md5(md5($password) . $salt), 0, 30) . 'T' . self::ENCRYPT_TYPE_ENHANCE;
        $inTransaction = Database::inTransaction();
        if (!$inTransaction) {
            Database::beginTransaction();
        }
        $statement = Database::prepare("UPDATE member SET `password`=:pwd WHERE uid=:userId");
        $statement->bindValue(':pwd', $this->password, \PDO::PARAM_STR);
        $statement->bindValue(':userId', $this->uid, \PDO::PARAM_INT);
        $statement->execute();
        if (!$inTransaction) {
            Database::commit();
        }
    }

    /**
     * update User info
     *
     */
    public function updateUser() {

        $inTransaction = Database::inTransaction();
        if (!$inTransaction) {
            Database::beginTransaction();
        }
        $statement = Database::prepare("UPDATE member SET email=:email, `password`=:pwd, sspwd=:sspwd, `port`=:port, nickname=:nickname,
            `flow_up`=:flow_up, `flow_down`=:flow_down, transfer=:transfer, plan=:plan, `enable`=:enable, invite=:invite, regDateLine=:regDateLine,
            lastConnTime=:lastConnTime,lastCheckinTime=:lastCheckinTime,lastFindPasswdTime=:lastFindPasswdTime,
            lastFindPasswdCount=:lastFindPasswdCount WHERE uid=:userId");
        $statement->bindValue(':email', $this->email, \PDO::PARAM_STR);
        $statement->bindValue(':pwd', $this->password, \PDO::PARAM_STR);
        $statement->bindValue(':sspwd', $this->sspwd, \PDO::PARAM_STR);
        $statement->bindValue(':port', $this->port, \PDO::PARAM_INT);
        $statement->bindValue(':nickname', $this->nickname, \PDO::PARAM_STR);
        $statement->bindValue(':flow_up', $this->flow_up, \PDO::PARAM_INT);
        $statement->bindValue(':flow_down', $this->flow_down, \PDO::PARAM_INT);
        $statement->bindValue(':transfer', $this->transfer, \PDO::PARAM_INT);
        $statement->bindValue(':plan', $this->plan, \PDO::PARAM_STR);
        $statement->bindValue(':enable', $this->enable, \PDO::PARAM_INT);
        $statement->bindValue(':invite', $this->invite, \PDO::PARAM_INT);
        $statement->bindValue(':regDateLine', $this->regDateLine, \PDO::PARAM_INT);
        $statement->bindValue(':lastConnTime', $this->lastConnTime, \PDO::PARAM_INT);
        $statement->bindValue(':lastCheckinTime', $this->lastCheckinTime, \PDO::PARAM_INT);
        $statement->bindValue(':lastFindPasswdTime', $this->lastFindPasswordTime, \PDO::PARAM_INT);
        $statement->bindValue(':lastFindPasswdCount', $this->lastFindPasswordCount, \PDO::PARAM_INT);
        $statement->bindValue(':userId', $this->uid, \PDO::PARAM_INT);
        $flag = $statement->execute();
        if (!$inTransaction) {
            Database::commit();
        }
    }


    /**
     * Get password
     */
    public function getPassword() {
        return $this->password;
    }

    public function getRegTime() {
        return date("Y-m-d H:i:s", $this->regDateLine);
    }

    public function getGravatar() {
        return \Helper\Util::GetGravatar($this->email, 128);
    }

    public function getFlow() {
        return \Helper\Util::ToGB($this->transfer);
    }

    public static function getSSPwd($userId) {
        $statement = Database::prepare("SELECT * FROM member WHERE uid=?");
        $statement->bindValue(1, $userId, \PDO::PARAM_INT);
        $statement->execute();
        $statement->setFetchMode(\PDO::FETCH_CLASS, '\\Model\\User');
        return $statement->fetch(\PDO::FETCH_CLASS);
    }

    public static function getUserCheckIn($uid) {
        $statement = Database::prepare("SELECT count(*) FROM member WHERE lastCheckinTime > " . date('Y-m-d 00:00:00',
                time()) . " AND uid=?");
        $statement->bindValue(1, $uid, \PDO::PARAM_INT);
        $checkIn = $statement->fetch(\PDO::PARAM_INT)[0];
        return $checkIn == null ? 0 : $checkIn;
    }


}
