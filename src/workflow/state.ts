import { ClassroomMoment } from '@contracts/moment';

export interface WorkflowState {
  currentMomentIndex: number;
  totalMoments: number;
  activeMoment?: ClassroomMoment;
  isCompleted: boolean;
}

export class WorkflowStateManager {
  private moments: ClassroomMoment[] = [];
  private currentIndex: number = -1;

  constructor(moments: ClassroomMoment[] = []) {
    this.moments = moments;
  }

  public setMoments(moments: ClassroomMoment[]): void {
    this.moments = moments;
    this.currentIndex = moments.length > 0 ? 0 : -1;
  }

  public getCurrentState(): WorkflowState {
    const activeMoment = this.currentIndex >= 0 && this.currentIndex < this.moments.length
      ? this.moments[this.currentIndex]
      : undefined;

    return {
      currentMomentIndex: this.currentIndex,
      totalMoments: this.moments.length,
      activeMoment,
      isCompleted: this.currentIndex >= this.moments.length && this.moments.length > 0,
    };
  }

  public next(): ClassroomMoment | null {
    if (this.currentIndex < this.moments.length - 1) {
      this.currentIndex++;
      return this.moments[this.currentIndex];
    }
    this.currentIndex = this.moments.length; // Marked as completed
    return null;
  }
}