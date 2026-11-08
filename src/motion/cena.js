import * as THREE from "three";
import pecas from "../data/pecas.json";
import { casos } from "../data/casos";

export const PROF_DESTAQUES = [-16, -40, -64];
const Z_FIM = -96;
export function criarCena(host, reduzido) {
  const opacidadeHero = THREE.MathUtils.clamp(
    Number(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--hero-imagens-opacidade",
      ),
    ) || 0.55,
    0,
    1,
  );
  const aspecto =
    Number(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--imagem-aspecto",
      ),
    ) || 16 / 9;
  const fundo = new THREE.Color(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--imersao-fundo")
      .trim(),
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(fundo, 0);
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(fundo, 9, 44);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 160);
  camera.position.z = 6;
  const manager = new THREE.LoadingManager();
  const pronta = new Promise((resolve) => { manager.onLoad = resolve; });
  const loader = new THREE.TextureLoader(manager),
    cache = new Map(),
    geometry = new THREE.PlaneGeometry(1, 1);
  let frame = 0,
    portrait = false;
  const alvo = { z: 6, x: 0, y: 0 };
  const estado = { z: 6, puxar: 0, ativo: -1, entrada: 1 };
  const smooth = (a, b, x) => THREE.MathUtils.smoothstep(x, a, b);
  let seed = 41;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  function texture(src) {
    if (!cache.has(src)) {
      const t = loader.load("/" + src, (textura) => {
        const origem = textura.image.width / textura.image.height;
        // Equivalente a object-fit: cover: enquadramento comum sem deformação.
        const x = Math.min(1, aspecto / origem);
        const y = Math.min(1, origem / aspecto);
        textura.repeat.set(x, y);
        textura.offset.set((1 - x) / 2, (1 - y) / 2);
        render();
      });
      t.colorSpace = THREE.SRGBColorSpace;
      cache.set(src, t);
    }
    return cache.get(src);
  }
  function material(src) {
    const m = new THREE.MeshBasicMaterial({
      map: texture(src),
      transparent: true,
      depthWrite: false,
      fog: false,
      side: THREE.DoubleSide,
    });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uBias = { value: 0 };
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float uBias;")
        .replace("texture2D( map, vMapUv )", "texture2D( map, vMapUv, uBias )");
      m.userData.shader = shader;
    };
    return m;
  }
  const planos = Array.from({ length: 66 }, (_, i) => {
    const foto = pecas[i % pecas.length],
      ang = i * 2.39996 + (rand() - 0.5) * 0.5,
      r = 3.5 + rand() * 2.1,
      h = 1.65;
    const mesh = new THREE.Mesh(geometry, material(foto.src));
    mesh.userData = {
      ang,
      r,
      h,
      aspect: aspecto,
      z: 3.5 - (i * (3.5 - Z_FIM)) / 65,
    };
    scene.add(mesh);
    return mesh;
  });
  const destaques = casos.map((c, i) => {
    const mesh = new THREE.Mesh(geometry, material(c.src.replace(/^\//, "")));
    mesh.userData = {
      ang: [0.4, 2.6, 5.3][i],
      r: 4.6,
      altura: 6 / aspecto,
      z: PROF_DESTAQUES[i],
    };
    scene.add(mesh);
    return mesh;
  });
  function parede(mesh) {
    const d = mesh.userData;
    let x = Math.cos(d.ang) * d.r * (portrait ? 0.72 : 1.45),
      y = Math.sin(d.ang) * d.r * (portrait ? 1.55 : 1);
    if (
      planos.indexOf(mesh) < 10 &&
      planos.indexOf(mesh) >= 0 &&
      x < 0 &&
      y < 0
    )
      y = Math.abs(y);
    mesh.position.set(x, y, d.z);
    mesh.rotation.set(Math.sin(d.ang) * 0.28, -Math.cos(d.ang) * 0.32, 0);
  }
  function distancia() {
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const altura = destaques[estado.ativo]?.userData.altura || 4;
    return portrait
      ? 6 / (0.9 * 2 * tan * camera.aspect)
      : 0.9 * Math.min(altura / (2 * tan), 6 / (2 * tan * camera.aspect));
  }
  function resize() {
    const w = host.clientWidth,
      h = host.clientHeight;
    portrait = w / h < 0.8;
    camera.fov = portrait ? 62 : 50;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    planos.forEach((m) => {
      parede(m);
      m.scale.set(m.userData.h * m.userData.aspect, m.userData.h, 1);
    });
    render();
  }
  function draw() {
    frame = 0;
    const opacidadeAmbiente = THREE.MathUtils.lerp(
      1,
      opacidadeHero,
      estado.entrada,
    );
    const f = reduzido ? 1 : 0.14;
    camera.position.z += (estado.z - camera.position.z) * f;
    const intensidade = reduzido ? 0 : 1 - estado.puxar;
    camera.position.x +=
      (alvo.x * intensidade - camera.position.x) * (reduzido ? 1 : 0.06);
    camera.position.y +=
      (alvo.y * intensidade - camera.position.y) * (reduzido ? 1 : 0.06);
    camera.lookAt(
      camera.position.x * 0.3,
      camera.position.y * 0.3,
      camera.position.z - 12,
    );
    planos.forEach((m) => {
      const d = camera.position.z - m.position.z;
      m.material.opacity =
        opacidadeAmbiente *
        smooth(0.4, 2.2, d) *
        (1 - estado.puxar * (portrait ? 1 : 0.88)) *
        (1 - smooth(scene.fog.near, scene.fog.far, d));
      const shader = m.material.userData.shader;
      if (shader)
        shader.uniforms.uBias.value =
          d < 6 ? (6 - d) * 0.45 : d > 22 ? Math.min(3, (d - 22) * 0.12) : 0;
    });
    destaques.forEach((m, i) => {
      parede(m);
      const p = i === estado.ativo ? estado.puxar : 0;
      m.position.x *= 1 - p;
      m.position.y *= 1 - p;
      m.rotation.x *= 1 - p;
      m.rotation.y *= 1 - p;
      const scale = THREE.MathUtils.lerp(0.36, 1, p);
      m.scale.set(6 * scale, m.userData.altura * scale, 1);
      const d = camera.position.z - m.position.z;
      // A distância desvanece a textura sem pintar retângulos sobre o degradê.
      m.material.opacity =
        THREE.MathUtils.lerp(opacidadeAmbiente, 1, p) *
        smooth(-0.1, 0.45, d) *
        (1 - smooth(scene.fog.near, scene.fog.far, d) * (1 - p));
    });
    renderer.render(scene, camera);
    if (
      Math.abs(camera.position.z - estado.z) > 0.001 ||
      Math.abs(camera.position.x - alvo.x * intensidade) > 0.001 ||
      Math.abs(camera.position.y - alvo.y * intensidade) > 0.001
    )
      render();
  }
  function render() {
    if (!frame) frame = requestAnimationFrame(draw);
  }
  if (!reduzido && matchMedia("(pointer:fine)").matches)
    window.addEventListener("pointermove", (e) => {
      alvo.x = (e.clientX / innerWidth - 0.5) * 1.1;
      alvo.y = -(e.clientY / innerHeight - 0.5) * 0.7;
      render();
    });
  window.addEventListener("vextech:tema", () => {
    fundo.set(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--imersao-fundo")
        .trim(),
    );
    renderer.setClearColor(fundo, 0);
    scene.fog.color.copy(fundo);
    render();
  });
  window.addEventListener("resize", resize);
  resize();
  return { estado, render, distancia, camera, resize, pronta };
}
