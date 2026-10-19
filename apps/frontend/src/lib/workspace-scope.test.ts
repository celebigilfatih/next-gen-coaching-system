import { describe, expect, it } from 'vitest';
import { workspaceSeasonLabel } from './workspace-scope';

describe('workspace season label', () => {
  it.each([
    ['*', undefined, 'Tüm sezonlar'],
    ['*', 'Old record', 'Tüm sezonlar'],
    ['selected', '2026–27', '2026–27'],
    ['selected', undefined, 'Sezon TBD'],
    ['', undefined, 'Sezon TBD'],
  ])('labels scope %s and name %s as %s', (clubSeasonId, name, label) => {
    expect(workspaceSeasonLabel({ clubSeasonId }, name)).toBe(label);
  });

  it('preserves the settings missing-value wording without treating it as all seasons', () => {
    expect(workspaceSeasonLabel({ clubSeasonId: '' }, undefined, 'TBD')).toBe(
      'TBD',
    );
  });
});
