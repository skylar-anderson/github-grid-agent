import { pluralize } from '../pluralize';

describe('pluralize', () => {
  describe('regular words (add s)', () => {
    it('pluralizes regular words by adding s', () => {
      expect(pluralize('cat')).toBe('cats');
      expect(pluralize('dog')).toBe('dogs');
      expect(pluralize('house')).toBe('houses');
      expect(pluralize('car')).toBe('cars');
    });
  });

  describe('words ending in y (change to ies)', () => {
    it('changes y to ies for words ending in consonant + y', () => {
      expect(pluralize('city')).toBe('cities');
      expect(pluralize('baby')).toBe('babies');
      expect(pluralize('story')).toBe('stories');
      expect(pluralize('family')).toBe('families');
    });

    it('preserves y and adds s for words ending in vowel + y', () => {
      expect(pluralize('day')).toBe('days');
      expect(pluralize('key')).toBe('keys');
      expect(pluralize('boy')).toBe('boys');
      expect(pluralize('guy')).toBe('guys');
      expect(pluralize('way')).toBe('ways');
    });
  });

  describe('words ending in s, sh, ch, x, z (add es)', () => {
    it('adds es to words ending in s', () => {
      expect(pluralize('glass')).toBe('glasses');
      expect(pluralize('class')).toBe('classes');
      expect(pluralize('bus')).toBe('buses');
    });

    it('adds es to words ending in sh', () => {
      expect(pluralize('dish')).toBe('dishes');
      expect(pluralize('brush')).toBe('brushes');
      expect(pluralize('flash')).toBe('flashes');
    });

    it('adds es to words ending in ch', () => {
      expect(pluralize('watch')).toBe('watches');
      expect(pluralize('church')).toBe('churches');
      expect(pluralize('match')).toBe('matches');
    });

    it('adds es to words ending in x', () => {
      expect(pluralize('box')).toBe('boxes');
      expect(pluralize('fox')).toBe('foxes');
      expect(pluralize('tax')).toBe('taxes');
    });

    it('adds es to words ending in z', () => {
      expect(pluralize('quiz')).toBe('quizes');
      expect(pluralize('buzz')).toBe('buzzes');
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(pluralize('')).toBe('s');
    });

    it('handles single character words', () => {
      expect(pluralize('a')).toBe('as');
      expect(pluralize('I')).toBe('Is');
    });

    it('handles words with mixed case', () => {
      expect(pluralize('City')).toBe('Cities');
      expect(pluralize('STORY')).toBe('STORYs');
    });
  });
});