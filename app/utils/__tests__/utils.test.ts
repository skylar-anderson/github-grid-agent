import { pluralize } from '../pluralize';
import { capitalize } from '../capitalize';

describe('Utility functions', () => {
  describe('pluralize', () => {
    it('handles regular plurals', () => {
      expect(pluralize('cat')).toBe('cats');
      expect(pluralize('dog')).toBe('dogs');
    });

    it('adds "es" for s, sh, ch, x, z endings', () => {
      expect(pluralize('bus')).toBe('buses');
      expect(pluralize('box')).toBe('boxes');
      expect(pluralize('church')).toBe('churches');
    });

    it('replaces y with ies when appropriate', () => {
      expect(pluralize('country')).toBe('countries');
      expect(pluralize('city')).toBe('cities');
      // Should not replace when preceded by a vowel
      expect(pluralize('day')).toBe('days');
    });
  });

  describe('capitalize', () => {
    it('capitalizes the first character of a string', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('returns the same string when already capitalized', () => {
      expect(capitalize('World')).toBe('World');
    });

    it('handles empty strings gracefully', () => {
      expect(capitalize('')).toBe('');
    });
  });
});