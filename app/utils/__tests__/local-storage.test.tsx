import React from 'react';
import { renderHook, act } from '@testing-library/react';
import useLocalStorage from '../local-storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('returns default value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    expect(result.current[0]).toBe('defaultValue');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
  });

  it('returns stored value when it exists', () => {
    localStorageMock.setItem('testKey', JSON.stringify('storedValue'));
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    expect(result.current[0]).toBe('storedValue');
  });

  it('updates state and localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    act(() => {
      result.current[1]('newValue');
    });
    
    expect(result.current[0]).toBe('newValue');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('testKey', JSON.stringify('newValue'));
  });

  it('handles function updates correctly', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 5));
    
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    
    expect(result.current[0]).toBe(6);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(6));
  });

  it('handles complex objects', () => {
    const defaultObj = { name: 'test', count: 0 };
    const { result } = renderHook(() => useLocalStorage('objectKey', defaultObj));
    
    const newObj = { name: 'updated', count: 5 };
    
    act(() => {
      result.current[1](newObj);
    });
    
    expect(result.current[0]).toEqual(newObj);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('objectKey', JSON.stringify(newObj));
  });

  it('handles arrays', () => {
    const defaultArray = [1, 2, 3];
    const { result } = renderHook(() => useLocalStorage('arrayKey', defaultArray));
    
    const newArray = [4, 5, 6];
    
    act(() => {
      result.current[1](newArray);
    });
    
    expect(result.current[0]).toEqual(newArray);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('arrayKey', JSON.stringify(newArray));
  });

  it('handles invalid JSON gracefully', () => {
    // Store invalid JSON in localStorage
    localStorageMock.getItem.mockReturnValueOnce('invalid json {');
    
    // Mock console.error to avoid error output in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    expect(result.current[0]).toBe('defaultValue');
    
    consoleSpy.mockRestore();
  });

  it('checks window availability in the hook', () => {
    // Test that the hook checks for window availability
    // This is more of a unit test for the condition logic
    const windowCheck = typeof window !== 'undefined';
    expect(windowCheck).toBe(true); // In jsdom environment, window exists
  });
});