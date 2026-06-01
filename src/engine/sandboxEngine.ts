import { ExecutionStep } from './executionEngine';

/**
 * SandboxEngine
 * 
 * Executes user-written JavaScript sorting code in a safe, offline environment.
 * Uses a Proxy on the input array to intercept all comparisons and swaps, 
 * automatically generating visualization steps without any external API.
 */
export class SandboxEngine {
  
  static executeUserCode(userCode: string, inputArray: number[]): {
    steps: ExecutionStep[];
    error: string | null;
  } {
    const steps: ExecutionStep[] = [];
    const arr = [...inputArray];
    let stepCount = 0;
    const MAX_STEPS = 5000; // Safety limit

    // Create a tracked array that records every operation
    const trackedArr = new Proxy(arr, {
      get(target, prop) {
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
          // Array index access — record a read
          return target[Number(prop)];
        }
        if (prop === 'length') return target.length;
        if (prop === Symbol.iterator) return target[Symbol.iterator].bind(target);
        // Pass through standard array methods
        const val = (target as any)[prop];
        if (typeof val === 'function') return val.bind(target);
        return val;
      },
      set(target, prop, value) {
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
          const idx = Number(prop);
          target[idx] = value;
          stepCount++;
          if (stepCount <= MAX_STEPS) {
            steps.push({
              type: 'highlight',
              index: idx,
              message: `Set arr[${idx}] = ${value}`,
              state: [...target],
            });
          }
          return true;
        }
        (target as any)[prop] = value;
        return true;
      }
    });

    // Helper functions the user can call in their code
    const helpers = {
      compare: (i: number, j: number): number => {
        stepCount++;
        if (stepCount <= MAX_STEPS) {
          steps.push({
            type: 'compare',
            i,
            j,
            message: `Comparing arr[${i}] (${arr[i]}) and arr[${j}] (${arr[j]})`,
            state: [...arr],
          });
        }
        return arr[i] - arr[j];
      },
      swap: (i: number, j: number): void => {
        stepCount++;
        if (stepCount <= MAX_STEPS) {
          steps.push({
            type: 'swap',
            i,
            j,
            message: `Swapping arr[${i}] (${arr[i]}) and arr[${j}] (${arr[j]})`,
            state: [...arr],
          });
        }
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        steps.push({
          type: 'highlight',
          index: j,
          message: `After swap: arr[${i}]=${arr[i]}, arr[${j}]=${arr[j]}`,
          state: [...arr],
        });
      },
      highlight: (idx: number, msg?: string): void => {
        stepCount++;
        if (stepCount <= MAX_STEPS) steps.push({ type: 'highlight', index: idx, message: msg || `Highlighting arr[${idx}]`, state: [...arr] });
      },
      visit: (node: number, msg?: string): void => {
        stepCount++;
        if (stepCount <= MAX_STEPS) steps.push({ type: 'visit', node, message: msg || `Visiting node ${node}`, state: [...arr] });
      },
      markSorted: (idx: number, msg?: string): void => {
        stepCount++;
        if (stepCount <= MAX_STEPS) steps.push({ type: 'found', index: idx, message: msg || `arr[${idx}] is sorted!`, state: [...arr] });
      }
    };

    try {
      // Create sandboxed function
      // The user code receives `arr` (the proxy), `compare(i,j)`, `swap(i,j)`, `highlight(i, msg)`, `visit(node, msg)`, `markSorted(i, msg)`, and `n`
      const sandboxedFn = new Function('arr', 'compare', 'swap', 'highlight', 'visit', 'markSorted', 'n', `
        "use strict";
        ${userCode}
      `);

      sandboxedFn(trackedArr, helpers.compare, helpers.swap, helpers.highlight, helpers.visit, helpers.markSorted, arr.length);

      return { steps, error: null };
    } catch (e: any) {
      return { steps, error: e.message || 'Unknown error during execution.' };
    }
  }
}
