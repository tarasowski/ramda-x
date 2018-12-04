
/* A helper for delaying the execution of a function */
const delayed = typeof setImmediate !== 'undefined' ? setImmediate
    : typeof process !== 'undefined' ? process.nextTick
        : /* otherwise */                       setTimeout
/* End of a helper method for delaying the execution of a function */

const trace = label => value => (console.log(`${label}: ${JSON.stringify(value, null, 2)}`), value)

const curry = (fn) => {
    return function f1(...args) {
        return args.length >= fn.length
            ? fn(...args)
            : (...moreArgs) => f1(...[...args, ...moreArgs])
    }
}

/* Deprecated since version 1.0.05 */

//const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x)

/* Deprecated since version 1.0.05 */

const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x)

const map = f => xs => xs.map(f)

const filter = pred => xs => xs.filter(pred)

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

/* Task Start */



const Task = (computation, cleanup = () => { }) => ({
    fork: computation,
    cleanup,
    map: f => Task((reject, resolve) => computation(a => reject(a), b => resolve(f(b)), cleanup)),
    chain: f => Task((reject, resolve) => computation(a => reject(a), b => f(b).fork(reject, resolve), cleanup)),
    ap: b2 => Task((reject, resolve) => {

        let func = false
        let funcLoaded = false
        let val = false
        let valLoaded = false
        let rejected = false
        let allState

        const cleanupBoth = state => {
            state[0] = {}
            state[1] = {}
        }

        const guardResolve = setter => {
            return (x) => {
                if (rejected) {
                    return
                }
                setter(x)
                if (funcLoaded && valLoaded) {
                    delayed(() => cleanupBoth(allState))
                    return resolve(func(val))
                } else {
                    return x
                }
            }
        }
        const guardReject = x => {
            if (!rejected) {
                rejected = true
                return reject(x)
            }
        }

        const thisState = computation(guardReject, guardResolve((x) => {
            funcLoaded = true
            func = x
        }))

        const thatState = b2.fork(guardReject, guardResolve((x) => {
            valLoaded = true
            val = x
        }))
        return allState = [thisState, thatState]
    })

})

Task.of = b => Task((_, resolve) => resolve(b))
Task.rejected = a => Task((reject, _) => reject(a))

/* Task End */

/* Either Start */

const Right = x =>
    ({
        ap: b2 => b2.map(x),
        chain: f => f(x),
        map: f => Right(f(x)),
        fold: (f, g) => g(x),
    })

const Left = x =>
    ({
        ap: b2 => Left(x),
        chain: f => Left(x),
        map: f => Left(x),
        fold: (f, g) => f(x),
    })
const fromNullable = x =>
    x !== null ? Either.Right(x) : Either.Left(x)

const of = x => Right(x)

const tryCatch = f => x => {
    try {
        return Either.Right(x)
    } catch (e) {
        return Either.Left(x)
    }
}

const Either = {
    Right,
    Left,
    fromNullable,
    of,
    try: tryCatch
}

/* Either End */

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
    Either
}
