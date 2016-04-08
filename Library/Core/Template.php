<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Core;

use Helper\Escape;
use Helper\PHPLock;

class Template
{
    private static $viewName;
    private static $context = array();

    /**
     * Load a template from data folder, compile it if it is outdated or not exists
     * @param string $templateName
     * @param array $context
     * @return string
     * @throws Error
     * @deprecated Please use setView(), putContext(), render()
     */
    public static function load($templateName, $context = array())
    {
        if ($context) {
            self::setContext($context);
        }
        if(!is_numeric(stripos($templateName, "Misc")) && !is_numeric(stripos($templateName, THEME)))
            $templateName = THEME .'/'. $templateName;

        $templateFileOrigin = self::getPath($templateName);
        $templateFile = DATA_PATH . "Template/{$templateName}.php";
        if (!file_exists($templateFile) && !file_exists($templateFileOrigin)) {
            throw new Error("Template {$templateName} not exists!", 101);
        }
        if (!file_exists($templateFile)) {
            self::compile($templateName);
        } elseif (filemtime($templateFile) <= filemtime($templateFileOrigin)) {
            self::compile($templateName);
        }
        return $templateFile;
    }

    /**
     * Get template file path
     * @param string $templateName Template file name
     * @return string Absolute path of the template file
     */
    public static function getPath($templateName)
    {
        if (file_exists(ROOT_PATH . "Template/{$templateName}.htm")) {
            return ROOT_PATH . "Template/{$templateName}.htm";
        } else {
            return "";
        }
    }

    public static function render()
    {
        if (self::$viewName) {
            extract(self::$context);
            /** @noinspection PhpIncludeInspection, PhpDeprecationInspection */
            include self::load(self::$viewName);
        }
    }

    public static function setView($viewName)
    {
        self::$viewName = $viewName;
    }

    public static function getView()
    {
        return self::$viewName;
    }

    public static function setContext($context = array())
    {
        self::$context = $context;
    }

    public static function putContext($name, $value, $escapeType = Escape::TEXT_RECURSIVE)
    {
        if (!is_array(self::$context)) {
            self::$context = array();
        }
        self::$context[$name] = Escape::perform($value, $escapeType);
    }

    public static function getContext()
    {
        return self::$context;
    }

