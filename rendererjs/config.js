

//填充配置列表

const baiduid = document.getElementById('baidu-id');
const baidukey = document.getElementById('baidu-key');
const baiduname = document.getElementById('baidu-name');

const baiduocrak = document.getElementById('baiduocr-ak');
const baiduocrsk = document.getElementById('baiduocr-sk');
const baiduocrname = document.getElementById('baiduocr-name');

const youdaoid = document.getElementById('youdao-id');
const youdaokey = document.getElementById('youdao-key');
const youdaoname = document.getElementById('youdao-name');

const tencentid = document.getElementById('tencent-id');
const tencentkey = document.getElementById('tencent-key');
const tencentname = document.getElementById('tencent-name');

const alibaseid = document.getElementById('alibase-id');
const alibasekey = document.getElementById('alibase-key');
const alibasename = document.getElementById('alibase-name');

const volcid = document.getElementById('volc-id');
const volckey = document.getElementById('volc-key');
const volcname = document.getElementById('volc-name');

const huaweiid = document.getElementById('huawei-id');
const huaweikey = document.getElementById('huawei-key');
const huaweiname = document.getElementById('huawei-name');

const ollamaurl = document.getElementById('ollama-url');
const ollamaname = document.getElementById('ollama-name');

const kimikey = document.getElementById('kimi-key');
const kiminame = document.getElementById('kimi-name');

const wxocrurl = document.getElementById('wxocr-url');
const wxocrname = document.getElementById('wxocr-name');

window.electronAPI.onEngineList((value) => {
  for (const key in value) {
    if (value[key].name) {
      switch (key) {
        case "baidu":
            baiduid.value = value[key].appid;
            baidukey.value = value[key].key;
            break;
        case "baiduocr":
            baiduocrak.value = value[key].ak;
            baiduocrsk.value = value[key].sk;
            break;
        case "wxocr":
            wxocrurl.value = value[key].url;
            break;
        case "youdao":
            youdaoid.value = value[key].appid;
            youdaokey.value = value[key].key;
            break;
        case "tencent":
            tencentid.value = value[key].appid;
            tencentkey.value = value[key].key;
            break;
        case "alibase":
            alibaseid.value = value[key].appid;
            alibasekey.value = value[key].key;
            break;
        case "volc":
          volcid.value = value[key].appid;
          volckey.value = value[key].key;
          break;
        case "huawei":
          huaweiid.value = value[key].appid;
          huaweikey.value = value[key].key;
          break;
        case "ollama":
          ollamaurl.value = value[key].url;
          //ollamamodel.value = value[key].model;
          break;
        case "kimi":
          kimikey.value = value[key].key;
          break;
        default:
            break;
      }
    }
  }
})

//保存翻译引擎配置
const btnsavecfg = document.getElementById('btnsavecfg')
btnsavecfg.addEventListener('click', async () => {
  let cfg = {};
  cfg.baidu = {"name":baiduname.innerText,"appid":baiduid.value,"key":baidukey.value};
  cfg.baiduocr = {"name":baiduocrname.innerText,"ak":baiduocrak.value,"sk":baiduocrsk.value};
  cfg.youdao = {"name":youdaoname.innerText,"appid":youdaoid.value,"key":youdaokey.value};
  cfg.tencent = {"name":tencentname.innerText,"appid":tencentid.value,"key":tencentkey.value};
  cfg.alibase = {"name":alibasename.innerText,"appid":alibaseid.value,"key":alibasekey.value};
  cfg.volc = {"name":volcname.innerText,"appid":volcid.value,"key":volckey.value};
  cfg.huawei = {"name":huaweiname.innerText,"appid":huaweiid.value,"key":huaweikey.value};
  cfg.ollama = {"name":ollamaname.innerText,"url":ollamaurl.value};
  cfg.kimi = {"name":kiminame.innerText,"key":kimikey.value};
  cfg.wxocr = {"name":wxocrname.innerText,"url":wxocrurl.value};
  //console.log(cfg)
  window.electronAPI.onSaveCfg(cfg);
  window.close();
})
