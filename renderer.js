

//翻译剪切板文本
const origintext = document.getElementById('origintext')
const resulttext = document.getElementById('resulttext')
window.electronAPI.onUpdateText((value) => {
  console.log("renderer.js onUpdateText:",value);
  origintext.value = value.origintext.toString();
  resulttext.value = value.resulttext.toString();
});

//填充翻译引擎列表
const engineselect = document.getElementById('engineselect')
window.electronAPI.onEngineList((value) => {
  engineselect.options.length = 0;
  const curengine = value.curengine;
  for (const key in value) {
    if (value[key].name) {
      let newOption = document.createElement('option');  
      newOption.text = value[key].name; // 设置文本  
      newOption.value = key; // 设置值  
      if (value[key].key!='') {
        if (key == curengine) {
          newOption.selected = true;
        }
        engineselect.add(newOption)
      }else{
        newOption.disabled = true;
        engineselect.add(newOption)
      }
    }
  }
})

//切换翻译引擎
engineselect.addEventListener('change', function(event) {  
  let engine = event.target.value; // 获取选中选项的值  
  //let selectedOptionText = event.target.options[event.target.selectedIndex].text; // 获取选中选项的文本  
  console.log('Selected option value:', engine);  
  //console.log('Selected option text:', selectedOptionText);  
  window.electronAPI.changeEngine(engine);
});  

//点击按钮翻译
const btntranslator = document.getElementById('btntranslator')
btntranslator.addEventListener('click', async () => {
  if (origintext.value == '') {
    resulttext.value = '源语言为空。';
  } else {
    const result = await window.electronAPI.onTranslator(origintext.value);
    //console.log(result);
    resulttext.value = result.resulttext;
  }
})

//打开引擎配置窗口
const btnconfig = document.getElementById('btnconfig')
btnconfig.addEventListener('click', async () => {
   await window.electronAPI.onConfig();
})

//打开关于窗口
const btnabout = document.getElementById('btnabout')
btnabout.addEventListener('click', async () => {
   await window.electronAPI.onAbout();
})


//捕获鼠标进出事件
document.documentElement.addEventListener('mouseenter', (event) => {  
  //console.log('鼠标进入了窗口');  
  window.electronAPI.onMouseAct('mouseenter');
});  

document.documentElement.addEventListener('mouseleave', (event) => {  
  //console.log('鼠标离开了窗口');  
  window.electronAPI.onMouseAct('mouseleave');
});


