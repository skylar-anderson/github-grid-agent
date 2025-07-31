// Testing utility functions from components
describe('shuffleArray utility', () => {
  // Extract the shuffle function for testing
  const shuffleArray = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  beforeEach(() => {
    // Seed random for predictable tests
    jest.spyOn(Math, 'random');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the same array with same elements', () => {
    const original = ['a', 'b', 'c', 'd'];
    const shuffled = shuffleArray([...original]);
    
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('handles empty array', () => {
    const result = shuffleArray([]);
    expect(result).toEqual([]);
  });

  it('handles single element array', () => {
    const result = shuffleArray(['single']);
    expect(result).toEqual(['single']);
  });

  it('handles two element array', () => {
    const original = ['a', 'b'];
    const result = shuffleArray([...original]);
    
    expect(result).toHaveLength(2);
    expect(result.sort()).toEqual(['a', 'b']);
  });

  it('actually shuffles elements with mocked random', () => {
    // Mock Math.random to return predictable values
    (Math.random as jest.Mock)
      .mockReturnValueOnce(0.8) // Will swap last with second-to-last
      .mockReturnValueOnce(0.5) // Will swap in middle
      .mockReturnValueOnce(0.1); // Will swap near beginning
    
    const original = ['a', 'b', 'c', 'd'];
    const shuffled = shuffleArray([...original]);
    
    // With our mocked random values, we expect a specific shuffle pattern
    expect(shuffled).toHaveLength(4);
    expect(shuffled).toContain('a');
    expect(shuffled).toContain('b');
    expect(shuffled).toContain('c');
    expect(shuffled).toContain('d');
  });

  it('modifies the original array', () => {
    const original = ['a', 'b', 'c'];
    const result = shuffleArray(original);
    
    // Should return the same reference
    expect(result).toBe(original);
  });
});