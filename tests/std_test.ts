import { assertEquals } from '@std/assert';
import { countErrors } from './testUtils_test.ts';

Deno.test('標準関数', () => {
    assertEquals(countErrors('<: "Hello, world!"'), 0);
    assertEquals(countErrors('1 + 1'), 0);
    assertEquals(countErrors('1 - 1'), 0);
    assertEquals(countErrors('1 * 1'), 0);
    assertEquals(countErrors('1 / 1'), 0);
    assertEquals(countErrors('1 == 1'), 0);
    assertEquals(countErrors('1 < 1'), 0);
    assertEquals(countErrors('1 > 1'), 0);
});
