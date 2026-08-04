import { Router, Request, Response } from 'express';
import { BrainOrchestrator } from '../brain/orchestrator/brain.orchestrator';
import { ClassroomRuntimeEngine } from '../runtime/engine';

const router = Router();

// Store sederhana di memori untuk mengelola sesi aktif
const activeSessions = new Map<string, ClassroomRuntimeEngine>();

// 1. ORCHESTRATOR ENDPOINT (03:00 AM)
router.post('/brain/prepare-day', async (req: Request, res: Response) => {
  try {
    const { group = 'B1' } = req.body;

    const brain = new BrainOrchestrator();
    const episodePackage = await brain.triggerEarlyMorningProcess(group);

    res.status(200).json({
      success: true,
      message: `Episode for group ${group} successfully prepared by Brain Orchestrator.`,
      data: episodePackage,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to trigger prepare day workflow.',
    });
  }
});

// 2. RUNTIME CLASSROOM ENDPOINT (07:00 AM)
router.post('/classroom/session', async (req: Request, res: Response) => {
  try {
    const { action, sessionId, classId, teacherId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }

    let engine = activeSessions.get(sessionId);

    // ACTION: BOOT
    if (action === 'BOOT') {
      if (!classId || !teacherId) {
        return res.status(400).json({ success: false, error: 'classId and teacherId are required for BOOT' });
      }

      engine = new ClassroomRuntimeEngine(sessionId, classId, teacherId);
      engine.boot();
      activeSessions.set(sessionId, engine);

      return res.status(200).json({
        success: true,
        action: 'BOOT',
        message: `Session ${sessionId} booted successfully for class ${classId}`,
      });
    }

    if (!engine) {
      return res.status(404).json({ success: false, error: `Session ${sessionId} is not active` });
    }

    // ACTION: ADVANCE
    if (action === 'ADVANCE') {
      engine.advanceMoment();
      return res.status(200).json({
        success: true,
        action: 'ADVANCE',
        message: `Session ${sessionId} advanced to next moment`,
      });
    }

    // ACTION: SHUTDOWN
    if (action === 'SHUTDOWN') {
      const metrics = engine.getMetrics();
      engine.shutdown();
      activeSessions.delete(sessionId);

      return res.status(200).json({
        success: true,
        action: 'SHUTDOWN',
        metrics,
        message: `Session ${sessionId} closed successfully`,
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid action provided' });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Runtime execution error',
    });
  }
});

export default router;