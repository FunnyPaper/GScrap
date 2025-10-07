import { greet } from '../src/greet';

test("greet function should greet user with Hello", () => {
    const helloStr = greet('Lam');

    expect(helloStr).toBe('Hello Lam');
})