<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/4/6 22:32
 */


namespace Model;

use Core\Database as DB;
use Core\Error;
use Core\Model;
use Helper\Utils;
use Helper\Encrypt;

/**
 * Class User
 * @table member
 * @package Model
 */
class User extends Model
{

    const ENCRYPT_TYPE_DEFAULT = 0;
    const ENCRYPT_TYPE_ENHANCE = 1;

    private $primaryKey = 'uid';// 定义主键

    public $uid;// (主键)
    public $email;//电子邮件
    public $nickname;//昵称,没卵用
    protected $password = 'default';//Fuck password
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
    public $forgePwdCode; // 找回密码次数
    public $payTime; // 上次支付时间
    public $expireTime; // 到期时间
    public $method; // 自定义加密方式
    /** @ignore */
    public $lastActive = TIMESTAMP;
    /** @ignore */
    private $admin = 0;

    /**
     * Get current user object
     * @return User
     */
    public static function getCurrent()
    {
        /** @var User $user */
        $user = $_SESSION['currentUser'];
        if ($user && TIMESTAMP - $user->lastActive > 600) {
            $userObj = self::getUserByUserId($user->uid);
            if (!$userObj) {
                $user = null;
            } elseif ($user->password != $userObj->password) {
                // Password changed
                $user = null;
            } else {
                $userObj->lastActive = TIMESTAMP;
                $user = $userObj;
            }
        } elseif (!$user->uid) {
            $uid = Encrypt::decode(base64_decode($_COOKIE['uid']), ENCRYPT_KEY);
            $expire = Encrypt::decode(base64_decode($_COOKIE['expire']), ENCRYPT_KEY);
            $token = Encrypt::decode(base64_decode($_COOKIE['token']), ENCRYPT_KEY);
            if($uid && $expire && $token) {
                $userObj = self::getUserByUserId($uid);
                if($userObj) {
                    $validateToken = md5($userObj->uid . ":" . $userObj->email . ":" . $userObj->passwd . ":" . $expire . ":" . COOKIE_KEY);
                    if ($token == $validateToken) {
                        $userObj->lastActive = TIMESTAMP;
                        $user = $userObj;
                    }
                }
            }
        }
        $_SESSION['currentUser'] = $user;
        return $user;
    }

    /**
     * @param $email
     * @return User
     */
    public static function getUserByEmail($email)
    {
        $statement = DB::getInstance()->prepare('SELECT t1.*, IF(t2.id>0,1,0) as `admin` FROM `member` t1 LEFT JOIN `admin` t2 ON t1.uid=t2.uid WHERE t1.email = ?');
        $statement->bindValue(1, $email);
        $statement->execute();
        return $statement->fetchObject(__CLASS__);
    }

    /**
     * @param $userId
     * @return User
     */
    public static function getUserByUserId($userId)
    {
        $statement = DB::getInstance()->prepare('SELECT t1.*, IF(t2.id>0,1,0) as `admin` FROM `member` t1 LEFT JOIN `admin` t2 ON t1.uid=t2.uid WHERE t1.uid = ?');
        $statement->bindValue(1, $userId, DB::PARAM_INT);
        $statement->execute();
        return $statement->fetchObject(__CLASS__);
    }

    public static function getUserList()
    {
        $statement = DB::getInstance()->prepare('SELECT t1.*, t2.id as `admin` FROM `member` t1 LEFT JOIN `admin` t2 ON t1.uid=t2.uid ORDER BY uid');
        $statement->execute();
        return $statement->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }

    public static function getCount()
    {
        $stn = DB::getInstance()->prepare("SELECT count(1) FROM `member`");
        $stn->execute();
        return $stn->fetch(DB::FETCH_NUM)[0];
    }

    public static function getUserArrayByExpire()
    {
        $selectSQL = "SELECT * FROM member WHERE (expireTime<:expireTime OR (flow_up+flow_down)>transfer) AND `enable`=1 ORDER BY uid";
        $statement = DB::sql($selectSQL);
        $statement->bindValue(":expireTime", time(), DB::PARAM_INT);
        $statement->execute();
        return $statement->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }

    public static function enableUsersByExpireTime()
    {
        $selectSQL = "UPDATE member SET enable=1 WHERE expireTime>:expireTime AND (flow_up+flow_down)<transfer AND enable=0";
        $statement = DB::sql($selectSQL);
        $statement->bindValue(":expireTime", time(), DB::PARAM_INT);
        $statement->execute();
    }

    /**
     * 停止用户
     */
    public function stop()
    {
        $inTransaction = DB::getInstance()->inTransaction();
        if (!$inTransaction) {
            DB::getInstance()->beginTransaction();
        }
        $stn = DB::sql("UPDATE member SET `enable` = 0 WHERE uid=?");
        $stn->bindValue(1, $this->uid, DB::PARAM_INT);
        $stn->execute();
        if (!$inTransaction) {
            DB::getInstance()->commit();
        }
    }

    public static function checkUserPortIsAvailable($port = 0, $uid)
    {
        if ($port != 0) {
            $stn = DB::sql("SELECT * FROM member WHERE port=? AND uid<>?");
            $stn->bindValue(1, $port, DB::PARAM_INT);
            $stn->bindValue(2, $uid, DB::PARAM_INT);
            $stn->execute();
            return $stn->fetchObject(__CLASS__);
        }
        return null;
    }

    public function verifyPassword($password)
    {
        return password_verify($password, $this->password);
    }

    public function setPassword($password)
    {
        $this->password = password_hash($password, PASSWORD_BCRYPT);
    }

    public function isAdmin()
    {
        return $this->admin==0?false:true;
    }

    /**
     * Set administrator
     */
    public function setAdmin($val)
    {
        if ($val == 1 && !$this->isAdmin()) {
            $stn = DB::sql("INSERT INTO `admin` SET uid=?");
            $stn->bindValue(1, $this->uid, DB::PARAM_INT);
            $stn->execute();
        } else {
            if ($val == 0 && $this->isAdmin()) {
                $stn = DB::sql("DELETE FROM `admin` WHERE uid=?");
                $stn->bindValue(1, $this->uid, DB::PARAM_INT);
                $stn->execute();
            }
        }
    }

    public function getPlan()
    {
        return Utils::planAutoShow($this->plan);
    }

    public function getUseTransfer()
    {
        return $this->flow_up + $this->flow_down;
    }
}