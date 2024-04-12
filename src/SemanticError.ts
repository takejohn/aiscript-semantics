import type { Ast } from '@syuilo/aiscript';

export class SemanticError {
    public readonly message: string;

    public readonly node: Ast.Node;

    constructor(message: string, node: Ast.Node) {
        this.message = message;
        this.node = node;
    }
}
