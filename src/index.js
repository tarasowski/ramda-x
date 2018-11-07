const trace = label => value => (console.log(`${label}: ${JSON.stringify(value, null, 2)}`), value)

const curry = (fn) => {
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

const reduce = curry((fn, config, data) => {
    return config === null
        ? data.reduce(fn)
        : data.reduce(fn, config)
})




module.exports = {
    curry,
    trace,
    pipe,
    compose,
    map,
    filter,
    prop,
    propEq,
    reduce
}