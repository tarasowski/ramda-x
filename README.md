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
- **VIII.** Task() || Task.of(x) || Task.map(), Task.chain(), Task.ap() -> for lazy evaluation and isolation of side effects
- **IX.** Either.Right(x) || Either.Left(x) || Either.fromNullable(x) || Either.of(x) || Either.try(f) -> for branching

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
const {Task} = require('ramda-x')

// pure function
const readFile = (filename, enc) =>
    Task((reject, resolve) =>
        fs.readFile(filename, enc, (err, content) =>
            err ? reject(err) : resolve(content))
    )
// pure function
const writeFile = (filename, contents) =>
    Task((reject, resolve) =>
        fs.writeFile(filename, contents, (err, success) =>
            err ? reject(err) : resolve(success))
    )

// pure function
const app = readFile('config.json', 'utf-8')
    .map(content => content.replace(/8/g, '9'))
    .chain(contents => writeFile('config2.json', contents))

// impure function with side effects
app.fork(e => console.log('error', e), succes => console.log('success'))

```

## Lifting a value into a type

```js
const f = x => x.concat('!!!')

const res = Task.of('hello').map(f)
res.fork(e => 'error', d => console.log(d)) // hello!!!

Either.of('hello').map(f).fold(_ => _, d => console.log(d)) // hello!!!
```

## Try/Catch Examples

```js
const {Either} = require('ramda-x')
const fs = require('fs')


const tryCatch = f => {
    try {
        return Either.Right(f())
    } catch (e) {
        return Either.Left(e)
    }
}

const getPort = () =>
    tryCatch(() => fs.readFileSync('config.json'))
        .chain(c => tryCatch(() => JSON.parse(c)))
        .fold(e => 3000,
            c => c.port)

const res = getPort()
``` 

## Try with Either.try(f)

```js
const parse = Either.try(JSON.parse)


const eitherToTask = e =>
    e.fold(Task.rejected, Task.of)

const findPost = id =>
    httpGet(url(id))
        .map(parse)
        .chain(eitherToTask)

const main = ([id]) =>
    Task.of(title => [title]).ap(findPost(id))

id.chain(main).fork(console.error, x => console.log('success', x))

```

## Either - Instead of If/Else + Composition

```js
import {Either} = require('ramda-x')

const fromNullable = x =>
    x !== null ? Either.Right(x) : Either.Left(x)

// You can also import Either.fromNullable() and use it instead of fromNullable()
const findColor = name =>
    fromNullable({ red: '#ff4444', blue: '#3b5998', yellow: '#fffG8F' }[name])


const result = findColor('yellow').map(c => c.slice(1)).fold(err => 'nothing found', c => c.toUpperCase())
```
## Some other examples

```js
const fromNullable = x =>
    x !== null ? Either.Right(x) : Either.Left(x)

const tryCatch = f => {
    try {
        return Either.Right(f())
    } catch (e) {
        return Either.Left(e)
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




