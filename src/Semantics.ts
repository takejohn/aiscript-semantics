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
        const analyzedAst = ast.map((node) => analyze(scope, node));
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
