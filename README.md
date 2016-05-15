## Shadowsocks Panel

**A powerful Shadowsocks management system**


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
# Download script: The Latest Version
cd /home/wwwroot/
git clone https://github.com/sendya/shadowsocks-panel.git
cd shadowsocks-panel

# Download script: Stable Version (Recommended)
# Go to https://github.com/sendya/shadowsocks-panel/releases, download the latest release version (current version: v1.16)
wget https://github.com/sendya/shadowsocks-panel/archive/sspanel-v1.16.zip -O shadowsocks-panel.zip
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
