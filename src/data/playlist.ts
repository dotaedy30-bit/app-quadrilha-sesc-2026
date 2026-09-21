import { audioManifest, shotEffectFile } from '../generated/audioManifest'

export type Track = { id: string; number: number; name: string; fileName: string; audioPath: string | null; color: string; colorSecondary: string }
const audio = (fileName: string | null) => fileName ? `${import.meta.env.BASE_URL}audios/${encodeURIComponent(fileName)}` : null
const item = (id: string, fallback: string, manifestId = id) => ({ fileName: audioManifest[manifestId] || fallback, audioPath: audio(audioManifest[manifestId]) })

export const treinoPlaylist: Track[] = [
  { id: 'entrada', number: 1, name: 'Entrada da Quadrilha', ...item('entrada', 'entrada-da-quadrilha.mpeg'), color: '#2589e8', colorSecondary: '#1747b8' },
  { id: 'trem-maluco', number: 2, name: 'Trem Maluco', ...item('trem-maluco', 'trem-maluco.mpeg'), color: '#f5bf2e', colorSecondary: '#f07825' },
  { id: 'rei-rainha', number: 3, name: 'Apresentação do Rei e da Rainha', ...item('rei-rainha', 'apresntacao-rei-e-rainha.mpeg'), color: '#8e54d9', colorSecondary: '#e4ad35' },
  { id: 'me-de-a-mao', number: 4, name: 'Me Dê Sua Mão', ...item('me-de-a-mao', 'me-de-a-sua-mao.mp3'), color: '#ef4f9a', colorSecondary: '#ac238d' },
  { id: 'riacho-navio', number: 5, name: 'Riacho do Navio', ...item('riacho-navio', 'riacho-do-navio.mpeg'), color: '#1767cc', colorSecondary: '#112e79' },
  { id: 'amor-amor', number: 6, name: 'Amor, Amor', ...item('amor-amor', 'amor-amor.mp3'), color: '#a92550', colorSecondary: '#e49b3d' },
  { id: 'quadrilhao', number: 7, name: 'Quadrilhão', ...item('quadrilhao', 'quadrilhao.mpeg'), color: '#38a95b', colorSecondary: '#8ccf43' },
  { id: 'apresentacao-noivos', number: 8, name: 'Apresentação dos Noivos', ...item('apresentacao-noivos', 'apresentacao-dos-noivos.mpeg'), color: '#f26a55', colorSecondary: '#c72936' },
  { id: 'xote-noivos', number: 9, name: 'Xote dos Noivos', ...item('xote-noivos', 'xote-dos-noivos.mpeg'), color: '#42cbe1', colorSecondary: '#248eae' },
  { id: 'despedida', number: 10, name: 'Despedida', ...item('despedida', 'despedida.mpeg'), color: '#ef4938', colorSecondary: '#f6bd3b' },
]

export const diretaoPlaylist: Track[] = [
  { id: 'diretao-001', number: 1, name: 'Diretão 001', ...item('diretao-001', 'diretao-001.mpeg'), color: '#087ec1', colorSecondary: '#00549b' },
  { id: 'diretao-002', number: 2, name: 'Diretão 002', ...item('diretao-002', 'diretao-002.mpeg'), color: '#29a9e8', colorSecondary: '#0070bb' },
]

export const diretaoTemporarioPlaylist: Track[] = [
  { id: 'diretao-temporario-001', number: 1, name: 'Diretão Temporário', ...item('diretao-temporario-001', 'Diretão Temporário', 'diretao-temporario-001'), color: '#008dcc', colorSecondary: '#005aa8' },
  { id: 'diretao-temporario-002', number: 2, name: 'Diretão Temporário 02', ...item('diretao-temporario-002', 'Diretão Temporário 02', 'diretao-temporario-002'), color: '#3abdea', colorSecondary: '#087ec1' },
]

export const treinoTemporarioPlaylist: Track[] = [
  { id: 'temporario-trem-maluco', number: 1, name: 'Trem Maluco', ...item('temporario-trem-maluco', 'trem-maluco.mpeg', 'trem-maluco'), color: '#f5bf2e', colorSecondary: '#f07825' },
  { id: 'temporario-explode-coracao', number: 2, name: 'Explode Coração', ...item('temporario-explode-coracao', 'explode-coracao.mp3', 'explode-coracao'), color: '#ef4f9a', colorSecondary: '#ac238d' },
  { id: 'temporario-me-de-a-mao', number: 3, name: 'Me Dê a Sua Mão', ...item('temporario-me-de-a-mao', 'me-de-a-sua-mao.mp3', 'me-de-a-mao'), color: '#8e54d9', colorSecondary: '#e4ad35' },
  { id: 'temporario-riacho-navio', number: 4, name: 'Riacho do Navio', ...item('temporario-riacho-navio', 'riacho-do-navio.mpeg', 'riacho-navio'), color: '#1767cc', colorSecondary: '#112e79' },
  { id: 'temporario-amor-amor', number: 5, name: 'Amor a Amor', ...item('temporario-amor-amor', 'amor-amor.mp3', 'amor-amor'), color: '#a92550', colorSecondary: '#e49b3d' },
  { id: 'temporario-xote-noivos', number: 6, name: 'Xote dos Noivos', ...item('temporario-xote-noivos', 'xote-dos-noivos.mpeg', 'xote-noivos'), color: '#42cbe1', colorSecondary: '#248eae' },
]

export const shotEffect = { fileName: shotEffectFile || 'efeito-de-tiro', audioPath: audio(shotEffectFile) }
