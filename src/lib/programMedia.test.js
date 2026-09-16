import { DEFAULT_PROGRAM, programAllowsClientEmail, getCachedProgram } from './programConfig';
import { pogUrlForSet, sellSheetUrl } from './mediaLibrary';

describe('programConfig + mediaLibrary', () => {
  test('default program id', () => {
    expect(DEFAULT_PROGRAM.id).toBe('joey-circlek');
    expect(getCachedProgram().brand).toBe('JOEY');
  });

  test('client domain gate', () => {
    expect(programAllowsClientEmail('joey@joeypouches.com')).toBe(true);
    expect(programAllowsClientEmail('x@gmail.com')).toBe(false);
  });

  test('media urls', () => {
    expect(sellSheetUrl()).toContain('/media/joey/sell-sheet');
    expect(pogUrlForSet(3)).toBe('/media/joey/pog/set-3.svg');
    expect(pogUrlForSet('Set 12')).toBe('/media/joey/pog/set-12.svg');
  });
});
