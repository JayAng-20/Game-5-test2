import{$ as e,Et as t,L as n,O as r,R as i,U as a,W as o,ct as s,f as c,ft as l,kt as u,nt as d,ot as f,pt as p,ut as m,wt as h,z as g}from"./three.module-BMBLjNzd.js";var _=`
  float rockMass(vec2 uv) {
    vec2 p = uv + uSeed;
    vec2 w = warp(p * 3.0, 3.0, 0.35);
    float mass = ridged(w, 3.0, 5, 0.55);               // big lumps and crests
    float cracks = 1.0 - smoothstep(0.0, 0.06, worleyEdge(p * 6.0 + 0.3, 6.0));
    float grain = fbm(p * 48.0, 48.0, 3, 0.5) * 0.5 + 0.5;
    float h = mass * 0.75 + grain * 0.12 - cracks * 0.22;
    return h;
  }
  float recipeHeight(vec2 uv) {
    return clamp(rockMass(uv) * 0.9 + 0.1, 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    vec2 p = uv + uSeed;
    // Warm grey base, cooler in the hollows, mineral veins from a low-frequency field.
    vec3 base = vec3(0.33, 0.30, 0.27);
    vec3 dark = vec3(0.13, 0.12, 0.11);
    vec3 warm = vec3(0.42, 0.34, 0.26);
    float vein = fbm(p * 2.0 + 5.0, 2.0, 3, 0.5) * 0.5 + 0.5;
    float speck = step(0.93, hash1(floor(p * 512.0)));
    albedo = mix(dark, base, smoothstep(0.15, 0.7, h));
    albedo = mix(albedo, warm, vein * 0.45);
    albedo = mix(albedo, dark * 0.8, cavity * 0.7);
    albedo += speck * 0.08;
    // Dusty hollows are rough, exposed faces slightly polished; grain breaks it up.
    rough = 0.5 + 0.3 * (1.0 - h) + 0.2 * cavity + fbm(p * 32.0, 32.0, 2, 0.5) * 0.12;
    metal = 0.0;
  }
`,v=`
  ${_.replace(`void recipeColor`,`void rockColor`)}
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    rockColor(uv, h, cavity, albedo, rough, metal);
    vec2 p = uv + uSeed;
    // Water pools in the hollows: darker and glossier where cavity is high.
    float film = smoothstep(0.1, 0.7, cavity) * 0.6 + 0.4;
    albedo *= mix(0.72, 0.5, film);
    rough = mix(0.35, 0.12, film) + fbm(p * 64.0, 64.0, 2, 0.5) * 0.04;
    metal = 0.0;
  }
`,y={cloth:{id:`cloth`,glsl:`
  float recipeHeight(vec2 uv) {
    vec2 p = uv + uSeed;
    float warp_ = 0.5 + 0.5 * sin(p.x * 6.2831853 * 90.0);
    float weft = 0.5 + 0.5 * sin(p.y * 6.2831853 * 90.0);
    float over = step(0.5, fract(p.x * 90.0 + floor(p.y * 90.0) * 0.5)); // twill offset
    float weave = mix(warp_, weft, over);
    float slub = fbm(p * 30.0, 30.0, 3, 0.5) * 0.5 + 0.5;
    return clamp(0.35 + weave * 0.45 + slub * 0.15, 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    vec2 p = uv + uSeed;
    float wear = fbm(p * 5.0 + 4.0, 5.0, 3, 0.5) * 0.5 + 0.5;
    albedo = vec3(0.72 + 0.28 * h) * (0.9 + 0.2 * wear);
    rough = 0.82 + cavity * 0.1;
    metal = 0.0;
  }
`,size:256,heightScale:.004,tileMetres:.25,aoStrength:.3,normalStrength:.8},leather:{id:`leather`,glsl:`
  float recipeHeight(vec2 uv) {
    vec2 p = uv + uSeed;
    vec3 w = worley(p * 60.0, 60.0);
    float grain = 1.0 - smoothstep(0.0, 0.5, w.x);
    float crease = 1.0 - smoothstep(0.0, 0.05, worleyEdge(p * 7.0 + 2.0, 7.0));
    float undulate = fbm(p * 4.0, 4.0, 3, 0.5) * 0.5 + 0.5;
    return clamp(0.4 + grain * 0.3 + undulate * 0.2 - crease * 0.2, 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    vec2 p = uv + uSeed;
    vec3 base = vec3(0.30, 0.18, 0.10);
    vec3 scuff = vec3(0.48, 0.34, 0.22);
    float wear = smoothstep(0.55, 0.9, fbm(p * 6.0 + 9.0, 6.0, 3, 0.5) * 0.5 + 0.5);
    albedo = mix(base, scuff, wear * 0.6);
    albedo = mix(albedo, base * 0.5, cavity * 0.7);
    rough = mix(0.55, 0.8, wear) + cavity * 0.1;
    metal = 0.0;
  }
`,size:512,heightScale:.01,tileMetres:.5,aoStrength:.6,normalStrength:.8},cobble:{id:`cobble`,glsl:`
  float recipeHeight(vec2 uv) {
    vec2 p = uv + uSeed;
    vec3 w = worley(p * 12.0, 12.0);
    float stone = 1.0 - smoothstep(0.28, 0.62, w.x);
    float dome = pow(stone, 0.6) * (0.85 + 0.3 * w.z);
    float wear = fbm(p * 40.0 + w.z * 3.0, 40.0, 3, 0.5) * 0.5 + 0.5;
    return clamp(0.2 + dome * 0.62 + wear * 0.1, 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    vec2 p = uv + uSeed;
    vec3 w = worley(p * 12.0, 12.0);
    vec3 a = vec3(0.38, 0.35, 0.31);
    vec3 b = vec3(0.30, 0.31, 0.33);
    vec3 c = vec3(0.44, 0.38, 0.30);
    vec3 mortar = vec3(0.22, 0.20, 0.17);
    vec3 stoneC = mix(mix(a, b, w.z), c, fract(w.z * 7.0) * 0.5);
    float isStone = smoothstep(0.3, 0.45, h);
    albedo = mix(mortar, stoneC, isStone);
    albedo = mix(albedo, albedo * 0.55, cavity * 0.8);
    rough = mix(0.95, 0.62, isStone) + cavity * 0.1;
    metal = 0.0;
  }
`,size:1024,heightScale:.08,tileMetres:2,thermalPasses:2,aoStrength:1.2},plank:{id:`plank`,glsl:`
  float recipeHeight(vec2 uv) {
    vec2 p = uv + uSeed;
    float boards = 6.0;
    float row = floor(p.y * boards);
    float local = fract(p.y * boards);
    float gap = smoothstep(0.0, 0.05, local) * smoothstep(0.0, 0.05, 1.0 - local);
    float id = hash1(vec2(row, 3.0));
    float grain = fbm(vec2(p.x * 3.0 + id * 9.0, p.y * 60.0), 3.0, 4, 0.55) * 0.5 + 0.5;
    vec3 knot = worley(vec2(p.x * 4.0, p.y * 12.0) + id, 4.0);
    float k = 1.0 - smoothstep(0.05, 0.18, knot.x);
    return clamp(0.25 + gap * (0.5 + grain * 0.2 + id * 0.08) - k * 0.12, 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    vec2 p = uv + uSeed;
    float row = floor(p.y * 6.0);
    float id = hash1(vec2(row, 3.0));
    float grain = fbm(vec2(p.x * 3.0 + id * 9.0, p.y * 60.0), 3.0, 4, 0.55) * 0.5 + 0.5;
    vec3 light = vec3(0.45, 0.33, 0.20);
    vec3 dark = vec3(0.22, 0.15, 0.09);
    vec3 grey = vec3(0.36, 0.34, 0.30);
    albedo = mix(dark, light, grain);
    albedo = mix(albedo, grey, smoothstep(0.5, 0.9, fbm(p * 5.0 + 11.0, 5.0, 3, 0.5) * 0.5 + 0.5) * 0.6);
    albedo *= 0.8 + 0.4 * id;
    albedo = mix(albedo, dark * 0.6, cavity * 0.7);
    rough = 0.7 + cavity * 0.2;
    metal = 0.0;
  }
`,size:512,heightScale:.03,tileMetres:1.2,thermalPasses:1,aoStrength:.8},roofTiles:{id:`roofTiles`,glsl:`
  float recipeHeight(vec2 uv) {
    vec2 p = uv + uSeed;
    float rows = 8.0, cols = 6.0;
    float row = floor(p.y * rows);
    float shift = mod(row, 2.0) * 0.5;
    float u = fract(p.x * cols + shift);
    float v = fract(p.y * rows);
    float round_ = sin(u * 3.14159);
    float overlap = smoothstep(0.0, 0.25, v);
    float chip = fbm(p * 30.0, 30.0, 3, 0.5) * 0.06;
    return clamp(0.3 + round_ * 0.45 * overlap + (1.0 - v) * 0.15 + chip, 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    vec2 p = uv + uSeed;
    float row = floor(p.y * 8.0);
    float shift = mod(row, 2.0) * 0.5;
    float id = hash1(vec2(floor(p.x * 6.0 + shift), row));
    vec3 terracotta = vec3(0.48, 0.24, 0.15);
    vec3 faded = vec3(0.52, 0.36, 0.28);
    vec3 moss = vec3(0.26, 0.32, 0.12);
    albedo = mix(terracotta, faded, id * 0.7);
    albedo = mix(albedo, moss, smoothstep(0.6, 0.95, fbm(p * 6.0 + 4.0, 6.0, 3, 0.5) * 0.5 + 0.5) * (1.0 - h) * 0.8);
    albedo = mix(albedo, albedo * 0.5, cavity * 0.8);
    rough = 0.75 + cavity * 0.15;
    metal = 0.0;
  }
`,size:512,heightScale:.06,tileMetres:1.6,thermalPasses:1,aoStrength:1},metal:{id:`metal`,glsl:`
  float recipeHeight(vec2 uv) {
    vec2 p = uv + uSeed;
    float brush = fbm(vec2(p.x * 80.0, p.y * 4.0), 80.0, 3, 0.5) * 0.5 + 0.5;
    float pits = 1.0 - smoothstep(0.0, 0.12, worley(p * 20.0, 20.0).x);
    return clamp(0.6 + brush * 0.1 - pits * 0.25, 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    vec2 p = uv + uSeed;
    float rust = smoothstep(0.45, 0.8, fbm(p * 5.0 + 2.0, 5.0, 4, 0.55) * 0.5 + 0.5 + cavity * 0.6);
    vec3 iron = vec3(0.56, 0.57, 0.58);
    vec3 rustC = vec3(0.42, 0.20, 0.08);
    albedo = mix(iron, rustC, rust);
    rough = mix(0.35, 0.9, rust);
    metal = 1.0 - rust * 0.9;
  }
`,size:512,heightScale:.01,tileMetres:1,aoStrength:.4,normalStrength:.5},bark:{id:`bark`,glsl:`
  float recipeHeight(vec2 uv) {
    vec2 p = uv + uSeed;
    vec2 q = vec2(p.x * 6.0, p.y * 1.5);
    float ridges = ridged(q, 6.0, 5, 0.6);
    float fissure = 1.0 - smoothstep(0.0, 0.08, worleyEdge(vec2(p.x * 8.0, p.y * 2.0) + 0.3, 8.0));
    float plates = worley(vec2(p.x * 10.0, p.y * 3.0), 10.0).z;
    float grain = fbm(p * 40.0, 40.0, 3, 0.5) * 0.5 + 0.5;
    return clamp(0.25 + ridges * 0.45 - fissure * 0.28 + plates * 0.12 + grain * 0.1, 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    vec2 p = uv + uSeed;
    vec3 outer = vec3(0.30, 0.24, 0.18);
    vec3 inner = vec3(0.14, 0.09, 0.06);
    vec3 moss = vec3(0.24, 0.32, 0.10);
    albedo = mix(inner, outer, smoothstep(0.2, 0.7, h));
    float mossy = smoothstep(0.55, 0.85, fbm(p * 5.0 + 3.0, 5.0, 3, 0.5) * 0.5 + 0.5) * (1.0 - h * 0.5);
    albedo = mix(albedo, moss, mossy * 0.7);
    albedo = mix(albedo, inner * 0.7, cavity * 0.8);
    rough = 0.85 + cavity * 0.1;
    metal = 0.0;
  }
`,size:512,heightScale:.06,tileMetres:1.5,thermalPasses:2,aoStrength:1},leafAtlas:{id:`leafAtlas`,glsl:`
  // Single leaf: pointed ellipse of half-length len / half-width wid at origin, along +y.
  float leaf(vec2 q, float len, float wid, float serrate) {
    float t = clamp((q.y + len) / (2.0 * len), 0.0, 1.0);
    float profile = sin(t * 3.14159) * (0.75 + 0.25 * (1.0 - t));
    float edge = wid * profile * (1.0 + serrate * 0.12 * sin(t * 40.0));
    float inside = 1.0 - smoothstep(edge - 0.008, edge + 0.008, abs(q.x));
    return inside * step(-len, q.y) * step(q.y, len);
  }
  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
  float cluster(vec2 c, float id, out float ribs) {
    float m = 0.0;
    ribs = 0.0;
    for (int i = 0; i < 7; i++) {
      float fi = float(i);
      float h1 = hash1(vec2(fi * 3.7, id * 5.1));
      float h2 = hash1(vec2(fi * 1.3 + 9.0, id * 2.9));
      // Fan out from the stem base at (0.5, 0.08).
      float angle = (fi / 7.0 - 0.5) * 2.4 + (h1 - 0.5) * 0.5;
      float dist = 0.16 + h2 * 0.26;
      vec2 center = vec2(0.5, 0.1) + vec2(sin(angle), cos(angle)) * dist;
      vec2 q = rot(-angle) * (c - center);
      float len = 0.13 + h1 * 0.06;
      float wid = 0.055 + h2 * 0.03;
      float l = leaf(q, len, wid, step(0.5, fract(id * 3.1)));
      m = max(m, l);
      ribs = max(ribs, l * (1.0 - smoothstep(0.0, 0.012, abs(q.x))));
    }
    // Stem.
    float stem = (1.0 - smoothstep(0.0, 0.012, abs(c.x - 0.5))) * step(0.02, c.y) * step(c.y, 0.45);
    return max(m, stem);
  }
  float recipeHeight(vec2 uv) {
    vec2 cell = floor(uv * vec2(2.0, 4.0));
    vec2 c = fract(uv * vec2(2.0, 4.0));
    float id = cell.x + cell.y * 2.0 + uSeed.x * 0.01;
    float ribs;
    float mask = cluster(c, id, ribs);
    return clamp(mask * (0.82 + ribs * 0.15), 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    vec2 cell = floor(uv * vec2(2.0, 4.0));
    vec2 c = fract(uv * vec2(2.0, 4.0));
    float id = cell.x + cell.y * 2.0;
    vec3 base = mix(vec3(0.15, 0.34, 0.08), vec3(0.28, 0.42, 0.10), fract(id * 0.37));
    vec3 tip = vec3(0.40, 0.40, 0.12);
    float ribs;
    float mask = cluster(c, id, ribs);
    albedo = mix(base, tip, smoothstep(0.35, 0.85, c.y) * 0.4);
    albedo = mix(albedo, albedo * 1.4, ribs * 0.6);
    float spot = smoothstep(0.7, 0.9, fbm(uv * 30.0 + id, 30.0, 3, 0.5) * 0.5 + 0.5);
    albedo = mix(albedo, vec3(0.36, 0.30, 0.10), spot * 0.35);
    albedo = mix(albedo, vec3(0.30, 0.24, 0.12), (1.0 - mask) * 0.0);
    rough = 0.55 + 0.2 * (1.0 - h);
    metal = 0.0;
  }
`,size:512,heightScale:.01,tileMetres:1,aoStrength:0,normalStrength:.6},frondAtlas:{id:`frondAtlas`,glsl:`
  float frondMask(vec2 c, float id) {
    // Rachis along v (bottom → top); leaflets alternate along it.
    float t = c.y;
    float halfWidth = (0.42 - 0.3 * pow(t, 1.4)) * smoothstep(0.0, 0.08, t);
    float x = abs(c.x - 0.5);
    float rachis = 1.0 - smoothstep(0.0, 0.012 + 0.01 * (1.0 - t), x);
    float n = 14.0 + id * 4.0;
    float seg = fract(t * n);
    // Each leaflet is a slanted ellipse from the rachis outward.
    float along = seg;
    float leaflet = 1.0 - smoothstep(0.55, 1.0, abs(along - 0.5) * 2.0);
    float reach = halfWidth * leaflet;
    float body = 1.0 - smoothstep(reach - 0.01, reach + 0.01, x);
    float base = step(0.02, x);
    return max(rachis, body * base);
  }
  float recipeHeight(vec2 uv) {
    float half_ = floor(uv.x * 2.0);
    vec2 c = vec2(fract(uv.x * 2.0), uv.y);
    return clamp(frondMask(c, half_) * 0.9, 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    float half_ = floor(uv.x * 2.0);
    vec2 c = vec2(fract(uv.x * 2.0), uv.y);
    vec3 young = vec3(0.24, 0.45, 0.12);
    vec3 old = vec3(0.12, 0.28, 0.08);
    albedo = mix(old, young, c.y) * (0.9 + 0.2 * half_);
    float rachis = 1.0 - smoothstep(0.0, 0.015, abs(c.x - 0.5));
    albedo = mix(albedo, vec3(0.32, 0.30, 0.12), rachis * 0.8);
    rough = 0.6;
    metal = 0.0;
  }
`,size:512,heightScale:.01,tileMetres:1,aoStrength:0,normalStrength:.4},grass:{id:`grass`,glsl:`
  float recipeHeight(vec2 uv) {
    float m = 0.0;
    for (int i = 0; i < 9; i++) {
      float fi = float(i);
      float x0 = 0.1 + 0.8 * fract(fi * 0.618 + uSeed.x * 0.01);
      float lean = (fract(fi * 0.371) - 0.5) * 0.35;
      float top = 0.55 + 0.45 * fract(fi * 0.83);
      float t = uv.y / top;
      float cx = x0 + lean * t * t;
      float w = 0.028 * (1.0 - t * 0.85);
      float blade = (1.0 - smoothstep(w - 0.006, w + 0.006, abs(uv.x - cx))) * step(uv.y, top);
      m = max(m, blade);
    }
    return m;
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    vec3 base = vec3(0.14, 0.30, 0.07);
    vec3 tip = vec3(0.45, 0.50, 0.16);
    albedo = mix(base, tip, pow(uv.y, 1.6));
    rough = 0.7;
    metal = 0.0;
  }
`,size:256,heightScale:.01,tileMetres:1,aoStrength:0,normalStrength:.3},waterNormal:{id:`waterNormal`,glsl:`
  float recipeHeight(vec2 uv) {
    vec2 p = uv + uSeed;
    vec2 w1 = warp(p * 6.0, 6.0, 0.25);
    float a = fbm(w1, 6.0, 4, 0.55);
    float b = fbm(p * 14.0 + 3.0, 14.0, 3, 0.5);
    float c = 1.0 - abs(pnoise(p * 9.0 + 7.0, 9.0));
    return clamp(0.5 + a * 0.32 + b * 0.12 + (c - 0.5) * 0.15, 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    albedo = vec3(1.0); rough = 0.05; metal = 0.0;
  }
`,size:512,heightScale:.05,tileMetres:6,aoStrength:0,normalStrength:.6},foam:{id:`foam`,glsl:`
  float recipeHeight(vec2 uv) {
    vec2 p = uv + uSeed;
    vec3 w = worley(p * vec2(10.0, 3.0), 10.0);
    float cells = smoothstep(0.15, 0.75, w.x);
    float streak = fbm(p * vec2(8.0, 40.0), 8.0, 4, 0.55) * 0.5 + 0.5;
    return clamp(streak * 0.6 + (1.0 - cells) * 0.5, 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    vec2 p = uv + uSeed;
    float m = smoothstep(0.35, 0.8, h + fbm(p * 30.0, 30.0, 3, 0.5) * 0.15);
    albedo = vec3(m); rough = 1.0; metal = 0.0;
  }
`,size:512,heightScale:.02,tileMetres:3,aoStrength:0},rock:{id:`rock`,glsl:_,size:1024,heightScale:.22,tileMetres:2,thermalPasses:6,streakPasses:3,aoStrength:1},wetRock:{id:`wetRock`,glsl:v,size:1024,heightScale:.22,tileMetres:2,thermalPasses:6,streakPasses:3,aoStrength:1},moss:{id:`moss`,glsl:`
  float recipeHeight(vec2 uv) {
    vec2 p = uv + uSeed;
    vec3 w = worley(p * 24.0, 24.0);
    float pads = 1.0 - smoothstep(0.0, 0.55, w.x);        // round pads
    vec3 w2 = worley(p * 64.0 + 3.0, 64.0);
    float fuzz = 1.0 - smoothstep(0.0, 0.5, w2.x);
    float ground = fbm(p * 6.0, 6.0, 4, 0.5) * 0.5 + 0.5;
    return clamp(0.25 + ground * 0.25 + pads * 0.35 + fuzz * 0.15, 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    vec2 p = uv + uSeed;
    vec3 young = vec3(0.34, 0.46, 0.12);
    vec3 deep = vec3(0.10, 0.19, 0.06);
    vec3 dry = vec3(0.40, 0.38, 0.16);
    float age = fbm(p * 3.0 + 9.0, 3.0, 3, 0.5) * 0.5 + 0.5;
    albedo = mix(deep, young, smoothstep(0.3, 0.85, h));
    albedo = mix(albedo, dry, smoothstep(0.6, 0.9, age) * 0.5);
    albedo = mix(albedo, deep * 0.7, cavity * 0.8);
    rough = 0.92 - h * 0.08;
    metal = 0.0;
  }
`,size:512,heightScale:.03,tileMetres:2,thermalPasses:3,aoStrength:.6,normalStrength:.7},dirt:{id:`dirt`,glsl:`
  float recipeHeight(vec2 uv) {
    vec2 p = uv + uSeed;
    float soil = fbm(p * 8.0, 8.0, 5, 0.55) * 0.5 + 0.5;
    vec3 w = worley(p * 40.0 + 1.0, 40.0);
    float pebbleMask = step(0.72, w.z);                   // only some cells hold a pebble
    float pebble = pebbleMask * (1.0 - smoothstep(0.0, 0.3, w.x));
    // Shallow footprint-like hollows from a sparse low-frequency Worley field.
    vec3 w3 = worley(p * 5.0 + 4.0, 5.0);
    float hollow = step(0.6, w3.z) * (1.0 - smoothstep(0.0, 0.5, w3.x));
    return clamp(0.3 + soil * 0.3 + pebble * 0.35 - hollow * 0.18, 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    vec2 p = uv + uSeed;
    vec3 earth = vec3(0.30, 0.22, 0.14);
    vec3 dust = vec3(0.46, 0.38, 0.27);
    vec3 stone = vec3(0.45, 0.43, 0.40);
    vec3 w = worley(p * 40.0 + 1.0, 40.0);
    float pebble = step(0.72, w.z) * (1.0 - smoothstep(0.0, 0.3, w.x));
    float moisture = fbm(p * 4.0 + 2.0, 4.0, 3, 0.5) * 0.5 + 0.5;
    albedo = mix(earth, dust, smoothstep(0.3, 0.75, h) * (1.0 - moisture * 0.5));
    albedo = mix(albedo, stone * (0.8 + 0.4 * w.z), smoothstep(0.2, 0.6, pebble));
    albedo = mix(albedo, earth * 0.6, cavity * 0.6);
    rough = mix(0.95, 0.7, pebble) - moisture * 0.1;
    metal = 0.0;
  }
`,size:512,heightScale:.06,tileMetres:1.5,thermalPasses:2,aoStrength:.7},brick:{id:`brick`,glsl:`
  // Block grid helpers. 6 courses per tile, 3 blocks per course, half-offset rows.
  vec2 blockCell(vec2 p, out vec2 local) {
    float rows = 6.0, cols = 3.0;
    float row = floor(p.y * rows);
    float shift = mod(row, 2.0) * 0.5;
    float col = floor(p.x * cols + shift);
    local = vec2(fract(p.x * cols + shift), fract(p.y * rows));
    return vec2(mod(col, cols), mod(row, rows));
  }
  float recipeHeight(vec2 uv) {
    vec2 p = uv + uSeed;
    vec2 local;
    vec2 cell = blockCell(fract(p), local);
    float id = hash1(cell + 3.0);
    // Mortar: gap width in local units, softened edges.
    vec2 gap = vec2(0.045, 0.09);
    float ex = smoothstep(0.0, gap.x, local.x) * smoothstep(0.0, gap.x, 1.0 - local.x);
    float ey = smoothstep(0.0, gap.y, local.y) * smoothstep(0.0, gap.y, 1.0 - local.y);
    float block = ex * ey;
    // Chipped corners: a Worley field eats into the block near its edges.
    float edgeDist = min(min(local.x, 1.0 - local.x) / gap.x, min(local.y, 1.0 - local.y) / gap.y);
    float chip = (1.0 - smoothstep(0.0, 0.5, worley(p * 30.0 + id * 10.0, 30.0).x)) * (1.0 - smoothstep(0.5, 2.5, edgeDist));
    float weather = fbm(p * 20.0 + id * 5.0, 20.0, 4, 0.5) * 0.5 + 0.5;
    float faceHeight = 0.55 + id * 0.18 + weather * 0.12 - chip * 0.3;
    float mortar = 0.22 + (fbm(p * 40.0, 40.0, 3, 0.5) * 0.5 + 0.5) * 0.1;
    return clamp(mix(mortar, faceHeight, block), 0.0, 1.0);
  }
  void recipeColor(vec2 uv, float h, float cavity, out vec3 albedo, out float rough, out float metal) {
    vec2 p = uv + uSeed;
    vec2 local;
    vec2 cell = blockCell(fract(p), local);
    float id = hash1(cell + 3.0);
    float id2 = hash1(cell + 11.0);
    vec3 sand = vec3(0.56, 0.49, 0.38);
    vec3 grey = vec3(0.40, 0.40, 0.38);
    vec3 mortarC = vec3(0.30, 0.28, 0.25);
    vec3 lichen = vec3(0.35, 0.40, 0.18);
    float isBlock = smoothstep(0.3, 0.45, h);
    vec3 face = mix(sand, grey, id2) * (0.85 + 0.3 * id);
    float stain = fbm(p * 12.0 + id * 3.0, 12.0, 3, 0.5) * 0.5 + 0.5;
    face = mix(face, face * 0.6, smoothstep(0.55, 0.9, stain));
    face = mix(face, lichen, smoothstep(0.7, 0.95, fbm(p * 7.0 + 21.0, 7.0, 3, 0.5) * 0.5 + 0.5) * 0.6);
    albedo = mix(mortarC, face, isBlock);
    albedo = mix(albedo, albedo * 0.5, cavity * 0.8);
    rough = mix(0.95, 0.68 + 0.15 * id2, isBlock) + cavity * 0.1;
    metal = 0.0;
  }
`,size:1024,heightScale:.08,tileMetres:1.5,thermalPasses:1,aoStrength:1.2}},b=`
// --- hashing -------------------------------------------------------------
float hash1(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
vec3 hash3(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.xxy + p3.yzz) * p3.zyx);
}

// --- periodic gradient noise, range about [-1, 1] ------------------------
float pnoise(vec2 p, float period) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 g00 = hash2(mod(i, period)) * 2.0 - 1.0;
  vec2 g10 = hash2(mod(i + vec2(1.0, 0.0), period)) * 2.0 - 1.0;
  vec2 g01 = hash2(mod(i + vec2(0.0, 1.0), period)) * 2.0 - 1.0;
  vec2 g11 = hash2(mod(i + vec2(1.0, 1.0), period)) * 2.0 - 1.0;
  float a = dot(g00, f);
  float b = dot(g10, f - vec2(1.0, 0.0));
  float c = dot(g01, f - vec2(0.0, 1.0));
  float d = dot(g11, f - vec2(1.0, 1.0));
  return 1.6 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Fractal sum. period is the base frequency's period; each octave doubles.
float fbm(vec2 p, float period, int octaves, float gain) {
  float sum = 0.0, amp = 0.5, norm = 0.0;
  float per = period;
  for (int o = 0; o < 8; o++) {
    if (o >= octaves) break;
    sum += amp * pnoise(p, per);
    norm += amp;
    amp *= gain;
    p *= 2.0;
    per *= 2.0;
  }
  return sum / norm;
}

// Ridged multifractal: sharp crests, good for rock and bark.
float ridged(vec2 p, float period, int octaves, float gain) {
  float sum = 0.0, amp = 0.5, norm = 0.0, per = period;
  for (int o = 0; o < 8; o++) {
    if (o >= octaves) break;
    float n = 1.0 - abs(pnoise(p, per));
    sum += amp * n * n;
    norm += amp;
    amp *= gain;
    p *= 2.0;
    per *= 2.0;
  }
  return sum / norm;
}

// --- periodic Worley (cellular) noise -------------------------------------
// Returns (F1, F2, id) where id is a stable per-cell random in [0, 1).
vec3 worley(vec2 p, float period) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float f1 = 8.0, f2 = 8.0, id = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 cell = mod(i + g, period);
      vec2 o = hash2(cell);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < f1) { f2 = f1; f1 = d; id = hash1(cell + 7.0); }
      else if (d < f2) { f2 = d; }
    }
  }
  return vec3(sqrt(f1), sqrt(f2), id);
}

// Cell-edge distance (F2 - F1), thin near borders: cracks and mortar lines.
float worleyEdge(vec2 p, float period) {
  vec3 w = worley(p, period);
  return w.y - w.x;
}

// Domain warp helper: offsets p by two noise fields.
vec2 warp(vec2 p, float period, float amount) {
  return p + amount * vec2(pnoise(p + 3.1, period), pnoise(p + 17.7, period));
}

float sat(float x) { return clamp(x, 0.0, 1.0); }
float remap(float x, float a, float b) { return sat((x - a) / (b - a)); }
`,x=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,S=e=>`
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uSeed;
  uniform vec3 uTint;
  ${b}
  ${e}
  void main() {
    float h = recipeHeight(vUv);
    gl_FragColor = vec4(clamp(h, 0.0, 1.0), 0.0, 0.0, 1.0);
  }
`,C=`
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tHeight;
  uniform vec2 uTexel;
  uniform float uTalus;
  uniform float uRate;
  void main() {
    float h = texture2D(tHeight, vUv).r;
    float sum = 0.0;
    for (int i = 0; i < 4; i++) {
      vec2 o = i == 0 ? vec2(uTexel.x, 0.0) : i == 1 ? vec2(-uTexel.x, 0.0) : i == 2 ? vec2(0.0, uTexel.y) : vec2(0.0, -uTexel.y);
      float n = texture2D(tHeight, vUv + o).r;
      float d = n - h;
      sum += max(0.0, d - uTalus) - max(0.0, -d - uTalus);
    }
    gl_FragColor = vec4(clamp(h + uRate * 0.25 * sum, 0.0, 1.0), 0.0, 0.0, 1.0);
  }
`,w=`
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tHeight;
  uniform vec2 uTexel;
  uniform float uRate;
  void main() {
    float h = texture2D(tHeight, vUv).r;
    float up = texture2D(tHeight, vUv + vec2(0.0, uTexel.y)).r;
    float up2 = texture2D(tHeight, vUv + vec2(0.0, 2.0 * uTexel.y)).r;
    // Water arriving from higher ground above cuts a shallow channel.
    float flow = max(0.0, up - h) + 0.5 * max(0.0, up2 - h);
    gl_FragColor = vec4(clamp(h - uRate * flow, 0.0, 1.0), 0.0, 0.0, 1.0);
  }
`,T=`
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tHeight;
  uniform vec2 uTexel;
  uniform float uStrength;
  float H(vec2 o) { return texture2D(tHeight, vUv + o * uTexel).r; }
  void main() {
    // Sobel, wrapping through the repeat sampler.
    float dx = (H(vec2(1.0, -1.0)) + 2.0 * H(vec2(1.0, 0.0)) + H(vec2(1.0, 1.0)))
             - (H(vec2(-1.0, -1.0)) + 2.0 * H(vec2(-1.0, 0.0)) + H(vec2(-1.0, 1.0)));
    float dy = (H(vec2(-1.0, 1.0)) + 2.0 * H(vec2(0.0, 1.0)) + H(vec2(1.0, 1.0)))
             - (H(vec2(-1.0, -1.0)) + 2.0 * H(vec2(0.0, -1.0)) + H(vec2(1.0, -1.0)));
    vec3 n = normalize(vec3(-dx * uStrength, -dy * uStrength, 1.0));
    gl_FragColor = vec4(n * 0.5 + 0.5, 1.0);
  }
`,E=`
  uniform sampler2D tHeight;
  uniform vec2 uTexel;
  uniform float uAoStrength;
  uniform float uHeightScale;
  float heightAt(vec2 uv) { return texture2D(tHeight, uv).r; }
  // Local cavity: how far below the 5-texel neighbourhood mean this texel sits.
  float cavityAt(vec2 uv) {
    float h = heightAt(uv);
    float m = 0.0;
    for (int y = -2; y <= 2; y++)
      for (int x = -2; x <= 2; x++)
        m += heightAt(uv + vec2(float(x), float(y)) * uTexel * 2.0);
    m /= 25.0;
    return clamp((m - h) * 6.0, 0.0, 1.0);
  }
  // Horizon occlusion: eight directions, geometric steps (2, 6, 18, 54 texels)
  // so both fine grain and the large ridges shade their neighbours. Slopes
  // are in world terms: relief in metres over distance in metres.
  uniform float uTileMetres;
  float aoAt(vec2 uv) {
    if (uAoStrength <= 0.0) return 1.0;
    float h = heightAt(uv);
    float occ = 0.0;
    for (int d = 0; d < 8; d++) {
      float a = float(d) * 0.7853982;
      vec2 dir = vec2(cos(a), sin(a));
      float best = 0.0;
      float dist = 2.0;
      for (int s = 0; s < 4; s++) {
        float hs = heightAt(uv + dir * uTexel * dist);
        float slope = (hs - h) * uHeightScale / (dist * uTexel.x * uTileMetres);
        best = max(best, slope);
        dist *= 3.0;
      }
      occ += clamp(best * 0.8, 0.0, 1.0);
    }
    return clamp(1.0 - uAoStrength * occ / 8.0, 0.0, 1.0);
  }
`,D=e=>`
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uSeed;
  uniform vec3 uTint;
  ${b}
  ${E}
  ${e}
  void main() {
    float h = heightAt(vUv);
    float cavity = cavityAt(vUv);
    vec3 albedo; float rough; float metal;
    recipeColor(vUv, h, cavity, albedo, rough, metal);
    albedo *= uTint;
    // The target is SRGB8_ALPHA8: WebGL2 encodes linear → sRGB on write, so
    // the shader hands over linear values and the texture decodes on sample.
    gl_FragColor = vec4(clamp(albedo, 0.0, 1.0), 1.0);
  }
`,O=e=>`
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uSeed;
  uniform vec3 uTint;
  ${b}
  ${E}
  ${e}
  void main() {
    float h = heightAt(vUv);
    float cavity = cavityAt(vUv);
    vec3 albedo; float rough; float metal;
    recipeColor(vUv, h, cavity, albedo, rough, metal);
    float ao = aoAt(vUv) * (1.0 - 0.35 * cavity);
    gl_FragColor = vec4(ao, clamp(rough, 0.02, 1.0), clamp(metal, 0.0, 1.0), 1.0);
  }
`,k=`
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tHeight;
  // Replicated to RGB so the map can also serve as an alphaMap (three reads .g).
  void main() { float h = texture2D(tHeight, vUv).r; gl_FragColor = vec4(h, h, h, 1.0); }
`;function A(e,t,r){e.wrapS=s,e.wrapT=s,e.colorSpace=t,e.anisotropy=r,e.generateMipmaps=!0,e.minFilter=i,e.magFilter=n}var j=class{renderer;scene=new l;camera=new e(-1,1,1,-1,0,1);quad;lastMs=0;constructor(e){this.renderer=e,this.quad=new a(new d(2,2),new o),this.quad.frustumCulled=!1,this.scene.add(this.quad)}pass(e,t){this.quad.material=e,this.renderer.setRenderTarget(t),this.renderer.render(this.scene,this.camera)}floatTarget(e){return new u(e,e,{type:r,format:f,minFilter:n,magFilter:n,wrapS:s,wrapT:s,generateMipmaps:!1,depthBuffer:!1,stencilBuffer:!1})}byteTarget(e,t){let r=new u(e,e,{type:h,format:f,generateMipmaps:!0,minFilter:i,magFilter:n,wrapS:s,wrapT:s,depthBuffer:!1,stencilBuffer:!1,colorSpace:t});return A(r.texture,t,this.renderer.capabilities.getMaxAnisotropy()),r}synthesise(e,n={}){let r=performance.now(),i=e.size,a=new t(1/i,1/i),o=n.seed??0,s=new t(37.13*o+11.7,19.71*o+5.3),l=new c(n.tint??16777215),u=this.renderer.getRenderTarget(),d=this.renderer.autoClear,f=this.renderer.toneMapping;this.renderer.toneMapping=0,this.renderer.autoClear=!1;let h=this.floatTarget(i),_=this.floatTarget(i),v=new p({vertexShader:x,fragmentShader:S(e.glsl),uniforms:{uSeed:{value:s},uTint:{value:l}},depthTest:!1,depthWrite:!1});this.pass(v,h);let y=new p({vertexShader:x,fragmentShader:C,uniforms:{tHeight:{value:null},uTexel:{value:a},uTalus:{value:.004},uRate:{value:.5}},depthTest:!1,depthWrite:!1});for(let t=0;t<(e.thermalPasses??0);t++)y.uniforms.tHeight.value=h.texture,this.pass(y,_),[h,_]=[_,h];let b=new p({vertexShader:x,fragmentShader:w,uniforms:{tHeight:{value:null},uTexel:{value:a},uRate:{value:.35}},depthTest:!1,depthWrite:!1});for(let t=0;t<(e.streakPasses??0);t++)b.uniforms.tHeight.value=h.texture,this.pass(b,_),[h,_]=[_,h];let E=h,A=this.byteTarget(i,g),j=new p({vertexShader:x,fragmentShader:T,uniforms:{tHeight:{value:E.texture},uTexel:{value:a},uStrength:{value:e.heightScale*i/8*(e.normalStrength??1)}},depthTest:!1,depthWrite:!1});this.pass(j,A);let M=()=>({tHeight:{value:E.texture},uTexel:{value:a},uAoStrength:{value:e.aoStrength??1},uHeightScale:{value:e.heightScale},uTileMetres:{value:e.tileMetres},uSeed:{value:s},uTint:{value:l}}),N=this.byteTarget(i,m),P=new p({vertexShader:x,fragmentShader:D(e.glsl),uniforms:M(),depthTest:!1,depthWrite:!1});this.pass(P,N);let F=this.byteTarget(i,g),I=new p({vertexShader:x,fragmentShader:O(e.glsl),uniforms:M(),depthTest:!1,depthWrite:!1});this.pass(I,F);let L=this.byteTarget(i,g),R=new p({vertexShader:x,fragmentShader:k,uniforms:{tHeight:{value:E.texture}},depthTest:!1,depthWrite:!1});this.pass(R,L),this.renderer.setRenderTarget(u),this.renderer.autoClear=d,this.renderer.toneMapping=f;for(let e of[v,y,b,j,P,I,R])e.dispose();h.dispose(),_.dispose(),this.lastMs=performance.now()-r;let z=[N,A,F,L];return{map:N.texture,normalMap:A.texture,ormMap:F.texture,heightMap:L.texture,size:i,heightScale:e.heightScale,dispose:()=>{for(let e of z)e.dispose()}}}dispose(){this.quad.geometry.dispose(),this.quad.material.dispose()}};function M(e){return Math.round(e*e*4*4*1.333)}var N=class{synth;sets=new Map;totalMs=0;constructor(e){this.synth=new j(e)}key(e,t){let n=t.tint===void 0?``:new c(t.tint).getHexString();return`${e}:${t.seed??0}:${n}`}get(e,t={}){let n=this.key(e,t),r=this.sets.get(n);if(r)return r;let i=y[e];if(!i)throw Error(`unknown texture recipe: ${String(e)}`);let a=this.synth.synthesise(i,t);return this.totalMs+=this.synth.lastMs,this.sets.set(n,a),a}static apply(e,t,n){e.map=t.map,e.normalMap=t.normalMap,e.roughnessMap=t.ormMap,e.metalnessMap=t.ormMap,e.aoMap=t.ormMap,e.aoMapIntensity=1,e.roughness=1,e.metalness=1,e.normalScale.set(1,1);for(let e of[t.map,t.normalMap,t.ormMap,t.heightMap])e.repeat.set(n,n);e.needsUpdate=!0}stats(){let e=0;for(let t of this.sets.values())e+=M(t.size);return{sets:this.sets.size,bytes:e,totalMs:this.totalMs,keys:[...this.sets.keys()]}}dispose(){for(let e of this.sets.values())e.dispose();this.sets.clear(),this.synth.dispose()}};export{b as n,y as r,N as t};