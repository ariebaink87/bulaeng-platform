export interface PolicyRule {
  ruleId: string;
  name: string;
  validate: (context: { teacherId?: string; action?: string }) => { allowed: boolean; reason?: string };
}

export const defaultRules: PolicyRule[] = [
  {
    ruleId: 'POL-001',
    name: 'Require Valid Teacher ID',
    validate: (ctx) => {
      if (!ctx.teacherId || ctx.teacherId.trim() === '') {
        return { allowed: false, reason: 'Teacher ID is required to execute commands.' };
      }
      return { allowed: true };
    },
  },
  {
    ruleId: 'POL-002',
    name: 'Disallow Empty Action',
    validate: (ctx) => {
      if (!ctx.action || ctx.action.trim() === '') {
        return { allowed: false, reason: 'Action name cannot be empty.' };
      }
      return { allowed: true };
    },
  },
];