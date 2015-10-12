<?php
/**
 * KK Forum
 * A simple bulletin board system
 * Author: kookxiang <r18@ikk.me>
 */
namespace Helper;

class Resource
{
    public static function CompressCSS($fromFile, $templateName)
    {
        if (!is_array($fromFile)) {
            $fromFile = array($fromFile);
        }
        $contents = '';
        foreach ($fromFile as $file) {
            $contents .= file_get_contents($file) . PHP_EOL;
        }
        $contents = trim($contents);
        $contents = str_replace(array("\r\n", "\r", "\n"), PHP_EOL, $contents);
        while (strpos($contents, PHP_EOL . PHP_EOL) !== false) {
            $contents = str_replace(PHP_EOL . PHP_EOL, PHP_EOL, $contents);
        }
        $contents = preg_replace('/\/\*.*?\*\//s', '', $contents);
        $contents = preg_replace('/^[ \t]*(.+)[ \t]*$/m', '\\1', $contents);
        $contents = preg_replace_callback('/{([^{}]+)}/s', array('Helper\\Resource', '_ClearCSSInBracket'), $contents);
        $contents = str_replace(' {', '{', $contents);
        $contents = str_replace(', ', ',', $contents);
        $contents = trim($contents);

        $hash = substr(sha1($contents), 8, 10);
        $header = '/*' . PHP_EOL;
        $header .= ' * Automatically compressed by KK Framework' . PHP_EOL;
        $header .= ' * MD5 hash: ' . md5($contents) . PHP_EOL;
        $header .= ' */' . PHP_EOL;
        $contents = $header . $contents;

        $toFile = DATA_PATH . "Resource/StyleSheet/{$templateName}_{$hash}.css";
        self::createDir(dirname($toFile));
        file_put_contents($toFile, $contents);
        return str_replace(DATA_PATH, 'Data/', $toFile);
    }

    private static function createDir($dir, $permission = 0777)
    {
        if (is_dir($dir)) {
            return;
        }
        self::createDir(dirname($dir), $permission);
        @mkdir($dir, $permission);
    }

    public static function _ClearCSSInBracket($match)
    {
        $contents = $match[0];
        $contents = str_replace(array("\r", "\n"), ' ', $contents);
        $contents = preg_replace('/[ ]+/s', ' ', $contents);
        $contents = str_replace(': ', ':', $contents);
        $contents = str_replace('; ', ';', $contents);
        $contents = str_replace('{ ', '{', $contents);
        $contents = str_replace(';}', '}', $contents);
        return $contents;
    }
}
