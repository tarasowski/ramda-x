# Ramda X

Ramda X is a super small API with only 10 most important methods for functional programming. Original Ramda library is too big and abstracts almost everything away from the JavaScript language. That's why Ramda X uses the most important methods and leaves everything as it is. All implemented methods are auto-curried!!!

**Important:** Data comes last!

### Implemented API methods:

- **I.** curry() 
- **II.** compose()
- **III.** map() -> works only on arrays
- **IV.** filter() -> works only on arrays
- **V.** prop() -> works only on objects `prop('name')({name: 'Dimitri', location: 'Berlin'})`
- **VI.** propEq() -> works only on objects `propEq('location', 'Berlin')`
- **VII.** reduce() -> works only on arrays `reduce(fn, null || 'acc value', {location: Berlin})`
- **VIII.*** Task() -> for lazy evaluation and isolation of side effects
- **IX.*** Either.Right(x) || Either.Left(x)

### Methods on the waiting list:
- composeP() -> composition with Promises
- propNotEq() -> removing a an element from an array

### Additional methods for debugging Ramda X

- trace() -> can be used to debug compose/pipe `trace('label')(value)`

If you want the full suite, just use the original [Ramda](https://ramdajs.com). 

### Example

```js
const { map, prop, compose, trace } = require('ramda-x')

const users = [
    { name: 'Dimitri', isAdmin: true },
    { name: 'John', isAdmin: true },
    { name: 'Mike', isAdmin: false }
]

const names = map(prop('name'), users)
console.log(names) // [ 'Dimitri', 'John', 'Mike' ]

const message = {
    Records: [
        { name: 'Dimitri', isAdmin: true },
        { name: 'John', isAdmin: true },
        { name: 'Mike', isAdmin: false }
    ]
}

const extractNamesFromMessage = compose(
    map(prop('name')),
    trace('AFTER PLUCK'),
    prop('Records')
)

console.log(extractNamesFromMessage(message))
// AFTER PLUCK: [
//   {
//     "name": "Dimitri",
//     "isAdmin": true
//   },
//   {
//     "name": "John",
//     "isAdmin": true
//   },
//   {
//     "name": "Mike",
//     "isAdmin": false
//   }
// ]
//[ 'Dimitri', 'John', 'Mike' ]

const filterNamesFromMessage = compose(
    filter(propEq('name', 'Dimitri')),
    prop('Records')
)

console.log(filterNamesFromMessage(message))
// [ { name: 'Dimitri', isAdmin: true } ]
```

## Task - Lazy Evaluation / Isolation of Side Effects

```js
const Task = (computation, cleanup = () => { }) => ({
    fork: computation,
    cleanup,
    map: f => Task((reject, resolve) => computation((a) => reject(a), b => resolve(f(b)), cleanup)),
})


const readFile = (filename, enc) =>
    Task((reject, resolve) =>
        fs.readFile(filename, enc, (err, content) =>
            err ? reject(err) : resolve(content))
    )

const app = readFile('config.json', 'utf-8')
app.map(content => content.replace(/8/g, '6'))
    .fork(e => console.log('error', e), data => console.log('success', data))

```

## Either - Instead of If/Else + Composition

```js
import {Either} = require('ramda-x')

const tryCatch = f => {
    try {
        return Either.Right(f())
    } catch (e) {
        return Either.Left(e)
    }
}
const fs = require('fs')

const getPort = () =>
    tryCatch(() => fs.readFileSync('confg.json'))
        .chain(c => tryCatch(() => JSON.parse(c)))
        .fold(e => 3000,
            c => c.port)

const result = getPort()

console.log(
    result
)
```
## Some other examples

```js
const fromNullable = x =>
    x !== null ? Right(x) : Left(x)

const tryCatch = f => {
    try {
        return Right(f())
    } catch (e) {
        return Left(e)
    }
}


// imperative code
const openSite = () => {
    if (current_user) {
        return renderPage(current_user)
    } else {
        return showLogin()
    }
}


// declarative code
const openSite = () => {
    fromNullable(current_user)
        .fold(showLogin, renderPage)
}

// imperative code
const getPrefs = user => {
    if (user.premium) {
        return loadPrefs(user.preferences)
    } else {
        return defaultPrefs
    }
}

// declarative code
const getPrefs = user =>
    (user.premium ? Right(user) : Left('not premium'))
        .map(u => u.preferences)
        .fold(() => defaultPrefs, prefs => loadPrefs(prefs))

// imperative code
const streetName = user => {
    const address = user.address
    if (address) {
        const street = address.street
        if (street) {
            return street.name
        }
    }
    return 'no street!'
}

// declarative code
const streetName = user =>
    fromNullable(user.address)
        .chain(a => fromNullable(a.street))
        .map(s => s.name)
        .fold(e => 'no street', n => n)

// imperative code
const concatUniq = (x, ys) => {
    const found = ys.filter(y => y === x)[0]
    return found ? ys : ys.concat(x)
}

// declarative code
const concatUniq = (x, ys) =>
    fromNullable(ys.filter(y => y === x)[0])
        .fold(() => ys.concat(x), y => ys)

// imperative code
const wrapExamples = example => {
    if (example.previewPath) {
        try {
            example.preview = fs.readFileSync(example.previewPath)
        } catch (e) { }
    }
    return example
}

const readFile = x => tryCatch(() => fs.readFileSync(x))

// declarative code
const wrapExamples = example => {
    fromNullable(example.previewPath)
        .chain(readFile)
        .fold(() => example, ex => Object.assign({ preview: p }, ex))
}

// imperative code
const parseDbUrl = cfg => {
    try {
        const c = JSON.parse(cfg)
        if(c.url) {
            return c.url.match(/*....*/)
        }
    } catch(e) {
        return null
    }
}

// declarative code
const parseDbUrl = cfg => {
    tryCatch(() => JSON.parse(cfg))
    .chain(c => fromNullable(c.url))
    .fold(e => null,
        u => u.match(/*...*/))
}
```




