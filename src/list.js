const List = xs => ({
    concat: x => List(xs.concat(x)),
    map: fn => List(xs.map(fn)),
    reduce: (f, i) => List(xs.reduce(f, i)),
    fold: f => f(xs),
    traverse(of, fn) {
        return xs.reduce(
            (f, a) => fn(a).map(b => bs => bs.concat(b)).ap(f),
            of(List([]))
        )
    }
})


module.exports = List
