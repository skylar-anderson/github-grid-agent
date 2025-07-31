import { capitalize } from '../capitalize';

describe('capitalize', () => {
  it('capitalizes the first letter of a regular word', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
    expect(capitalize('test')).toBe('Test');
  });

  it('handles already capitalized words', () => {
    expect(capitalize('Hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('WORLD');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('handles single character strings', () => {
    expect(capitalize('a')).toBe('A');
    expect(capitalize('A')).toBe('A');
    expect(capitalize('1')).toBe('1');
    expect(capitalize(' ')).toBe(' ');
  });

  it('handles strings with special characters', () => {
    expect(capitalize('hello-world')).toBe('Hello-world');
    expect(capitalize('test_case')).toBe('Test_case');
    expect(capitalize('123abc')).toBe('123abc');
  });

  it('handles strings with leading spaces', () => {
    expect(capitalize(' hello')).toBe(' hello');
    expect(capitalize('  test')).toBe('  test');
  });

  it('handles non-alphabetic first characters', () => {
    expect(capitalize('123hello')).toBe('123hello');
    expect(capitalize('!important')).toBe('!important');
    expect(capitalize('@username')).toBe('@username');
  });
});