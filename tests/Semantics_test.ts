import { assertEquals, assertRejects } from '@std/assert';
import { Interpreter, Parser } from '@syuilo/aiscript';
import { Semantics } from '../src/Semantics.ts';

const source = `
let x = true
let x = 42
`;

Deno.test('グローバルスコープで同名の変数を定義するとエラーが発生すること', () => {
    const ast = new Parser().parse(source);
    const constants = {};
    const result = new Semantics(constants).analyze(ast);
    assertEquals(result.errors.length, 1);
    assertEquals(
        result.errors[0].message,
        "Variable 'x' already exists in scope '<root>'",
    );
    assertRejects(() => new Interpreter(constants).exec(ast));
});
