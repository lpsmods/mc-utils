export class ErrorUtils {
  /**
   * Wraps the callback in a try-catch statement, making the error silent.
   * @param {object} error
   * @param callback
   * @returns
   */
  static wrapCatchSingle(error: typeof Error, callback: () => void): boolean {
    return ErrorUtils.wrapCatch([error], callback);
  }

  /**
   * Wraps the callback in a try-catch statement, making errors silent.
   * @param {Error[]} errors
   * @param callback
   * @returns
   */
  static wrapCatch(errors: (typeof Error)[], callback: () => void): boolean {
    try {
      callback();
      return true;
    } catch (err) {
      if (!err) return false;
      for (const error of errors) {
        if (error && typeof error === "function" && err instanceof error) return false;
      }
      throw err;
    }
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
    issues.push({ path: path, message: `Must be a ${types.join(", ")} not "${type}".` });
    return false;
  }

  static optionalValueError(
    issues: ValidationIssue[],
    path: string,
    value: any,
    types: string[]
  ): boolean {
    types.push("undefined");
    return this.valueError(issues, path, value, types);
  }
}
