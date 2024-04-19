import type { Ast } from '@syuilo/aiscript';

export type SyntaxObject = Variable;

export interface Variable {
    name: string;

    /**
     * この変数が定義されたノード。
     * ビルトイン定数の場合は null。
     */
    definition: Ast.Fn | Ast.Definition | null;
}

export class BuiltinConstant implements Variable {
    name: string;

    definition: null;

    constructor(name: string) {
        this.name = name;
        this.definition = null;
    }
}
