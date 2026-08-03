import { ClassroomUIState } from '../experience/state';

export class PresentationAdapter {
  /**
   * Mengubah UI State menjadi format payload JSON standar untuk Frontend / WebSocket
   */
  public static toApiResponse(state: ClassroomUIState) {
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        session_id: state.sessionId,
        class_id: state.classId,
        current_moment: state.activeMomentTitle,
        progress: `${state.progressPercentage}%`,
        system_status: state.systemStatus,
      },
    };
  }
}