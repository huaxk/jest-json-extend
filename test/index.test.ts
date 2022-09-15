import { SyncExpectationResult, MatcherState } from 'expect/build/types';
import {
  EXPECTED_COLOR,
  matcherHint,
  printReceived,
  printWithType,
  RECEIVED_COLOR,
} from 'jest-matcher-utils';
import { parseJSON } from '../src';

const mockedState = {
  utils: {
    matcherHint,
    printReceived,
    printWithType,
    RECEIVED_COLOR,
    EXPECTED_COLOR,
  } as Partial<MatcherState['utils']> as MatcherState['utils'],
} as Partial<MatcherState> as MatcherState;

const pass = { pass: true };
const fail = { pass: false };

describe('parseJSON', () => {
  const matcherName = 'parseJSON';
  const passMessage = 'received value is a JSON string';
  const errorMessage = 'received value is not a JSON string';
  const invalidMesage = 'received value is not a valid JSON string';

  it('should pass for serialized null', () => {
    expect(
      parseJSON.call(mockedState, JSON.stringify(null), matcherName)
    ).toMatchObject(pass);
  });

  it('should pass for serialized number', () => {
    expect(
      parseJSON.call(mockedState, JSON.stringify(33), matcherName)
    ).toMatchObject(pass);
  });

  it('should pass for serialized boolean', () => {
    expect(
      parseJSON.call(mockedState, JSON.stringify(true), matcherName)
    ).toMatchObject(pass);
  });

  it('should pass for serialized string', () => {
    expect(
      parseJSON.call(mockedState, JSON.stringify('test'), matcherName)
    ).toMatchObject(pass);
  });

  it('should pass for serialized array', () => {
    expect(
      parseJSON.call(
        mockedState,
        JSON.stringify(['apple', 'banana']),
        matcherName
      )
    ).toMatchObject(pass);
  });

  it('should pass for serialized object', () => {
    expect(
      parseJSON.call(mockedState, JSON.stringify({ test: 'ok' }), matcherName)
    ).toMatchObject(pass);
  });

  it('should pass for formatted strings', () => {
    expect(
      parseJSON.call(
        mockedState,
        JSON.stringify({ test: 'ok' }, null, 4),
        matcherName
      )
    ).toMatchObject(pass);
  });

  it('should not pass for undefined', () => {
    expect(parseJSON.call(mockedState, undefined, matcherName)).toMatchObject(
      fail
    );
  });

  it('should not pass for null', () => {
    expect(parseJSON.call(mockedState, null, matcherName)).toMatchObject(fail);
  });

  it('should not pass for number', () => {
    expect(parseJSON.call(mockedState, 33, matcherName)).toMatchObject(fail);
  });

  it('should not pass for boolean', () => {
    expect(parseJSON.call(mockedState, false, matcherName)).toMatchObject(fail);
  });

  it('should not pass for array', () => {
    expect(
      parseJSON.call(mockedState, ['apple', 'banana'], matcherName)
    ).toMatchObject(fail);
  });

  it('should not pass for object', () => {
    expect(
      parseJSON.call(mockedState, { test: 'ok' }, matcherName)
    ).toMatchObject(fail);
  });

  it('should not pass for invalid JSON string', () => {
    expect(parseJSON.call(mockedState, 'test', matcherName)).toMatchObject(
      fail
    );
  });

  it('should return pass message for JSON string', () => {
    const result = parseJSON.call(
      mockedState,
      JSON.stringify(null),
      matcherName
    ) as SyncExpectationResult;
    expect(result.message()).toContain(passMessage);
  });

  it('should return error message for not string', () => {
    const result = parseJSON.call(
      mockedState,
      null,
      matcherName
    ) as SyncExpectationResult;
    expect(result.message()).toContain(errorMessage);
  });

  it('should return invalid message for invalid JSON string', () => {
    const result = parseJSON.call(
      mockedState,
      'test',
      matcherName
    ) as SyncExpectationResult;
    expect(result.message()).toContain(invalidMesage);
  });
});

describe('toBeJSON', () => {
  it('should be json sting', () => {
    expect(JSON.stringify({ test: new Date() })).toBeJSON();
  });

  it('should not be json string', () => {
    expect(null).not.toBeJSON();
  });

  it('should not be valid json string', () => {
    expect('[1, 2, 3, ]').not.toBeJSON();
  });
});

