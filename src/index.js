
/* Deprecated since version 1.0.05 */

//const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x)

/* Deprecated since version 1.0.05 */


const delayed = typeof setImmediate !== 'undefined' ? setImmediate
    : typeof process !== 'undefined' ? process.nextTick
        : /* otherwise */                       setTimeout


const trace = label => value => (console.log(`${label}: ${JSON.stringify(value, null, 2)}`), value)

const curry = (fn) => {
    return function f1(...args) {
        return args.length >= fn.length
            ? fn(...args)
            : (...moreArgs) => f1(...[...args, ...moreArgs])
    }
}

const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x)

const map = curry((f, x) =>
    Array.isArray(x)
        ? x.reduce((a, c) => a.concat([f(c)]), []) // map over regular arrays map(console.log, [1, 2, 3])
        : x.map(f) // map over types Either, Task // compose(map(f),map(f),fromNullable)(data)
)

const fold = (f, g) => e => e.fold(f, g)

const chain = f => e => e.chain(f)

const ap = b2 => e => e.ap(b2)

const filter = curry((pred, xs) => xs.reduce((newArr, item) => pred(item) ? newArr.concat([item]) : newArr, []))

const prop = curry((property, data) => data[property])

const propEq = curry((key, value, data) => {
    return data[key] === value
        ? true
        : false
})

const reduce = curry((fn, config, x) =>
    config === null
        ? x.reduce(fn)
        : x.reduce(fn, config))

/* Task Start */



const Task = (computation, cleanup = () => { }) => ({
    fork: computation,
    cleanup,
    map: f =>
        Task((reject, resolve) => computation(a => reject(a), b => resolve(f(b)), cleanup)),
    chain: f =>
        Task((reject, resolve) => computation(a => reject(a), b => f(b).fork(reject, resolve), cleanup)),
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
const fork = reject => resolve => b => b.fork(reject, resolve)

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
    x === null || x === undefined ? Left(null) : Right(x)

const of = x => Right(x)

const tryCatch = f => x => {
    try {
        return Right(f(x))
    } catch (e) {
        return Left(e)
    }
}


const Either = {
    Right,
    Left,
    fromNullable,
    of,
    try: tryCatch,
}

/* Either End */

/* Box - Just for demo purposes */
const Box = x => ({
    ap: b2 => b2.map(x),
    chain: f => f(x),
    map: f => Box(f(x)),
    fold: f => f(x),
    inspect: () => `Box(${x})`
})

/* End of Box */

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
