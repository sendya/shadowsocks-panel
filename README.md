## Shadowsocks Panel

**A powerful Shadowsocks management system**

The new panel released.

> More secure rights management
> Super simple annotation type codes
> Optimization of various operations
> 	1. The client profile to modify / card recharge optimization
> 	2. The invitation code to add logic optimization, no display refresh list
> 	3. Management additions and deletions to the end of each function optimization
> 	4. The dynamic properties of the control system
> 	5. Scheduled Tasks control
> 	6. PRO Node purview! support ss manyuser service
> 	7. Custom encryption method(support `chacha20`, `aes-128-cfb`, `aes-192-cfb`, `aes-256-cfb` and `rc4-md5`)

Require PHP version PHP5.5 ~ PHP7 , recommended PHP7.

### Quick Start
```bash
# First way: The latest version of the clone
cd /home/wwwroot/
git clone https://github.com/sendya/shadowsocks-panel.git
cd shadowsocks-panel

# Second way: download the stable version (recommended)
# Go https://github.com/sendya/shadowsocks-panel/releases, download the latest release version (current version: v1.10)
wget https://github.com/sendya/shadowsocks-panel/archive/sspanel-v1.10.zip -O shadowsocks-panel.zip
# Extract to /home/wwwroot/shadowsocks-panel/
$ unzip -o -d /home/wwwroot/shadowsocks-panel/ shadowsocks-panel.zip
$ cd /home/wwwroot/shadowsocks-panel/

# Copy ./Data/Config.simple.php to ./Data/Config.php
cp ./Data/Config.simple.php ./Data/Config.php
# Set the Data directory permissions to read and write
chmod -R 777 ./Data/
# Configure the name of the database and the database account password (code at the bottom)
vim ./Data/Config.php

# Start the installation
php index.php install
```

### Documentation
Detailed installation documentation [Wiki](https://github.com/sendya/shadowsocks-panel/wiki)
