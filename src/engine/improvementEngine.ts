export interface ImprovementResult {
  issues: string[];
  suggestions: string[];
  optimized_version?: string;
}

export class ImprovementEngine {
  /**
   * Rule-based (No AI) Code Improvement System.
   * Analyzes raw code strings to detect anti-patterns or inefficiencies.
   */
  static analyzeCode(code: string, language: string): ImprovementResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let optimized_version = code;

    const normalizedCode = code.replace(/\s+/g, '');

    // Rule 1: Detect nested loops (potential O(n^2))
    const forLoopCount = (code.match(/for\s*\(/g) || []).length + (code.match(/for\s+\w+\s+in/g) || []).length;
    const whileLoopCount = (code.match(/while\s*\(/g) || []).length + (code.match(/while\s+\w+/g) || []).length;
    
    if (forLoopCount >= 2 || (forLoopCount + whileLoopCount >= 2)) {
      // Basic heuristic: if there are multiple loops, there's a chance they are nested
      // In a real parser we'd build an AST, but regex is sufficient for this offline simulation
      if (normalizedCode.includes('for(') && code.split(/for/).length > 2) {
        issues.push('Multiple loops detected (Potential O(n^2) complexity).');
        suggestions.push('Consider if you can reduce nested loops by using Hash Maps (O(n)) or sorting first (O(n log n)).');
      }
    }

    // Rule 2: Inefficient Array operations (e.g. shift/unshift in JS, insert at 0 in Python)
    if (language === 'js' || language === 'javascript') {
      if (code.includes('.shift(') || code.includes('.unshift(')) {
        issues.push('Using shift() or unshift() on arrays is O(n).');
        suggestions.push('If you need frequent insertions/deletions at the start, consider a Linked List or Deque structure.');
      }
    }
    
    // Rule 3: Redundant variables
    if (code.includes('let temp =') || code.includes('int temp =')) {
      if (language === 'python' || language === 'js' || language === 'javascript') {
        issues.push('Using a temporary variable for swapping.');
        if (language === 'python') {
          suggestions.push('In Python, you can swap directly: a, b = b, a');
          optimized_version = optimized_version.replace(/temp\s*=\s*(.+?);\s*(.+?)\s*=\s*(.+?);\s*(.+?)\s*=\s*temp;/g, '$2, $4 = $3, $2');
        }
        if (language === 'js' || language === 'javascript') {
          suggestions.push('In ES6+, you can use destructuring to swap: [a, b] = [b, a]');
        }
      }
    }

    // Rule 4: System out in loops
    if (normalizedCode.includes('console.log') || normalizedCode.includes('print(') || normalizedCode.includes('system.out.print')) {
      if (forLoopCount > 0 || whileLoopCount > 0) {
        issues.push('I/O operations inside loops drastically reduce performance.');
        suggestions.push('Consider accumulating output in a string/array and printing once after the loop.');
      }
    }

    if (issues.length === 0) {
      issues.push('Code looks clean based on static rules.');
      suggestions.push('Keep up the good work! Make sure to verify edge cases.');
    }

    return {
      issues,
      suggestions,
      optimized_version: issues.length > 0 ? optimized_version : undefined
    };
  }
}
