// app.js
const context = new (window.AudioContext || window.webkitAudioContext)();
let oscillators = {};
let gainNodes = {};

const createComponent = (id) => {
    const component = document.createElement('div');
    component.className = 'component';
    
    component.innerHTML = `
        <label for="frequency${id}">ヘルツ:</label>
        <input type="number" id="frequency${id}" value="400" oninput="updateFrequency(${id})">
        <label for="semitone${id}">平均律での半音補正:</label>
        <button onclick="adjustSemitone(${id}, -1)">-</button>
        <input type="number" id="semitone${id}" value="0">
        <button onclick="adjustSemitone(${id}, 1)">+</button>
        <label for="volume${id}">音量:</label>
        <input type="range" id="volume${id}" min="0" max="1" step="0.01" value="0.5" oninput="updateVolume(${id})">
        <button id="play${id}" onclick="play(${id})">再生</button>
        <button onclick="stop(${id})">停止</button>
    `;
    
    document.getElementById('components').appendChild(component);
};

const adjustSemitone = (id, change) => {
    const semitoneInput = document.getElementById(`semitone${id}`);
    let semitone = parseInt(semitoneInput.value) + change;
    semitoneInput.value = semitone;
    updateFrequency(id);
};

const getFrequency = (id) => {
    const baseFrequency = parseFloat(document.getElementById(`frequency${id}`).value);
    const semitone = parseInt(document.getElementById(`semitone${id}`).value);
    return baseFrequency * Math.pow(2, semitone / 12);
};

const getVolume = (id) => {
    return parseFloat(document.getElementById(`volume${id}`).value);
};

const play = (id) => {
    stop(id); // 既存のオシレーターを停止
    
    const frequency = getFrequency(id);
    const volume = getVolume(id);

    const oscillator = context.createOscillator();
    oscillator.type = 'triangle'; // 他の波形を試す場合は 'square', 'sawtooth', 'triangle' を使用

    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(volume, context.currentTime);

    // 高精度の周波数を設定
    oscillator.frequency.setValueAtTime(Number(frequency.toFixed(10)), context.currentTime);

    oscillator.start(context.currentTime);
    
    oscillator.connect(gainNode).connect(context.destination);
    
    oscillators[id] = oscillator;
    gainNodes[id] = gainNode;
    
    // 再生ボタンの背景色を変更
    document.getElementById(`play${id}`).classList.add('playing');
};

const stop = (id) => {
    if (oscillators[id]) {
        oscillators[id].stop();
        delete oscillators[id];
        delete gainNodes[id];
        
        // 再生ボタンの背景色を元に戻す
        document.getElementById(`play${id}`).classList.remove('playing');
    }
};

const updateFrequency = (id) => {
    if (oscillators[id]) {
        const frequency = getFrequency(id);
        oscillators[id].frequency.setValueAtTime(Number(frequency.toFixed(10)), context.currentTime);
    }
};

const updateVolume = (id) => {
    if (gainNodes[id]) {
        const volume = getVolume(id);
        gainNodes[id].gain.setValueAtTime(volume, context.currentTime);
    }
};

// 初期コンポーネントの作成
for (let i = 0; i < 10; i++) { // 10個のコンポーネントを作成
    createComponent(i);
}
