<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Core;

use ReflectionObject;
use ReflectionProperty;

abstract class Model
{
    const SAVE_AUTO = 0;
    const SAVE_INSERT = 1;
    const SAVE_UPDATE = 2;

    public function delete()
    {
        $reflection = new ReflectionObject($this);
        $primaryKey = $this->getPrimaryKeyName($reflection);
        $property = $reflection->getProperty($primaryKey);
        if ($property->isProtected() || $property->isPrivate()) {
            $property->setAccessible(true);
        }
        $primaryValue = $property->getValue($this);
        if (!$primaryValue) {
            throw new Error('Cannot delete object without id');
        }
        $tableName = $this->getTableName($reflection);
        $statement = Database::getInstance()->prepare("DELETE FROM `{$tableName}` WHERE `{$primaryKey}`=:value");
        $statement->bindValue(':value', $primaryValue);
        $statement->execute();
    }

    public function save($mode = self::SAVE_AUTO)
    {
        $map = array();
        $reflection = new ReflectionObject($this);
        $reflectionProp = $reflection->getProperties(ReflectionProperty::IS_PROTECTED | ReflectionProperty::IS_PUBLIC);
        foreach ($reflectionProp as $property) {
            if (strpos($property->getDocComment(), '@ignore')) {
                continue;
            }
            $propertyName = $property->getName();
            if ($propertyName == 'primaryKey') {
                continue;
            }
            if ($property->isProtected()) {
                $property->setAccessible(true);
            }
            $propertyValue = $property->getValue($this);
            $map[$propertyName] = $propertyValue;
        }
        $primaryKey = $this->getPrimaryKeyName($reflection);
        $identifier = $map[$primaryKey];
        unset($map[$primaryKey]);
        $tableName = $this->getTableName($reflection);
        if ($mode == self::SAVE_UPDATE || ($identifier && $mode != self::SAVE_INSERT)) {
            $sql = "UPDATE `{$tableName}` SET ";
            foreach ($map as $key => $value) {
                $sql .= "`{$key}` = :{$key},";
            }
            $sql = rtrim($sql, ',');
            $sql .= " WHERE {$primaryKey} = :id";
            $statement = Database::getInstance()->prepare($sql);
            $statement->bindValue(':id', $identifier);
            foreach ($map as $key => $value) {
                $statement->bindValue(":{$key}", $value);
            }
        } else {
            $sql = "INSERT INTO `{$tableName}` SET ";
            foreach ($map as $key => $value) {
                $sql .= "{$key} = :{$key},";
            }
            $sql = rtrim($sql, ',');
            $statement = Database::getInstance()->prepare($sql);
            foreach ($map as $key => $value) {
                $statement->bindValue(":{$key}", $value);
            }
        }
        $statement->execute();
        if (!$identifier) {
            $insertId = Database::getInstance()->lastInsertId();
            if ($insertId) {
                $reflection->getProperty($primaryKey)->setValue($this, $insertId);
            }
        }
    }

    private function getPrimaryKeyName(ReflectionObject $reflection)
    {
        if (!$reflection->hasProperty('primaryKey')) {
            return 'id';
        } else {
            $property = $reflection->getProperty('primaryKey');
            if ($property->isPrivate() || $property->isProtected()) {
                $property->setAccessible(true);
            }
            return $property->getValue($this);
        }
    }

    private function getTableName(ReflectionObject $reflection)
    {
        $docComment = $reflection->getDocComment();
        if (!preg_match('/@table ?([A-Za-z\-_0-9]+)/i', $docComment, $matches) || !$matches[1]) {
            return strtolower($reflection->getShortName());
        } else {
            return $matches[1];
        }
    }
}
