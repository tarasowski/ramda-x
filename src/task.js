const compose = (...fns) => x =>
    fns.reduceRight((v, f) => f(v), x)


const fork = computation => ({ fork: computation })
const map = o => ({
    ...o, ...{
        map(fn) {
            return Task((reject, resolve) => this.fork(a => reject(a), b => resolve(fn(b))))
        }
    }
})
const chain = o => ({
    ...o, ...{
        chain(fn) {
            return Task((reject, resolve) => this.fork(reject, x => fn(x).fork(reject, resolve)))
        }
    }
})
const ap = o => ({
    ...o, ...{
        ap(f) {
            return this.chain(fn => f.map(fn))
        }
    }
})

const Task = computation => compose(ap, chain, map, fork)(computation)

Task.of = x => Task((_, resolve) => resolve(x))
Task.rejected = a => Task((reject, _) => reject(a))

module.exports = Task
