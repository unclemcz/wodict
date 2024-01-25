/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

//翻译剪切板文本
const origintext = document.getElementById('origintext')
const resulttext = document.getElementById('resulttext')
window.electronAPI.onUpdateText((value) => {
  console.log("renderer.js onUpdateText:",value);
  origintext.innerText = value.origintext.toString();
  resulttext.innerText = value.resulttext.toString();
});

//填充翻译引擎列表
const engineselect = document.getElementById('engineselect')
window.electronAPI.onEngineList((value) => {
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


