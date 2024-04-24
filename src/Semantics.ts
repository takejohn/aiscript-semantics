import type { values } from '@syuilo/aiscript';
import type { Ast } from '@syuilo/aiscript';
import type { SemanticError } from './SemanticError.ts';
import { StaticRootScope } from './StaticScope.ts';
import { analyze } from './NodeAnalyzer.ts';

export class Semantics {
    private readonly constants: Map<string, values.Value>;

    constructor(constants: Record<string, values.Value>) {
        this.constants = new Map(Object.entries(constants));
    }

    analyze(ast: Ast.Node[]): AnalysisResult {
        const scope = new StaticRootScope(this.constants.keys());
        const exceptNamespaces: Exclude<Ast.Node, Ast.Namespace>[] = [];
        for (const node of ast) {
            if (node.type == 'ns') {
                analyze(scope, node);
            } else {
                exceptNamespaces.push(node);
            }
        }
        for (const node of exceptNamespaces) {
            analyze(scope, node);
        }
        return {
            errors: scope.errors,
        };
    }
}

interface AnalysisResult {
    errors: SemanticError[];
}
