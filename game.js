/* Low Poly Square: tiny 3D RPG town square. Raw WebGL, flat-shaded low-poly meshes, no dependencies. */
(function () {
    'use strict';
    var TEXT = {
        en: { title: 'Low Poly Square', hint: 'Arrows: walk', talk: 'OK: talk', next: 'OK: continue',
              npcs: [
                  { name: 'Mara', lines: ['Welcome to the square, traveler!', 'The baker opens at dawn.'] },
                  { name: 'Old Tom', lines: ['This fountain is older than the town.', 'Rumour says a dragon sleeps in the hills.'] },
                  { name: 'Pip', lines: ['I am guarding the gate. Very important job!', 'Nothing ever happens here... yet.'] }
              ], restart: 'Back to start' },
        fr: { title: 'Place Low Poly', hint: 'Flèches : marcher', talk: 'OK : parler', next: 'OK : continuer',
              npcs: [
                  { name: 'Mara', lines: ['Bienvenue sur la place, voyageur !', 'Le boulanger ouvre à l’aube.'] },
                  { name: 'Vieux Tom', lines: ['Cette fontaine est plus vieille que la ville.', 'On dit qu’un dragon dort dans les collines.'] },
                  { name: 'Pip', lines: ['Je garde la porte. Travail très important !', 'Il ne se passe jamais rien ici... pour l’instant.'] }
              ], restart: 'Retour au départ' },
        es: { title: 'Plaza Low Poly', hint: 'Flechas: caminar', talk: 'OK: hablar', next: 'OK: continuar',
              npcs: [
                  { name: 'Mara', lines: ['¡Bienvenido a la plaza, viajero!', 'El panadero abre al amanecer.'] },
                  { name: 'Viejo Tom', lines: ['Esta fuente es más vieja que el pueblo.', 'Dicen que un dragón duerme en las colinas.'] },
                  { name: 'Pip', lines: ['Vigilo la puerta. ¡Trabajo importante!', 'Aquí nunca pasa nada... todavía.'] }
              ], restart: 'Volver al inicio' },
        ar: { title: 'ساحة لو بولي', hint: 'الأسهم: للمشي', talk: 'OK: تحدث', next: 'OK: متابعة',
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
    var hintEl, topEl, dlgEl, lowTier = false;

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
        draw();
    }
    function startLoop() { if (!raf) { last = 0; acc = 0; raf = requestAnimationFrame(frame); } }
    function stopLoop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    function reset() {
        player.x = 0; player.z = 8; player.a = 0; cam.x = 0; cam.z = 8; state = 'play'; dlgEl.style.display = 'none';
        MyPC.save('pos', { x: 0, z: 8 });
    }

    MyPC.init({
        pad: true,
        onInit: function (info) {
            t = TEXT[info.lang] || TEXT.en; rtl = !!info.rtl;
            lowTier = !!(info.quality && info.quality.tier === 'low');
            canvas = document.getElementById('c'); hintEl = document.getElementById('hint');
            topEl = document.getElementById('top'); dlgEl = document.getElementById('dlg');
            document.title = t.title;
            topEl.textContent = t.title + ' · ' + t.hint;
            if (!initGL()) { MyPC.fail('WebGL'); return; }
            resize(); window.addEventListener('resize', resize);
            buildWorld(); MyPC.progress(0.8);
            var s = MyPC.load('pos', null);
            if (s && typeof s.x === 'number' && typeof s.z === 'number' && !blocked(s.x, s.z)) { player.x = cam.x = s.x; player.z = cam.z = s.z; }
            MyPC.setMenu([{ id: 'restart', label: t.restart }]);
            MyPC.progress(1);
            ready = true;
            MyPC.ready();
        },
        onStart: function () { MyPC.announce(t.title + '. ' + t.hint); startLoop(); },
        onPause: function () { stopLoop(); MyPC.save('pos', { x: player.x, z: player.z }); },
        onResume: startLoop,
        onDestroy: function () { stopLoop(); window.removeEventListener('resize', resize); },
        onInput: function (action, pressed, repeat) {
            if (pressed && !repeat && action === 'confirm' && ready) confirm();
        },
        onMenu: function (id) { if (id === 'restart') reset(); }
    });
})();
