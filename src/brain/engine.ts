import { BrainCommand, BrainResponse } from '@contracts/brain';

export interface BrainEngine {
  providerName: string;
  process<T = unknown, R = unknown>(command: BrainCommand<T>): Promise<BrainResponse<R>>;
}

export class DefaultBrainEngine implements BrainEngine {
  public providerName = 'BULAENG-Core-AI';

  async process<T = unknown, R = unknown>(command: BrainCommand<T>): Promise<BrainResponse<R>> {
    const startTime = Date.now();

    // Mock processing logic (siap dihubungkan ke API LLM sesungguhnya)
    const executionTimeMs = Date.now() - startTime;

    return {
      commandId: command.commandId,
      success: true,
      data: {
        message: `Processed action '${command.action}' successfully via ${this.providerName}`,
        echoPayload: command.payload,
      } as R,
      executionTimeMs,
    };
  }
}