<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

// Initialize constants
define('ROOT_PATH', dirname(dirname(__FILE__)) . DIRECTORY_SEPARATOR);
define('LIBRARY_PATH', ROOT_PATH . 'Library/');
define('DATA_PATH', ROOT_PATH . 'Data/');
@ini_set('display_errors', 'on');
@ini_set('expose_php', false);

// Register composer
require ROOT_PATH . 'Package/autoload.php';

// Register error handler
Core\Error::registerHandler();

// Initialize config
@include DATA_PATH . 'Config.php';

if (ini_get('opcache.enable')) {
    if (!ini_get('opcache.save_comments')) {
        throw new \Core\Error('ZendOpcache is configured not saving PHP DocComments which is required.');
    }
}

// Initialize i18n engine
Core\I18N::init();

// Handler for json request
Core\Filter::register(new Helper\JSON());

//$Router = new Core\DefaultRouter();
$Router = new Core\ReflectionRouter();
$Router->handleRequest();
