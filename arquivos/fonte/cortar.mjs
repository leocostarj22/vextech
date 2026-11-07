// Corta as folhas 2x2 (folha-1 a folha-7, 1536 x 1024) em 28 peças e converte tudo para WebP em public/trabalhos/.
// Também converte os quatro destaques e as fotos do método, e regrava src/data/pecas.json com as medidas.
// Uso, da raiz do projeto: node arquivos/fonte/cortar.mjs [pasta-das-imagens]  (precisa de ffmpeg e cwebp)
// A pasta (padrão: imagens/) tem folha-1 … folha-7, destaque-<slug> e metodo-rascunho / metodo-sistema, em .jpg ou .png.
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'

const src = process.argv[2] || 'imagens'
const out = 'public/trabalhos'
const tmp = '.tmp-cortar'
mkdirSync(out, { recursive: true })
mkdirSync(tmp, { recursive: true })
const img = (nome) => [`${src}/${nome}.jpg`, `${src}/${nome}.png`].find((f) => existsSync(f))

// proporções alternadas para o túnel não parecer grade
const formatos = [[3, 2], [1, 1], [4, 5], [3, 2], [4, 5], [1, 1], [3, 2]]
const pecas = []
let n = 0
for (let f = 1; f <= 7; f++) {
  const folha = img(`folha-${f}`)
  if (!folha) continue
  for (let q = 0; q < 4; q++) {
    const qx = (q % 2) * 768 + 8, qy = Math.floor(q / 2) * 512 + 8
    const qw = 752, qh = 496
    const [aw, ah] = formatos[n % formatos.length]
    let w = qw, h = Math.round(qw * ah / aw)
    if (h > qh) { h = qh; w = Math.round(qh * aw / ah) }
    const x = qx + Math.round((qw - w) / 2), y = qy + Math.round((qh - h) / 2)
    n++
    const id = `t${String(n).padStart(2, '0')}`
    const png = `${tmp}/${id}.png`
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', folha, '-vf', `crop=${w}:${h}:${x}:${y}`, png])
    execFileSync('cwebp', ['-quiet', '-q', '80', png, '-o', `${out}/${id}.webp`])
    pecas.push({ id, src: `trabalhos/${id}.webp`, w, h })
  }
}
// destaques: os slugs de src/data/casos.js
for (const d of ['torra-alta', 'sol', 'restinga', 'preamar']) {
  const f = img(`destaque-${d}`)
  if (f) execFileSync('cwebp', ['-quiet', '-q', '82', f, '-o', `${out}/${d}.webp`])
}
// método: rascunho e prancha do sistema (retrato)
for (const m of ['rascunho', 'sistema']) {
  const f = img(`metodo-${m}`)
  if (f) execFileSync('cwebp', ['-quiet', '-q', '80', '-resize', '1000', '0', f, '-o', `${out}/metodo-${m}.webp`])
}
// método 4: a embalagem recortada do primeiro destaque. O recorte (x 820, 683 x 1024) foi medido na foto da demo;
// com outra foto, ajuste o crop para pegar o produto inteiro.
const rua = img('destaque-torra-alta')
if (rua) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', rua, '-vf', 'crop=683:1024:820:0', `${tmp}/rua.png`])
  execFileSync('cwebp', ['-quiet', '-q', '80', `${tmp}/rua.png`, '-o', `${out}/metodo-rua.webp`])
}
rmSync(tmp, { recursive: true })
if (pecas.length) writeFileSync('src/data/pecas.json', JSON.stringify(pecas, null, 1) + '\n')
console.log(pecas.length, 'peças')
