const Task = require('./task')
const Either = require('./either')
const Box = require('./box')

const trace = label => value => (console.log(`${label}: ${JSON.stringify(value, null, 2)}`), value)

const curry = (fn) => {
    return function f1(...args) {
        return args.length >= fn.length
            ? fn(...args)
            : (...moreArgs) => f1(...[...args, ...moreArgs])
    }
}

const compose = (...fns) => x =>
    fns.reduceRight((v, f) => f(v), x)

const map = curry((f, x) =>
    Array.isArray(x)
        ? x.reduce((a, c) => a.concat([f(c)]), []) // map over regular arrays map(console.log, [1, 2, 3])
        : x.map(f) // map over types Either, Task // compose(map(f),map(f),fromNullable)(data)
)

const reduce = curry((fn, config, x) =>
    config === null
        ? x.reduce(fn)
        : x.reduce(fn, config))

const filter = curry((pred, xs) =>
    xs.reduce((newArr, item) => pred(item) ? newArr.concat([item]) : newArr, []))

const fold = (f, g) => e => e.fold(f, g)

const chain = f => e => e.chain(f)

const ap = b2 => e => e.ap(b2)

const fork = reject => resolve => b => b.fork(reject, resolve)

const prop = curry((property, data) => data[property])

const propEq = curry((key, value, data) => {
    return data[key] === value
        ? true
        : false
})


module.exports = {
    curry,
    trace,
    compose,
    map,
    filter,
    prop,
    propEq,
    reduce,
    Task,
    Either,
    fold,
    chain,
    ap,
    Box,
    fork
}