import { FileVideo, Upload } from 'lucide-react'
import { Separator } from './ui/separator'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react'
import { getFFmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { api } from '@/lib/axios'
import { Loading } from './loading'

type Status = 'awaiting' | 'converting' | 'uploading' | 'generating' | 'success'

const statusLabel = {
  converting: 'Convertendo',
  generating: 'Transcrevendo',
  uploading: 'Carregando',
  success: 'Sucesso!',
}

interface VideoInputFormProps {
  onVideoUploaded: (videoId: string) => void
}

export function VideoInputForm({ onVideoUploaded }: VideoInputFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [status, setSatus] = useState<Status>('awaiting')

  const promptInputRef = useRef<HTMLTextAreaElement>(null)

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget

    if (!files) return

    const selectedFile = files[0]

    setVideoFile(selectedFile)
  }
  async function convertVideoToAudio(video: File) {
    console.log('Converting video to audio started')

    const ffmpeg = await getFFmpeg()

    await ffmpeg.writeFile('input.mp4', await fetchFile(video))

    ffmpeg.on('progress', (progress) => {
      console.log('Convert progress: ' + Math.round(progress.progress * 100))
    })

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3',
    ])

    const data = await ffmpeg.readFile('output.mp3')

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })
    const audioFile = new File([audioFileBlob], 'audio.mp3', {
      type: 'audio/mpeg',
    })

    console.log('Convert finished')

    return audioFile
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const prompt = promptInputRef.current?.value

    if (!videoFile) return []

    setSatus('converting')

    const audio = await convertVideoToAudio(videoFile)

    const data = new FormData()

    data.append('file', audio)

    const res = await api.post('/videos', data)

    const videoId = res.data.video.id

    setSatus('generating')

    await api.post(`/videos/${videoId}/transcription`, {
      prompt,
    })

    setSatus('success')

    onVideoUploaded(videoId)
  }

  const previewURL = useMemo(() => {
    if (!videoFile) return null

    return URL.createObjectURL(videoFile)
  }, [videoFile])

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <label
        htmlFor="video"
        className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-accent overflow-hidden"
      >
        {previewURL && (
          <video
            src={previewURL}
            controls={false}
            className="absolute inset-0 pointer-events-none"
          />
        )}
        {!videoFile && (
          <>
            <FileVideo className="w-4 h-4" />
            Selecione um video
          </>
        )}
      </label>
      <input
        type="file"
        id="video"
        disabled={status !== 'awaiting'}
        accept="video/mp4"
        className="sr-only"
        onChange={handleFileSelect}
      />
      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de descrição</Label>
        <Textarea
          id="transcription_prompt"
          ref={promptInputRef}
          disabled={status !== 'awaiting'}
          className="h-20 leading-relaxed resize-none scrollbar-thin scrollbar-thumb-primary scrollbar-track-muted-foreground/20 scrollbar-thumb-rounded-ls scrollbar-track-rounded-ls hover:scrollbar-thumb-primary/70"
          placeholder="Inclua palavras-chaves inclusas no video separadas por (,)"
        />
      </div>
      <Button
        disabled={status !== 'awaiting'}
        type="submit"
        data-status={status}
        className="w-full data-[status='success']:bg-emerald-500"
      >
        {status === 'awaiting' && (
          <>
            Carregar video <Upload className={`w-4 h-4 ml-2`} />
          </>
        )}
        {status !== 'awaiting' && status !== 'success' && (
          <>
            {statusLabel[status]}
            <Loading />
          </>
        )}
        {status === 'success' && 'Sucesso!'}
      </Button>
    </form>
  )
}