    private static function compile($templateName)
    {
        $headers = '';
        $fp = @fopen(self::getPath($templateName), 'rb');
        if (!$fp) {
            return;
        }
        $sourceCode = '';
        while (!feof($fp)) {
            $sourceCode .= fread($fp, 8192);
        }
        $lock = new PHPLock($sourceCode);
        $lock->acquire();

        // variable with braces:
        $sourceCode = preg_replace('/\{\$([A-Za-z0-9_\[\]\'"]+)(->|::)(\$?[A-Za-z0-9_\-]+)(\(.*\))?}/',
            '<?php echo \$\\1\\2\\3\\4; ?>', $sourceCode);
        $sourceCode = preg_replace('/\{\$([A-Za-z0-9_\[\]\->\(\)]+)\}/', '<?php echo \$\\1; ?>', $sourceCode);
        $sourceCode = preg_replace('/\{([A-Z][A-Z0-9_\[\]]*)\}/', '<?php echo \\1; ?>', $sourceCode);
        $sourceCode = preg_replace('/\{\((.*)\)}/', '<?php echo \\1; ?>', $sourceCode);
        $lock->acquire();

        // PHP code:
        $sourceCode = preg_replace('/<php>(.+?)<\/php>/is', '<?php \\1; ?>', $sourceCode);
        $lock->acquire();

        // import:
        $sourceCode = preg_replace('/\<import template="([A-z0-9_\-\/]+)"[\/ ]*\>(<\/import>)?/i',
            '<?php include \\Core\\Template::load(\'\\1\'); ?>', $sourceCode);
        $lock->acquire();

        // loop:
        $sourceCode = preg_replace_callback('/\<loop(.*?)\>/is', array('\\Core\\Template', 'parseLoop'), $sourceCode);
        $sourceCode = preg_replace('/\<\/loop\>/i', '<?php } ?>', $sourceCode);
        $lock->acquire();

        // if:
        $sourceCode = preg_replace('/\<if (?:condition=)?"(.+?)"[\/ ]*\>/i', '<?php if(\\1) { ?>', $sourceCode);
        $sourceCode = preg_replace('/\<elseif (?:condition=)?"(.+?)"[\/ ]*\>/i', '<?php } elseif(\\1) { ?>',
            $sourceCode);
        $sourceCode = preg_replace('/\<else[\/ ]*\>/i', '<?php } else { ?>', $sourceCode);
        $sourceCode = preg_replace('/\<\/if\>/i', '<?php } ?>', $sourceCode);
        $lock->acquire();

        // header:
        preg_match_all('/\<meta header="(.+?)" content="(.+?)"[ \/]*\>/i', $sourceCode, $matches);
        foreach ($matches[0] as $offset => $string) {
            $headers .= "header('{$matches[1][$offset]}: {$matches[2][$offset]}');" . PHP_EOL;
            $sourceCode = str_replace($string, '', $sourceCode);
        }
        $lock->acquire();

        // variable without braces
        $sourceCode = preg_replace('/\$([a-z][A-Za-z0-9_]+)/', '<?php echo \$\\1; ?>', $sourceCode);

        // unlock PHP code
        $lock->release();

        // rewrite link
        if (!defined('USE_REWRITE') || !USE_REWRITE) {
            $sourceCode = preg_replace_callback('/(href|action)="([A-Z0-9_\\.\\-\\/%\\?=&]*?)"/is',
                array('\\Core\\Template', 'parseUrlRewrite'), $sourceCode);
        }

        // clear space and tab
//        $sourceCode = preg_replace('/^[ \t]*(.+)[ \t]*$/m', '\\1', $sourceCode);
//        $sourceCode = preg_replace('/[\r\n]/', '', $sourceCode);

        $output = '<?php' . PHP_EOL;
        $output .= 'if(!defined(\'ROOT_PATH\'))';
        $output .= ' exit(\'This file could not be access directly.\');' . PHP_EOL;
        if ($headers) {
            $output .= $headers;
        }
        $output .= '?>' . PHP_EOL;
        $output .= $sourceCode;
        $output = preg_replace('/\s*\?\>\s*\<\?php\s*/is', PHP_EOL, $output);
        self::createDir(dirname(DATA_PATH . "Template/{$templateName}.php"));
        if (!file_exists(DATA_PATH . "Template/{$templateName}.php")) {
            @touch(DATA_PATH . "Template/{$templateName}.php");
        }
        if (!is_writable(DATA_PATH . "Template/{$templateName}.php")) {
            throw new Error('Cannot write template file: ' . DATA_PATH . "Template/{$templateName}.php", 8);
        }
        file_put_contents(DATA_PATH . "Template/{$templateName}.php", $output);
    }

    public static function parseLoop($match)
    {
        $variable = self::pregGet($match[1], '/variable="([^"]+)"/i');
        if (!$variable) {
            $variable = self::pregGet($match[1], '/^\s*"([^"]+)"/i');
        }
        if (!$variable) {
            throw new Error('Cannot convert loop label: ' . htmlspecialchars($match[0]), 102);
        }
        $query = self::pregGet($match[1], '/query="([^"]+)"/i');
        if ($query) {
            return '<?php while (' . $variable . ' = ' . ($query) . '->getRow()) { ?>';
        }
        $key = self::pregGet($match[1], '/key="([^"]+)"/i');
        $value = self::pregGet($match[1], '/value="([^"]+)"/i');
        return '<?php foreach (' . $variable . ' as ' . ($key ? $key : '$key') . ' => ' . ($value ? $value : '$value') . ') { ?>';
    }

    public static function parseUrlRewrite($match)
    {
        $originText = $match[0];
        $linkTarget = $match[2];
        if (strpos($linkTarget, '//') !== false) {
            return $originText;
        }
        if (file_exists(ROOT_PATH . $linkTarget)) {
            return $originText;
        }
        return str_replace($linkTarget, 'index.php/' . $linkTarget, $originText);
    }

    private static function pregGet($subject, $pattern, $offset = 1)
    {
        if (!preg_match($pattern, $subject, $matches)) {
            return null;
        }
        return $matches[$offset];
    }

    private static function createDir($dir, $permission = 0777)
    {
        if (is_dir($dir)) {
            return;
        }
        self::createDir(dirname($dir), $permission);
        @mkdir($dir, $permission);
    }
}
