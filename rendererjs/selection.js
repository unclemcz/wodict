let startX, startY, endX, endY;
let isSelecting = false;

// 获取 DOM 元素
const overlay = document.getElementById('selectionOverlay');
const rect = document.getElementById('selectionRect');

if (!overlay || !rect) {
    console.error('DOM 元素 #selectionOverlay 或 #selectionRect 不存在，请检查 HTML 结构。');
    throw new Error('Missing required DOM elements.');
}

function updateSelection() {
    if (!isSelecting) return;

    rect.style.left = `${Math.min(startX, endX)}px`;
    rect.style.top = `${Math.min(startY, endY)}px`;
    rect.style.width = `${Math.abs(endX - startX)}px`;
    rect.style.height = `${Math.abs(endY - startY)}px`;
    rect.style.display = 'block';
}

function onMouseMove(e) {
    endX = e.clientX;
    endY = e.clientY;
    updateSelection();
}

function onMouseUp(e) {
    isSelecting = false;

    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);

    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    // 获取窗口在屏幕上的位置
    const windowPosition = {
        x: window.screenX, // 窗口左上角在屏幕上的 X 坐标
        y: window.screenY  // 窗口左上角在屏幕上的 Y 坐标
    };
    // 计算屏幕坐标
    const screenX = windowPosition.x + Math.min(startX, endX);
    const screenY = windowPosition.y + Math.min(startY, endY);

    // 通过预加载脚本发送信息给主进程
    window.api.send('selection-complete', {
        x: screenX,
        y: screenY,
        width,
        height,
    });

    // 关闭窗口
    setTimeout(() => {
        window.close();
    }, 100);
}


// 处理 ESC 键退出截图
function onKeyUp(e) {
    console.log('按键释放:', e.key); // 打印所有按键
    if (e.key === 'Escape' || e.key === 'Esc') { // 兼容不同浏览器对 ESC 的定义
        isSelecting = false;

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('keyup', onKeyUp); // 移除自身

        // 关闭窗口
        setTimeout(() => {
            window.close();
        }, 100);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('keyup', onKeyUp);
    console.log('ESC 监听器已绑定（窗口加载时）');
});



overlay.addEventListener('mousedown', (e) => {
    e.preventDefault();

    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    endX = startX;
    endY = startY;

    rect.style.display = 'block';
    updateSelection();

    // 绑定到 window 上以防止拖出窗口外时事件丢失
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    //window.addEventListener('keyup', onKeyUp);
    //console.log('ESC 监听器已绑定'); // 确认是否执行到这里
});