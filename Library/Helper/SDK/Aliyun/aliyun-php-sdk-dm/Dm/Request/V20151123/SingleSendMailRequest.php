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

class SingleSendMailRequest extends \RpcAcsRequest
{
	function  __construct()
	{
		parent::__construct("Dm", "2015-11-23", "SingleSendMail");
		parent::setMethod("POST");
	}

	private  $ownerId;

	private  $resourceOwnerAccount;

	private  $resourceOwnerId;

	private  $accountName;

	private  $addressType;

	private  $tagName;

	private  $replyToAddress;

	private  $toAddress;

	private  $subject;

	private  $htmlBody;

	private  $textBody;

	private  $fromAlias;

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

	public function getAccountName() {
		return $this->accountName;
	}

	public function setAccountName($accountName) {
		$this->accountName = $accountName;
		$this->queryParameters["AccountName"]=$accountName;
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

	public function getReplyToAddress() {
		return $this->replyToAddress;
	}

	public function setReplyToAddress($replyToAddress) {
		$this->replyToAddress = $replyToAddress;
		$this->queryParameters["ReplyToAddress"]=$replyToAddress;
	}

	public function getToAddress() {
		return $this->toAddress;
	}

	public function setToAddress($toAddress) {
		$this->toAddress = $toAddress;
		$this->queryParameters["ToAddress"]=$toAddress;
	}

	public function getSubject() {
		return $this->subject;
	}

	public function setSubject($subject) {
		$this->subject = $subject;
		$this->queryParameters["Subject"]=$subject;
	}

	public function getHtmlBody() {
		return $this->htmlBody;
	}

	public function setHtmlBody($htmlBody) {
		$this->htmlBody = $htmlBody;
		$this->queryParameters["HtmlBody"]=$htmlBody;
	}

	public function getTextBody() {
		return $this->textBody;
	}

	public function setTextBody($textBody) {
		$this->textBody = $textBody;
		$this->queryParameters["TextBody"]=$textBody;
	}

	public function getFromAlias() {
		return $this->fromAlias;
	}

	public function setFromAlias($fromAlias) {
		$this->fromAlias = $fromAlias;
		$this->queryParameters["FromAlias"]=$fromAlias;
	}
	
}