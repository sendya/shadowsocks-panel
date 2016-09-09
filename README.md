## Shadowsocks Panel
**A powerful Shadowsocks management system**

[![TeamCity CodeBetter](https://img.shields.io/teamcity/codebetter/bt428.svg?maxAge=2592000)]() [![NEW VERSION](https://img.shields.io/badge/version-1.2.0B-green.svg?maxAge=2592000)]() [![PHP VERSION](https://img.shields.io/badge/PHP-5.5+-orange.svg?maxAge=2592000)]() [![MySQL 5.5+](https://img.shields.io/badge/MySQL-5.5+-green.svg?maxAge=2592000)]() [![Resource Download](https://img.shields.io/badge/Resource-download-green.svg?maxAge=2592000)](https://github.com/sendya/shadowsocks-panel/releases/download/sspanel-v1.2.0.B/Resource.zip)


> Comprehensive user permissions management.
> All codes come with clear annotation.
> Optimized for various operations:
> 	1. Self-service user profile change and add value.
> 	2. Invitation page optimization: no refresh upon submission.
> 	3. Dynamic control of system properties.
> 	4. Scheduled Tasks control.
> 	5. Preview! Support for Shadowsocks Manyuser branch.
> 	6. Support varies encryption algorithms (`chacha20`, `aes-128-cfb`, `aes-192-cfb`, `aes-256-cfb`, `rc4-md5`).

Required PHP version: PHP5.5 ~ PHP7. PHP7 is recommended.

### Quick Start
```bash
#Pick one version: Latest or Stable
# Download script: The Latest Version (Recommended)
cd /home/wwwroot/
git clone https://github.com/sendya/shadowsocks-panel.git
cd shadowsocks-panel

# Download script: Stable Version
# Go to https://github.com/sendya/shadowsocks-panel/releases, download the latest release version (current version: v1.2.0.B)
wget https://github.com/sendya/shadowsocks-panel/archive/sspanel-v1.2.0.B.zip -O shadowsocks-panel.zip
# Extract to /home/wwwroot/shadowsocks-panel/
$ unzip -o -d /home/wwwroot/shadowsocks-panel/ shadowsocks-panel.zip
$ cd /home/wwwroot/shadowsocks-panel/

# Copy ./Data/Config.simple.php to ./Data/Config.php
cp ./Data/Config.simple.php ./Data/Config.php
# Set the Data directory permissions to read and write
chmod -R 777 ./Data/
# Configure database (relevanet code at the bottom)
vim ./Data/Config.php

# Start the installation
php index.php install
```

### Documentation
Detailed installation documentation [Wiki](https://github.com/sendya/shadowsocks-panel/wiki)
