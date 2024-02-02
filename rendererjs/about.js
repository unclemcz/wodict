//填充版本信息
const appversion = document.getElementById('app-version');
window.electronAPI.onVersion((value) => {
  appversion.innerText = value;
})

