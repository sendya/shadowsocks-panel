<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use \Core\Template;

use \Model\Node as NodeModel;


class Node extends AdminListener {
	
	public function index() {
		//throw new \Core\Error('node page', 525);
		global $user;

		$nodes = NodeModel::GetNodeArray();

		include Template::load('/admin/node');
		//exit();
	}

	public function add() {
		$result = array('error' => -1, 'message' => '添加失败');
		if(isset($_POST['form_add']) || $_POST['form_add']!=null) {
			$node = new NodeModel();
			if($_POST['node_name'] != null) $node->name = $_POST['node_name'];
			if($_POST['node_type'] != null) $node->type = $_POST['node_type'];
			if($_POST['node_server'] != null) $node->server = $_POST['node_server'];
			if($_POST['node_method'] != null) $node->method = $_POST['node_method'];
			if($_POST['node_info'] != null) $node->info = $_POST['node_info'];
			if($_POST['node_status'] != null) $node->status = $_POST['node_status'];
			if($_POST['node_order'] != null) $node->order = $_POST['node_order'];

			if($node->insertToDB() > 0) {
				$result = array('error' => 0, 'message' => '添加成功');
			}
		}

		echo json_encode($result);
		exit();
	}

	public function nodeInfo() {
		$result = array('error' => -1, 'message' => '获取节点信息失败');
		if($_GET['node_id']!=null) {
			$result['data'] = NodeModel::GetNodeById($_GET['node_id']);
			$result['error'] = 0;
		}
		echo json_encode($result);
		exit();
	}

	public function modify() {
		$result = array('error' => -1, 'message' => '修改失败');
		if(isset($_POST['node_id']) || $_POST['node_id']!=null) {

			$node = new NodeModel();
			$node->id = $_POST['node_id'];
			if($_POST['node_name'] != null) $node->name = $_POST['node_name'];
			if($_POST['node_type'] != null) $node->type = $_POST['node_type'];
			if($_POST['node_server'] != null) $node->server = $_POST['node_server'];
			if($_POST['node_method'] != null) $node->method = $_POST['node_method'];
			if($_POST['node_info'] != null) $node->info = $_POST['node_info'];
			if($_POST['node_status'] != null) $node->status = $_POST['node_status'];
			if($_POST['node_order'] != null) $node->order = $_POST['node_order'];


			$node->UpdateNode();
			$result = array('error' => 0, 'message' => '修改成功');
	  	}
		echo json_encode($result);
		exit();
	}

	public function delete() {
		$result = array('error' => -1, 'message' => '删除失败');
		if( $_POST['node_id'] != null) {

			if(NodeModel::deleteNode($_POST['node_id']) > 0) {
				$result = array('error' => 0, 'message' => '删除成功');
			}

		}
		echo json_encode($result);
		exit();
	}

}
