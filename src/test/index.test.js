const { trace, compose, map, filter, curry, pipe } = require('../index')
const test = require('tape')


test('should call a map function and multiply each element by x', assert => {
    const msg = 'returns a new array multiplied by 2'
    const testMap = x => x * 2
    const actual = map(testMap, [1, 2, 3, 4])
    const expected = [2, 4, 6, 8]
    assert.same(actual, expected, msg)
    assert.end()
})

test('should call a filter function and remove an element from an array', assert => {
    const msg = 'returns a new array w/o 2'
    const testFilter = x => x !== 2
    const actual = filter(testFilter, [1, 2, 3, 4])
    const expected = [1, 3, 4]
    assert.same(actual, expected, msg)
    assert.end()
})

// TODO:
// - test for compose
// - test for pipe
// - test for trace
// - test for curry
