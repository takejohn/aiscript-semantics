import { Parser } from '@syuilo/aiscript';
import { Semantics } from '../mod.ts';

export function analyze(source: string) {
    const ast = new Parser().parse(source);
    const constants = {};
    return new Semantics(constants).analyze(ast);
}

export function countErrors(source: string) {
    return analyze(source).errors.length;
}
