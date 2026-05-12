// ============ NAVIGATION ============
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        link.classList.add('active');
        document.getElementById(link.dataset.section).classList.add('active');
        if (link.dataset.section === 'simulator') resizeCanvas();
    });
});

// ============ DOM REFS ============
const canvas = document.getElementById('simulation-canvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('canvas-overlay');

const sliders = {
    velocity: document.getElementById('velocity-slider'),
    angle: document.getElementById('angle-slider'),
    height: document.getElementById('height-slider'),
    gravity: document.getElementById('gravity-slider')
};
const inputs = {
    velocity: document.getElementById('velocity-input'),
    angle: document.getElementById('angle-input'),
    height: document.getElementById('height-input'),
    gravity: document.getElementById('gravity-input')
};
const toggles = {
    grid: document.getElementById('show-grid'),
    vectors: document.getElementById('show-vectors'),
    trace: document.getElementById('show-trace')
};

// ============ STATE ============
let sim = { running: false, paused: false, time: 0, dt: 0.016, x: 0, y: 0, vx: 0, vy: 0 };
let params = { v0: 40, angle: 45, h0: 0, g: 9.8 };
let trail = [];
let comparedTrajectories = [];
const trailColors = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee', '#fb923c'];
let animId = null;
let scale = 1;
let originX = 60, originY = 0;

// ============ PARAM SYNC ============
function updateParams() {
    params.v0 = +sliders.velocity.value;
    params.angle = +sliders.angle.value;
    params.h0 = +sliders.height.value;
    params.g = +sliders.gravity.value;
    inputs.velocity.value = params.v0;
    inputs.angle.value = params.angle;
    inputs.height.value = params.h0;
    inputs.gravity.value = params.g;
}
function syncFromInputs() {
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    sliders.velocity.value = inputs.velocity.value = clamp(+inputs.velocity.value, 5, 100);
    sliders.angle.value = inputs.angle.value = clamp(+inputs.angle.value, 1, 89);
    sliders.height.value = inputs.height.value = clamp(+inputs.height.value, 0, 50);
    sliders.gravity.value = inputs.gravity.value = clamp(+inputs.gravity.value, 1, 25);
    params.v0 = +sliders.velocity.value;
    params.angle = +sliders.angle.value;
    params.h0 = +sliders.height.value;
    params.g = +sliders.gravity.value;
}
Object.values(sliders).forEach(s => s.addEventListener('input', updateParams));
Object.values(inputs).forEach(inp => { inp.addEventListener('input', syncFromInputs); });

// Planet presets
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        sliders.gravity.value = btn.dataset.gravity;
        updateParams();
    });
});

// ============ CANVAS RESIZE ============
function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = (rect.width) * dpr;
    canvas.height = 500 * dpr;
    canvas.style.height = '500px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!sim.running) drawStatic();
}
window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 100);

// ============ PHYSICS ============
function calcTrajectory(v0, angleDeg, h0, g) {
    const rad = angleDeg * Math.PI / 180;
    const vx = v0 * Math.cos(rad);
    const vy = v0 * Math.sin(rad);
    // Time when y = 0: h0 + vy*t - 0.5*g*t^2 = 0
    const disc = vy * vy + 2 * g * h0;
    const totalTime = (vy + Math.sqrt(Math.max(0, disc))) / g;
    const points = [];
    const steps = 300;
    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * totalTime;
        const x = vx * t;
        const y = h0 + vy * t - 0.5 * g * t * t;
        points.push({ t, x, y: Math.max(0, y) });
    }
    const maxH = h0 + (vy * vy) / (2 * g);
    const range = vx * totalTime;
    return { points, totalTime, maxHeight: maxH, range, vx, vy0: vy };
}

function calcScale(maxX, maxY) {
    const w = canvas.width / (window.devicePixelRatio || 1) - 100;
    const h = canvas.height / (window.devicePixelRatio || 1) - 80;
    const sx = w / Math.max(maxX, 1);
    const sy = h / Math.max(maxY, 1);
    return Math.min(sx, sy) * 0.85;
}

