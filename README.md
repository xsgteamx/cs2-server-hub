# CS2 服务器首页

一个轻量级的 Counter-Strike 2 私人服务器首页。

本项目用于展示 CS2 服务器信息，提供 Steam 一键加入、服务器状态检测、WeaponPaints 皮肤入口、服务器密码提示等功能。

> 默认说明语言为中文，英文说明见下方 [English Version](#english-version)。

## 功能特性

* Steam 一键加入服务器按钮
* CS2 服务器在线状态检测 API
* WeaponPaints `/skins/` 入口
* 服务器密码提示弹窗
* 适配手机端的响应式布局
* 前端配置与私有配置分离
* 前端不暴露内网、WireGuard、真实查询 IP 等敏感信息

## 项目结构

```text
.
├── api/
│   └── server-status.php
├── config/
│   ├── site.config.example.js
│   └── site.config.js
├── _private/
│   ├── status.env.example
│   └── status.env
├── skins/
├── index.html
├── NOTICE.md
└── README.md
```

## 快速开始

复制示例配置文件：

```bash
cp config/site.config.example.js config/site.config.js
cp _private/status.env.example _private/status.env
```

编辑前端公开配置：

```text
config/site.config.js
```

编辑后端状态检测私有配置：

```text
_private/status.env
```

## 配置说明

### 前端公开配置

`config/site.config.js` 会被浏览器加载。

这里应该只放可以公开展示的信息，例如：

* 网站标题
* 服务器名称
* 公网连接地址
* Steam 加入地址
* 服务器密码提示文案
* 首页展示链接

不要在这里填写内网 IP、WireGuard IP、数据库信息、真实查询 IP 或其他敏感信息。

### 后端私有配置

`_private/status.env` 由后端状态检测 API 使用。

这里可以填写服务器真实查询信息，例如：

```env
CS2_QUERY_HOST=127.0.0.1
CS2_QUERY_PORT=27015
CS2_DISPLAY_HOST=cs2.example.com
CS2_DISPLAY_PORT=27015
```

其中：

* `CS2_QUERY_HOST`：后端实际查询服务器状态时使用的地址
* `CS2_QUERY_PORT`：后端实际查询服务器状态时使用的端口
* `CS2_DISPLAY_HOST`：前端展示给玩家的公网地址
* `CS2_DISPLAY_PORT`：前端展示给玩家的公网端口

状态 API 只能返回安全的公开信息。

不要在 JSON 响应中暴露真实内网 IP、WireGuard IP、LAN 地址或其他私有基础设施信息。

## Nginx 保护配置

`_private/` 目录必须禁止公网访问。

请在当前站点的 Nginx 配置中添加：

```nginx
location ^~ /_private/ {
    deny all;
    return 404;
}
```

修改后检查并重载 Nginx：

```bash
nginx -t
systemctl reload nginx
```

## 状态检测 API

状态检测接口位于：

```text
api/server-status.php
```

该接口会通过 UDP A2S Query 检测 CS2 服务器状态，并返回首页可安全展示的信息。

示例响应：

```json
{
  "online": true,
  "name": "CS2 Private Server",
  "map": "de_dust2",
  "players": 3,
  "max_players": 10,
  "connect": "cs2.example.com:27015"
}
```

接口返回内容中不应包含：

* 内网 IP
* WireGuard IP
* 真实查询 IP
* 数据库信息
* 服务器内部路径
* 其他私有运维信息

## WeaponPaints 入口

如果已经部署 WeaponPaints Web 页面，首页可以跳转到：

```text
/skins/
```

玩家可以通过该入口进入皮肤选择页面。

## 安全注意事项

* 不要将 `_private/status.env` 提交到公开仓库。
* 不要在前端 JS 中写入真实内网或 WG 查询地址。
* 只向玩家展示公网连接地址。
* 必须通过 Nginx 禁止访问 `_private/` 目录。
* 部署前请检查 API 响应，确认没有泄露私有信息。
* 建议在 `.gitignore` 中忽略实际私有配置文件。

推荐 `.gitignore` 配置：

```gitignore
_private/status.env
config/site.config.js
```

## License

This project is licensed under GPL-3.0.

It may include modifications and integration work based on the website component of `Nereziel/cs2-WeaponPaints`, which is also licensed under GPL-3.0.

See `NOTICE.md` for attribution details.

---

# English Version

A lightweight homepage for a private Counter-Strike 2 server.

This project provides a simple public landing page for players, with server status checking, Steam join support, WeaponPaints entry, and private configuration separation.

## Features

* Steam one-click join button
* CS2 server status check API
* WeaponPaints `/skins/` entry
* Server password notice dialog
* Mobile-friendly responsive layout
* Private runtime config separated from frontend files
* No frontend exposure of internal LAN, WireGuard, or query IPs

## Project structure

```text
.
├── api/
│   └── server-status.php
├── config/
│   ├── site.config.example.js
│   └── site.config.js
├── _private/
│   ├── status.env.example
│   └── status.env
├── skins/
├── index.html
├── NOTICE.md
└── README.md
```

## Quick start

Copy the example configuration files:

```bash
cp config/site.config.example.js config/site.config.js
cp _private/status.env.example _private/status.env
```

Edit the public site configuration:

```text
config/site.config.js
```

Edit the private server status configuration:

```text
_private/status.env
```

## Configuration

### Public site config

`config/site.config.js` is loaded by the frontend.

Use it for public display information only, such as:

* Site title
* Server name
* Public connect address
* Steam join address
* Password notice text
* Links shown on the homepage

Do not put private LAN, WireGuard, database, or internal query addresses in this file.

### Private status config

`_private/status.env` is used by the backend status API.

It may contain internal server query information, for example:

```env
CS2_QUERY_HOST=127.0.0.1
CS2_QUERY_PORT=27015
CS2_DISPLAY_HOST=cs2.example.com
CS2_DISPLAY_PORT=27015
```

The status API should only return safe public information.

Do not expose real LAN, WireGuard, or private query IPs in the JSON response.

## Nginx protection

The `_private/` directory must not be accessible from the public web.

Add the following rule to the Nginx site configuration:

```nginx
location ^~ /_private/ {
    deny all;
    return 404;
}
```

After updating Nginx, reload it:

```bash
nginx -t
systemctl reload nginx
```

## Status API

The status API is located at:

```text
api/server-status.php
```

It checks the configured CS2 server through a UDP A2S query and returns public-safe status information for the homepage.

Example response:

```json
{
  "online": true,
  "name": "CS2 Private Server",
  "map": "de_dust2",
  "players": 3,
  "max_players": 10,
  "connect": "cs2.example.com:27015"
}
```

The API response must not include internal query hosts, LAN IPs, WireGuard IPs, or other private infrastructure details.

## WeaponPaints entry

If WeaponPaints web support is deployed, the homepage can link to:

```text
/skins/
```

This allows players to access the skin selection page from the main server homepage.

## Security notes

* Keep `_private/status.env` out of public repositories.
* Never expose internal query IPs to the browser.
* Only expose the public connect address.
* Protect private files through Nginx.
* Review API responses before deploying publicly.
* It is recommended to ignore real private config files in `.gitignore`.

Recommended `.gitignore` entries:

```gitignore
_private/status.env
config/site.config.js
```

## License

This project is licensed under GPL-3.0.

It may include modifications and integration work based on the website component of `Nereziel/cs2-WeaponPaints`, which is also licensed under GPL-3.0.

See `NOTICE.md` for attribution details.
