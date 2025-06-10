


const btntranslator = document.getElementById('btntranslator') //翻译按钮
const origintext = document.getElementById('origintext')//源文本
const resulttext = document.getElementById('resulttext') //翻译结果
const audiosource = document.getElementById('audiosource') //声音源
const btnaudio = document.getElementById('btnaudio')  //声音按钮
const btncut = document.getElementById('btncut');//OCR按钮
const modelselect = document.getElementById('modelselect') //模型

//翻译剪切板文本
window.electronAPI.onUpdateText((value) => {
  console.log("renderer.js onUpdateText:",value,value.done);
  if (value.origintext && value.origintext.toString() != ''){
    origintext.value = value.origintext.toString();    
  }
  resulttext.value = value.resulttext.toString();
  //自动滚动
  resulttext.scrollTop = resulttext.scrollHeight;
  if (value.voice && value.voice.toString() != '') {
    audiosource.setAttribute('src', value.voice.toString());
    //btnaudio.style.display = '';
    btnaudio.disabled = false;
  }else{
    btnaudio.disabled = true;
  }
  if (value.done == undefined) value.done = true; 
  if (value.done == false){
    btntranslator.disabled = true;
  }else {
    btntranslator.disabled = false;
  }
});

//填充翻译引擎列表
const engineselect = document.getElementById('engineselect')
window.electronAPI.onEngineList((value) => {
  engineselect.options.length = 0;
  let selected = 0; //用来判断是否有项目被选中
  const curengine = value.curengine;
  for (const key in value) {
    if (value[key].name) {
      let newOption = document.createElement('option');  
      newOption.text = value[key].name; // 设置文本  
      newOption.value = key; // 设置值  
      if (value[key].key!='') {
        if (key == curengine) {
          newOption.selected = true;
          selected = 1;
        }
        engineselect.add(newOption)
      }else{
        newOption.disabled = true;
        engineselect.add(newOption)
      }
    }
  }
  if (selected == 0) {  //如果未选中，默认选中ollama
    window.electronAPI.changeEngine('ollama');
  }else{
    window.electronAPI.changeEngine(curengine);
  }

  //判断btncut按钮是否可以使用
  if (value.curocr&&value[value.curocr].ak!='') {
    btncut.disabled = false;
  }else{
    btncut.disabled = true;
  }
})


//填充模型列表
window.electronAPI.onModelList((value) => {
  modelselect.options.length = 0;
  if (value.length > 0) {
    modelselect.hidden = false;
    for (const key in value) {
        let newOption = document.createElement('option');  
        newOption.text = value[key]; // 设置文本  
        newOption.value = value[key]; // 设置值  
        if (key == 0) {
          newOption.selected = true;
        }
        modelselect.add(newOption)
        //console.log(key);
    }
  } else {
    modelselect.hidden = true;
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

//切换模型
modelselect.addEventListener('change', function(event) {  
  let model = event.target.value; // 获取选中选项的值  
  //let selectedOptionText = event.target.options[event.target.selectedIndex].text; // 获取选中选项的文本  
  console.log('Selected model value:', model);  
  //console.log('Selected option text:', selectedOptionText);  
  window.electronAPI.changeModel(model);
});  

//点击按钮翻译
btntranslator.addEventListener('click', async () => {
  if (origintext.value == '') {
    resulttext.value = '源语言为空。';
  } else {
    await window.electronAPI.onTranslatorV2(origintext.value);
  }
})
// btntranslator.addEventListener('click', async () => {
//   if (origintext.value == '') {
//     resulttext.value = '源语言为空。';
//   } else {
//     const result = await window.electronAPI.onTranslator(origintext.value);
//     //console.log(result);
//     resulttext.value = result.resulttext;
//     if (result.voice && result.voice.toString() != '') {
//       audiosource.setAttribute('src', result.voice.toString());

//       btnaudio.disabled = false;
//     }else{
//       btnaudio.disabled = true;
//     }
//   }
// })

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

//停止翻译
const btnabort = document.getElementById('btnabort')
btnabort.addEventListener('click', async () => {
   await window.electronAPI.onAbort();
   console.log('btnabort click');
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


//播放单词语音
//const btnaudio = document.getElementById('btnaudio');
const audioplayer = document.getElementById('audioplayer');
btnaudio.addEventListener('click', async () => {
  const audiosource = document.getElementById('audiosource');
  if (audiosource.getAttribute('src') != ''){
    await audioplayer.load();
    audioplayer.play();
  }
})



document.getElementById('btncut').addEventListener('click', async () => {
  try {
    window.electronAPI.send('open-selection-window'); // 打开选区窗口
  } catch (error) {
    console.error('Error during screen capture:', error);
  }
});