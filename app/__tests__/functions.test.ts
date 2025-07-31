import { selectFunctions, runFunction, availableFunctions, FunctionName } from '../functions';

describe('Functions utility', () => {
  it('selectFunctions returns meta definitions for provided function names', () => {
    const names: FunctionName[] = ['searchWithBing', 'addMemory'];
    const defs = selectFunctions(names);
    expect(defs).toHaveLength(names.length);
    // Ensure that the returned function definitions correspond to the requested names
    const returnedNames = defs.map((d) => d.name);
    names.forEach((n) => expect(returnedNames).toContain(n));
  });

  it('runFunction throws an error for unknown function name', async () => {
    await expect(runFunction('unknown_function', {})).rejects.toThrow('Unknown function');
  });

  it('every entry in availableFunctions exposes meta and run', () => {
    Object.entries(availableFunctions).forEach(([name, mod]) => {
      expect(typeof mod.meta).toBe('object');
      expect(mod.meta.name).toBe(name);
      expect(typeof mod.run).toBe('function');
    });
  });
});