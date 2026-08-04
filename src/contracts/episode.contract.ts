import { z } from 'zod';

export const SceneSchema = z.object({
  id: z.string(),
  name: z.string(), // Opening, Animation, Song, Discussion, Activity, Observation, Reflection, Closing
  durationMinutes: z.number(),
  promptInstruction: z.string()
});

export const EpisodePackageSchema = z.object({
  episodeId: z.string(),
  title: z.string(),
  universe: z.string(),
  story: z.string(),
  group: z.string(), // Contoh: B1
  semester: z.number(), // Contoh: 1
  theme: z.string(), // Contoh: Tanaman
  scenes: z.array(SceneSchema),
  preparedAt: z.string()
});

export type EpisodePackage = z.infer<typeof EpisodePackageSchema>;
export type Scene = z.infer<typeof SceneSchema>;