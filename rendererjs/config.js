

//填充翻译引擎列表

const baiduid = document.getElementById('baidu-id');
const baidukey = document.getElementById('baidu-key');
const baiduname = document.getElementById('baidu-name');

const youdaoid = document.getElementById('youdao-id');
const youdaokey = document.getElementById('youdao-key');
const youdaoname = document.getElementById('youdao-name');

const tencentid = document.getElementById('tencent-id');
const tencentkey = document.getElementById('tencent-key');
const tencentname = document.getElementById('tencent-name');

const alibaseid = document.getElementById('alibase-id');
const alibasekey = document.getElementById('alibase-key');
const alibasename = document.getElementById('alibase-name');


window.electronAPI.onEngineList((value) => {
  for (const key in value) {
    if (value[key].name) {
      switch (key) {
        case "baidu":
            baiduid.value = value[key].appid;
            baidukey.value = value[key].key;
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
  cfg.youdao = {"name":youdaoname.innerText,"appid":youdaoid.value,"key":youdaokey.value};
  cfg.tencent = {"name":tencentname.innerText,"appid":tencentid.value,"key":tencentkey.value};
  cfg.alibase = {"name":alibasename.innerText,"appid":alibaseid.value,"key":alibasekey.value};
  //console.log(cfg)
  window.electronAPI.onSaveCfg(cfg);
  window.close();
})
