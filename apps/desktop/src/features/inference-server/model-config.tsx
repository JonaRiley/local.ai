import { cn } from "@localai/theme/utils"
import { Button, SpinnerButton } from "@localai/ui/button"
import { Input } from "@localai/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@localai/ui/select"
import { invoke } from "@tauri-apps/api/tauri"
import { useState } from "react"
import Balancer from "react-wrap-balancer"

import { modelList, modelMap } from "~core/model-metadata"
import type { ModelMetadata } from "~pages"

export enum ModelType {
  GptJ = "gptj",
  Llama = "llama",
  NeoX = "neox",
  Bloom = "bloom",
  Gpt2 = "gpt2"
}

const modelTypeList = Object.values(ModelType)

export enum ModelLoadState {
  Default,
  Loading,
  Loaded
}

export const ModelConfig = ({ model }: { model: ModelMetadata }) => {
  const [label, setLabel] = useState("")
  const [modelLoadState, setModelLoadState] = useState<ModelLoadState>(
    ModelLoadState.Default
  )

  // TODO: Cache the model type in a kv later
  const [modelType, setModelType] = useState<ModelType>(ModelType.GptJ)
  return (
    <div className="flex items-center justify-between w-full gap-2">
      <Input
        placeholder="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <Select
        value={modelType}
        onValueChange={(s: ModelType) => setModelType(s)}>
        <SelectTrigger className={cn("text-gray-11", "w-24")}>
          <SelectValue aria-label={modelType}>{modelType}</SelectValue>
        </SelectTrigger>
        <SelectContent className="flex h-48 w-full">
          {modelTypeList.map((mt) => (
            <SelectItem key={mt} value={mt}>
              {mt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <SpinnerButton
        isSpinning={modelLoadState === ModelLoadState.Loading}
        disabled={modelLoadState === ModelLoadState.Loaded}
        onClick={async () => {
          setModelLoadState(ModelLoadState.Loading)
          await invoke("load_model", {
            ...model,
            modelType,
            label
          })
          setModelLoadState(ModelLoadState.Loaded)
        }}>
        {modelLoadState === ModelLoadState.Loaded ? "Loaded" : "Load Model"}
      </SpinnerButton>
    </div>
  )
}
