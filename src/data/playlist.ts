import { audioManifest, shotEffectFile } from '../generated/audioManifest'

export type Track = { id: string; number: number; name: string; description?: string; fileName: string; audioPath: string | null; color: string; colorSecondary: string; order: number }
const audio = (fileName: string | null) => fileName ? `${import.meta.env.BASE_URL}audios/${encodeURIComponent(fileName)}` : null
const item = (id: string, fallback: string) => ({ fileName: audioManifest[id] || fallback, audioPath: audio(audioManifest[id]) })

export const playlist: Track[] = [
  { id: 'apresentacao-professor', number: 1, name: 'Apresentação da Quadrilha pelo Professor', description: 'Fundo para a apresentação falada do professor.', ...item('apresentacao-professor', 'apresentacao-da-quadrilha-pelo-professor.mp3'), color: '#ef4938', colorSecondary: '#f6bd3b', order: 1 },
  { id: 'entrada', number: 2, name: 'Entrada da Quadrilha', ...item('entrada', 'entrada-da-quadrilha.mp3'), color: '#2589e8', colorSecondary: '#1747b8', order: 2 },
  { id: 'cumprimentacao', number: 3, name: 'Cumprimentação ao Público', ...item('cumprimentacao', 'cumprimentacao-ao-publico.mp3'), color: '#f5bf2e', colorSecondary: '#f07825', order: 3 },
  { id: 'me-de-a-mao', number: 4, name: 'Me Dê a Sua Mão', ...item('me-de-a-mao', 'me-de-a-sua-mao.mp3'), color: '#ef4f9a', colorSecondary: '#ac238d', order: 4 },
  { id: 'rei-rainha', number: 5, name: 'Apresentação do Rei e da Rainha', ...item('rei-rainha', 'apresentacao-do-rei-e-da-rainha.mp3'), color: '#8e54d9', colorSecondary: '#e4ad35', order: 5 },
  { id: 'quadrilhao', number: 6, name: 'Quadrilhão', ...item('quadrilhao', 'quadrilhao.mp3'), color: '#38a95b', colorSecondary: '#8ccf43', order: 6 },
  { id: 'xote-noivos', number: 7, name: 'Xote dos Noivos', ...item('xote-noivos', 'xote-dos-noivos.mp3'), color: '#42cbe1', colorSecondary: '#248eae', order: 7 },
  { id: 'riacho-navio', number: 8, name: 'Riacho do Navio', ...item('riacho-navio', 'riacho-do-navio.mp3'), color: '#1767cc', colorSecondary: '#112e79', order: 8 },
  { id: 'apresentacao-noivos', number: 9, name: 'Apresentação dos Noivos', ...item('apresentacao-noivos', 'apresentacao-dos-noivos.mp3'), color: '#f26a55', colorSecondary: '#c72936', order: 9 },
  { id: 'amor-amor', number: 10, name: 'Amor a Amor', ...item('amor-amor', 'amor-amor.mp3'), color: '#a92550', colorSecondary: '#e49b3d', order: 10 },
]
export const shotEffect = { fileName: shotEffectFile || 'efeito-de-tiro', audioPath: audio(shotEffectFile) }
