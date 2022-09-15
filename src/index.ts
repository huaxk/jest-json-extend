import matchers from 'expect/build/matchers';
import { MatcherState, ExpectationResult } from 'expect/build/types';
import {
  matcherHint,
  printReceived,
  printWithType,
  RECEIVED_COLOR,
  stringify,
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
  const hint = matcherHint(matcherName, undefined, undefined, {
    isNot,
    promise,
  });

  if (typeof received !== 'string') {
    return {
      pass: false,
      message: () =>
        [
          hint,
          '\n\n',
          'received value is not a JSON string',
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
              hint,
              '\n\n',
              'received value is a JSON string',
              '\n',
              printWithType('Received', received, printReceived),
            ].join(' '),
        };
  } catch (error) {
    if (error instanceof Error) {
      const index = getJsonErrorPosition(received, error);
      const isEmpty = received.trim().length === 0;
      const message = error.message;
      return {
        pass: false,
        message: () =>
          [
            hint,
            '\n\n',
            'received value is not a valid JSON string\n',
            message,
            '\n',
            isEmpty
              ? 'Received: ' + RECEIVED_COLOR(stringify(received))
              : printJsonError(stringify(received), RECEIVED_COLOR, index + 1),
          ].join(' '),
      };
    } else {
      throw error;
    }
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

function printJsonError(
  value: string,
  print: typeof RECEIVED_COLOR,
  index: number
) {
  let message = `Received: `;

  const lines = value.split('\n');

  for (let i = 0, count = 0; i < lines.length; i++) {
    const line = lines[i];
    message += print(line) + '\n';
    if (index >= count && index <= count + line.length) {
      message += ' '.repeat(index - count + (i === 0 ? 10 : 0)) + '^\n';
    }
    count += line.length + 1;
  }

  return message;
}

function getJsonErrorPosition(received: string, error: Error): number {
  const match = error.message.match(
    /Unexpected (\w+)(?: .)? in JSON at position (\d+)/
  );
  const position = match ? parseInt(match[2], 10) : received.length;
  return position;
}