// ============ DRAWING ============
function toScreen(px, py) {
    const cH = canvas.height / (window.devicePixelRatio || 1);
    return { x: originX + px * scale, y: cH - 40 - py * scale };
}

function drawGrid() {
    if (!toggles.grid.checked) return;
    const cW = canvas.width / (window.devicePixelRatio || 1);
    const cH = canvas.height / (window.devicePixelRatio || 1);
    const groundY = cH - 40;

    // Determine nice grid spacing
    const maxWorldX = (cW - originX) / scale;
    const maxWorldY = (groundY - 20) / scale;
    const niceStep = niceNum(Math.max(maxWorldX, maxWorldY) / 8);

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.06)';
    ctx.lineWidth = 1;
    ctx.font = '10px Inter';
    ctx.fillStyle = '#475569';

    // Vertical lines
    for (let wx = 0; wx <= maxWorldX; wx += niceStep) {
        const sx = originX + wx * scale;
        if (sx > cW) break;
        ctx.beginPath(); ctx.moveTo(sx, 20); ctx.lineTo(sx, groundY); ctx.stroke();
        if (wx > 0) ctx.fillText(Math.round(wx) + 'm', sx - 10, groundY + 14);
    }
    // Horizontal lines
    for (let wy = 0; wy <= maxWorldY; wy += niceStep) {
        const sy = groundY - wy * scale;
        if (sy < 20) break;
        ctx.beginPath(); ctx.moveTo(originX, sy); ctx.lineTo(cW, sy); ctx.stroke();
        if (wy > 0) ctx.fillText(Math.round(wy) + 'm', originX - 32, sy + 4);
    }

    // Axes
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(originX, 20); ctx.lineTo(originX, groundY); ctx.lineTo(cW, groundY); ctx.stroke();

    // Ground
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(cW, groundY); ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Horizontal Distance (metres) →', (originX + cW) / 2, groundY + 30);
    ctx.save();
    ctx.translate(16, cH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('↑ Height (metres)', 0, 0);
    ctx.restore();
}

function niceNum(range) {
    const exp = Math.floor(Math.log10(range));
    const frac = range / Math.pow(10, exp);
    let nice;
    if (frac <= 1.5) nice = 1;
    else if (frac <= 3) nice = 2;
    else if (frac <= 7) nice = 5;
    else nice = 10;
    return nice * Math.pow(10, exp);
}

function drawTrail(points, color, alpha) {
    if (points.length < 2) return;
    ctx.beginPath();
    const p0 = toScreen(points[0].x, points[0].y);
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < points.length; i++) {
        const p = toScreen(points[i].x, points[i].y);
        ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawProjectile(x, y) {
    const s = toScreen(x, y);
    // Glow
    const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 20);
    grd.addColorStop(0, 'rgba(96, 165, 250, 0.5)');
    grd.addColorStop(1, 'rgba(96, 165, 250, 0)');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(s.x, s.y, 20, 0, Math.PI * 2); ctx.fill();
    // Ball
    const ballGrd = ctx.createRadialGradient(s.x - 2, s.y - 2, 1, s.x, s.y, 8);
    ballGrd.addColorStop(0, '#93c5fd');
    ballGrd.addColorStop(1, '#3b82f6');
    ctx.fillStyle = ballGrd;
    ctx.beginPath(); ctx.arc(s.x, s.y, 7, 0, Math.PI * 2); ctx.fill();
}

function drawVectors(x, y, vx, vy) {
    if (!toggles.vectors.checked) return;
    const s = toScreen(x, y);
    const vScale = 1.5;
    // Vx
    drawArrow(s.x, s.y, s.x + vx * vScale, s.y, '#34d399', 2);
    // Vy (screen y is inverted)
    drawArrow(s.x, s.y, s.x, s.y - vy * vScale, '#f87171', 2);
    // V total
    drawArrow(s.x, s.y, s.x + vx * vScale, s.y - vy * vScale, '#60a5fa', 2);
}

