<?php
/**
 * KK Forum
 * A simple bulletin board system
 * Author: kookxiang <r18@ikk.me>
 */
namespace Helper;

class Resource {
    private static $currentDir = '';

    public static function CompressJs($file) {
        if (defined('ENABLE_UGLIFYJS') && function_exists('shell_exec') && ENABLE_UGLIFYJS) {
            $contents = shell_exec('uglifyjs ' . escapeshellarg($file) . ' -c -m');
            if (stripos('error', $contents) !== false) {
                throw new Error("Failed to compress file: {$file}. Cannot parse javascript code");
            }

            $contents = trim($contents);

            return self::addComment($contents, 'Uglify-JS');
        } else {
            $contents = file_get_contents($file);
            $contents = trim($contents);
            $contents = str_replace(array("\r\n", "\r", "\n"), PHP_EOL, $contents);
            $contents = preg_replace('/\/\/[^\r\n\'"]*/m', '', $contents);
            $contents = preg_replace('/^[ \t]*(.+)[ \t]*$/m', '\\1', $contents);
            $contents = preg_replace('/[\r\n\t ]*[{}()\[\]][\r\n\t ]*/s', '\\1', $contents);
            $contents = trim($contents);
            return self::addComment($contents);
        }
    }

    public static function CompressCSS($file) {
        if (defined('ENABLE_CLEANCSS') && function_exists('shell_exec') && ENABLE_CLEANCSS) {
            self::$currentDir = dirname($file);
            $contents = shell_exec('cleancss ' . escapeshellarg($file));
            $contents = preg_replace_callback('/url\([\'"]?([^\)]+?)[\'"]?\)/s',
                array('Helper\\Resource', '_FixCSSURL'), $contents);
            $contents = trim($contents);
            return self::addComment($contents, 'Clean-CSS');
        } else {
            self::$currentDir = dirname($file);
            $contents = file_get_contents($file);
            $contents = trim($contents);
            $contents = str_replace(array("\r\n", "\r", "\n"), PHP_EOL, $contents);
            $contents = str_replace(PHP_EOL, '', $contents);
            $contents = preg_replace('/\/\*.*?\*\//s', '', $contents);
            $contents = preg_replace('/^[ \t]*(.+)[ \t]*$/m', '$1', $contents);
            $contents = preg_replace_callback('/{([^{}]+)}/s', array('Helper\\Resource', '_ClearCSSInBracket'),
                $contents);
            $contents = preg_replace_callback('/url\([\'"]?([^\)]+?)[\'"]?\)/s',
                array('Helper\\Resource', '_FixCSSURL'), $contents);
            $contents = str_replace(' {', '{', $contents);
            $contents = str_replace(array(' > ', ' >', '> '), '>', $contents);
            $contents = str_replace(', ', ',', $contents);
            $contents = str_replace(' (', '(', $contents);
            $contents = str_replace(': ', ':', $contents);
            $contents = preg_replace('/{ +/', '{', $contents);
            $contents = trim($contents);
            return self::addComment($contents);
        }
    }

    public static function _ClearCSSInBracket($match) {
        $contents = $match[0];
        $contents = str_replace(array("\r", "\n"), ' ', $contents);
        $contents = preg_replace('/[ ]+/s', ' ', $contents);
        $contents = str_replace('; ', ';', $contents);
        $contents = str_replace(';}', '}', $contents);
        return $contents;
    }

    public static function _FixCSSURL($match) {
        $link = $match[1];
        $return = "url('{$link}')";
        if (strpos($link, '//') !== false) {
            return $return;
        }
        $filePath = self::$currentDir . '/' . $link;
        $filePath = realpath($filePath);
        if ($filePath === false) {
            return $return;
        }
        $cssPath = str_replace(ROOT_PATH, DATA_PATH, self::$currentDir) . '/';
        $path = self::getRelativePath($cssPath, $filePath);
        return "url('{$path}')";
    }

    private static function getRelativePath($fromDir, $toDir) {
        $prefix = $tailing = array();
        $from = explode('/', $fromDir);
        $to = explode('/', $toDir);
        $intersection = array_intersect_assoc($from, $to);
        $depth = 0;
        for ($i = 0, $len = count($intersection); $i < $len; $i++) {
            if (!isset($intersection[$i])) {
                break;
            }
        }
        $depth = $i;
        $tmp = array_merge(array_fill(0, count($from) - $depth - 1, '..'), array_slice($to, $depth));
        return implode('/', $tmp);
    }

    private function addComment($contents, $tool = '') {
        $hash = substr(sha1($contents), 8, 10);
        $header = '/*' . PHP_EOL;
        $header .= ' * Automatically compressed by KK Framework' . ($tool ? " via {$tool}" : '') . PHP_EOL;
        $header .= ' * MD5 hash: ' . md5($contents) . PHP_EOL;
        $header .= ' */' . PHP_EOL;

        return $header . $contents;
    }
}