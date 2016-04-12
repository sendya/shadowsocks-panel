<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

if (!defined('ROOT_PATH')) {
    exit('This file could not be access directly.');
}

/**
 * Site Name
 */
define('SITE_NAME', 'SS Cat');

/**
 * Theme setting:
 *
 */
define('THEME', 'Default');

/**
 * Resource url setting:
 *
 */
//define('RESOURCE', 'https://static-2.loacg.com/open/static/sspanel');
define('RESOURCE', 'Resource/'.THEME);

/**
 * Mailer config
 */
$MAIL = array(
    'host' => 'smtp.exmail.qq.com',
    'username' => 'h@loacg.com',
    'password' => 'password',
    'from'     => '某科学的h本 <h@loacg.com>',
    'secure' => ''
); // open SSL send 'secure' => 'ssl'

/**
 * Rewrite setting:
 * remove "index.php" from url, needs to config apache/nginx manually
 */
define('USE_REWRITE', true);

/**
 * Encrypt Key:
 * This key is used to encrypt password and other information.
 * Don't touch it after application install finished.
 */
define('ENCRYPT_KEY', 'Please generate key and paste here');

/**
 * HTTPS support:
 * Use HTTPS connection when necessary, needs to config apache/nginx manually
 */
define('HTTPS_SUPPORT', true);

/**
 * Enable debug mode:
 * Disable debug mode will hide backtrace information, which is helpful for developer
 */
define('DEBUG_ENABLE', true);

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
Core\Database::initialize('mysql:dbname=test;host=localhost;charset=UTF8', 'root', '');

/**
 * Session
 */
@session_start();