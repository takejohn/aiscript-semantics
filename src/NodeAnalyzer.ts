import type { Ast } from '@syuilo/aiscript';
import type { StaticScope } from './StaticScope.ts';
import { SemanticError } from './SemanticError.ts';

export type NodeType = Ast.Node['type'];

export type NodeOfType<T extends NodeType> = Ast.Node & { type: T };

export type NodeAnalyzer = {
    [T in NodeType]: (scope: StaticScope, node: NodeOfType<T>) => NodeOfType<T>;
};

export function analyze<T extends NodeType>(
    scope: StaticScope,
    node: NodeOfType<T>,
): NodeOfType<T> {
    return NodeAnalyzer[node.type](scope, node);
}

export const NodeAnalyzer: NodeAnalyzer = new class implements NodeAnalyzer {
    ns(scope: StaticScope, node: Ast.Namespace): Ast.Namespace {
        visitNamespace(scope, node);
        return node;
    }

    meta(scope: StaticScope, node: Ast.Meta): Ast.Meta {
        // TODO
        return node;
    }

    def(scope: StaticScope, node: Ast.Definition): Ast.Definition {
        scope.addVariable(node.name, node);
        return node;
    }

    return(scope: StaticScope, node: Ast.Return): Ast.Return {
        // TODO
        return node;
    }

    each(scope: StaticScope, node: Ast.Each): Ast.Each {
        // TODO
        return node;
    }

    for(scope: StaticScope, node: Ast.For): Ast.For {
        // TODO
        return node;
    }

    loop(scope: StaticScope, node: Ast.Loop): Ast.Loop {
        // TODO
        return node;
    }

    break(scope: StaticScope, node: Ast.Break): Ast.Break {
        // TODO
        return node;
    }

    continue(scope: StaticScope, node: Ast.Continue): Ast.Continue {
        // TODO
        return node;
    }

    addAssign(scope: StaticScope, node: Ast.AddAssign): Ast.AddAssign {
        // TODO
        return node;
    }

    subAssign(scope: StaticScope, node: Ast.SubAssign): Ast.SubAssign {
        // TODO
        return node;
    }

    assign(scope: StaticScope, node: Ast.Assign): Ast.Assign {
        // TODO
        return node;
    }

    not(scope: StaticScope, node: Ast.Not): Ast.Not {
        // TODO
        return node;
    }

    and(scope: StaticScope, node: Ast.And): Ast.And {
        // TODO
        return node;
    }

    or(scope: StaticScope, node: Ast.Or): Ast.Or {
        // TODO
        return node;
    }

    if(scope: StaticScope, node: Ast.If): Ast.If {
        // TODO
        return node;
    }

    fn(scope: StaticScope, node: Ast.Fn): Ast.Fn {
        // TODO
        return node;
    }

    match(scope: StaticScope, node: Ast.Match): Ast.Match {
        // TODO
        return node;
    }

    block(scope: StaticScope, node: Ast.Block): Ast.Block {
        // TODO
        return node;
    }

    exists(scope: StaticScope, node: Ast.Exists): Ast.Exists {
        // TODO
        return node;
    }

    tmpl(scope: StaticScope, node: Ast.Tmpl): Ast.Tmpl {
        // TODO
        return node;
    }

    str(scope: StaticScope, node: Ast.Str): Ast.Str {
        // TODO
        return node;
    }

    num(scope: StaticScope, node: Ast.Num): Ast.Num {
        // TODO
        return node;
    }

    bool(scope: StaticScope, node: Ast.Bool): Ast.Bool {
        // TODO
        return node;
    }

    null(scope: StaticScope, node: Ast.Null): Ast.Null {
        // TODO
        return node;
    }

    obj(scope: StaticScope, node: Ast.Obj): Ast.Obj {
        // TODO
        return node;
    }

    arr(scope: StaticScope, node: Ast.Arr): Ast.Arr {
        // TODO
        return node;
    }

    identifier(scope: StaticScope, node: Ast.Identifier): Ast.Identifier {
        scope.findVariable(node.name, node);
        return node;
    }

    call(scope: StaticScope, node: Ast.Call): Ast.Call {
        // TODO
        return node;
    }

    index(scope: StaticScope, node: Ast.Index): Ast.Index {
        // TODO
        return node;
    }

    prop(scope: StaticScope, node: Ast.Prop): Ast.Prop {
        // TODO
        return node;
    }

    namedTypeSource(
        scope: StaticScope,
        node: Ast.NamedTypeSource,
    ): Ast.NamedTypeSource {
        // TODO
        return node;
    }

    fnTypeSource(scope: StaticScope, node: Ast.FnTypeSource): Ast.FnTypeSource {
        // TODO
        return node;
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
