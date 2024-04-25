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

    assertEquals(
        countErrors(`
            Ns1:Ns2:a
            :: Ns1 {
                :: Ns2 {
                    let a = 1
                }
            }
        `),
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

Deno.test('メタデータ構文', () => {
    assertEquals(
        countErrors(`
            ### {
                name: "example"
            }
        `),
        0,
    );
});

Deno.test('return文', () => {
    assertEquals(
        countErrors(`
            return 0
        `),
        0,
    );

    assertEquals(
        countErrors(`
            return x
        `),
        1,
    );
});

Deno.test('each文', () => {
    assertEquals(
        countErrors(`
            let arr = ['foo', 'bar', 'baz']
            each let v, arr {
                v
            }
        `),
        0,
    );

    assertEquals(
        countErrors(`
            each let v, arr {
                v
            }
        `),
        1,
    );

    assertEquals(
        countErrors(`
            each let v, arr {
                u
            }
        `),
        2,
    );
});

Deno.test('for文', () => {
    assertEquals(
        countErrors(`
            for 2 {
                'foo'
            }
        `),
        0,
    );

    assertEquals(
        countErrors(`
            for a {
                'foo'
            }
        `),
        1,
    );

    assertEquals(
        countErrors(`
            for a {
                b
            }
        `),
        2,
    );

    assertEquals(
        countErrors(`
            for let a, 5 {
                a
            }
        `),
        0,
    );

    assertEquals(
        countErrors(`
            for let a, 5 {
                b
            }
        `),
        1,
    );
});

Deno.test('loop文', () => {
    assertEquals(
        countErrors(`
            loop {
                1
            }
        `),
        0,
    );

    assertEquals(
        countErrors(`
            loop {
                a
            }
        `),
        1,
    );
});

Deno.test('break文', () => {
    assertEquals(countErrors('break'), 0);
});

Deno.test('continue文', () => {
    assertEquals(countErrors('continue'), 0);
});

Deno.test('代入文', () => {
    assertEquals(
        countErrors(`
            var a = 0
            a = 1
            a += 1
            a -= 1
        `),
        0,
    );

    assertEquals(
        countErrors(`
            let a = 0
            a = 1
        `),
        1,
    );

    assertEquals(
        countErrors(`
            let a = [0]
            a[0] = 1

            let b = {}
            b.a = 1

            var c = null
            [c] = [0]

            var d = null
            { a: d } = { a: 1 }
        `),
        0,
    );

    assertEquals(countErrors('1 = 1'), 1);
});

Deno.test('論理演算子', () => {
    assertEquals(countErrors('!false'), 0);
    assertEquals(countErrors('!a'), 1);

    assertEquals(countErrors('false && false'), 0);
    assertEquals(countErrors('a && b'), 2);

    assertEquals(countErrors('false || false'), 0);
    assertEquals(countErrors('a || b'), 2);
});

Deno.test('if式', () => {
    assertEquals(
        countErrors(`
            if a {
                b
            } elif c {
                d
            } else {
                e
            }
        `),
        5,
    );
});

Deno.test('関数式', () => {
    assertEquals(countErrors('@(a) { a }'), 0);
    assertEquals(countErrors('@() { a }'), 1);
});

Deno.test('match式', () => {
    assertEquals(
        countErrors(`
            match 1 {
                1 => 'yes'
                0 => 'no'
                * => 'other'
            }
        `),
        0,
    );

    assertEquals(
        countErrors(`
            match x {
                a => b
            }
        `),
        3,
    );
});

Deno.test('exists式', () => {
    assertEquals(countErrors('exists a'), 0);
});

Deno.test('リテラル式', () => {
    assertEquals(countErrors('`No.{1}`'), 0);
    assertEquals(countErrors('`No.{a}`'), 1);

    assertEquals(countErrors('"Hello, world!"'), 0);

    assertEquals(countErrors('1'), 0);

    assertEquals(countErrors('null'), 0);

    assertEquals(countErrors('[]'), 0);
    assertEquals(countErrors('[a]'), 1);

    assertEquals(countErrors('{}'), 0);
    assertEquals(countErrors('{a: a}'), 1);
});

Deno.test('関数呼び出し', () => {
    assertEquals(
        countErrors(`
            @f() { 42 }
            f()
        `),
        0,
    );

    assertEquals(countErrors('f()'), 1);
});

function analyze(source: string) {
    const ast = new Parser().parse(source);
    const constants = {};
    return new Semantics(constants).analyze(ast);
}

function countErrors(source: string) {
    return analyze(source).errors.length;
}
