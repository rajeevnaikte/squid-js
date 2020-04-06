import main from '../index';

describe('Template', () => {
  test('default function', () => {
    expect(main()).toEqual(4)
  });
});
