import type { Ast } from '@syuilo/aiscript';
import { SemanticError } from './SemanticError.ts';
import {
    BuiltinConstant,
    type DefinitionNode,
    type SyntaxObject,
} from './SyntaxObject.ts';

export abstract class StaticScope {
    public readonly name = '<root>';

    public readonly parent?: StaticScope;

    private readonly variables: Map<string, SyntaxObject>;

    constructor(variables: Iterable<string> | null) {
        const variableMap = new Map();
        if (variables != null) {
            for (const variable of variables) {
                variableMap.set(variable, new BuiltinConstant(variable));
            }
        }
        this.variables = new Map();
    }

    createChild(): StaticChildScope {
        return new StaticChildScope(null, this);
    }

    createChildNamespace(name: string): StaticNamespaceScope {
        return new StaticNamespaceScope(this, name);
    }

    addVariable(identifier: string, node: DefinitionNode): void {
        const variables = this.variables;
        if (variables.has(identifier)) {
            this.addError(
                new SemanticError(
                    `Variable '${identifier}' already exists in scope '${this.name}'`,
                    node,
                ),
            );
        } else {
            variables.set(identifier, {
                name: identifier,
                definition: node,
                mutable: node.type == 'def' && node.mut,
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
        this.addError(
            new SemanticError(
                `No such variable '${identifier}' in scope '${this.name}'`,
                node,
            ),
        );
    }

    abstract addError(error: SemanticError): void;
}

export class StaticRootScope extends StaticScope {
    constructor(constants: Iterable<string> | null) {
        super(constants);
    }

    public readonly errors: SemanticError[] = [];

    addError(error: SemanticError): void {
        this.errors.push(error);
    }
}

export class StaticChildScope extends StaticScope {
    public readonly parent: StaticScope;

    constructor(variables: Iterable<string> | null, parent: StaticScope) {
        super(variables);
        this.parent = parent;
    }

    addError(error: SemanticError): void {
        this.parent.addError(error);
    }
}

export class StaticNamespaceScope extends StaticChildScope {
    private readonly nsName: string;

    constructor(parent: StaticScope, nsName: string) {
        super(null, parent);
        this.nsName = nsName;
    }

    override addVariable(identifier: string, node: Ast.Definition): void {
        super.addVariable(identifier, node);
        this.parent?.addVariable(this.nsName + ':' + identifier, node);
    }
}
