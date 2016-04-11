<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use \Core\Template;

use \Model\Node as NodeModel;
use Model\User;

/**
 * Class Node
 * @Admin
 * @Authorization
 * @package Controller\Admin
 */
class Node {
	
	public function index() {

		$data['user'] = User::getCurrent();
		$data['nodes'] = NodeModel::getNodeArray();

		Template::setContext($data);
		Template::setView('admin/node');
	}

	/**
	 * 添加 node
	 * @JSON
	 */
	public function update() {
		$result = array('error' => -1, 'message' => '保存失败');
		if($_POST['node_id']==null) {
			$node = new NodeModel();
			if($_POST['node_name'] != null) $node->name = $_POST['node_name'];
			if($_POST['node_type'] != null) $node->type = $_POST['node_type'];
			if($_POST['node_server'] != null) $node->server = $_POST['node_server'];
			if($_POST['node_method'] != null) $node->method = $_POST['node_method'];
			if($_POST['node_info'] != null) $node->info = $_POST['node_info'];
			if($_POST['node_status'] != null) $node->status = $_POST['node_status'];
			if($_POST['node_order'] != null) $node->order = intval($_POST['node_order']);
			$node->save();
			$result = array('error' => 0, 'message' => '添加成功', 'node' => $node);
		} else if($_POST['node_id'] != '') {
			$node = NodeModel::getNodeById(trim($_POST['node_id']));
			if($_POST['node_name'] != null) $node->name = $_POST['node_name'];
			if($_POST['node_type'] != null) $node->type = $_POST['node_type'];
			if($_POST['node_server'] != null) $node->server = $_POST['node_server'];
			if($_POST['node_method'] != null) $node->method = $_POST['node_method'];
			if($_POST['node_info'] != null) $node->info = $_POST['node_info'];
			if($_POST['node_status'] != null) $node->status = $_POST['node_status'];
			if($_POST['node_order'] != null) $node->order = intval($_POST['node_order']);
			$node->save();
			$result = array('error' => 0, 'message' => '修改成功', 'node' => $node);
		}
		return $result;
	}

	/**
	 *
	 * @JSON
	 */
	public function query() {
		$result = array('error' => 1);
		if($_GET['node_id']!=null) {
			$result['node'] = NodeModel::getNodeById(trim($_GET['node_id']));
			$result['error'] = 0;
		}
		return $result;
	}

	/**
	 * @JSON
	 */
	public function delete() {
		$result = array('error' => -1, 'message' => '删除失败');
		if( $_POST['node_id'] != null) {

			if(NodeModel::deleteNode($_POST['node_id']) > 0) {
				$result = array('error' => 0, 'message' => '删除成功');
			}

		}
		return $result;
	}

}
