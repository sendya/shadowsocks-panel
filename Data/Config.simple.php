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
 * 网站名称
 * 模板 LOGO 若是图制，则需自行修改图片
 * 其余所有页面展示名称皆为此配置项内容
 */
define('SITE_NAME', 'SS Cat');

/**
 * Theme setting:
 *
 */
define('THEME', 'Xenon');

/**
 * Resource url setting:
 *
 */
//define('RESOURCE', 'https://static-2.loacg.com/open/static/sspanel');
define('RESOURCE', 'Resource/'.THEME);

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
define('COOKIE_KEY', 'Please generate key and paste here');

/**
 * HTTPS support:
 * Use HTTPS connection when necessary, needs to config apache/nginx manually
 */
define('HTTPS_SUPPORT', true);

/**
 * Enable debug mode:
 * Disable debug mode will hide backtrace information, which is helpful for developer
 */
define('DEBUG_ENABLE', false);

/**
 * Logger:
 */
define('LOG_LEVEL', 4);

/**
 * Base URL:
 * To manually config this, uncomment the following line and change the URL
 * To use auto detect, keep this commented
 */
// define('BASE_URL', 'http://www.kookxiang.com');
Core\Request::autoDetectBaseURL();

/**
 * Database Connection:
 * 请修改此处配置：
 *  dbname 数据库名称
 *  host   数据库连接IP地址
 *  最后两项  root  password 替换成你的数据库 用户 与 密码
 */
Core\Database::initialize('mysql:dbname=sspanel;host=localhost;port=3306;charset=UTF8', 'root', 'password');

/**
 * Session
 */
@session_start();
