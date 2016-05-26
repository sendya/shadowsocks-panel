<?php
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
namespace Dm\Request\V20151123;

class BatchSendMailRequest extends \RpcAcsRequest
{
	function  __construct()
	{
		parent::__construct("Dm", "2015-11-23", "BatchSendMail");
	}

	private  $ownerId;

	private  $resourceOwnerAccount;

	private  $resourceOwnerId;

	private  $templateName;

	private  $accountName;

	private  $receiversName;

	private  $addressType;

	private  $tagName;

	public function getOwnerId() {
		return $this->ownerId;
	}

	public function setOwnerId($ownerId) {
		$this->ownerId = $ownerId;
		$this->queryParameters["OwnerId"]=$ownerId;
	}

	public function getResourceOwnerAccount() {
		return $this->resourceOwnerAccount;
	}

	public function setResourceOwnerAccount($resourceOwnerAccount) {
		$this->resourceOwnerAccount = $resourceOwnerAccount;
		$this->queryParameters["ResourceOwnerAccount"]=$resourceOwnerAccount;
	}

	public function getResourceOwnerId() {
		return $this->resourceOwnerId;
	}

	public function setResourceOwnerId($resourceOwnerId) {
		$this->resourceOwnerId = $resourceOwnerId;
		$this->queryParameters["ResourceOwnerId"]=$resourceOwnerId;
	}

	public function getTemplateName() {
		return $this->templateName;
	}

	public function setTemplateName($templateName) {
		$this->templateName = $templateName;
		$this->queryParameters["TemplateName"]=$templateName;
	}

	public function getAccountName() {
		return $this->accountName;
	}

	public function setAccountName($accountName) {
		$this->accountName = $accountName;
		$this->queryParameters["AccountName"]=$accountName;
	}

	public function getReceiversName() {
		return $this->receiversName;
	}

	public function setReceiversName($receiversName) {
		$this->receiversName = $receiversName;
		$this->queryParameters["ReceiversName"]=$receiversName;
	}

	public function getAddressType() {
		return $this->addressType;
	}

	public function setAddressType($addressType) {
		$this->addressType = $addressType;
		$this->queryParameters["AddressType"]=$addressType;
	}

	public function getTagName() {
		return $this->tagName;
	}

	public function setTagName($tagName) {
		$this->tagName = $tagName;
		$this->queryParameters["TagName"]=$tagName;
	}
	
}