function drawArrow(x1, y1, x2, y2, color, width) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    if (len < 3) return;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 8 * Math.cos(angle - 0.4), y2 - 8 * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - 8 * Math.cos(angle + 0.4), y2 - 8 * Math.sin(angle + 0.4));
    ctx.closePath(); ctx.fill();
}

function drawCompared() {
    comparedTrajectories.forEach((traj, i) => {
        drawTrail(traj.points, traj.color, 0.35);
        const lastPt = traj.points[traj.points.length - 1];
        const s = toScreen(lastPt.x, lastPt.y);
        ctx.fillStyle = traj.color;
        ctx.font = '10px Inter';
        ctx.fillText(`#${i + 1} (${traj.angle}°, ${traj.v0}m/s)`, s.x - 10, s.y - 10);
    });
}

function drawAngleArc() {
    const rad = params.angle * Math.PI / 180;
    const s = toScreen(0, params.h0);
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 30, -rad, 0);
    ctx.stroke();
    ctx.fillStyle = '#818cf8';
    ctx.font = '11px JetBrains Mono';
    ctx.fillText('θ=' + params.angle + '°', s.x + 34, s.y - 8);
}

// ============ DETAILED ANNOTATIONS ============
function drawAnnotations(traj) {
    const rad = params.angle * Math.PI / 180;
    const vy0 = params.v0 * Math.sin(rad);
    const vx0 = params.v0 * Math.cos(rad);
    const timeToApex = vy0 / params.g;
    const apexX = vx0 * timeToApex;
    const apexY = traj.maxHeight;
    const apexScreen = toScreen(apexX, apexY);
    const groundAtApex = toScreen(apexX, 0);
    const landScreen = toScreen(traj.range, 0);
    const launchScreen = toScreen(0, params.h0);
    const groundOrigin = toScreen(0, 0);

    // --- Dashed line: apex to ground (max height dimension) ---
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(apexScreen.x, apexScreen.y);
    ctx.lineTo(groundAtApex.x, groundAtApex.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Max height label
    const midHY = (apexScreen.y + groundAtApex.y) / 2;
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText('H=' + apexY.toFixed(1) + 'm', apexScreen.x + 8, midHY);

    // --- Apex marker ---
    ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
    ctx.beginPath(); ctx.arc(apexScreen.x, apexScreen.y, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(apexScreen.x, apexScreen.y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('APEX', apexScreen.x, apexScreen.y - 14);

    // --- Range dimension line along ground ---
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(groundOrigin.x, groundOrigin.y + 10);
    ctx.lineTo(landScreen.x, landScreen.y + 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    // Range arrow tips
    ctx.fillStyle = 'rgba(52, 211, 153, 0.7)';
    ctx.beginPath(); ctx.moveTo(groundOrigin.x, groundOrigin.y + 6); ctx.lineTo(groundOrigin.x + 5, groundOrigin.y + 10); ctx.lineTo(groundOrigin.x, groundOrigin.y + 14); ctx.fill();
    ctx.beginPath(); ctx.moveTo(landScreen.x, landScreen.y + 6); ctx.lineTo(landScreen.x - 5, landScreen.y + 10); ctx.lineTo(landScreen.x, landScreen.y + 14); ctx.fill();
    // Range label
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText('R=' + traj.range.toFixed(1) + 'm', (groundOrigin.x + landScreen.x) / 2, groundOrigin.y + 26);

    // --- Landing point marker ---
    ctx.fillStyle = 'rgba(248, 113, 113, 0.25)';
    ctx.beginPath(); ctx.arc(landScreen.x, landScreen.y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f87171';
    ctx.beginPath(); ctx.arc(landScreen.x, landScreen.y, 3, 0, Math.PI * 2); ctx.fill();
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('LAND', landScreen.x, landScreen.y - 12);

    // --- Launch point marker ---
    ctx.fillStyle = 'rgba(96, 165, 250, 0.3)';
    ctx.beginPath(); ctx.arc(launchScreen.x, launchScreen.y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath(); ctx.arc(launchScreen.x, launchScreen.y, 3, 0, Math.PI * 2); ctx.fill();
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('LAUNCH', launchScreen.x, launchScreen.y - 12);

    // --- Time markers along trajectory ---
    ctx.textAlign = 'center';
    const interval = traj.totalTime > 8 ? 2 : traj.totalTime > 4 ? 1 : 0.5;
    for (let t = interval; t < traj.totalTime; t += interval) {
        const mx = vx0 * t;
        const my = params.h0 + vy0 * t - 0.5 * params.g * t * t;
        if (my < 0) break;
        const ms = toScreen(mx, my);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.beginPath(); ctx.arc(ms.x, ms.y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px JetBrains Mono';
        ctx.fillText(t.toFixed(1) + 's', ms.x, ms.y - 8);
    }

    // --- Info box on canvas ---
    drawInfoBox(traj);
}

function drawInfoBox(traj) {
    const cW = canvas.width / (window.devicePixelRatio || 1);
    const bx = cW - 190, by = 55, bw = 178, bh = 90;
    ctx.fillStyle = 'rgba(10, 14, 26, 0.75)';
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 8);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('Parameters', bx + 10, by + 16);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText(`v₀ = ${params.v0} m/s`, bx + 10, by + 32);
    ctx.fillText(`θ  = ${params.angle}°`, bx + 10, by + 46);
    ctx.fillText(`h₀ = ${params.h0} m`, bx + 10, by + 60);
    ctx.fillText(`g  = ${params.g} m/s²`, bx + 10, by + 74);
    ctx.fillStyle = '#64748b';
    ctx.fillText(`T=${traj.totalTime.toFixed(2)}s`, bx + 100, by + 32);
}

function drawLiveTooltip(x, y, t) {
    const s = toScreen(x, y);
    const speed = Math.sqrt(sim.vx ** 2 + sim.vy ** 2);
    const tx = s.x + 18, ty = s.y - 30;
    ctx.fillStyle = 'rgba(10, 14, 26, 0.8)';
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(tx, ty, 110, 42, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '9px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText(`t=${t.toFixed(2)}s  v=${speed.toFixed(1)}`, tx + 6, ty + 14);
    ctx.fillText(`x=${x.toFixed(1)}  y=${y.toFixed(1)}`, tx + 6, ty + 28);
}

function drawVectorLabels(x, y, vx, vy) {
    if (!toggles.vectors.checked) return;
    const s = toScreen(x, y);
    const vs = 1.5;
    ctx.font = '9px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#34d399';
    ctx.fillText('Vx=' + vx.toFixed(1), s.x + vx * vs + 4, s.y - 2);
    ctx.fillStyle = '#f87171';
    ctx.fillText('Vy=' + vy.toFixed(1), s.x + 4, s.y - vy * vs - 4);
    ctx.fillStyle = '#60a5fa';
    const speed = Math.sqrt(vx*vx + vy*vy);
    ctx.fillText('V=' + speed.toFixed(1), s.x + vx * vs + 4, s.y - vy * vs - 4);
}

function drawLegend() {
    const cW = canvas.width / (window.devicePixelRatio || 1);
    const lx = 75, ly = 55;
    ctx.fillStyle = 'rgba(10, 14, 26, 0.65)';
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(lx, ly, 130, 68, 6); ctx.fill(); ctx.stroke();
    ctx.font = 'bold 9px Inter';
    ctx.textAlign = 'left';
    const items = [
        ['#34d399', '● Vx (horizontal)'],
        ['#f87171', '● Vy (vertical)'],
        ['#60a5fa', '● V (resultant)'],
        ['#fbbf24', '● Apex / Max Height'],
    ];
    items.forEach((it, i) => {
        ctx.fillStyle = it[0];
        ctx.fillText(it[1], lx + 8, ly + 14 + i * 14);
    });
}

function drawStatic() {
    const cW = canvas.width / (window.devicePixelRatio || 1);
    const cH = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, cW, cH);

    const traj = calcTrajectory(params.v0, params.angle, params.h0, params.g);
    let maxX = traj.range, maxY = traj.maxHeight;
    comparedTrajectories.forEach(ct => {
        maxX = Math.max(maxX, ct.range);
        maxY = Math.max(maxY, ct.maxHeight);
    });
    scale = calcScale(maxX || 100, maxY || 50);

    drawGrid();
    drawCompared();

    ctx.setLineDash([6, 4]);
    drawTrail(traj.points, '#818cf8', 0.25);
    ctx.setLineDash([]);

    drawAnnotations(traj);
    drawAngleArc();
    drawLegend();
}

// ============ SIMULATION LOOP ============
function launch() {
    if (sim.running) { cancelAnimationFrame(animId); }
    overlay.classList.add('hidden');
    updateParams();

    const rad = params.angle * Math.PI / 180;
    sim = {
        running: true, time: 0, dt: 0.02,
        x: 0, y: params.h0,
        vx: params.v0 * Math.cos(rad),
        vy: params.v0 * Math.sin(rad),
        landed: false
    };
    trail = [{ x: sim.x, y: sim.y }];

    const traj = calcTrajectory(params.v0, params.angle, params.h0, params.g);
    let maxX = traj.range, maxY = traj.maxHeight;
    comparedTrajectories.forEach(ct => {
        maxX = Math.max(maxX, ct.range);
        maxY = Math.max(maxY, ct.maxHeight);
    });
    scale = calcScale(maxX, maxY);

    sim.summary = traj;
    updateSummaryStats(traj);
    animId = requestAnimationFrame(animate);
}

function animate() {
    if (!sim.running) return;

    const stepsPerFrame = 3;
    for (let i = 0; i < stepsPerFrame; i++) {
        if (sim.landed) break;
        sim.vy -= params.g * sim.dt;
        sim.x += sim.vx * sim.dt;
        sim.y += sim.vy * sim.dt;
        sim.time += sim.dt;
        if (sim.y <= 0) { sim.y = 0; sim.landed = true; }
        trail.push({ x: sim.x, y: sim.y });
    }

    const cW = canvas.width / (window.devicePixelRatio || 1);
    const cH = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, cW, cH);

    drawGrid();
    drawCompared();
    if (toggles.trace.checked) drawTrail(trail, '#818cf8', 0.7);
    drawAnnotations(sim.summary);
    drawProjectile(sim.x, sim.y);
    drawVectors(sim.x, sim.y, sim.vx, sim.vy);
    drawVectorLabels(sim.x, sim.y, sim.vx, sim.vy);
    drawAngleArc();
    drawLiveTooltip(sim.x, sim.y, sim.time);
    drawLegend();

    updateLiveStats();

    if (!sim.landed) {
        animId = requestAnimationFrame(animate);
    } else {
        sim.running = false;
        updateLiveStats();
    }
}

// ============ STATS UPDATES ============
function setStatValue(id, val, unit) {
    const card = document.getElementById(id);
    card.querySelector('.stat-value').innerHTML = val + ' <span class="stat-unit">' + unit + '</span>';
}

function updateLiveStats() {
    const speed = Math.sqrt(sim.vx ** 2 + sim.vy ** 2);
    setStatValue('stat-time', sim.time.toFixed(2), 's');
    setStatValue('stat-x', sim.x.toFixed(2), 'm');
    setStatValue('stat-y', sim.y.toFixed(2), 'm');
    setStatValue('stat-vx', sim.vx.toFixed(2), 'm/s');
    setStatValue('stat-vy', sim.vy.toFixed(2), 'm/s');
    setStatValue('stat-speed', speed.toFixed(2), 'm/s');
}

function updateSummaryStats(traj) {
    setStatValue('stat-range', traj.range.toFixed(2), 'm');
    setStatValue('stat-max-height', traj.maxHeight.toFixed(2), 'm');
    setStatValue('stat-total-time', traj.totalTime.toFixed(2), 's');
    const impactSpeed = Math.sqrt(traj.vx ** 2 + (traj.vy0 - params.g * traj.totalTime) ** 2);
    setStatValue('stat-impact-speed', impactSpeed.toFixed(2), 'm/s');
}

function resetStats() {
    ['stat-time', 'stat-x', 'stat-y', 'stat-vx', 'stat-vy', 'stat-speed'].forEach(id => setStatValue(id, '0.00', id.includes('time') ? 's' : id.includes('v') ? 'm/s' : 'm'));
    ['stat-range', 'stat-max-height', 'stat-total-time', 'stat-impact-speed'].forEach(id => setStatValue(id, '—', id.includes('time') ? 's' : id.includes('speed') ? 'm/s' : 'm'));
}

// ============ BUTTONS ============
document.getElementById('launch-btn').addEventListener('click', launch);
document.getElementById('reset-btn').addEventListener('click', () => {
    if (animId) cancelAnimationFrame(animId);
    sim.running = false;
    trail = [];
    overlay.classList.remove('hidden');
    resetStats();
    drawStatic();
});

document.getElementById('compare-btn').addEventListener('click', () => {
    updateParams();
    const traj = calcTrajectory(params.v0, params.angle, params.h0, params.g);
    const color = trailColors[comparedTrajectories.length % trailColors.length];
    comparedTrajectories.push({
        points: traj.points, range: traj.range, maxHeight: traj.maxHeight,
        totalTime: traj.totalTime, v0: params.v0, angle: params.angle,
        h0: params.h0, g: params.g, color
    });
    updateComparisonTable();
    drawStatic();
});

document.getElementById('clear-compare-btn').addEventListener('click', () => {
    comparedTrajectories = [];
    updateComparisonTable();
    drawStatic();
});

// ============ COMPARISON TABLE ============
function updateComparisonTable() {
    const tbody = document.getElementById('comparison-body');
    if (comparedTrajectories.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="9">No trajectories added yet. Use "Add to Compare" in the Simulator.</td></tr>';
        return;
    }
    tbody.innerHTML = comparedTrajectories.map((t, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${t.color};vertical-align:middle;"></span></td>
            <td>${t.v0}</td>
            <td>${t.angle}</td>
            <td>${t.h0}</td>
            <td>${t.g}</td>
            <td>${t.range.toFixed(2)}</td>
            <td>${t.maxHeight.toFixed(2)}</td>
            <td>${t.totalTime.toFixed(2)}</td>
        </tr>
    `).join('');
}

// ============ ANALYSIS CHARTS (Pure Canvas) ============
function drawChart(canvasId, title, xLabel, yLabel, datasets) {
    const c = document.getElementById(canvasId);
    const cctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = c.parentElement.getBoundingClientRect();
    c.width = (rect.width - 48) * dpr;
    c.height = 350 * dpr;
    c.style.width = (rect.width - 48) + 'px';
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = c.width / dpr, H = c.height / dpr;
    const pad = { top: 40, right: 30, bottom: 45, left: 55 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    // Clear
    cctx.clearRect(0, 0, W, H);

    // Find data bounds
    let minX = Infinity, maxX = -Infinity, minY = 0, maxY = -Infinity;
    datasets.forEach(ds => ds.data.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }));
    maxY *= 1.1;
    if (maxY === 0) maxY = 10;

    function toChartX(v) { return pad.left + ((v - minX) / (maxX - minX)) * plotW; }
    function toChartY(v) { return pad.top + plotH - (v / maxY) * plotH; }

    // Grid
    cctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
    cctx.lineWidth = 1;
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
        const y = pad.top + (i / ySteps) * plotH;
        cctx.beginPath(); cctx.moveTo(pad.left, y); cctx.lineTo(W - pad.right, y); cctx.stroke();
        cctx.fillStyle = '#64748b';
        cctx.font = '10px JetBrains Mono';
        cctx.textAlign = 'right';
        cctx.fillText(((ySteps - i) / ySteps * maxY).toFixed(1), pad.left - 8, y + 4);
    }
    const xSteps = 6;
    for (let i = 0; i <= xSteps; i++) {
        const x = pad.left + (i / xSteps) * plotW;
        cctx.beginPath(); cctx.moveTo(x, pad.top); cctx.lineTo(x, pad.top + plotH); cctx.stroke();
        cctx.fillStyle = '#64748b';
        cctx.font = '10px JetBrains Mono';
        cctx.textAlign = 'center';
        cctx.fillText((minX + (i / xSteps) * (maxX - minX)).toFixed(1), x, H - pad.bottom + 18);
    }

    // Axes
    cctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    cctx.lineWidth = 1.5;
    cctx.beginPath(); cctx.moveTo(pad.left, pad.top); cctx.lineTo(pad.left, pad.top + plotH); cctx.lineTo(W - pad.right, pad.top + plotH); cctx.stroke();

    // Data
    datasets.forEach(ds => {
        cctx.strokeStyle = ds.color;
        cctx.lineWidth = 2;
        cctx.beginPath();
        ds.data.forEach((p, i) => {
            const sx = toChartX(p.x), sy = toChartY(p.y);
            if (i === 0) cctx.moveTo(sx, sy); else cctx.lineTo(sx, sy);
        });
        cctx.stroke();

        // Fill under
        cctx.globalAlpha = 0.08;
        cctx.lineTo(toChartX(ds.data[ds.data.length - 1].x), toChartY(0));
        cctx.lineTo(toChartX(ds.data[0].x), toChartY(0));
        cctx.closePath();
        cctx.fillStyle = ds.color;
        cctx.fill();
        cctx.globalAlpha = 1;
    });

    // Labels
    cctx.fillStyle = '#94a3b8';
    cctx.font = '12px Inter';
    cctx.textAlign = 'center';
    cctx.fillText(xLabel, pad.left + plotW / 2, H - 5);
    cctx.save();
    cctx.translate(14, pad.top + plotH / 2);
    cctx.rotate(-Math.PI / 2);
    cctx.fillText(yLabel, 0, 0);
    cctx.restore();

    // Title
    cctx.fillStyle = '#e2e8f0';
    cctx.font = 'bold 13px Inter';
    cctx.textAlign = 'left';
    cctx.fillText(title, pad.left, pad.top - 15);

    // Legend
    let lx = W - pad.right;
    datasets.forEach(ds => {
        cctx.textAlign = 'right';
        cctx.fillStyle = ds.color;
        cctx.font = '10px Inter';
        const tw = cctx.measureText(ds.label).width;
        cctx.fillText(ds.label, lx, pad.top - 15);
        cctx.fillRect(lx - tw - 16, pad.top - 20, 10, 10);
        lx -= tw + 30;
    });
}

document.getElementById('generate-chart-btn').addEventListener('click', () => {
    updateParams();
    const data = [];
    for (let a = 1; a <= 89; a++) {
        const traj = calcTrajectory(params.v0, a, params.h0, params.g);
        data.push({ x: a, y: traj.range });
    }
    drawChart('analysis-chart', `Range vs Angle (v₀=${params.v0} m/s, g=${params.g} m/s²)`,
        'Angle (°)', 'Range (m)', [{ data, color: '#818cf8', label: 'Range' }]);
});

document.getElementById('generate-height-chart-btn').addEventListener('click', () => {
    if (comparedTrajectories.length === 0) {
        alert('Add some trajectories to compare first!');
        return;
    }
    const datasets = comparedTrajectories.map((t, i) => ({
        data: t.points.map(p => ({ x: p.t, y: p.y })),
        color: t.color,
        label: `#${i + 1} (${t.angle}°)`
    }));
    drawChart('height-chart', 'Height vs Time', 'Time (s)', 'Height (m)', datasets);
});

// Toggle redraws
Object.values(toggles).forEach(t => t.addEventListener('change', () => { if (!sim.running) drawStatic(); }));

// Init
updateParams();
setTimeout(drawStatic, 200);
