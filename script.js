let posX = -1000, posY = -1000;
let isLightOn = false;
let audioStarted = false;
let systemCrashed = false;
let isDragging = false;
let lastX = 0, lastY = 0;

// 音效全域變數
let globalAudioCtx, globalOsc, globalGain;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');
const intro = document.getElementById('intro');

// 1. 全平台相容嘅音效啟動機制 (400Hz 電話實聽到)
function initAudio() {
    if (audioStarted) return;
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    globalAudioCtx = new AudioContext();
    globalOsc = globalAudioCtx.createOscillator();
    globalGain = globalAudioCtx.createGain();
    
    globalOsc.type = 'sawtooth';
    globalOsc.frequency.value = 400; // 低頻微弱電流聲
    globalOsc.connect(globalGain);
    globalGain.connect(globalAudioCtx.destination);
    globalGain.gain.value = 0.02; // 勁細聲，唔嚇親人住
    
    globalOsc.start();
    
    // Apple 設備需要手動 Resume
    if (globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
    }
    audioStarted = true;
}

// 2. 統一啟動體驗 (全螢幕 + 開燈)
function startExperience() {
    if (systemCrashed) return;
    if (intro) intro.style.display = 'none';
    
    initAudio(); // 保證喺使用者點擊嗰一刻啟動聲音
    isLightOn = true;
    updateFlashlight(window.innerWidth / 2, window.innerHeight / 2);
    
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(()=>{});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen().catch(()=>{});
}

function updateFlashlight(x, y) {
    if (isLightOn && !systemCrashed) {
        overlay.style.background = `radial-gradient(circle 130px at ${x}px ${y}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
    }
}

// 3. 綁定事件 (涵蓋 PC / iPad / 手機)
// 呢段代碼確保使用者第一次「點擊」、「摸螢幕」或者「㩒鍵盤」，就會立刻觸發 startExperience()
const firstInteraction = () => {
    startExperience();
    window.removeEventListener('touchstart', firstInteraction);
    window.removeEventListener('click', firstInteraction);
    window.removeEventListener('keydown', firstInteraction);
};
window.addEventListener('touchstart', firstInteraction, { once: true });
window.addEventListener('click', firstInteraction, { once: true });
window.addEventListener('keydown', firstInteraction, { once: true });

// 手機 / iPad 拖拽移動地圖
window.addEventListener('touchstart', (e) => {
    if (systemCrashed) return;
    isDragging = true;
    lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
    updateFlashlight(lastX, lastY);
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    if (systemCrashed || !isDragging) return;
    e.preventDefault(); // 防止 iOS 畫面上網頁被拖走
    let tx = e.touches[0].clientX; let ty = e.touches[0].clientY;
    posX += (tx - lastX); posY += (ty - lastY);
    map.style.transform = `translate(${posX}px, ${posY}px)`;
    updateFlashlight(tx, ty);
    lastX = tx; lastY = ty;
}, { passive: false });

window.addEventListener('touchend', () => isDragging = false);

// PC 滑鼠及鍵盤 (WASD) 移動
window.addEventListener('mousemove', (e) => {
    if (systemCrashed) return;
    updateFlashlight(e.clientX, e.clientY);
});

window.addEventListener('keydown', (e) => {
    if (systemCrashed) return;
    let key = e.key.toLowerCase();
    const s = 60;
    if (key === 'w') posY += s; if (key === 's') posY -= s; if (key === 'a') posX += s; if (key === 'd') posX -= s;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});

// 4. 無 Popup 純淨凍結死機 (終極殺招)
function triggerFinalCrash() {
    if (systemCrashed) return;
    systemCrashed = true;

    // A. 瞬間將全畫面變成紅字 HELP ME (無任何 alert！)
    document.body.innerHTML = `
        <div style="background:black; color:red; width:100vw; height:100vh; display:flex; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:99999; cursor:none;">
            <h1 style="font-size:15vw; font-family:serif; text-shadow:0 0 50px red;">HELP ME.</h1>
        </div>
    `;

    // B. 音效瞬間變成超大聲嘅尖銳高頻 (4000Hz)
    if (audioStarted && globalOsc && globalGain) {
        globalOsc.frequency.setValueAtTime(4000, globalAudioCtx.currentTime);
        globalGain.gain.setValueAtTime(1.0, globalAudioCtx.currentTime);
    }

    // C. 延遲 50 毫秒，等瀏覽器畫好紅色字之後，發動無盡死結
    setTimeout(() => {
        // 呢個 while(true) 會徹底霸佔部機嘅 CPU 主線程。
        // Safari/Chrome 會完全失去反應，無法滑動、無法點擊，直到 OS 強制將佢殺死。
        while (true) {
            Math.random(); // 密集的空轉運算
        }
    }, 50);
}

// 5. 生成 Glitch 白塊 (測試用：5秒後出，你可以自己改返做 30000 即係30秒)
setTimeout(() => {
    if (systemCrashed) return;
    const glitch = document.createElement('div');
    
    // 生成喺你視線中心附近
    let spawnX = -posX + window.innerWidth/2 + 100;
    let spawnY = -posY + window.innerHeight/2 + 100;

    glitch.style.cssText = `position:absolute; width:50px; height:50px; background:white; left:${spawnX}px; top:${spawnY}px; z-index:1001; box-shadow: 0 0 30px white;`;
    map.appendChild(glitch);
    
    // 閃爍效果
    setInterval(() => {
        glitch.style.background = Math.random() > 0.5 ? 'white' : 'black';
    }, 50);

    // 檢測碰撞
    const check = setInterval(() => {
        const r = glitch.getBoundingClientRect();
        const cx = window.innerWidth/2, cy = window.innerHeight/2;
        if (Math.abs(r.left + 25 - cx) < 60 && Math.abs(r.top + 25 - cy) < 60) {
            triggerFinalCrash();
            clearInterval(check);
        }
    }, 100);
}, 5000); // <--- 測試完如果 work，記得將 5000 改返做 30000
