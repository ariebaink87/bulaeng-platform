export interface BrainCommand<T = unknown> {
  commandId: string;
  action: string;
  context: {
    sessionId: string;
    teacherId: string;
    studentId?: string;
  };
  payload: T;
}

export interface BrainResponse<R = unknown> {
  commandId: string;
  success: boolean;
  data?: R;
  error?: {
    code: string;
    message: string;
  };
  executionTimeMs: number;
}