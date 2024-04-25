import type { Ast } from '@syuilo/aiscript';

export type SyntaxObject = Variable;

export type DefinitionNode = Ast.Definition | Ast.Each | Ast.For | Ast.Fn;

export interface Variable {
    name: string;

    /**
     * この変数が定義されたノード。
     * ビルトイン定数の場合は null。
     */
    definition: DefinitionNode | null;

    mutable: boolean;
}

export class BuiltinConstant implements Variable {
    name: string;

    definition: null;

    mutable = false;

    constructor(name: string) {
        this.name = name;
        this.definition = null;
    }
}
