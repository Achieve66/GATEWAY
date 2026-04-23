let posX = -1000, posY = -1000;
let isLightOn = true; // 直接開啟手電筒模式
let audioStarted = false;
let systemCrashed = false;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');
const intro = document.getElementById('intro');

// 隱藏說明，準備直接開始
if(intro) intro.style.display = 'none';

function spawnSecretDot() {
    const dot = document.createElement('div');
    dot.id = 'secret-dot';
    dot.style.cssText = `
        position: absolute; width: 10px; height: 10px;
        background: #ff6600; border-radius: 50%;
        box-shadow: 0 0 15px #ff6600; cursor: pointer;
        z-index: 9999; left: 1500px; top: 1500px;
    `;
    dot.onclick = (e) => {
        e.stopPropagation();
        window.location.href = "your_other_website.html";
    };
    map.appendChild(dot);
}

function startCreepyVoice() {
    if (audioStarted) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
    let t = 0;
    scriptNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            if (systemCrashed) {
                output[i] = (Math.random() * 2 - 1) * 0.95;
            } else {
                let g = (t & (t >> 8)) ? 0.08 : -0.08;
                output[i] = (Math.random() * 0.1) + g;
            }
            t++;
        }
    };
    scriptNode.connect(audioCtx.destination);
    audioStarted = true;
}

// 啟動獵殺倒數（玩家進入後立即開始計時）
function initGame() {
    if (audioStarted) return;
    
    // 全螢幕啟動
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

    startCreepyVoice();
    spawnSecretDot();
    startHunterTimer(); // 呼叫之前建議的獵殺倒數
}

// 核心：終極封鎖 (韓文版)
function triggerFinalCrash() {
    if (systemCrashed) return;
    systemCrashed = true;

    const dot = document.getElementById('secret-dot');
    if(dot) dot.remove();

    // 朝鮮語提示
    window.onbeforeunload = () => "나를 떠나지 마십시오."; 
    
    document.body.innerHTML = `
        <div id="death-screen" style="background:black; color:red; width:100vw; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:9999999; cursor:none; overflow:hidden;">
            <h1 style="font-size:12vw; font-family:serif; text-shadow:0 0 40px red; margin:0;">나를 도와주세요.</h1>
            <p style="font-size:2vw; color:white; opacity:0.5;">ERROR_CODE: PYONGYANG_CORE_FAILURE</p>
        </div>
    `;

    // 這裡維持你原有的強制 Freeze 邏輯...
    setTimeout(() => {
        // ... (原有的 Worker 和 absoluteLock 代碼) ...
        absoluteLock();
    }, 100);
}

// 修改後的控制邏輯：任何點擊或按鍵直接 Start
window.addEventListener('click', initGame);
window.addEventListener('keydown', (e) => {
    initGame();
    if (systemCrashed) return;
    let key = e.key.toLowerCase();
    
    // 手電筒開關改為 '1'
    if (key === '1') {
        isLightOn = !isLightOn;
        updateFlashlight();
    }
    
    const speed = 60;
    if (key === 'w') posY += speed;
    if (key === 's') posY -= speed;
    if (key === 'a') posX += speed;
    if (key === 'd') posX -= speed;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    updateFlashlight();
});

function updateFlashlight() {
    if (isLightOn && !systemCrashed) {
        overlay.style.background = `radial-gradient(circle 140px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
    } else if (!isLightOn) {
        overlay.style.background = 'rgba(0,0,0,1)';
    }
}
