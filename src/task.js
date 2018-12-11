const compose = (...fns) => x =>
    fns.reduceRight((v, f) => f(v), x)


const Task = computation => {
    const fork = computation
    const map = fn =>
        Task((reject, resolve) =>
            fork(reject, compose(resolve, fn)))
    const chain = fn =>
        Task((reject, resolve) =>
            fork(reject, x => fn(x).fork(reject, resolve)))
    const ap = f =>
        chain(fn => f.map(fn))
    return { fork, map, chain, ap, }
}

Task.of = x => Task((_, resolve) => resolve(x))
Task.rejected = a => Task((reject, _) => reject(a))


module.exports = Task
