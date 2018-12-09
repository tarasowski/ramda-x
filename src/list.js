const List = x => ({
    map: f => List(x.map(f)),
    filter: f => List(x.filter(f)),
    reduce: f => List(x.reduce(f)),
    fold: f => f(x),
    inspect: () => `List(${x})`
})

module.exports = List
