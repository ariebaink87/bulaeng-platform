import { PolicyRule, defaultRules } from './rules';

export interface PolicyEvaluationResult {
  isAllowed: boolean;
  violations: string[];
}

export class PolicyEvaluator {
  private rules: PolicyRule[];

  constructor(customRules?: PolicyRule[]) {
    this.rules = customRules || defaultRules;
  }

  public evaluate(context: { teacherId?: string; action?: string }): PolicyEvaluationResult {
    const violations: string[] = [];

    for (const rule of this.rules) {
      const result = rule.validate(context);
      if (!result.allowed && result.reason) {
        violations.push(`[${rule.ruleId}] ${result.reason}`);
      }
    }

    return {
      isAllowed: violations.length === 0,
      violations,
    };
  }
}