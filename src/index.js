const trace = label => value => (console.log(`${label}: ${value}`), value)

function curry(fn) {
    return function f1(...args) {
        return args.length >= fn.length
            ? fn(...args)
            : (...moreArgs) => f1(...[...args, ...moreArgs])
    }
}

const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x)

const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x)

const map = curry((fn, array) => array.map(fn))

const filter = curry((fn, array) => array.filter(fn))

module.exports = {
    curry,
    trace,
    pipe,
    compose,
    map,
    filter
}