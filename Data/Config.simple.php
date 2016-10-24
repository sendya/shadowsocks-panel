<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 *
 * shadowsocks-panel configuration file
 */

if (!defined('ROOT_PATH')) {
    exit('This file could not be access directly.');
}

/**
 * Site Name
 * 站点标题
 */
define('SITE_NAME', 'SS Cat');

/**
 * Enable debug mode:
 * Disable debug mode will hide backtrace information, which is helpful for developer
 *
 * Debug 模式
 * 开启后，将会在错误页输出错误详情
 */
define('DEBUG_ENABLE', false);

/**
 * Database Connection:
 * 数据库连接配置项
 */
Core\Database::initialize('mysql:dbname=ssp;host=localhost;port=3306;charset=UTF8', 'root', 'root');

/**
 * =============================
 *      以下内容请勿轻易改变
 * =============================
 */

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
 * Real time mode:
 * This option will disable i18n / router / template cache, development only.
 * DO NOT TURN ON THIS OPTION IN PRODUCTION!!!
 */
define('REAL_TIME_MODE', false);

/**
 * Base URL:
 * To manually config this, uncomment the following line and change the URL
 * To use auto detect, keep this commented
 *
 * define('BASE_URL', 'http://www.kookxiang.com');
 */
Core\Request::autoDetectBaseURL();

/**
 * Set i18n translation file
 * If you don't need this, simply comment out the following line
 */
Core\I18N::setTranslationFile(LIBRARY_PATH . 'Language/en-US.yml');