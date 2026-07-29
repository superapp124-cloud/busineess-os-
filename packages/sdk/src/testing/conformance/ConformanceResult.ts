import { ValidationIssue } from '../../validation/ValidationResult';

export interface RuleResult {
  ruleName: string;
  passed: boolean;
  message: string;
}

export interface ConformanceResult {
  passed: boolean;
  score: number;
  rules: RuleResult[];
  warnings: ValidationIssue[];
  errors: ValidationIssue[];
  kernelVersion: string;
  certifiedAt: string;
}

export interface ConformanceRule {
  name: string;
  evaluate(target: any): RuleResult;
}
