/* Low Poly Square: tiny 3D RPG town square. Raw WebGL, flat-shaded low-poly meshes, no dependencies. */
(function () {
    'use strict';
    var TEXT = {
        en: { diagOpen: 'Controller diagnostics', diagClose: 'Close diagnostics', diagTitle: 'Controller & sensor diagnostics', diagExit: 'Press Back (remote) \u2192 Close diagnostics', gpHead: 'Gamepad (raw)', noPad: 'No gamepad detected. Press any button on the controller.', btnHead: 'Buttons', axHead: 'Axes', senHead: 'Accelerometer / gyroscope', noSen: 'No motion data received (this device or controller does not expose it).', accel: 'Accel (m/s\u00b2)', gyro: 'Gyro (\u00b0/s)', actHead: 'My PC actions held', lastAct: 'Last action', none: 'none', title: 'Low Poly Square', hint: 'Arrows: walk', talk: 'OK: talk', next: 'OK: continue',
              npcs: [
                  { name: 'Mara', lines: ['Welcome to the square, traveler!', 'The baker opens at dawn.'] },
                  { name: 'Old Tom', lines: ['This fountain is older than the town.', 'Rumour says a dragon sleeps in the hills.'] },
                  { name: 'Pip', lines: ['I am guarding the gate. Very important job!', 'Nothing ever happens here... yet.'] }
              ], restart: 'Back to start' },
        fr: { diagOpen: 'Diagnostic manette', diagClose: 'Fermer le diagnostic', diagTitle: 'Diagnostic manette et capteurs', diagExit: 'Appuyez sur Retour (t\u00e9l\u00e9commande) \u2192 Fermer le diagnostic', gpHead: 'Manette (brut)', noPad: 'Aucune manette d\u00e9tect\u00e9e. Appuyez sur un bouton.', btnHead: 'Boutons', axHead: 'Axes', senHead: 'Acc\u00e9l\u00e9rom\u00e8tre / gyroscope', noSen: 'Aucune donn\u00e9e de mouvement re\u00e7ue (non expos\u00e9e par cet appareil ou la manette).', accel: 'Acc\u00e9l (m/s\u00b2)', gyro: 'Gyro (\u00b0/s)', actHead: 'Actions My PC maintenues', lastAct: 'Derni\u00e8re action', none: 'aucune', title: 'Place Low Poly', hint: 'Flèches : marcher', talk: 'OK : parler', next: 'OK : continuer',
              npcs: [
                  { name: 'Mara', lines: ['Bienvenue sur la place, voyageur !', 'Le boulanger ouvre à l’aube.'] },
                  { name: 'Vieux Tom', lines: ['Cette fontaine est plus vieille que la ville.', 'On dit qu’un dragon dort dans les collines.'] },
                  { name: 'Pip', lines: ['Je garde la porte. Travail très important !', 'Il ne se passe jamais rien ici... pour l’instant.'] }
              ], restart: 'Retour au départ' },
        es: { diagOpen: 'Diagn\u00f3stico del mando', diagClose: 'Cerrar diagn\u00f3stico', diagTitle: 'Diagn\u00f3stico de mando y sensores', diagExit: 'Pulsa Atr\u00e1s (mando a distancia) \u2192 Cerrar diagn\u00f3stico', gpHead: 'Mando (sin procesar)', noPad: 'No se detecta ning\u00fan mando. Pulsa un bot\u00f3n.', btnHead: 'Botones', axHead: 'Ejes', senHead: 'Aceler\u00f3metro / giroscopio', noSen: 'No se reciben datos de movimiento (este dispositivo o mando no los expone).', accel: 'Acel (m/s\u00b2)', gyro: 'Giro (\u00b0/s)', actHead: 'Acciones de My PC activas', lastAct: '\u00daltima acci\u00f3n', none: 'ninguna', title: 'Plaza Low Poly', hint: 'Flechas: caminar', talk: 'OK: hablar', next: 'OK: continuar',
              npcs: [
                  { name: 'Mara', lines: ['¡Bienvenido a la plaza, viajero!', 'El panadero abre al amanecer.'] },
                  { name: 'Viejo Tom', lines: ['Esta fuente es más vieja que el pueblo.', 'Dicen que un dragón duerme en las colinas.'] },
                  { name: 'Pip', lines: ['Vigilo la puerta. ¡Trabajo importante!', 'Aquí nunca pasa nada... todavía.'] }
              ], restart: 'Volver al inicio' },
        ar: { diagOpen: 'تشخيص ذراع التحكم', diagClose: 'إغلاق التشخيص', diagTitle: 'تشخيص ذراع التحكم والحساسات', diagExit: 'اضغط رجوع (الريموت) ← إغلاق التشخيص', gpHead: 'ذراع التحكم (خام)', noPad: 'لم يتم اكتشاف ذراع. اضغط أي زر.', btnHead: 'الأزرار', axHead: 'المحاور', senHead: 'مقياس التسارع / الجيروسكوب', noSen: 'لا توجد بيانات حركة (الجهاز أو الذراع لا يوفرها).', accel: 'التسارع (م/ث²)', gyro: 'الجيرو (°/ث)', actHead: 'أوامر My PC المضغوطة', lastAct: 'آخر أمر', none: 'لا شيء', title: 'ساحة لو بولي', hint: 'الأسهم: للمشي', talk: 'OK: تحدث', next: 'OK: متابعة',
              npcs: [
                  { name: 'مارا', lines: ['أهلاً بك في الساحة أيها المسافر!', 'الخباز يفتح عند الفجر.'] },
                  { name: 'العم توم', lines: ['هذه النافورة أقدم من البلدة.', 'يقال إن تنيناً ينام في التلال.'] },
                  { name: 'بيب', lines: ['أحرس البوابة. عمل مهم جداً!', 'لا يحدث شيء هنا... حتى الآن.'] }
              ], restart: 'العودة إلى البداية' }
    };
    var t = TEXT.en, rtl = false;
    var SKY = [0.62, 0.83, 1.0];
    var STEP = 1000 / 60, LIM = 19, PR = 0.5, SPEED = 5 / 60;

    var canvas, gl, prog, uVP, uM, uFog, raf = 0, last = 0, acc = 0, ready = false;
    var hintEl, topEl, dlgEl, diagEl, lowTier = false;
    var DIAG = { on: false, t: 0, btn: [], ax: [], pad: null, btnBox: null, axBox: null, sen: null, acc: null, gyr: null, act: null, last: null, lastTxt: '', motion: false, ax3: [0, 0, 0], gy3: [0, 0, 0] };
    var BTN = ['B', 'A', 'Y', 'X', 'L', 'R', 'ZL', 'ZR', '\u2212', '+', 'LS', 'RS', '\u2191', '\u2193', '\u2190', '\u2192', 'Home', 'Capt'];
    var ACTIONS = ['left', 'right', 'up', 'down', 'confirm', 'jump', 'run', 'cancel', 'pause', 'menu'];

    // ---------- math (preallocated, no per-frame allocation) ----------
    var P = new Float32Array(16), V = new Float32Array(16), VP = new Float32Array(16), M = new Float32Array(16);
    function perspective(o, fovy, asp, n, f) {
        var q = 1 / Math.tan(fovy / 2);
        o.fill(0); o[0] = q / asp; o[5] = q; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f);
    }
    function lookAt(o, ex, ey, ez, cx, cy, cz) {
        var fx = cx - ex, fy = cy - ey, fz = cz - ez, l = Math.sqrt(fx * fx + fy * fy + fz * fz);
        fx /= l; fy /= l; fz /= l;
        var sx = fy * 0 - fz * 1, sy = fz * 0 - fx * 0, sz = fx * 1 - fy * 0;        // f x up(0,1,0)
        l = Math.sqrt(sx * sx + sy * sy + sz * sz); sx /= l; sy /= l; sz /= l;
        var ux = sy * fz - sz * fy, uy = sz * fx - sx * fz, uz = sx * fy - sy * fx;
        o[0] = sx; o[1] = ux; o[2] = -fx; o[3] = 0;
        o[4] = sy; o[5] = uy; o[6] = -fy; o[7] = 0;
        o[8] = sz; o[9] = uz; o[10] = -fz; o[11] = 0;
        o[12] = -(sx * ex + sy * ey + sz * ez); o[13] = -(ux * ex + uy * ey + uz * ez); o[14] = (fx * ex + fy * ey + fz * ez); o[15] = 1;
    }
    function mul(o, a, b) {
        for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
            o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
        }
    }
    function modelRotY(x, y, z, ang) {
        var c = Math.cos(ang), s = Math.sin(ang);
        M[0] = c; M[1] = 0; M[2] = -s; M[3] = 0; M[4] = 0; M[5] = 1; M[6] = 0; M[7] = 0;
        M[8] = s; M[9] = 0; M[10] = c; M[11] = 0; M[12] = x; M[13] = y; M[14] = z; M[15] = 1;
    }

    // ---------- mesh builder (init only) ----------
    function Mesh() { this.v = []; this.n = 0; }
    Mesh.prototype.tri = function (a, b, c, col, ix, iy, iz) {      // normal oriented away from interior point
        var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], wx = c[0] - a[0], wy = c[1] - a[1], wz = c[2] - a[2];
        var nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx, l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        nx /= l; ny /= l; nz /= l;
        if (nx * (a[0] - ix) + ny * (a[1] - iy) + nz * (a[2] - iz) < 0) { nx = -nx; ny = -ny; nz = -nz; }
        var pts = [a, b, c];
        for (var i = 0; i < 3; i++) this.v.push(pts[i][0], pts[i][1], pts[i][2], nx, ny, nz, col[0], col[1], col[2]);
        this.n += 3;
    };
    Mesh.prototype.quad = function (a, b, c, d, col, ix, iy, iz) { this.tri(a, b, c, col, ix, iy, iz); this.tri(a, c, d, col, ix, iy, iz); };
    function shade(col, k) { return [col[0] * k, col[1] * k, col[2] * k]; }
    Mesh.prototype.box = function (cx, cy, cz, sx, sy, sz, col) {
        var x0 = cx - sx / 2, x1 = cx + sx / 2, y0 = cy - sy / 2, y1 = cy + sy / 2, z0 = cz - sz / 2, z1 = cz + sz / 2;
        var p = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
        var F = [[0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0]];
        for (var i = 0; i < 6; i++) this.quad(p[F[i][0]], p[F[i][1]], p[F[i][2]], p[F[i][3]], col, cx, cy, cz);
    };
    Mesh.prototype.cyl = function (cx, y0, cz, r0, r1, h, seg, col) {     // r1 = 0 gives a cone
        var iy = y0 + h / 2;
        for (var i = 0; i < seg; i++) {
            var a0 = i / seg * 6.2832, a1 = (i + 1) / seg * 6.2832;
            var b0 = [cx + Math.cos(a0) * r0, y0, cz + Math.sin(a0) * r0], b1 = [cx + Math.cos(a1) * r0, y0, cz + Math.sin(a1) * r0];
            var t0 = [cx + Math.cos(a0) * r1, y0 + h, cz + Math.sin(a0) * r1], t1 = [cx + Math.cos(a1) * r1, y0 + h, cz + Math.sin(a1) * r1];
            var c = col;
            if (r1 > 0) { this.quad(b0, b1, t1, t0, c, cx, iy, cz); this.tri([cx, y0 + h, cz], t0, t1, shade(c, 1.1), cx, iy, cz); }
            else this.tri(b0, b1, t0, c, cx, iy, cz);
            this.tri([cx, y0, cz], b0, b1, shade(c, 0.7), cx, iy, cz);
        }
    };
    Mesh.prototype.pyramid = function (cx, y0, cz, hx, hz, h, col) {
        var ap = [cx, y0 + h, cz], c = [[cx - hx, y0, cz - hz], [cx + hx, y0, cz - hz], [cx + hx, y0, cz + hz], [cx - hx, y0, cz + hz]];
        for (var i = 0; i < 4; i++) this.tri(c[i], c[(i + 1) % 4], ap, shade(col, i % 2 ? 0.85 : 1), cx, y0 + h / 3, cz);
    };
    Mesh.prototype.flat = function (x0, z0, x1, z1, y, col) {
        this.quad([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], col, (x0 + x1) / 2, y - 1, (z0 + z1) / 2);
    };
    Mesh.prototype.upload = function () {
        var b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.v), gl.STATIC_DRAW);
        this.buf = b; this.v = null;
    };

    // ---------- world ----------
    var boxes = [], circles = [];            // collision: [x0,z0,x1,z1], [x,z,r]
    var world, hero, npcMeshes = [];
    var NPC = [{ x: -6, z: 6, a: 0.6 }, { x: 8, z: 5, a: -0.8 }, { x: -9, z: -4, a: 2.4 }];
    var player = { x: 0, z: 8, a: 0, bob: 0, moving: false };
    var cam = { x: 0, z: 8 };
    var near = -1, state = 'play', talkNpc = -1, talkLine = 0;

    function building(m, cx, cz, w, d, h, wall, roof, fx, fz) {
        m.box(cx, h / 2, cz, w, h, d, wall);
        m.pyramid(cx, h, cz, w / 2 + 0.5, d / 2 + 0.5, h * 0.45, roof);
        boxes.push([cx - w / 2 - 0.1, cz - d / 2 - 0.1, cx + w / 2 + 0.1, cz + d / 2 + 0.1]);
        var hf = fx ? w / 2 : d / 2, lt = fx ? d : w, tx = fz ? 1 : 0, tz = fx ? 1 : 0;
        var px = cx + fx * (hf + 0.05), pz = cz + fz * (hf + 0.05);
        var thin = 0.2, wide = 1.5;
        m.box(px, 1.1, pz, fx ? thin : wide, 2.2, fz ? thin : wide, [0.42, 0.28, 0.17]);
        if (h >= 4) for (var s = -1; s <= 1; s += 2) {
            m.box(px + tx * s * lt * 0.3, h * 0.62, pz + tz * s * lt * 0.3, fx ? thin : 1.2, 1.1, fz ? thin : 1.2, [1, 0.88, 0.45]);
        }
    }
    function tree(m, x, z, s) {
        m.cyl(x, 0, z, 0.25 * s, 0.2 * s, 1.2 * s, 5, [0.45, 0.3, 0.18]);
        m.cyl(x, 1 * s, z, 1.3 * s, 0, 2.6 * s, 6, [0.25, 0.6, 0.28]);
        m.cyl(x, 2.2 * s, z, 1 * s, 0, 2.2 * s, 6, [0.3, 0.68, 0.32]);
        circles.push([x, z, 0.6 * s]);
    }
    function lamp(m, x, z) {
        m.cyl(x, 0, z, 0.12, 0.1, 3, 5, [0.2, 0.2, 0.25]);
        m.box(x, 3.2, z, 0.5, 0.5, 0.5, [1, 0.9, 0.5]);
        circles.push([x, z, 0.3]);
    }
    function character(shirt, hair) {
        var m = new Mesh(), skin = [0.95, 0.75, 0.6];
        m.box(-0.18, 0.35, 0, 0.28, 0.7, 0.3, [0.2, 0.2, 0.3]);
        m.box(0.18, 0.35, 0, 0.28, 0.7, 0.3, [0.2, 0.2, 0.3]);
        m.box(0, 1.1, 0, 0.8, 0.8, 0.45, shirt);
        m.box(0, 1.8, 0, 0.55, 0.55, 0.55, skin);
        m.box(0, 2.1, -0.04, 0.6, 0.18, 0.6, hair);
        m.box(0, 1.85, 0.29, 0.3, 0.08, 0.04, [0.15, 0.1, 0.1]);
        for (var i = 0; i < 8; i++) {      // blob shadow
            var a0 = i / 8 * 6.2832, a1 = (i + 1) / 8 * 6.2832;
            m.tri([0, 0.03, 0], [Math.cos(a0) * 0.6, 0.03, Math.sin(a0) * 0.6], [Math.cos(a1) * 0.6, 0.03, Math.sin(a1) * 0.6], [0.2, 0.35, 0.15], 0, -1, 0);
        }
        m.upload();
        return m;
    }
    function buildWorld() {
        var m = new Mesh(), i, j;
        m.flat(-120, -120, 120, 120, -0.02, [0.42, 0.72, 0.38]);
        for (i = -5; i < 5; i++) for (j = -5; j < 5; j++) {
            m.flat(i * 4, j * 4, i * 4 + 4, j * 4 + 4, 0.01, ((i + j) & 1) ? [0.74, 0.72, 0.68] : [0.66, 0.64, 0.6]);
        }
        // boundary wall
        var wc = [0.55, 0.53, 0.5];
        m.box(0, 0.5, -20, 41, 1, 0.8, wc); m.box(0, 0.5, 20, 41, 1, 0.8, wc);
        m.box(-20, 0.5, 0, 0.8, 1, 41, wc); m.box(20, 0.5, 0, 0.8, 1, 41, wc);
        // fountain
        m.cyl(0, 0, 0, 3, 3, 0.7, 10, [0.62, 0.6, 0.58]);
        m.cyl(0, 0.7, 0, 2.5, 2.5, 0.05, 10, [0.35, 0.65, 0.9]);
        m.cyl(0, 0.7, 0, 0.4, 0.3, 1.8, 6, [0.7, 0.68, 0.65]);
        m.cyl(0, 2.5, 0, 1, 0.3, 0.3, 8, [0.35, 0.65, 0.9]);
        circles.push([0, 0, 3.1]);
        // buildings: x, z, w, d, h, wall, roof, front direction
        building(m, -12, -14, 9, 7, 5, [0.95, 0.85, 0.65], [0.78, 0.3, 0.22], 0, 1);
        building(m, 0, -15, 8, 6, 6, [0.85, 0.88, 0.95], [0.3, 0.4, 0.7], 0, 1);
        building(m, 11, -14, 8, 7, 4.5, [0.95, 0.78, 0.7], [0.55, 0.32, 0.22], 0, 1);
        building(m, -15, 2, 6, 8, 4.5, [0.8, 0.92, 0.8], [0.7, 0.45, 0.25], 1, 0);
        building(m, 15.5, 3, 5, 7, 4.5, [0.98, 0.9, 0.7], [0.75, 0.28, 0.28], -1, 0);
        building(m, -12, 15, 4.5, 4, 3, [0.92, 0.82, 0.7], [0.5, 0.35, 0.25], 0, 1);
        building(m, 12, 15, 4.5, 4, 3, [0.85, 0.85, 0.9], [0.4, 0.5, 0.35], 0, 1);
        // trees and lamps
        tree(m, -17, -6, 1.2); tree(m, 17, -7, 1.1); tree(m, -17, 10, 1); tree(m, 17, 10, 1.2); tree(m, 5, 17, 0.9); tree(m, -5, 17, 1);
        for (i = 0; i < 12; i++) tree(m, -60 + i * 11, -35 - (i % 3) * 6, 2.2);
        lamp(m, -6, -8); lamp(m, 6, -8); lamp(m, -8, 8); lamp(m, 8, 8);
        m.upload();
        world = m;
        hero = character([0.25, 0.45, 0.85], [0.35, 0.2, 0.1]);
        npcMeshes = [character([0.85, 0.35, 0.5], [0.9, 0.7, 0.2]), character([0.5, 0.5, 0.55], [0.85, 0.85, 0.85]), character([0.3, 0.7, 0.4], [0.15, 0.1, 0.1])];
    }

    // ---------- GL ----------
    function shader(type, src) {
        var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
    }
    function initGL() {
        gl = canvas.getContext('webgl', { antialias: !lowTier, alpha: false, powerPreference: 'high-performance' });
        if (!gl) return false;
        prog = gl.createProgram();
        gl.attachShader(prog, shader(gl.VERTEX_SHADER,
            'attribute vec3 aP,aN,aC;uniform mat4 uVP,uM;varying vec3 vC;varying float vF;' +
            'void main(){vec4 w=uM*vec4(aP,1.);gl_Position=uVP*w;vec3 n=normalize((uM*vec4(aN,0.)).xyz);' +
            'float l=0.5+0.6*max(dot(n,normalize(vec3(0.5,1.,0.35))),0.);vC=aC*l;vF=clamp((gl_Position.w-55.)/45.,0.,1.);}'));
        gl.attachShader(prog, shader(gl.FRAGMENT_SHADER,
            'precision mediump float;uniform vec3 uFog;varying vec3 vC;varying float vF;void main(){gl_FragColor=vec4(mix(vC,uFog,vF),1.);}'));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
        gl.useProgram(prog);
        uVP = gl.getUniformLocation(prog, 'uVP'); uM = gl.getUniformLocation(prog, 'uM'); uFog = gl.getUniformLocation(prog, 'uFog');
        gl.uniform3f(uFog, SKY[0], SKY[1], SKY[2]);
        for (var i = 0; i < 3; i++) gl.enableVertexAttribArray(i);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(SKY[0], SKY[1], SKY[2], 1);
        return true;
    }
    function drawMesh(m) {
        gl.bindBuffer(gl.ARRAY_BUFFER, m.buf);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 36, 0);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 36, 12);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 36, 24);
        gl.drawArrays(gl.TRIANGLES, 0, m.n);
    }
    function resize() {
        var maxW = lowTier ? 1280 : 1920, k = Math.min(1, maxW / window.innerWidth);
        canvas.width = Math.round(window.innerWidth * k); canvas.height = Math.round(window.innerHeight * k);
        if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // ---------- game ----------
    function blocked(x, z) {
        var i, b, c, px, pz, dx, dz, r;
        for (i = 0; i < boxes.length; i++) {
            b = boxes[i];
            px = x < b[0] ? b[0] : (x > b[2] ? b[2] : x); pz = z < b[1] ? b[1] : (z > b[3] ? b[3] : z);
            dx = x - px; dz = z - pz;
            if (dx * dx + dz * dz < PR * PR) return true;
        }
        for (i = 0; i < circles.length; i++) {
            c = circles[i]; dx = x - c[0]; dz = z - c[1]; r = c[2] + PR;
            if (dx * dx + dz * dz < r * r) return true;
        }
        for (i = 0; i < NPC.length; i++) {
            dx = x - NPC[i].x; dz = z - NPC[i].z;
            if (dx * dx + dz * dz < 1) return true;
        }
        return false;
    }
    function setHint(s) { if (hintEl.textContent !== s) hintEl.textContent = s; }
    function showDialog() {
        var n = t.npcs[talkNpc], last = talkLine >= n.lines.length - 1;
        while (dlgEl.firstChild) dlgEl.removeChild(dlgEl.firstChild);
        var b = document.createElement('b'); b.textContent = n.name;
        var p = document.createElement('span'); p.textContent = n.lines[talkLine];
        var i = document.createElement('i'); i.textContent = t.next;
        dlgEl.appendChild(b); dlgEl.appendChild(p); dlgEl.appendChild(i);
        dlgEl.style.display = 'block';
        MyPC.announce(n.name + '. ' + n.lines[talkLine]);
        if (last) { /* last line: next OK closes */ }
    }
    function confirm() {
        if (state === 'talk') {
            if (++talkLine >= t.npcs[talkNpc].lines.length) { state = 'play'; dlgEl.style.display = 'none'; MyPC.save('pos', { x: player.x, z: player.z }); }
            else showDialog();
        } else if (near >= 0) {
            state = 'talk'; talkNpc = near; talkLine = 0;
            NPC[near].a = Math.atan2(player.x - NPC[near].x, player.z - NPC[near].z);
            showDialog(); setHint('');
        }
    }
    function step() {
        var dx = 0, dz = 0, i, nx, nz;
        if (state === 'play') {
            if (MyPC.isDown('left')) dx -= 1; if (MyPC.isDown('right')) dx += 1;
            if (MyPC.isDown('up')) dz -= 1; if (MyPC.isDown('down')) dz += 1;
        }
        player.moving = dx !== 0 || dz !== 0;
        if (player.moving) {
            var l = Math.sqrt(dx * dx + dz * dz); dx = dx / l * SPEED; dz = dz / l * SPEED;
            nx = Math.max(-LIM, Math.min(LIM, player.x + dx));
            if (!blocked(nx, player.z)) player.x = nx;
            nz = Math.max(-LIM, Math.min(LIM, player.z + dz));
            if (!blocked(player.x, nz)) player.z = nz;
            var ta = Math.atan2(dx, dz), d = ta - player.a;
            while (d > Math.PI) d -= 6.2832; while (d < -Math.PI) d += 6.2832;
            player.a += d * 0.25;
            player.bob += 0.3;
        } else player.bob = 0;
        cam.x += (player.x - cam.x) * 0.08; cam.z += (player.z - cam.z) * 0.08;
        if (state === 'play') {
            near = -1;
            for (i = 0; i < NPC.length; i++) {
                var ex = player.x - NPC[i].x, ez = player.z - NPC[i].z;
                if (ex * ex + ez * ez < 6) { near = i; break; }
            }
            setHint(near >= 0 ? t.talk : '');
        }
    }
    function draw() {
        var i, aspect = canvas.width / canvas.height;
        perspective(P, 0.85, aspect, 1, 140);
        lookAt(V, cam.x, 24, cam.z + 19, cam.x, 0, cam.z + 1);
        mul(VP, P, V);
        gl.uniformMatrix4fv(uVP, false, VP);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        modelRotY(0, 0, 0, 0); gl.uniformMatrix4fv(uM, false, M); drawMesh(world);
        for (i = 0; i < NPC.length; i++) {
            modelRotY(NPC[i].x, 0, NPC[i].z, NPC[i].a); gl.uniformMatrix4fv(uM, false, M); drawMesh(npcMeshes[i]);
        }
        modelRotY(player.x, Math.abs(Math.sin(player.bob)) * 0.12, player.z, player.a); gl.uniformMatrix4fv(uM, false, M); drawMesh(hero);
    }
    function frame(ts) {
        raf = requestAnimationFrame(frame);
        if (!last) last = ts;
        acc += Math.min(250, ts - last); last = ts;
        while (acc >= STEP) { step(); acc -= STEP; }
        if (DIAG.on) { if (ts - DIAG.t > 100) { DIAG.t = ts; updateDiag(); } } else draw();
    }
    function startLoop() { if (!raf) { last = 0; acc = 0; raf = requestAnimationFrame(frame); } }
    function stopLoop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

    // ---------- diagnostics screen (closed from My PC's pause menu: Back -> Close diagnostics) ----------
    function mk(tag, cls, txt, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; if (parent) parent.appendChild(e); return e; }
    function buildDiag() {
        var i, c;
        mk('h1', '', t.diagTitle, diagEl);
        mk('p', 'dx', t.diagExit, diagEl);
        var cols = mk('div', 'dcols', '', diagEl), l = mk('div', '', '', cols), r = mk('div', '', '', cols);
        mk('h2', '', t.gpHead, l); DIAG.pad = mk('p', 'dm', '', l);
        mk('h2', '', t.btnHead, l); DIAG.btnBox = mk('div', 'grid', '', l);
        for (i = 0; i < 24; i++) { c = mk('span', 'cell', i < BTN.length ? BTN[i] : String(i), DIAG.btnBox); DIAG.btn.push(c); }
        mk('h2', '', t.axHead, l); DIAG.axBox = mk('div', 'grid ax', '', l);
        for (i = 0; i < 8; i++) { c = mk('span', 'cell', '', DIAG.axBox); DIAG.ax.push(c); }
        mk('h2', '', t.senHead, r); DIAG.sen = mk('p', 'dm', t.noSen, r);
        DIAG.acc = mk('p', 'dm mono', '', r); DIAG.gyr = mk('p', 'dm mono', '', r);
        mk('h2', '', t.actHead, r); DIAG.act = mk('p', 'dm mono', '', r);
        mk('h2', '', t.lastAct, r); DIAG.last = mk('p', 'dm mono', '', r);
    }
    function onMotion(e) {
        var a = e.accelerationIncludingGravity || e.acceleration, g = e.rotationRate;
        if (a && a.x !== null) { DIAG.ax3[0] = a.x; DIAG.ax3[1] = a.y; DIAG.ax3[2] = a.z; DIAG.motion = true; }
        if (g && g.alpha !== null) { DIAG.gy3[0] = g.alpha; DIAG.gy3[1] = g.beta; DIAG.gy3[2] = g.gamma; DIAG.motion = true; }
    }
    function fx(v) { return (v < 0 ? '' : '+') + v.toFixed(2); }
    function updateDiag() {
        var i, gps = null, gp = null, n;
        try { gps = navigator.getGamepads ? navigator.getGamepads() : null; } catch (e) { gps = null; }
        if (gps) for (i = 0; i < gps.length; i++) if (gps[i] && gps[i].connected) { gp = gps[i]; break; }
        if (!gp) {
            DIAG.pad.textContent = t.noPad;
            for (i = 0; i < 24; i++) { DIAG.btn[i].className = 'cell' + (i < BTN.length ? '' : ' off'); }
            for (i = 0; i < 8; i++) DIAG.ax[i].className = 'cell off';
        } else {
            DIAG.pad.textContent = gp.id + ' [' + (gp.mapping || 'raw') + ']';
            n = gp.buttons.length;
            for (i = 0; i < 24; i++) {
                if (i < n) { DIAG.btn[i].className = 'cell' + (gp.buttons[i].pressed ? ' on' : ''); DIAG.btn[i].textContent = (i < BTN.length && gp.mapping === 'standard' ? BTN[i] : '#' + i) + (gp.buttons[i].value > 0 && gp.buttons[i].value < 1 ? ' ' + gp.buttons[i].value.toFixed(1) : ''); }
                else DIAG.btn[i].className = 'cell off';
            }
            for (i = 0; i < 8; i++) {
                if (i < gp.axes.length) { DIAG.ax[i].className = 'cell' + (Math.abs(gp.axes[i]) > 0.25 ? ' on' : ''); DIAG.ax[i].textContent = 'A' + i + ' ' + fx(gp.axes[i]); }
                else DIAG.ax[i].className = 'cell off';
            }
        }
        DIAG.sen.style.display = DIAG.motion ? 'none' : 'block';
        DIAG.acc.textContent = t.accel + ': X ' + fx(DIAG.ax3[0]) + '  Y ' + fx(DIAG.ax3[1]) + '  Z ' + fx(DIAG.ax3[2]);
        DIAG.gyr.textContent = t.gyro + ': α ' + fx(DIAG.gy3[0]) + '  β ' + fx(DIAG.gy3[1]) + '  γ ' + fx(DIAG.gy3[2]);
        var held = '';
        for (i = 0; i < ACTIONS.length; i++) if (MyPC.isDown(ACTIONS[i])) held += ACTIONS[i] + ' ';
        DIAG.act.textContent = held || t.none;
        DIAG.last.textContent = DIAG.lastTxt || t.none;
    }
    function setMenus() {
        MyPC.setMenu(DIAG.on ? [{ id: 'closediag', label: t.diagClose }, { id: 'restart', label: t.restart }]
                             : [{ id: 'diag', label: t.diagOpen }, { id: 'restart', label: t.restart }]);
    }
    function openDiag() {
        if (DIAG.on) return;
        DIAG.on = true; state = 'diag'; dlgEl.style.display = 'none'; setHint('');
        diagEl.style.display = 'block'; canvas.style.visibility = 'hidden';
        window.addEventListener('devicemotion', onMotion);
        setMenus(); updateDiag();
    }
    function closeDiag() {
        if (!DIAG.on) return;
        DIAG.on = false; state = 'play';
        diagEl.style.display = 'none'; canvas.style.visibility = 'visible';
        window.removeEventListener('devicemotion', onMotion);
        setMenus();
    }
    function reset() {
        player.x = 0; player.z = 8; player.a = 0; cam.x = 0; cam.z = 8; state = 'play'; dlgEl.style.display = 'none';
        MyPC.save('pos', { x: 0, z: 8 });
    }

    MyPC.init({
        pad: true,
        ownMenu: true,
        onInit: function (info) {
            t = TEXT[info.lang] || TEXT.en; rtl = !!info.rtl;
            lowTier = !!(info.quality && info.quality.tier === 'low');
            canvas = document.getElementById('c'); hintEl = document.getElementById('hint');
            topEl = document.getElementById('top'); dlgEl = document.getElementById('dlg'); diagEl = document.getElementById('diag'); buildDiag();
            document.title = t.title;
            topEl.textContent = t.title + ' \u00b7 ' + t.hint;
            if (!initGL()) { MyPC.fail('WebGL'); return; }
            resize(); window.addEventListener('resize', resize);
            buildWorld(); MyPC.progress(0.8);
            var s = MyPC.load('pos', null);
            if (s && typeof s.x === 'number' && typeof s.z === 'number' && !blocked(s.x, s.z)) { player.x = cam.x = s.x; player.z = cam.z = s.z; }
            setMenus();
            MyPC.progress(1);
            ready = true;
            if (info.standalone && /[?&]diag/.test(location.search)) openDiag();      // desktop testing
            MyPC.ready();
        },
        onStart: function () { MyPC.announce(t.title + '. ' + t.hint); startLoop(); },
        onPause: function () { stopLoop(); MyPC.save('pos', { x: player.x, z: player.z }); },
        onResume: startLoop,
        onDestroy: function () { stopLoop(); window.removeEventListener('devicemotion', onMotion); window.removeEventListener('resize', resize); },
        onInput: function (action, pressed, repeat, dev) {
            if (pressed && DIAG.on) DIAG.lastTxt = action + ' (' + dev + ')';
            if (pressed && !repeat && ready) {
                if (action === 'confirm' && !DIAG.on) confirm();
                else if (action === 'menu' && !DIAG.on) openDiag();
            }
        },
        onMenu: function (id) { if (id === 'restart') { closeDiag(); reset(); } else if (id === 'diag') openDiag(); else if (id === 'closediag') closeDiag(); }
    });
})();
