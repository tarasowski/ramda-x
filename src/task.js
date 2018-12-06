/* Task Start */


const delayed = typeof setImmediate !== 'undefined' ? setImmediate
    : typeof process !== 'undefined' ? process.nextTick
        : /* otherwise */                       setTimeout


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

/* Task End */

module.exports = Task