import type { Ast } from '@syuilo/aiscript';
import { SemanticError } from './SemanticError.ts';

export class StaticScope {
    private readonly variables: Set<string>;

    public readonly errors: SemanticError[] = [];

    constructor(variables: Iterable<string> | null) {
        if (variables != null) {
            this.variables = new Set(variables);
        } else {
            this.variables = new Set();
        }
    }

    addVariable(identifier: string, node: Ast.Node): void {
        const variables = this.variables;
        if (variables.has(identifier)) {
            this.errors.push(
                new SemanticError(
                    `Variable '${identifier}' is already defined`,
                    node,
                ),
            );
        } else {
            variables.add(identifier);
        }
    }
}
