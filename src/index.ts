import matchers from 'expect/build/matchers';
import { MatcherState, ExpectationResult } from 'expect/build/types';
import {
  EXPECTED_COLOR,
  matcherHint,
  printReceived,
  printWithType,
  RECEIVED_COLOR,
} from 'jest-matcher-utils';
import { JSONPath } from 'jsonpath-plus';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeJSON(): R;
      toEqualJSON(expected: any, path?: string): R;
      toMatchJSON(expected: any, path?: string): R;
    }
    interface Expect {
      jsonContaining<E = {}>(b: E): any;
    }
    interface InverseAsymmetricMatchers extends Expect {}
  }
}

expect.extend({
  toBeJSON,
  toEqualJSON,
  toMatchJSON,
  jsonContaining,
});

export function parseJSON(
  this: MatcherState,
  received: unknown,
  matcherName: string,
  fn?: (json: any) => ExpectationResult
): ExpectationResult {
  const { isNot, promise } = this;

  if (typeof received !== 'string') {
    return {
      pass: false,
      message: () =>
        [
          matcherHint(matcherName, undefined, undefined, { isNot, promise }),
          '\n\n',
          RECEIVED_COLOR('received'),
          'value is not a',
          EXPECTED_COLOR('JSON string'),
          '\n',
          printWithType('Received', received, printReceived),
        ].join(' '),
    };
  }

  try {
    const json = JSON.parse(received);
    return fn
      ? fn(json)
      : {
          pass: true,
          message: () =>
            [
              matcherHint(matcherName, undefined, undefined, {
                isNot,
                promise,
              }),
              '\n\n',
              RECEIVED_COLOR('received'),
              'value is a',
              EXPECTED_COLOR('JSON string'),
              '\n',
              printWithType('Received', received, printReceived),
            ].join(' '),
        };
  } catch (error) {
    return {
      pass: false,
      message: () =>
        [
          matcherHint(matcherName, undefined, undefined, { isNot, promise }),
          '\n\n',
          RECEIVED_COLOR('received'),
          'value is not a valid',
          EXPECTED_COLOR('JSON string'),
          '\n',
          printWithType('Received', received, printReceived),
        ].join(' '),
    };
  }
}

export function toBeJSON(
  this: MatcherState,
  received: unknown
): ExpectationResult {
  return parseJSON.call(this, received, 'toBeJSON');
}

export function toEqualJSON(
  this: MatcherState,
  received: unknown,
  expected: any,
  path?: string
): ExpectationResult {
  return parseJSON.call(this, received, 'toEqualJSON', (json) => {
    let actual = path ? JSONPath({ json: json, path, wrap: false }) : json;
    return matchers.toEqual.bind(this)(actual, expected);
  });
}

export function toMatchJSON(
  this: MatcherState,
  received: unknown,
  expected: any,
  path?: string
): ExpectationResult {
  return parseJSON.call(this, received, 'toMatchJSON', (json) => {
    let actual = path ? JSONPath({ json: json, path, wrap: false }) : json;
    return matchers.toMatchObject.bind(this)(actual, expected);
  });
}

export function jsonContaining(
  received: unknown,
  expected: any
): ExpectationResult {
  const matcherState = expect.getState() as MatcherState;
  if (typeof received === 'object') {
    return matchers.toMatchObject.bind(matcherState)(received, expected);
  } else {
    return toMatchJSON.bind(matcherState)(received, expected);
  }
}
