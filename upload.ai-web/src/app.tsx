import { useState } from 'react'
import { Button } from './components/ui/button'
import { Github, Wand2 } from 'lucide-react'
import { Separator } from './components/ui/separator'
import { Textarea } from './components/ui/textarea'
import { Label } from './components/ui/label'
import { Slider } from './components/ui/slider'
import logo from './assets/logo.svg'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from './components/ui/select'
import { VideoInputForm } from './components/video-input-form'
import { PromptSelect } from './components/prompt-select'
import { useCompletion } from 'ai/react'
import { Loading } from './components/loading'

export function App() {
  const [temperature, setTemperature] = useState(0.5)
  const [videoId, setVideoId] = useState<string | null>(null)

  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading,
  } = useCompletion({
    api: 'http://localhost:3333/ai/complete',
    body: {
      videoId,
      temperature,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-6 py-3 flex items-center justify-between border-b ">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" className="w-8 h-8" />
          <span className="font-bold text-2xl tracking-wide ">
            UPLOAD<span className="text-primary">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Feito com 💜 na NLW da rocketseat!
          </span>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline">
            <Github className="w-4 h-4 mr-2" />
            Github
          </Button>
        </div>
      </div>
      <main className="flex-1 p-6 flex gap-6">
        <div className="flex flex-col flex-1 gap-4">
          <div className="grid grid-row-2 gap-4 flex-1">
            <Textarea
              className="resize-none p-4 leading-relaxed  scrollbar-thin scrollbar-thumb-primary scrollbar-track-muted-foreground/20 scrollbar-thumb-rounded-ls scrollbar-track-rounded-ls hover:scrollbar-thumb-primary/70 "
              placeholder="Inclua o prompt para a IA.."
              value={input}
              onChange={handleInputChange}
            />
            <Textarea
              className="resize-none p-4 leading-relaxed scrollbar-thin scrollbar-thumb-primary scrollbar-track-muted-foreground/20 scrollbar-thumb-rounded-ls scrollbar-track-rounded-ls hover:scrollbar-thumb-primary/70 "
              placeholder="Resultado gerado pela IA.."
              value={completion}
              readOnly
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Lembre-se: Você pode utilizar a variável{' '}
            <code className="text-violet-800"> &#123;transcription&#125; </code>
            no seu prompt para adicionar o conteúdo da transcrição do video
            selecionado.
          </p>
        </div>
        <aside className="w-60 space-y-6">
          <VideoInputForm onVideoUploaded={setVideoId} />
          <Separator />
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 ">
              <Label>Prompt</Label>
              <PromptSelect onPromptSelect={setInput} />
            </div>
            <Separator />
            <div className="space-y-2 ">
              <Label>Model</Label>
              <Select disabled defaultValue="gpt3.5">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt3.5">GPT 3.5-turbo 16k</SelectItem>
                </SelectContent>
              </Select>
              <span className="block text-xs text-muted-foreground italic ">
                Você poderá selecionar essa opção em breve.
              </span>
            </div>
            <Separator />
            <div className="space-y-2 ">
              <Label>Temperatura</Label>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
                className="transition-all"
              />

              <span className="block text-xs text-muted-foreground italic">
                Valores mais altos tendem a deixar o resultado mas criativos e
                com maior possibilidade de erros.
              </span>
            </div>
            <Separator />

            <Button disabled={isLoading} type="submit" className="w-full">
              {isLoading && (
                <>
                  Gerando <Loading />
                </>
              )}
              {!isLoading && (
                <>
                  Executar <Wand2 className="w-4 h-4 ml-2 " />
                </>
              )}
            </Button>
          </form>
        </aside>
      </main>
    </div>
  )
}
