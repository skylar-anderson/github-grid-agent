export function pluralize(word: string): string {
  if (
    word.endsWith('y') &&
    !word.endsWith('ay') &&
    !word.endsWith('ey') &&
    !word.endsWith('oy') &&
    !word.endsWith('uy')
  ) {
    return word.slice(0, -1) + 'ies';
  } else if (
    word.endsWith('s') ||
    word.endsWith('sh') ||
    word.endsWith('ch') ||
    word.endsWith('x') ||
    word.endsWith('z')
  ) {
    return word + 'es';
  } else {
    return word + 's';
  }
}
