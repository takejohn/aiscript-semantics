import type { values } from '@syuilo/aiscript';
import type { Ast } from '@syuilo/aiscript';
import { SemanticError } from './SemanticError.ts';

export class Semantics {
    private readonly constants: Map<string, values.Value>;

    constructor(constants: Record<string, values.Value>) {
        this.constants = new Map(Object.entries(constants));
    }

    analyze(ast: Ast.Node[]): AnalysisResult {
        const variables = new Set<string>(this.constants.keys());
        const errors: SemanticError[] = [];
        for (const node of ast) {
            switch (node.type) {
                case 'def':
                    if (variables.has(node.name)) {
                        errors.push(
                            new SemanticError(
                                `Variable '${node.name}' is already defined`,
                                node,
                            ),
                        );
                    }
                    variables.add(node.name);
                    break;
            }
        }
        return { ast, errors };
    }
}

interface AnalysisResult {
    ast: Ast.Node[];
    errors: SemanticError[];
}
