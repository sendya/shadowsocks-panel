<?php
/**
 * KK SS-Panel
 * A simple Shadowsocks Panel
 * Author: kookxiang <r18@ikk.me>
 */

if(!defined('ROOT_PATH'))
	exit('This file could not be access directly.');


/**
 * Site Name
 */
define('SITE_NAME', 'SS Cat');
/**
 * Template Name
 */
define('TEMPLATE_NAME', 'Default');
define('TPL_PATH', 'Resource/'.TEMPLATE_NAME.'/');

/**
 * Lockscreen service switch
 */
define('LOCKSCREEN', true);

/**
 * Mailer config
 */
$MAIL = array(
	'host' => 'smtp.exmail.qq.com',
	'username' => 'h@loacg.com',
	'password' => 'password',
	'from'     => '某科学的h本 <h@loacg.com>',
	'secure' => ''
);

/**
 * Flow default value
 */
define('TRANSFER', 10);// Default flow 10GB . A port

/**
 * Plan 'A' enable
 * boolean false disable plan 'A' port!!!
 */
define('ENABLE_PLAN_A', false);

/**
 * Encrypt Key:
 * This key is used to encrypt password and other information.
 * Don't touch it after application install finished.
 */
define('ENCRYPT_KEY', 'Encrypt Key');

/**
 * Cookie Key:
 * Password which used to encrypt cookie info.
 * If this key is leaked, generate it again and all the users will forced logout.
 */
define('COOKIE_KEY', 'Cookie Key');

/**
 * Rewrite setting:
 * remove "index.php" from url, needs to config apache/nginx manually
 */
define('USE_REWRITE', true);

/**
 * Extension type:
 * custom response suffix
 */
define('EXTENSION', '.html,.json');

/**
 * HTTPS support:
 * Use HTTPS connection when necessary, needs to config apache/nginx manually
 */
define('HTTPS_SUPPORT', false);

/**
 * Enable debug mode:
 * Disable debug mode will hide backtrace information, which is helpful for developer
 */
define('DEBUG_ENABLE', true);

/**
 * Check template and resource file update automatically
 * You can turn off this on production environment.
 */
define('TEMPLATE_UPDATE', true);

/**
 * Base URL:
 * To manually config this, uncomment the following line and change the URL
 * To use auto detect, keep this commented
 */
// define('BASE_URL', 'http://www.kookxiang.com');
Core\Request::autoDetectBaseURL();

/**
 * Database Connection:
 */
Core\Database::register('mysql:dbname=sspanel;host=localhost;charset=UTF8', 'user', 'password');
