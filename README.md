# wodict

wodict是一个基于electron开发的网络环境下泛用型翻译（词典）工具，支持通过配置的方式接入ollama、百度翻译开放平台、网易有道翻译等。支持的语言由翻译引擎决定，只要翻译引擎支持，对应的语言就能翻译，包括但不限于英文、日语、韩语等。

开发的初衷是做一个可以支持读取剪贴板字符进行翻译的小玩意，便于自己阅读文献，现在也已支持百度OCR和本地部署的微信OCR，可以截图翻译。


## 最新版本已在以下系统测试
- Ubuntu25.04 x86


## 效果
### 主面板
![wodict](./readme/screenshot1.gif)
### 大模型
![wodict](./readme/ollama.gif)
### 左上角侧边吸附
![wodict](./readme/screenshot3.gif)
### 翻译通知
![wodict](./readme/screenshot2.gif)
### 百度OCR
![wodict](./readme/baiduocr.gif)
### wxocr
![wodict](./readme/wxocr.gif)

## 安装

### 源代码编译
拉取代码
```
git clone https://github.com/unclemcz/wodict.git
npm install
npm start
```
打包
```
npm run make
```

### 二进制安装
[releases](https://github.com/unclemcz/wodict/releases)

## 使用
### 图形界面配置
打开配置窗口，填入参数，返回主界面选择引擎。

![配置窗口](./readme/config.png)
![翻译引擎](./readme/engine.png)
### 通过配置文件配置
获取平台授权（方式见下文各翻译引擎介绍），运行程序，将授权信息填入配置文件，然后**关闭程序再打开**一下，就能使用了。

### 托盘菜单说明
![托盘菜单](./readme/tray.png)

#### 自动翻译
默认勾选，选中后会自动监测剪切板变化（复制操作），有变化则自动翻译复制的文本。

#### 侧边吸附（左上角）
默认不勾选，同样无法固化，如果需要固化，在配置文件改写这个属性（wininto:true）。

#### 翻译通知
默认不勾选，选中后会通过系统通知栏弹出翻译结果，这个设置是临时的，程序重启后会恢复到false，需要系统通知的话，每次都要设置一下。

如果要永久保持这个设置，需要自己改配置文件的notification字段。
```
# ~/.config/wodict/config.json
{
    "notification":false,
    "curengine":"baidu",
    "baidu":{
        "name":"百度通用文本翻译",
        "appid":"",
        "key":""
    },
}
```


## 已支持列表

### 百度翻译开放平台
**标准版每月5万字符额度，高级版100万字符额度。**

注册后为标准版，认证后可以切换至高级版，需自己切换，无法自动切。
> 注意：百度翻译会吃字，有些敏感词比如大人物的名字，会被屏蔽，甚至整段翻译结果会不显示。

说明文档：https://api.fanyi.baidu.com/product/113
1. 注册开发者信息（https://api.fanyi.baidu.com/ ），获取APPID和秘钥。
2. 进行配置（https://fanyi-api.baidu.com/choose） ，开通通用文本翻译服务。
3. 将步骤1中的APPID和秘钥填入配置窗口。

### 网易有道翻译
**无定期免费额度，新用户赠送一定额度，用完即止**
> 注意：有道翻译同样有吃字的问题，注册后会收到推销电话。
1. 注册 https://ai.youdao.com/product-fanyi-text.s ，认证用户。
2. 创建应用，服务选项选择文本翻译，如果需要朗读，还需开通语音合成服务。
3. 将步骤2中的应用ID和秘钥填入配置窗口。

### 腾讯机器文本翻译
**文本翻译的每月免费额度为500万字符**
1. 注册 https://console.cloud.tencent.com/tmt
2. 新建秘钥 https://console.cloud.tencent.com/cam/capi
3. 将步骤2中生成的Id和key填入配置中。

### 阿里机器文本翻译通用版
**每月100万字符免费额度**
1. 注册  https://www.aliyun.com/product/ai/base_alimt
2. 新建秘钥 https://ram.console.aliyun.com/manage/ak
3. 将步骤2中生成的Id和key填入配置中。

### 火山引擎机器文本翻译
**每月200万字符免费使用额度**
> 注意：认证需要银行卡或者人脸认证。

介绍：https://www.volcengine.com/product/machine-translation
1. 注册认证：https://console.volcengine.com/user/authentication/
2. 开通申请：https://console.volcengine.com/finance/opening-service/translate/
3. 新建秘钥 https://console.volcengine.com/iam/keymanage/
4. 将步骤3中生成的Id和key填入配置中。


### 华为机器文本翻译
**每月100万字符免费使用额度**
> 注意：认证需要银行卡或者人脸认证，注册后会收到客服电话。

介绍：https://www.huaweicloud.com/product/nlpmt.html
1. 注册认证开通：https://console.huaweicloud.com/nlp/#/nlp/overview
2. 新建秘钥 https://console.huaweicloud.com/iam/#/mine/accessKey
3. 将步骤2中生成的Id和key填入配置中。

### ollama大模型工具
**需要本地化搭建**
> 仅在通义千问qwen大模型下测试。

介绍：https://ollama.com/
1. 按照ollama网站安装说明安装ollama和自己的大模型，例如qwen。
2. 确认ollama正常运行。
3. 将url填入配置中。url默认为`http://127.0.0.1:11434/`,模型可参考ollama的网站，例如`qwen3`等。

### moonshot大模型
**速率限制：https://platform.moonshot.cn/docs/pricing#充值与限速**

介绍：https://platform.moonshot.cn/docs/intro
1. 注册开通：https://platform.moonshot.cn/console/info
2. 新建秘钥 https://platform.moonshot.cn/console/api-keys
3. 将步骤2中生成的key填入配置中。

### 百度OCR
**每月1000次免费额度**

介绍： https://cloud.baidu.com/doc/OCR/s/dk3iqnq51
1. 创建应用：https://console.bce.baidu.com/ai-engine/old/#/ai/ocr/app/list
2. 获取AK/SK：已创建的应用会有AK（API Key）与SK（Secret Key）。
3. 将步骤2中生成的AK/SK填入配置中。

### 微信OCR（本地）
**效果还可以吧...**
1. 部署以下服务：https://github.com/unclemcz/wxocr
```
# 正常部署
https://github.com/unclemcz/wxocr/blob/master/README.md

# Docker部署
https://github.com/unclemcz/wxocr/blob/master/DOCKER.md
```
2. 如果未使用默认的地址与端口，请在配置里填写。


## 隐私说明
wodict为纯客户端软件，使用过程中不需要连接wodict服务器，它也不会收集任何信息。

wodict使用到各种翻译引擎，这些引擎需要你自己申请与配置，wodict无法左右你所使用的翻译引擎本身的隐私处理行为，因此翻译引擎的隐私处理行为与wodict本身无关，wodict无法也不需对此做出保证。