describe('toEqualJSON', () => {
  const expected = { test: `${new Date()}` };
  const recevied = JSON.stringify(expected);

  it('should equal', () => {
    expect(recevied).toEqualJSON(expected);
  });

  it('should not equal', () => {
    expect(recevied).not.toEqualJSON({ another: true });
  });
});

describe('toEqualJSONPath', () => {
  const address = {
    streetAddress: 'naist street',
    city: 'Nara',
    postalCode: '630-0192',
  };
  const phoneNumber1 = {
    type: 'home',
    number: '0123-4567-8910',
  };
  const phoneNumber2 = {
    type: 'iPhone',
    number: '0123-4567-8888',
  };
  const complex = {
    firstName: 'John',
    lastName: 'doe',
    age: 26,
    address,
    phoneNumbers: [phoneNumber1, phoneNumber2],
  };
  const recevied = JSON.stringify(complex);

  it('should equal by jsonpath', () => {
    expect(recevied).toEqualJSON(address, '$.address');
  });

  it('should not equal by jsonpath', () => {
    let another = { ...address };
    another.city = 'another city';
    expect(recevied).not.toEqualJSON(another, '$.address');
  });

  it('should equal by jsonpath which return array', () => {
    expect(recevied).toEqualJSON(
      [phoneNumber1, phoneNumber2],
      '$.phoneNumbers'
    );
  });

  it('should not equal by jsonpath which return array', () => {
    let another = { ...phoneNumber2 };
    another.type = 'another type';
    expect(recevied).not.toEqualJSON([phoneNumber1, another], '$.phoneNumbers');
  });

  it('should equal by jsonpath which recursive return array', () => {
    expect(recevied).toEqualJSON(
      expect.arrayContaining(['iPhone', 'home']), // exclude the order of return array elements
      '$..type'
    );
  });
});

describe('toMatchJSON', () => {
  const part = { test: `${new Date()}` };
  const complex = { ...part, complex: true };
  const received = JSON.stringify(complex);

  it('should match part', () => {
    expect(received).toMatchJSON(part);
  });

  it('should not match part', () => {
    expect(received).not.toMatchJSON({ another: true });
  });
});

describe('toMatchJSONPath', () => {
  const part = {
    streetAddress: 'naist street',
    city: 'Nara',
  };
  const address = {
    ...part,
    postalCode: '630-0192',
  };
  const phoneNumber1 = {
    type: 'home',
    number: '0123-4567-8910',
  };
  const phoneNumber2 = {
    type: 'iPhone',
    number: '0123-4567-8888',
  };
  const complex = {
    firstName: 'John',
    lastName: 'doe',
    age: 26,
    address,
    phoneNumbers: [phoneNumber1, phoneNumber2],
  };
  const recevied = JSON.stringify(complex);

  it('should match part by jsonpath', () => {
    expect(recevied).toMatchJSON(part, '$.address');
  });

  it('should not match part by jsonpath', () => {
    let another = { ...part };
    another.city = 'another city';
    expect(recevied).not.toMatchJSON(another, '$.address');
  });

  it('should match by jsonpath extend', () => {
    expect(recevied).toMatchJSON(
      address,
      '$.address[?(@property.match(/city/i))]^'
    );
  });
});

describe('jsonContaining', () => {
  const part = {
    streetAddress: 'naist street',
    city: 'Nara',
  };
  const address = {
    ...part,
    postalCode: '630-0192',
  };
  const receviedObject = { address: JSON.stringify(address) };
  const receviedString = JSON.stringify({ address });

  it('should equal by jsonContaining', () => {
    expect(receviedObject).toEqual({ address: expect.jsonContaining(address) });
  });

  it('should not equal by jsonContaining', () => {
    let another = { ...address };
    another.city = 'another city';
    expect(receviedObject).toEqual({
      address: expect.not.jsonContaining(another),
    });
  });

  it('should match by jsonContaining', () => {
    expect(receviedObject).toEqual({ address: expect.jsonContaining(part) });
  });

  it('should not match by jsonContaining', () => {
    let another = { ...part };
    another.city = 'another city';
    expect(receviedObject).toEqual({
      address: expect.not.jsonContaining(another),
    });
  });

  it('should equal json by jsonContaining', () => {
    expect(receviedString).toEqualJSON({
      address: expect.jsonContaining(address),
    });
  });

  it('should not equal json by jsonContaining', () => {
    let another = { ...address };
    another.city = 'another city';
    expect(receviedString).toEqualJSON({
      address: expect.not.jsonContaining(another),
    });
  });
});
