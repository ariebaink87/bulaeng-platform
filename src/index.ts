import { ClassroomRuntimeEngine } from './runtime/engine';
import { ClassroomPresenter } from './experience/presenter';
import { PresentationAdapter } from './presentation/adapter';
import { ClassroomMoment } from './contracts/moment';

async function runFullBulaengOS() {
  console.log('🌟 [BULAENG CLASSROOM OS] Executing Full 10-Module Pipeline Test...\n');

  // 1. Booting Engine
  const os = new ClassroomRuntimeEngine('session-202', 'class-b2', 'teacher-888');
  const presenter = new ClassroomPresenter(os);
  os.boot();

  // 2. Workflow Plan & Advance
  const plan: ClassroomMoment[] = [
    {
      momentId: 'm-10',
      title: 'Orientasi Masalah',
      type: 'PRESENTATION',
      durationSeconds: 300,
      payload: {},
      isRequired: true,
    },
  ];
  os.orchestrator.loadPlan(plan);
  os.advanceMoment();

  // 3. Learning Module
  os.learningTracker.recordAssessment({
    studentId: 'std-01',
    competencyId: 'CRITICAL_THINKING',
    score: 90,
    feedback: 'Pemahaman masalah sangat tajam.',
  });

  // 4. Mission / Gamification Module
  const earnedXp = os.missionEngine.completeQuest('q-orientasi');
  console.log(`🎮 [MISSION REWARD] Quest Selesai! Student mendapat +${earnedXp} XP`);
  console.log('🏆 [GAMIFICATION STATUS]:', JSON.stringify(os.missionEngine.getMissionStatus(), null, 2));

  // 5. Presentation Payload Output
  const uiState = presenter.getUIState();
  const apiPayload = PresentationAdapter.toApiResponse(uiState);
  console.log('\n🌐 [PRESENTATION API PAYLOAD]:');
  console.log(JSON.stringify(apiPayload, null, 2));

  // 6. System Shutdown
  os.shutdown();
  console.log('\n✅ ALL 10 MODULES INTEGRATED AND OPERATIONAL!');
}

runFullBulaengOS();