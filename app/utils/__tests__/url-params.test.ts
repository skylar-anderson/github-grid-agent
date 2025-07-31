import { getUrlParam, setUrlParam } from '../url-params';

// Mock window object
const mockWindow = {
  location: {
    search: '?param1=value1&param2=value2&empty=',
    href: 'https://example.com/page?param1=value1&param2=value2'
  },
  history: {
    pushState: jest.fn()
  }
};

describe('URL Params utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window mock
    Object.defineProperty(window, 'location', {
      value: { ...mockWindow.location },
      writable: true
    });
    Object.defineProperty(window, 'history', {
      value: { ...mockWindow.history },
      writable: true
    });
  });

  describe('getUrlParam', () => {
    it('returns parameter value when it exists', () => {
      expect(getUrlParam('param1')).toBe('value1');
      expect(getUrlParam('param2')).toBe('value2');
    });

    it('returns null when parameter does not exist', () => {
      expect(getUrlParam('nonexistent')).toBe(null);
    });

    it('returns empty string when parameter exists but has no value', () => {
      expect(getUrlParam('empty')).toBe('');
    });

    it('returns null when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      expect(getUrlParam('param1')).toBe(null);
      
      global.window = originalWindow;
    });

    it('handles URL-encoded parameters', () => {
      Object.defineProperty(window, 'location', {
        value: { search: '?name=John%20Doe&special=%21%40%23' },
        writable: true
      });
      
      expect(getUrlParam('name')).toBe('John Doe');
      expect(getUrlParam('special')).toBe('!@#');
    });
  });

  describe('setUrlParam', () => {
    beforeEach(() => {
      mockWindow.history.pushState.mockClear();
    });

    it('sets a new parameter', () => {
      setUrlParam('newParam', 'newValue');
      
      const call = mockWindow.history.pushState.mock.calls[0];
      const newUrl = String(call[2]);
      expect(newUrl).toMatch(/newParam=newValue/);
    });

    it('updates an existing parameter', () => {
      setUrlParam('param1', 'updatedValue');
      
      const call = mockWindow.history.pushState.mock.calls[0];
      const newUrl = String(call[2]);
      expect(newUrl).toMatch(/param1=updatedValue/);
    });

    it('handles special characters in values', () => {
      setUrlParam('special', 'hello world!@#');
      
      const call = mockWindow.history.pushState.mock.calls[0];
      const newUrl = String(call[2]);
      // URL encoding can vary, so just check that the parameter is there
      expect(newUrl).toMatch(/special=/);
      expect(newUrl).toMatch(/hello/);
      expect(newUrl).toMatch(/world/);
    });

    it('does nothing when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      expect(() => setUrlParam('param', 'value')).not.toThrow();
      
      global.window = originalWindow;
    });

    it('preserves existing parameters when adding new ones', () => {
      setUrlParam('newParam', 'newValue');
      
      const call = mockWindow.history.pushState.mock.calls[0];
      const newUrl = String(call[2]);
      
      // Check that all parameters are present in the URL
      expect(newUrl).toMatch(/param1=value1/);
      expect(newUrl).toMatch(/param2=value2/);
      expect(newUrl).toMatch(/newParam=newValue/);
    });
  });
});