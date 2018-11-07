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

const map = curry((fn, data) => data.map(fn))

const filter = curry((fn, data) => data.filter(fn))

const prop = curry((property, data) => data[property])

const propEq = curry((key, value, data) => {
    return data[key] === value
        ? true
        : false
})

const pluck = curry((property, data) => {
    return data.map(prop(property), data)
})



module.exports = {
    curry,
    trace,
    pipe,
    compose,
    map,
    filter,
    pluck,
    prop,
    propEq
}