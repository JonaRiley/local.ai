import { cn } from "@localai/theme/utils"
import { Button } from "@localai/ui/button"
import { Input } from "@localai/ui/input"
import { open } from "@tauri-apps/api/dialog"
import { invoke } from "@tauri-apps/api/tauri"
import clsx from "clsx"

import "iconoir-react"

import { useState } from "react"

import {
  type ModelDirectoryState,
  type ModelMetadata,
  toGB
} from "~core/model-file"
import { ModelChecksum } from "~features/inference-server/model-checksum"
import { ModelConfig } from "~features/inference-server/model-config"
import { ServerConfig } from "~features/inference-server/server-config"
import { useInit } from "~features/inference-server/use-init"
import { useGlobal } from "~providers/global"

// Flow: Pick a models directory

// For each model file in the directory, show an items with the following:
// - Model name
// - Model hash
// - Model description
// - Model size

// A button to "spawn" an inference server for the selected model

function IndexPage() {
  const {
    activeModelState: [activeModel]
  } = useGlobal()
  const [modelsDirectory, setModelsDirectory] = useState("")
  const [models, setModels] = useState<ModelMetadata[]>([])

  useInit(async () => {
    // get the models directory saved in config
    const resp = await invoke<ModelDirectoryState>("initialize_models_dir")
    if (!resp) {
      return
    }
    setModelsDirectory(resp.path)
    setModels(resp.files)
  })

  return (
    <div
      className={clsx(
        "h-full w-full flex flex-col gap-6 overflow-auto bg-gray-2"
      )}>
      <div className="flex gap-2 sticky top-0 bg-gray-1 w-full p-8 z-50">
        <Input
          className="w-full"
          value={modelsDirectory}
          readOnly
          placeholder="Models directory"
        />
        <Button
          className="w-24 justify-center"
          onClick={async () => {
            const selected = (await open({
              directory: true,
              multiple: false
            })) as string

            if (!selected) {
              return
            }

            const resp = await invoke<ModelDirectoryState>(
              "update_models_dir",
              {
                dir: selected
              }
            )
            setModelsDirectory(resp.path)
            setModels(resp.files)
          }}>
          Change
        </Button>
        <Input
          className="w-full"
          readOnly
          value={activeModel?.name}
          placeholder="Active Model"
        />
        <ServerConfig />
      </div>

      <div className="flex flex-col gap-6 p-8">
        {models.map((model: ModelMetadata) => (
          <div
            className={cn(
              "flex flex-col gap-4 rounded-md p-4",
              "text-gray-11 hover:text-gray-12",
              "transition-colors",
              activeModel?.path === model.path
                ? "ring ring-green-7 hover:ring-green-8"
                : "ring ring-gray-7 hover:ring-gray-8"
            )}
            key={model.name}>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col justify-between w-full">
                <div className={"text-md"}>{model.name}</div>
                <div className="text-xs text-gray-10">
                  {`${toGB(model.size).toFixed(2)} GB`}
                </div>
              </div>
              <ModelChecksum model={model} />
            </div>
            <ModelConfig model={model} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default IndexPage
