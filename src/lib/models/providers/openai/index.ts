import { UIConfigField } from '@/lib/config/types';
import { getConfiguredModelProviderById } from '@/lib/config/serverRegistry';
import { Model, ModelList, ProviderMetadata } from '../../types';
import OpenAIEmbedding from './openaiEmbedding';
import BaseEmbedding from '../../base/embedding';
import BaseModelProvider from '../../base/provider';
import BaseLLM from '../../base/llm';
import OpenAILLM from './openaiLLM';

interface OpenAIConfig {
  apiKey: string;
  baseURL: string;
}

const defaultChatModels: Model[] = [
  {
    name: 'GPT-3.5 Turbo',
    key: 'gpt-3.5-turbo',
  },
  {
    name: 'GPT-4',
    key: 'gpt-4',
  },
  {
    name: 'GPT-4 turbo',
    key: 'gpt-4-turbo',
  },
  {
    name: 'GPT-4 omni',
    key: 'gpt-4o',
  },
  {
    name: 'GPT-4o (2024-05-13)',
    key: 'gpt-4o-2024-05-13',
  },
  {
    name: 'GPT-4 omni mini',
    key: 'gpt-4o-mini',
  },
  {
    name: 'GPT 4.1 nano',
    key: 'gpt-4.1-nano',
  },
  {
    name: 'GPT 4.1 mini',
    key: 'gpt-4.1-mini',
  },
  {
    name: 'GPT 4.1',
    key: 'gpt-4.1',
  },
  {
    name: 'GPT 5 nano',
    key: 'gpt-5-nano',
  },
  {
    name: 'GPT 5',
    key: 'gpt-5',
  },
  {
    name: 'GPT 5 Mini',
    key: 'gpt-5-mini',
  },
  {
    name: 'GPT 5 Pro',
    key: 'gpt-5-pro',
  },
  {
    name: 'GPT 5.1',
    key: 'gpt-5.1',
  },
  {
    name: 'GPT 5.2',
    key: 'gpt-5.2',
  },
  {
    name: 'GPT 5.2 Pro',
    key: 'gpt-5.2-pro',
  },
  {
    name: 'o1',
    key: 'o1',
  },
  {
    name: 'o3',
    key: 'o3',
  },
  {
    name: 'o3 Mini',
    key: 'o3-mini',
  },
  {
    name: 'o4 Mini',
    key: 'o4-mini',
  },
];

const defaultEmbeddingModels: Model[] = [
  {
    name: 'Text Embedding 3 Small',
    key: 'text-embedding-3-small',
  },
  {
    name: 'Text Embedding 3 Large',
    key: 'text-embedding-3-large',
  },
];

const providerConfigFields: UIConfigField[] = [
  {
    type: 'password',
    name: 'API Key',
    key: 'apiKey',
    description: 'Your OpenAI API key',
    required: true,
    placeholder: 'OpenAI API Key',
    env: 'OPENAI_API_KEY',
    scope: 'server',
  },
  {
    type: 'string',
    name: 'Base URL',
    key: 'baseURL',
    description: 'The base URL for the OpenAI API',
    required: true,
    placeholder: 'OpenAI Base URL',
    default: 'https://api.openai.com/v1',
    env: 'OPENAI_BASE_URL',
    scope: 'server',
  },
];

class OpenAIProvider extends BaseModelProvider<OpenAIConfig> {
  constructor(id: string, name: string, config: OpenAIConfig) {
    super(id, name, config);
  }

  private normalizeBaseURL(url: string): string {
    const trimmed = url.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`;
  }

  private isOfficialOpenAI(): boolean {
    return (
      this.normalizeBaseURL(this.config.baseURL) === 'https://api.openai.com/v1'
    );
  }

  private async getCompatibleChatModels(): Promise<Model[]> {
    const response = await fetch(
      `${this.normalizeBaseURL(this.config.baseURL)}/models`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Unable to discover models from the OpenAI-compatible server (${response.status})`,
      );
    }

    const body = await response.json();
    const models = Array.isArray(body?.data) ? body.data : [];

    const discovered = models
      .filter(
        (model: any) => typeof model?.id === 'string' && model.id.length > 0,
      )
      .map((model: any) => ({
        name: model.id,
        key: model.id,
      }));

    if (discovered.length === 0) {
      throw new Error(
        'The OpenAI-compatible server did not advertise a model at /v1/models',
      );
    }

    return discovered;
  }

  async getDefaultModels(): Promise<ModelList> {
    if (this.isOfficialOpenAI()) {
      return {
        embedding: defaultEmbeddingModels,
        chat: defaultChatModels,
      };
    }

    return {
      embedding: [],
      chat: await this.getCompatibleChatModels(),
    };
  }

  async getModelList(): Promise<ModelList> {
    const defaultModels = await this.getDefaultModels();
    const configProvider = getConfiguredModelProviderById(this.id)!;

    return {
      embedding: [
        ...defaultModels.embedding,
        ...configProvider.embeddingModels,
      ],
      // A compatible server is authoritative for its live chat models. This
      // prevents stale, manually saved llama.cpp model IDs from remaining in
      // the selector after the server loads a different model.
      chat: this.isOfficialOpenAI()
        ? [...defaultModels.chat, ...configProvider.chatModels]
        : defaultModels.chat,
    };
  }

  async loadChatModel(key: string): Promise<BaseLLM<any>> {
    const modelList = await this.getModelList();
    const selected = this.isOfficialOpenAI()
      ? modelList.chat.find((m) => m.key === key)
      : (modelList.chat.find((m) => m.key === key) ?? modelList.chat[0]);

    if (!selected) {
      throw new Error(
        'Error Loading OpenAI Chat Model. Invalid Model Selected',
      );
    }

    return new OpenAILLM({
      apiKey: this.config.apiKey,
      model: selected.key,
      baseURL: this.normalizeBaseURL(this.config.baseURL),
    });
  }

  async loadEmbeddingModel(key: string): Promise<BaseEmbedding<any>> {
    const modelList = await this.getModelList();
    const exists = modelList.embedding.find((m) => m.key === key);

    if (!exists) {
      throw new Error(
        'Error Loading OpenAI Embedding Model. Invalid Model Selected.',
      );
    }

    return new OpenAIEmbedding({
      apiKey: this.config.apiKey,
      model: key,
      baseURL: this.normalizeBaseURL(this.config.baseURL),
    });
  }

  static parseAndValidate(raw: any): OpenAIConfig {
    if (!raw || typeof raw !== 'object')
      throw new Error('Invalid config provided. Expected object');
    if (!raw.apiKey || !raw.baseURL)
      throw new Error(
        'Invalid config provided. API key and base URL must be provided',
      );

    return {
      apiKey: String(raw.apiKey),
      baseURL: String(raw.baseURL),
    };
  }

  static getProviderConfigFields(): UIConfigField[] {
    return providerConfigFields;
  }

  static getProviderMetadata(): ProviderMetadata {
    return {
      key: 'openai',
      name: 'OpenAI',
    };
  }
}

export default OpenAIProvider;
