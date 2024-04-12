import type { values } from '@syuilo/aiscript';
import type { Ast } from '@syuilo/aiscript';

export class Semantics {
    private readonly constants: Record<string, values.Value>;

    constructor(constants: Record<string, values.Value>) {
        this.constants = constants;
    }

    analyze(ast: Ast.Node[]): AnalysisResult {
        return { ast };
    }
}

interface AnalysisResult {
    ast: Ast.Node[];
}
