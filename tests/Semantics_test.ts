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

Deno.test('グローバルスコープに存在しない変数を参照するとエラーが発生すること', () => {
    const ast = new Parser().parse('x');
    const constants = {};
    const result = new Semantics(constants).analyze(ast);
    assertEquals(result.errors.length, 1);
    assertEquals(
        result.errors[0].message,
        "No such variable 'x' in scope '<root>'",
    );
    assertRejects(() => new Interpreter(constants).exec(ast));
});

Deno.test('名前空間を使用した場合の変数チェック', () => {
    assertEquals(
        analyze(`
            :: Ns {
                let a = 1
            }
            :: Ns {
                let a = 2
            }
        `).errors.length,
        1,
    );

    assertEquals(
        analyze(`
            :: Ns {
                let a = 1
            }
            Ns:b
        `).errors.length,
        1,
    );

    assertEquals(
        analyze(`
            :: Ns1 {
                let a = 1
            }
            :: Ns2 {
                let a = 1
            }
            let a = 1
        `).errors.length,
        0,
    );

    assertEquals(
        analyze(`
            Ns:a
            :: Ns {
                let a = 1
            }
        `).errors.length,
        0,
    );
});

Deno.test('名前空間でミュータブルな値を定義するとエラー', () => {
    assertEquals(
        analyze(`
            :: Ns {
                var a = 1
            }
        `).errors.length,
        1,
    );
});

Deno.test('ブロック内のエラー', () => {
    assertEquals(analyze('eval { x }').errors.length, 1);
});

function analyze(source: string) {
    const ast = new Parser().parse(source);
    const constants = {};
    return new Semantics(constants).analyze(ast);
}
