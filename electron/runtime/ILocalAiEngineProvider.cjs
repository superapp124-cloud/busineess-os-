'use strict';

/**
 * CHATR AI Runtime — Abstract Provider Interface (ILocalAiEngineProvider)
 * 
 * Standard contract for local inference engines (Ollama, llama.cpp, ONNX, vLLM).
 * Decouples CHATR application layer from specific inference daemon implementations.
 */

class ILocalAiEngineProvider {
  /** Provider metadata */
  get id() { throw new Error('Not implemented'); }
  get name() { throw new Error('Not implemented'); }
  get version() { throw new Error('Not implemented'); }

  /** Lifecycle operations */
  async initialize() { throw new Error('Not implemented'); }
  async isInstalled() { throw new Error('Not implemented'); }
  async install(onProgress) { throw new Error('Not implemented'); }
  async startService(port) { throw new Error('Not implemented'); }
  async stopService() { throw new Error('Not implemented'); }

  /** Model management */
  async listReadyModels() { throw new Error('Not implemented'); }
  async pullModel(modelName, onProgress) { throw new Error('Not implemented'); }

  /** Inference execution */
  async generateCompletion(request) { throw new Error('Not implemented'); }
}

module.exports = { ILocalAiEngineProvider };
