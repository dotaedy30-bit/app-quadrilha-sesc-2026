import { readdir, mkdir, writeFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'

const audioDir = resolve('public/audios')
const output = resolve('src/generated/audioManifest.ts')
const extensions = new Set(['.mp3', '.mpeg', '.wav', '.m4a', '.aac', '.ogg'])
const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
const has = (name, ...terms) => terms.every((term) => name.includes(normalize(term)))
const definitions = [
  ['apresentacao-professor', 'Apresentação da Quadrilha pelo Professor', (n) => has(n, 'apresentacao') && (has(n, 'professor') || has(n, 'quadrilha')) && !has(n, 'noivos')],
  ['entrada', 'Entrada da Quadrilha', (n) => has(n, 'entrada')],
  ['cumprimentacao', 'Cumprimentação ao Público', (n) => has(n, 'cumprimentacao') || has(n, 'comprimentacao') || has(n, 'publico')],
  ['me-de-a-mao', 'Me Dê a Sua Mão', (n) => has(n, 'me', 'de', 'sua', 'mao')],
  ['rei-rainha', 'Apresentação do Rei e da Rainha', (n) => has(n, 'rei', 'rainha')],
  ['quadrilhao', 'Quadrilhão', (n) => has(n, 'quadrilhao')],
  ['xote-noivos', 'Xote dos Noivos', (n) => has(n, 'xote', 'noivos')],
  ['riacho-navio', 'Riacho do Navio', (n) => has(n, 'riacho', 'navio')],
  ['apresentacao-noivos', 'Apresentação dos Noivos', (n) => has(n, 'apresentacao', 'noivos')],
  ['amor-amor', 'Amor a Amor', (n) => has(n, 'amor')],
]
const files = (await readdir(audioDir, { withFileTypes: true })).filter((e) => e.isFile() && extensions.has(extname(e.name).toLowerCase())).map((e) => e.name).sort((a, b) => a.localeCompare(b, 'pt-BR'))
const shotCandidates = files.filter((file) => has(normalize(file), 'tiro') || has(normalize(file), 'disparo'))
const musicFiles = files.filter((file) => !shotCandidates.includes(file))
const tracks = {}; const used = new Set()
console.log('\nManifesto de áudios:')
for (const [id, label, matcher] of definitions) {
  const matches = musicFiles.filter((file) => matcher(normalize(file)))
  if (matches.length === 1) { tracks[id] = matches[0]; used.add(matches[0]); console.log(`  ✓ ${label}: ${matches[0]}`) }
  else if (matches.length > 1) { tracks[id] = null; console.warn(`  ! CONFLITO ${label}: ${matches.join(', ')}`) }
  else { tracks[id] = null; console.warn(`  – FALTANDO ${label}`) }
}
if (shotCandidates.length > 1) console.warn(`  ! CONFLITO efeito de tiro: ${shotCandidates.join(', ')}`)
const shotEffect = shotCandidates.length === 1 ? shotCandidates[0] : null
console.log(shotEffect ? `  ✓ Efeito de tiro: ${shotEffect}` : '  – FALTANDO efeito de tiro')
const unmatched = musicFiles.filter((file) => !used.has(file)); if (unmatched.length) console.warn(`  ! Não associados: ${unmatched.join(', ')}`)
await mkdir(resolve('src/generated'), { recursive: true })
await writeFile(output, `// Gerado automaticamente. Não edite.\nexport const audioManifest: Record<string, string | null> = ${JSON.stringify(tracks, null, 2)}\nexport const shotEffectFile: string | null = ${JSON.stringify(shotEffect)}\nexport const discoveredAudioFiles = ${JSON.stringify(files, null, 2)} as const\n`, 'utf8')
console.log(`  → ${output}\n`)
