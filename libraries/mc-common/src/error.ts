/**
 * Generic error functions.
 */

import { LocationInUnloadedChunkError, LocationOutOfWorldBoundariesError } from "@minecraft/server";

export class ErrorUtils {
  /**
   * Wraps the callback in a try-catch statement, making the error silent.
   * @param {object} error
   * @param callback
   * @returns
   */
  static wrapCatch<T>(error: Function, callback: () => T): T | undefined {
    try {
      return callback();
    } catch (err) {
      if (err instanceof (error as any)) return;
      throw err;
    }
  }

  /**
   * Wraps the callback in a try-catch statement, making errors silent.
   * @param {Error[]} errors
   * @param callback
   * @returns
   */
  static wrapCatchAll<T>(errors: Function[], callback: () => T): T | undefined {
    try {
      return callback();
    } catch (err) {
      if (!err) return;
      for (const error of errors) {
        if (error && typeof error === "function" && err instanceof error) return;
      }
      throw err;
    }
  }

  static tryPos<T>(callback: () => T): T | undefined {
    return this.wrapCatchAll<T>([LocationInUnloadedChunkError, LocationOutOfWorldBoundariesError], callback);
  }
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export class ValidationError extends Error {
  public readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super(`Validation failed with ${issues.length} error(s).`);
    this.name = "ValidationError";
    this.issues = issues;

    // Ensure the prototype chain is correct for `instanceof` to work.
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  toString(): string {
    return this.issues.map((issue) => `• ${issue.path}: ${issue.message}`).join("\n");
  }

  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      issues: this.issues,
    };
  }

  static valueError(issues: ValidationIssue[], path: string, value: any, types: string[]): boolean {
    const type = typeof value;
    if (types.includes(type)) return true;
    issues.push({
      path: path,
      message: `Must be a ${types.join(", ")} not "${type}".`,
    });
    return false;
  }

  static optionalValueError(issues: ValidationIssue[], path: string, value: any, types: string[]): boolean {
    types.push("undefined");
    return this.valueError(issues, path, value, types);
  }
}
