import type { values } from '@syuilo/aiscript';
import type { Ast } from '@syuilo/aiscript';
import type { SemanticError } from './SemanticError.ts';
import { StaticScope } from './StaticScope.ts';
import { analyze } from './NodeAnalyzer.ts';

export class Semantics {
    private readonly constants: Map<string, values.Value>;

    constructor(constants: Record<string, values.Value>) {
        this.constants = new Map(Object.entries(constants));
    }

    analyze(ast: Ast.Node[]): AnalysisResult {
        const scope = new StaticScope(this.constants.keys());
        for (const node of ast) {
            if (node.type == 'ns') {
                analyze(scope, node);
            }
        }
        const analyzedAst = ast.map((node) => {
            if (node.type == 'ns') {
                return node;
            } else {
                return analyze(scope, node);
            }
        });
        return {
            ast: analyzedAst,
            errors: scope.errors,
        };
    }
}

interface AnalysisResult {
    ast: Ast.Node[];
    errors: SemanticError[];
}
