<?php
/**
 * shadowsocks-panel
 * Add: 2016/4/8 16:53
 * Author: Sendya <18x@loacg.com>
 */

namespace Model;

use Core\Model;
use Core\Database as DB;

class Node extends Model
{

    public $id; // 节点id
    public $name; // 节点名称
    public $type; // 类型 0 普通 1 vip
    public $server; // Server地址
    public $method; // 加密方式
    public $info; // 节点信息备注
    public $status; // 状态
    public $order; // 排序

    /**
     * Get node by Id
     * @param $nodeId
     * @return mixed
     */
    public static function getNodeById($nodeId)
    {
        $statement = DB::getInstance()->prepare("SELECT * FROM node WHERE id=?");
        $statement->bindValue(1, $nodeId);
        $statement->execute();
        return $statement->fetchObject(__CLASS__);
    }

    /**
     * Get Node array
     * @param $type
     * @return Node[]
     */
    public static function getNodeArray($type = -1)
    {
        $nodeList = null;
        $selectSQL = "SELECT * FROM node ";
        if ($type != -1) {
            $selectSQL .= " WHERE type=?";
        }
        $selectSQL .= "  ORDER BY `order`";
        $statement = DB::getInstance()->prepare($selectSQL);
        $statement->bindValue(1, $type);
        $statement->execute();
        return $statement->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }

    /**
     * Delete node
     * @param $nodeId
     * @return bool
     */
    public static function deleteNode($nodeId)
    {
        $inTransaction = DB::getInstance()->inTransaction();
        if (!$inTransaction) {
            DB::getInstance()->beginTransaction();
        }
        $statement = DB::getInstance()->prepare("DELETE FROM node WHERE id=:id");
        $statement->bindValue(':id', $nodeId, DB::PARAM_INT);
        $result = $statement->execute();
        if (!$inTransaction) {
            DB::getInstance()->commit();
        }
        return $result;
    }
}