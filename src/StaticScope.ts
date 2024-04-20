import type { Ast } from '@syuilo/aiscript';
import { SemanticError } from './SemanticError.ts';
import { BuiltinConstant, type SyntaxObject } from './SyntaxObject.ts';

export class StaticScope {
    public readonly name = '<root>';

    public readonly parent?: StaticScope;

    private readonly variables: Map<string, SyntaxObject>;

    public readonly errors: SemanticError[] = [];

    constructor(variables: Iterable<string> | null, parent?: StaticScope) {
        this.parent = parent;
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

    findVariable(
        identifier: string,
        node: Ast.Identifier,
    ): SyntaxObject | undefined {
        // deno-lint-ignore no-this-alias
        let scope: StaticScope | undefined = this;
        while (scope != null) {
            const result = scope.variables.get(identifier);
            if (result != null) {
                return result;
            }
            scope = scope.parent;
        }
        this.errors.push(
            new SemanticError(
                `No such variable '${identifier}' in scope '${this.name}'`,
                node,
            ),
        );
    }
}
