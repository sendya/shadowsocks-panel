<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Core;

use Symfony\Component\Yaml\Yaml;

class I18N
{
    const CACHE_FILE = DATA_PATH . 'i18n.cache.php';

    private static $loaded = false;
    private static $storage = array();
    private static $translationFile = '';

    public static function init()
    {
        if (!self::$translationFile) {
            return;
        }
        self::loadFromCache();
    }

    private static function loadFromCache()
    {
        $datas = array(
            'FileName' => 'None',
            'Storage' => array()
        );
        if (file_exists(self::CACHE_FILE) && !REAL_TIME_MODE) {
            /** @noinspection PhpIncludeInspection */
            $datas = include self::CACHE_FILE;
        }
        if ($datas['FilePath'] == self::$translationFile) {
            self::$storage = $datas['Storage'];
            self::$loaded = true;
        } elseif (file_exists(self::$translationFile)) {
            self::loadTranslation(self::$translationFile);
            self::saveTranslationCache();
        }
    }

    private static function loadTranslation($file)
    {
        self::$loaded = true;
        $translationFile = file_get_contents($file);
        $storage = Yaml::parse($translationFile, Yaml::PARSE_OBJECT);
        $storage = self::flattenArray($storage);
        ksort($storage);
        self::$storage = $storage;
        unset($storage);
    }

    private static function flattenArray($array, $prefix = '')
    {
        $newArray = array();
        foreach ($array as $key => $value) {
            if (!is_array($value)) {
                $newArray[$prefix . $key] = $value;
            } else {
                $newArray = array_merge($newArray, self::flattenArray($value, $prefix . $key . '.'));
            }
        }
        return $newArray;
    }

    private static function saveTranslationCache()
    {
        $datas = array(
            'Storage' => self::$storage,
            'FilePath' => self::$translationFile,
        );
        $output = '<?php' . PHP_EOL;
        $output .= 'if(!defined(\'ROOT_PATH\'))';
        $output .= ' exit(\'This file could not be access directly.\');' . PHP_EOL . PHP_EOL;
        $output .= 'return ' . var_export($datas, true) . ';' . PHP_EOL;
        file_put_contents(self::CACHE_FILE, $output);
    }

    public static function setTranslationFile($filePath)
    {
        self::$translationFile = $filePath;
    }

    /**
     * Get translation of the given key
     * @param string $key
     * @param string $fallback
     * @param array ...$args
     * @return string
     */
    public static function parse($key, $fallback = '', ...$args)
    {
        if (!$fallback) {
            $fallback = "[!{$key}]";
        }
        $translation = isset(self::$storage[$key]) ? self::$storage[$key] : $fallback;
        if ($args) {
            array_unshift($args, $translation);
            $translation = call_user_func_array('sprintf', $args);
        }
        return $translation;
    }
}
