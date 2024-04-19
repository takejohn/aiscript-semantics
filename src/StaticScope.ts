import type { Ast } from '@syuilo/aiscript';
import { SemanticError } from './SemanticError.ts';
import { BuiltinConstant, type SyntaxObject } from './SyntaxObject.ts';

export class StaticScope {
    public readonly name = '<root>';

    private readonly variables: Map<string, SyntaxObject>;

    public readonly errors: SemanticError[] = [];

    constructor(variables: Iterable<string> | null) {
        const variableMap = new Map();
        if (variables != null) {
            for (const variable of variables) {
                variableMap.set(variable, new BuiltinConstant(variable));
            }
        }
        this.variables = new Map();
    }

    addVariable(identifier: string, node: Ast.Definition): void {
        const variables = this.variables;
        if (variables.has(identifier)) {
            this.errors.push(
                new SemanticError(
                    `Variable '${identifier}' already exists in scope '${this.name}'`,
                    node,
                ),
            );
        } else {
            variables.set(identifier, {
                name: identifier,
                definition: node,
            });
        }
    }
}
