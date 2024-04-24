import type { Ast } from '@syuilo/aiscript';
import type { StaticScope } from './StaticScope.ts';
import { SemanticError } from './SemanticError.ts';

export type NodeType = Ast.Node['type'];

export type NodeOfType<T extends NodeType> = Ast.Node & { type: T };

export type NodeAnalyzer = {
    [T in NodeType]: (scope: StaticScope, node: NodeOfType<T>) => void;
};

export function analyze<T extends NodeType>(
    scope: StaticScope,
    node: NodeOfType<T>,
): void {
    NodeAnalyzer[node.type](scope, node);
}

export const NodeAnalyzer: NodeAnalyzer = new class implements NodeAnalyzer {
    ns(scope: StaticScope, node: Ast.Namespace): void {
        visitNamespace(scope, node);
    }

    meta(scope: StaticScope, node: Ast.Meta): void {
        // TODO
    }

    def(scope: StaticScope, node: Ast.Definition): void {
        scope.addVariable(node.name, node);
    }

    return(scope: StaticScope, node: Ast.Return): void {
        // TODO
    }

    each(scope: StaticScope, node: Ast.Each): void {
        // TODO
    }

    for(scope: StaticScope, node: Ast.For): void {
        // TODO
    }

    loop(scope: StaticScope, node: Ast.Loop): void {
        // TODO
    }

    break(scope: StaticScope, node: Ast.Break): void {
        // TODO
    }

    continue(scope: StaticScope, node: Ast.Continue): void {
        // TODO
    }

    addAssign(scope: StaticScope, node: Ast.AddAssign): void {
        // TODO
    }

    subAssign(scope: StaticScope, node: Ast.SubAssign): void {
        // TODO
    }

    assign(scope: StaticScope, node: Ast.Assign): void {
        // TODO
    }

    not(scope: StaticScope, node: Ast.Not): void {
        // TODO
    }

    and(scope: StaticScope, node: Ast.And): void {
        // TODO
    }

    or(scope: StaticScope, node: Ast.Or): void {
        // TODO
    }

    if(scope: StaticScope, node: Ast.If): void {
        // TODO
    }

    fn(scope: StaticScope, node: Ast.Fn): void {
        // TODO
    }

    match(scope: StaticScope, node: Ast.Match): void {
        // TODO
    }

    block(scope: StaticScope, node: Ast.Block): void {
        for (const statement of node.statements) {
            analyze(scope, statement);
        }
    }

    exists(scope: StaticScope, node: Ast.Exists): void {
        // TODO
    }

    tmpl(scope: StaticScope, node: Ast.Tmpl): void {
        // TODO
    }

    str(scope: StaticScope, node: Ast.Str): void {
        // TODO
    }

    num(scope: StaticScope, node: Ast.Num): void {
        // TODO
    }

    bool(scope: StaticScope, node: Ast.Bool): void {
        // TODO
    }

    null(scope: StaticScope, node: Ast.Null): void {
        // TODO
    }

    obj(scope: StaticScope, node: Ast.Obj): void {
        // TODO
    }

    arr(scope: StaticScope, node: Ast.Arr): void {
        // TODO
    }

    identifier(scope: StaticScope, node: Ast.Identifier): void {
        scope.findVariable(node.name, node);
    }

    call(scope: StaticScope, node: Ast.Call): void {
        // TODO
    }

    index(scope: StaticScope, node: Ast.Index): void {
        // TODO
    }

    prop(scope: StaticScope, node: Ast.Prop): void {
        // TODO
    }

    namedTypeSource(
        scope: StaticScope,
        node: Ast.NamedTypeSource,
    ): void {
        // TODO
    }

    fnTypeSource(scope: StaticScope, node: Ast.FnTypeSource): void {
        // TODO
    }
}();

function visitNamespace(scope: StaticScope, node: Ast.Namespace) {
    const nsScope = scope.createChildNamespace(node.name);

    for (const member of node.members) {
        if (member.type == 'ns') {
            visitNamespace(nsScope, member);
        }
    }

    for (const member of node.members) {
        if (member.type == 'def') {
            if (member.mut) {
                nsScope.addError(
                    new SemanticError(
                        `Namespaces cannot include mutable variable: ${member.name}`,
                        member,
                    ),
                );
            }
            nsScope.addVariable(member.name, member);
        }
    }
}
