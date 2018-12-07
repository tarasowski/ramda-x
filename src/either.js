/* Either Start */

const isNothing = x =>
    x === null || x === undefined

const Right = x =>
    ({
        ap: b2 => b2.map(x),
        chain: f => isNothing(x) ? Right(x) : f(x),
        map: f => isNothing(x) ? Right(x) : Right(f(x)),
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

module.exports = Either