/* Task Start */

const compose = (...fns) => x =>
    fns.reduceRight((v, f) => f(v), x)


const Task = computation => ({
    fork: computation,
    map(fn) {
        return Task((reject, resolve) => this.fork(reject, compose(resolve, fn)));
    },
    chain(fn) {
        return Task((reject, resolve) => this.fork(reject, x => fn(x).fork(reject, resolve)));
    },
    ap(f) {
        return this.chain(fn => f.map(fn))
    }
})

Task.of = x => Task((_, resolve) => resolve(x))
Task.rejected = a => Task((reject, _) => reject(a))


/* Task End */

module.exports = Task