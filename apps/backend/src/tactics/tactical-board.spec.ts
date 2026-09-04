import { BadRequestException } from '@nestjs/common';
import { validateTacticalBoardDocument } from './tactical-board';

const document = {
  schemaVersion: 1,
  kind: 'tactical-board',
  pitch: { type: 'full', width: 1200, height: 800 },
  elements: [
    { id: 'home-1', type: 'player', x: 200, y: 300, team: 'home', number: '8' },
    {
      id: 'run-1',
      type: 'arrow',
      x: 200,
      y: 300,
      endX: 500,
      endY: 350,
      color: '#fbbf24',
      thickness: 3,
      style: 'straight',
    },
  ],
};

describe('validateTacticalBoardDocument', () => {
  it('accepts a canonical version-one document', () => {
    expect(validateTacticalBoardDocument(document)).toBe(document);
  });

  it('rejects unknown fields and element types', () => {
    expect(() =>
      validateTacticalBoardDocument({ ...document, secret: true }),
    ).toThrow(BadRequestException);
    expect(() =>
      validateTacticalBoardDocument({
        ...document,
        elements: [{ id: 'x', type: 'script', x: 1, y: 1 }],
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects duplicate ids and non-canonical dimensions', () => {
    expect(() =>
      validateTacticalBoardDocument({
        ...document,
        pitch: { type: 'full', width: 1, height: 1 },
      }),
    ).toThrow(BadRequestException);
    expect(() =>
      validateTacticalBoardDocument({
        ...document,
        elements: [document.elements[0], document.elements[0]],
      }),
    ).toThrow(BadRequestException);
  });
});
