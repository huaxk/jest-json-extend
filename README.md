# Jest json extend

Jest expect matchers for JSON strings with jsonpath supported. Inspirted by [jest-json-matchers](https://github.com/debugmaster/jest-json-matchers), further optimize and add `jsonpath` support.

## New Matchers

### .toBeJSON()

It will pass if input is a string and it can be deserialized by `JSON.parse()`. For example:

```js
expect('{"hello":"world"}').toBeJSON(); // It will pass
expect('<span>Test</span>').toBeJSON(); // It will not pass
```

### .toEqualJSON(jsonObject)

It will pass if input is a valid JSON string and its deserialized value is equal to the value passed to the matcher. It compares based on [`toEqual()`](https://jestjs.io/docs/en/expect#toequalvalue) matcher. For example:

```js
expect('{"hello":"world"}').toEqualJSON({ hello: 'world' }); // It will pass
expect('{\n  "status": 400\n}').toEqualJSON({ status: 200 }); // It will not pass
```

### .toMatcherJSON(jsonObject)

It will pass if input is a valid JSON string and its deserialized value contains the properties of the value passed to the matcher. It matches based on [`toMatchObject()`](https://jestjs.io/docs/en/expect#tomatchobjectobject) matcher. For example:

```js
expect('{"status":202,"body":null}').toMatchJSON({ status: 202 }); // It will pass
expect('{"day":14,"month":3}').toMatchJSON({ month: 12 });
```

### expect.jsonContaining(jsonObject)

It will pass if input is a valid JSON string and its deserialized value contains the properties of the value passed to the matcher, It behaves like [`expect.objectContaining()`](https://jestjs.io/docs/en/expect#expectobjectcontainingobject) matcher. For example:

```js
// It will pass
expect({
  body: '{"message":"This is JSON"}',
}).toEqual({
  body: expect.jsonContaining({ message: 'This is JSON' }),
});
// It will not pass
expect({
  status: 200,
}).toEqual({
  body: expect.jsonContaining({ message: 'Not this one' }),
});
```

## Setup

Add jest-json to your Jest config:

```js
module.exports = {
  // ... other configurations
  setupFilesAfterEnv: ['jest-json-extend'],
};
```

Or load it explicitly

```js
import jest-json-extend;

it('should pass', () => {
    expect('').not.toBeJSON()
})
```

## Example with jsonpath

```js
it('should pass', () => {
  const recevied = JSON.stringify({
    firstName: 'John',
    lastName: 'doe',
    age: 26,
    address: {
      streetAddress: 'naist street',
      city: 'Nara',
      postalCode: '630-0192',
    },
  });
  expect(recevied).toMatchJSON(
    address,
    '$.address[?(@property.match(/city/i))]^'
  );
});
```

## License
[MIT](LICENSE)