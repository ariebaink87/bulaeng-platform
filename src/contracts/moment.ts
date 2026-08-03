export type MomentType = 'PRESENTATION' | 'QUIZ' | 'DISCUSSION' | 'AI_INTERACTION' | 'REFLECTION';

export interface ClassroomMoment {
  momentId: string;
  title: string;
  type: MomentType;
  durationSeconds: number;
  payload: Record<string, unknown>;
  isRequired: boolean;
}