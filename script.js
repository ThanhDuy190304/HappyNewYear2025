const text = 'TRẦN NGÔ NGỌC LINH';
window.requestAnimationFrame =
    window.__requestAnimationFrame ||
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame;

window.isDevice = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(((navigator.userAgent || navigator.vendor || window.opera)).toLowerCase()));

let mobile = window.isDevice;
let koef = mobile ? 0.5 : 1;

let canvas = document.getElementById('happy');
let ctx = canvas.getContext('2d');

let width = canvas.width = koef * window.innerWidth;
let height = canvas.height = koef * window.innerHeight;

let getTextPoints = function (text, fontSize, canvasWidth, canvasHeight) {
    let offscreenCanvas = document.createElement('canvas');
    let offCtx = offscreenCanvas.getContext('2d');
    offscreenCanvas.width = canvasWidth;
    offscreenCanvas.height = canvasHeight;

    offCtx.fillStyle = 'white';
    offCtx.font = `${fontSize}px Dancing Script`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(text, canvasWidth / 2, canvasHeight / 1.5);

    let imageData = offCtx.getImageData(0, 0, canvasWidth, canvasHeight);
    let points = [];
    for (let y = 0; y < canvasHeight; y += 1) { // Giảm khoảng cách giữa các điểm để chữ mượt mà hơn
        for (let x = 0; x < canvasWidth; x += 1) { // Giảm khoảng cách giữa các điểm để chữ mượt mà hơn
            let i = (y * canvasWidth + x) * 4;
            if (imageData.data[i] > 0) {
                points.push([x, y]);
            }
        }
    }
    return points;
};

// Adjust font size for mobile
let fontSize = mobile ? 60 : 100;
let pointsOrigin = getTextPoints(text, fontSize, width, height);
let targetPoints = [];
let isCompleted = false;

let pulse = function () {
    for (let i = 0; i < pointsOrigin.length; i++) {
        targetPoints[i] = pointsOrigin[i];
    }
};

window.addEventListener('resize', function () {
    let width = canvas.width = koef * window.innerWidth;
    let height = canvas.height = koef * window.innerHeight;
    if (mobile) {
        height = Math.min(height, 0.8 * window.innerHeight); // Giới hạn chiều cao canvas trên thiết bị di động
    }
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, width, height);
    pointsOrigin = getTextPoints(text, fontSize, width, height);
    pulse();
});

// Reduce particles for mobile to improve performance
let numParticles = mobile ? Math.floor(pointsOrigin.length / 2) : pointsOrigin.length;
let particles = [];

// Khởi tạo hạt, đặt ngẫu nhiên trên màn hình
for (let i = 0; i < numParticles; i++) {
    particles[i] = {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        size: 2,
        color: "hsla(0," + ~~(40 * Math.random() + 60) + "%," + ~~(60 * Math.random() + 20) + "%,.3)", // Màu ngẫu nhiên
        target: pointsOrigin[i], // Mỗi hạt có tọa độ mục tiêu tương ứng với các điểm chữ
        speedFactor: 0.2 + Math.random() * 0.5  // Tốc độ bắt đầu từ chậm và có sự khác biệt
    };
}

let config = {
    traceK: 0.4,
    timeDelta: 0.01
};

let time = 0;
let loop = function () {
    ctx.fillStyle = "rgba(0,0,0,.1)";
    ctx.fillRect(0, 0, width, height);

    let allCompleted = true;

    // Di chuyển các hạt từ vị trí ngẫu nhiên tới các điểm chữ
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        let target = p.target; // Mỗi hạt có mục tiêu là một điểm của chữ
        let dx = target[0] - p.x;
        let dy = target[1] - p.y;
        let length = Math.sqrt(dx * dx + dy * dy);

        if (length > 1) { // Tăng độ chính xác để chữ mượt mà hơn
            allCompleted = false;

            // Tạo chuyển động chậm dần
            p.vx += dx / length * p.speedFactor; // Tăng tốc độ di chuyển
            p.vy += dy / length * p.speedFactor;
            p.x += p.vx;
            p.y += p.vy;

            p.vx *= 0.98; // Giảm tốc độ dần để di chuyển mượt mà hơn
            p.vy *= 0.98;
        }
        // Vẽ các hạt
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    if (!allCompleted) {
        window.requestAnimationFrame(loop);
    } else {
        isCompleted = true;
        console.log('Animation Completed!');
    }
};

pulse();
loop();
