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
		if(isset($_POST['form_add']) || $_POST['form_add']!=null) {
			$result = array('error' => -1, 'message' => '添加失败');

			$node = new NodeModel();
			if(isset($_POST['name'])) $node->name = $_POST['name'];
			if(isset($_POST['type'])) $node->type = $_POST['type'];
			if(isset($_POST['server'])) $node->server = $_POST['server'];
			if(isset($_POST['method'])) $node->method = $_POST['method'];
			if(isset($_POST['info'])) $node->info = $_POST['info'];
			if(isset($_POST['status'])) $node->status = $_POST['status'];
			if(isset($_POST['order'])) $node->order = $_POST['order'];

			/*
			if($node->insertToDB() > 0) {
				$result = array('error' => 0, 'message' => '添加成功');
			}
			*/

	    echo json_encode($result);
	    exit();
		} else {
			include Template::load('/admin/nodeAdd');
		}


	}

	public function modify() {
		if(isset($_POST['id']) || $_POST['id']!=null) {
			$result = array('error' => -1, 'message' => '修改失败');

			$node = new NodeModel();
			if(isset($_POST['name'])) $node->name = $_POST['name'];
			if(isset($_POST['type'])) $node->type = $_POST['type'];
			if(isset($_POST['server'])) $node->server = $_POST['server'];
			if(isset($_POST['method'])) $node->method = $_POST['method'];
			if(isset($_POST['info'])) $node->info = $_POST['info'];
			if(isset($_POST['status'])) $node->status = $_POST['status'];
			if(isset($_POST['order'])) $node->order = $_POST['order'];

			/*
			$node->UpdateNode()
			$result = array('error' => 0, 'message' => '修改成功');
			
			*/
	    echo json_encode($result);
	    exit();
	  } else {
	  	include Template::load('/admin/nodeModify');
	  }
	}

	public function delete() {
		$result = array('error' => -1, 'message' => '删除失败');
		if(isset($_POST['id']) || $_POST['id']!=null) {

			if(NodeModel::deleteNode($_POST['id']) > 0) {
				$result = array('error' => 0, 'message' => '删除成功');
			}

		}
    echo json_encode($result);
    exit();
	}

}
