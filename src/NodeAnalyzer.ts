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

export function analyzeEach(scope: StaticScope, nodes: Ast.Node[]): void {
    for (const node of nodes) {
        analyze(scope, node);
    }
}

export const NodeAnalyzer: NodeAnalyzer = new class implements NodeAnalyzer {
    ns(scope: StaticScope, node: Ast.Namespace): void {
        visitNamespace(scope, node);
    }

    meta(scope: StaticScope, node: Ast.Meta): void {
        analyze(scope, node.value);
    }

    def(scope: StaticScope, node: Ast.Definition): void {
        scope.addVariable(node.name, node);
    }

    return(scope: StaticScope, node: Ast.Return): void {
        analyze(scope, node.expr);
    }

    each(scope: StaticScope, node: Ast.Each): void {
        analyze(scope, node.items);
        const innerScope = scope.createChild();
        innerScope.addVariable(node.var, node);
        analyze(innerScope, node.for);
    }

    for(scope: StaticScope, node: Ast.For): void {
        const innerScope = scope.createChild();
        if (node.times) {
            analyze(scope, node.times);
        } else {
            analyze(scope, node.from!);
            analyze(scope, node.to!);
            innerScope.addVariable(node.var!, node);
        }
        analyze(innerScope, node.for);
    }

    loop(scope: StaticScope, node: Ast.Loop): void {
        analyzeEach(scope.createChild(), node.statements);
    }

    break(): void {
        // ignore
    }

    continue(): void {
        // ignore
    }

    addAssign(scope: StaticScope, node: Ast.AddAssign): void {
        analyzeAssignmentDestination(scope, node.dest);
        analyze(scope, node.expr);
    }

    subAssign(scope: StaticScope, node: Ast.SubAssign): void {
        analyzeAssignmentDestination(scope, node.dest);
        analyze(scope, node.expr);
    }

    assign(scope: StaticScope, node: Ast.Assign): void {
        analyzeAssignmentDestination(scope, node.dest);
        analyze(scope, node.expr);
    }

    not(scope: StaticScope, node: Ast.Not): void {
        analyze(scope, node.expr);
    }

    and(scope: StaticScope, node: Ast.And): void {
        analyze(scope, node.left);
        analyze(scope, node.right);
    }

    or(scope: StaticScope, node: Ast.Or): void {
        analyze(scope, node.left);
        analyze(scope, node.right);
    }

    if(scope: StaticScope, node: Ast.If): void {
        analyze(scope, node.cond);
        analyze(scope.createChild(), node.then);
        for (const { cond, then } of node.elseif) {
            analyze(scope, cond);
            analyze(scope.createChild(), then);
        }
        if (node.else != null) {
            analyze(scope.createChild(), node.else);
        }
    }

    fn(scope: StaticScope, node: Ast.Fn): void {
        const innerScope = scope.createChild();
        for (const arg of node.args) {
            innerScope.addVariable(arg.name, node);
        }
        analyzeEach(innerScope, node.children);
    }

    match(scope: StaticScope, node: Ast.Match): void {
        analyze(scope, node.about);
        const innerScope = scope.createChild();
        for (const qa of node.qs) {
            analyze(innerScope, qa.q);
            analyze(innerScope, qa.a);
        }
    }

    block(scope: StaticScope, node: Ast.Block): void {
        for (const statement of node.statements) {
            analyze(scope, statement);
        }
    }

    exists(): void {
        // ignore
    }

    tmpl(scope: StaticScope, node: Ast.Tmpl): void {
        for (const expr of node.tmpl) {
            if (typeof expr != 'string') {
                analyze(scope, expr);
            }
        }
    }

    str(): void {
        // ignore
    }

    num(): void {
        // ignore
    }

    bool(): void {
        // ignore
    }

    null(): void {
        // ignore
    }

    obj(scope: StaticScope, node: Ast.Obj): void {
        for (const value of node.value.values()) {
            analyze(scope, value);
        }
    }

    arr(scope: StaticScope, node: Ast.Arr): void {
        analyzeEach(scope, node.value);
    }

    identifier(scope: StaticScope, node: Ast.Identifier): void {
        scope.findVariable(node.name, node);
    }

    call(scope: StaticScope, node: Ast.Call): void {
        analyze(scope, node.target);
        analyzeEach(scope, node.args);
    }

    index(scope: StaticScope, node: Ast.Index): void {
        analyze(scope, node.target);
        analyze(scope, node.index);
    }

    prop(scope: StaticScope, node: Ast.Prop): void {
        analyze(scope, node.target);
    }

    namedTypeSource(): void {
        throw new Error('invalid node type');
    }

    fnTypeSource(): void {
        throw new Error('invalid node type');
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

function analyzeAssignmentDestination(
    scope: StaticScope,
    node: Ast.Node,
): void {
    switch (node.type) {
        case 'identifier': {
            const name = node.name;
            const definition = scope.findVariable(name, node);
            if (definition != null && !definition.mutable) {
                scope.addError(
                    new SemanticError(
                        `Cannot assign to an immutable variable ${name}.`,
                        node,
                    ),
                );
            }
            break;
        }
        case 'index':
        case 'prop':
        case 'arr':
        case 'obj':
            analyze(scope, node);
            break;
        default:
            scope.addError(
                new SemanticError(
                    'The left-hand side of an assignment expression must be a variable or a property/index access.',
                    node,
                ),
            );
    }
}
