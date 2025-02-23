import {
  findScore,
  flatten,
  isObject,
  mockClass,
  noop,
  prettify,
  removeFormatting,
  romanNumeral,
  unflatten,
} from '../src';

describe('findScore', () => {
  const scores = [{ req: 0 }, { req: 10 }, { req: 20 }, { req: 30 }];

  it('finds the correct score', () => {
    expect(findScore(scores, 25)).toMatchObject({ req: 20 });
    expect(findScore(scores, 35)).toMatchObject({ req: 30 });
    expect(findScore(scores, 0)).toMatchObject({ req: 0 });
  });
});

describe('isNull', () => {
  it('returns null', () => {
    expect(noop).toBeInstanceOf(Function);

    const test = noop();
    expect(test).toBeNull();
  });
});

describe('isObject', () => {
  it('returns true for objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('returns false for arrays', () => {
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
  });

  it('returns false for other types', () => {
    expect(isObject(undefined)).toBe(false);
    expect(isObject(1)).toBe(false);
    expect(isObject('hello')).toBe(false);
  });
});

describe('romanNumeral', () => {
  it('should give the correct roman numeral', () => {
    expect(romanNumeral(-1)).toBe('I');
    expect(romanNumeral(1)).toBe('I');
    expect(romanNumeral(4)).toBe('IV');
    expect(romanNumeral(5)).toBe('V');
    expect(romanNumeral(6)).toBe('VI');
    expect(romanNumeral(50)).toBe('L');
    expect(romanNumeral(100)).toBe('C');
    expect(romanNumeral(99999)).toBe(
      'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMCMXCIX'
    );
  });
});

describe('prettify', () => {
  it('should format the string in a nice way', () => {
    expect(prettify('normal')).toBe('Normal');
    expect(prettify('two words')).toBe('Two Words');
    expect(prettify('snake_case')).toBe('Snake Case');
    expect(prettify('double__snake__case')).toBe('Double  Snake  Case');
    expect(prettify('switchy_Snake_Case')).toBe('Switchy Snake Case');
    expect(prettify('CAPS_SNAKE_CASE')).toBe('Caps Snake Case');
    expect(prettify('camelCase')).toBe('Camel Case');
    expect(prettify('Pascal Case')).toBe('Pascal Case');
    expect(prettify('sTuDlY cAPs')).toBe('Studly Caps');
  });
});

describe('removeFormatting', () => {
  it('should remove formatting', () => {
    expect(removeFormatting('§ahello§r world')).toBe('hello world');
    expect(removeFormatting('hello world')).toBe('hello world');
  });
});

describe('flatten', () => {
  it('should flatten objects', () => {
    expect(flatten({ a: 1 })).toMatchObject({ a: 1 });
    expect(flatten({ a: { b: { c: 1 } } })).toMatchObject({ 'a.b.c': 1 });
    expect(flatten({ a: { b: { c: 1, d: 2 } } })).toMatchObject({ 'a.b.c': 1, 'a.b.d': 2 });
    expect(flatten({ a: [{ b: { c: 1 } }] })).toMatchObject({ a: [{ b: { c: 1 } }] });
  });
});

describe('unflatten', () => {
  it('should unflatten objects', () => {
    expect(unflatten({ a: 1 })).toMatchObject({ a: 1 });
    expect(unflatten({ 'a.b.c': 1 })).toMatchObject({ a: { b: { c: 1 } } });
    expect(unflatten({ 'a.b.c': 1, 'a.b.d': 2 })).toMatchObject({ a: { b: { c: 1, d: 2 } } });
    expect(unflatten({ a: [{ b: { c: 1 } }] })).toMatchObject({ a: [{ b: { c: 1 } }] });
  });
});

describe('mockClass', () => {
  it("should create instances of classes that don't rely on methods of parameters", () => {
    class Test {
      public constructor(public a: string) {
        a[0];
      }
    }

    const mock = mockClass(Test);

    expect(mock).toBeInstanceOf(Test);
  });
});
