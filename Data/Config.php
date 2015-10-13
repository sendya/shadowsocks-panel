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
define('SITE_NAME', 'Suki.im');
/**
 * Template Name
 */
define('TEMPLATE_NAME', 'Default');
define('TPL_PATH', 'Resource/'.TEMPLATE_NAME.'/');

/**
 * Encrypt Key:
 * This key is used to encrypt password and other information.
 * Don't touch it after application install finished.
 */
define('ENCRYPT_KEY', 'úzØûÁ`·ÊæuÙÐ?');

/**
 * Cookie Key:
 * Password which used to encrypt cookie info.
 * If this key is leaked, generate it again and all the users will forced logout.
 */
define('COOKIE_KEY', 'ÏS?XñÕD?Àó?');

/**
 * Rewrite setting:
 * remove "index.php" from url, needs to config apache/nginx manually
 */
define('USE_REWRITE', true);

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
Core\Database::register('mysql:dbname=ss_panel;host=localhost;charset=UTF8', 'root', 'root');
