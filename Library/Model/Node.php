<?php
/**
 * SS-Panel
 * A simple bulletin board system
 * Author: Sendya <18x@mloli.com>
 */

namespace Model;

use Core\Database;

class Node {
	public $id; // 节点id
	public $name; // 节点名称
	public $type; // 类型
	public $server; // Server地址
	public $method; // 加密方式
	public $info; // 节点信息备注
	public $status; // 状态
	public $order; // 排序

	/**
	 * Get node by Id 
	 * @param $nodeId
	 * @return Node
	 */
	public static function GetNodeById($nodeId) {
		$statement = Database::prepare("SELECT * FROM node WHERE id=?");
		$statement->bindValue(1, $nodeId);
		$statement->execute();
		$statement->setFetchMode(\PDO::FETCH_CLASS, '\\Model\\Node');
		return $statement->fetch(\PDO::FETCH_CLASS);
	}
	/**
	 * Get Node array
	 * @param $type
	 * @return Node[]
	 */
	public static function GetNodeArray($type = 0) {
		$nodeList = null;
        try {
            $statement = Database::prepare("SELECT * FROM node WHERE type=? ORDER BY `order`");
            $statement->bindValue(1, $type);
            $statement->execute();
            $nodeList = $statement->fetchAll(\PDO::FETCH_CLASS, '\\Model\\Node');
        } catch (\PDOException $e) {
            $e->getMessage();
        }
		return $nodeList;
	}

	/**
	 * 取总节点数
	 * @return mixed
	 */
	public static function GetNodeCount() {
		$nodeCount = 0;
		try {
			$statement = Database::prepare("SELECT count(*) FROM node");
			$statement->execute();
			$nodeCount = $statement->fetch(\PDO::FETCH_NUM);
		} catch (\PDOException $e) {
			$e->getMessage();
		}
		return $nodeCount[0];
	}

	/**
	 * 增加 Node
	 * @param node Id
	 */
	public function insertToDB() {
		$statement = null;
		try {
			$inTransaction = Database::inTransaction();
			if(!$inTransaction) Database::beginTransaction();
			$statement = Database::prepare("INSERT INTO node SET `name`=:name, `type`=:type,
				`server`=:server, `method`=:method, `info`=:info, `status`:=status, `order`=:order");
			$statement->bindValue(':name', $this->name, \PDO::PARAM_STR);
			$statement->bindValue(':type', $this->type, \PDO::PARAM_INT);
			$statement->bindValue(':server', $this->server, \PDO::PARAM_STR);
			$statement->bindValue(':method', $this->method, \PDO::PARAM_STR);
			$statement->bindValue(':info', $this->info, \PDO::PARAM_STR);
			$statement->bindValue(':status', $this->status, \PDO::PARAM_STR);
			$statement->bindValue(':order', $this->order, \PDO::PARAM_INT);
			$statement->execute();
			$this->id = Database::lastInsertId();
			if(!$inTransaction) Database::commit();
		} catch (\PDOException $e) {
			//$statement->rollBack();
			Database::rollBack();
			$e->getMessage();
		}
		return $this->id;
	}

	/**
	 * 删除 node
	 * @param $nodeId  Int
	 */
	public static function deleteNode($nodeId) {

		try {
			$statement = Database::prepare("DELETE * FROM node WHERE id=:id");
			$statement->bindValue(':id', $nodeId, \PDO::PARAM_INT);
			Database::commit();
		} catch (\PDOException $e) {
			Database::rollBack();
			$e->getMessage();
		}
	}

	/**
	 * 更新 node 信息
	 * @param $node
	 */
	public function UpdateNode() {
		$statement = null;
		try {
			$statement = Database::prepare("UPDATE node SET `name`=:name, `type`=:type,
				`server`=:server, `method`=:method, `info`=:info, `status`:=status, `order`=:order WHERE id=:id");
			$statement->bindValue(':name', $this->name, \PDO::PARAM_STR);
			$statement->bindValue(':type', $this->type, \PDO::PARAM_INT);
			$statement->bindValue(':server', $this->server, \PDO::PARAM_STR);
			$statement->bindValue(':method', $this->method, \PDO::PARAM_STR);
			$statement->bindValue(':info', $this->info, \PDO::PARAM_STR);
			$statement->bindValue(':status', $this->status, \PDO::PARAM_STR);
			$statement->bindValue(':order', $this->order, \PDO::PARAM_INT);
			$statement->bindValue(':id', $this->id, \PDO::PARAM_INT);
			$statement->execute();
			Database::commit();
		} catch (\PDOException $e) {
			//$statement->rollBack();
			Database::rollBack();
			$e->getMessage();
		}
	}
}