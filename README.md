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
- **IX.** Either.Right(x) || Either.Left(x) || Either.fromNullable(x) || Either.of(x) || Either.try(f) -> Either captures the concept of errors

### Methods on the waiting list:
- composeP() -> composition with Promises
- propNotEq() -> removing a an element from an array

### Additional methods for debugging Ramda X

- trace() -> can be used to debug compose/pipe `trace('label')(value)`

If you want the full suite, just use the original [Ramda](https://ramdajs.com). 

## Algebraic Typologies

```js
// Source: https://github.com/DrBoolean

// Functor
Box.of(20).map(x => x / 2)
//Box(10)

// Monad
Box.of(true).chain(x => Box.of(!x))
// Box(false)

// Monoid
Box.of('small').concat(Box.of('pox'))
// Box('smallpox')

// Applicative
Box.of(x => x + 1).ap(2)
// Box(3)

// Traversable
Box.of(3).traverse(Either.x, x => fromNullable(x))
// Right(Box(3))

// Natural transformation
eitherToBox(fromNullable(null))
// Box(null)
```

---

## When to use what? - Code that never fails!

```js
const { Task, Either, Box, compose, map, fold, chain, ap, fork, trace } = require('ramda-x')
const fs = require('fs')

// we are using Task in order not to grab the state directly
// by doing so we isolate the side-effects and make our app more safely

// Use Task for side-effects: console.log, process.arg, http calls, db calls, read/write -> ASYNCHRONOUS CODE
const argv = Task((reject, resolve) => resolve(process.argv))

const httpGet = Task((reject, resolve) =>
    request(url, (err, res, body) =>
        err ? reject(err) : resolve(body)))

const readFile = enc => file => Task((reject, resolve) =>
    fs.readFile(file, enc, (err, content) =>
        err ? reject(err) : resolve(content)))

const file = readFile('utf-8')
file('config.json').fork(console.error, console.log)


// Use Eiter.try for JSON.parse/JSON.stringify -> SYNCHRONOUS CODE
const parse = Either.try(JSON.parse)

const readFileSync = Either.try(fs.readFileSync)

const result = readFileSync('config.json')

result.fold(console.error, console.log)



// Use Either.fromNullable when you are trying to get properties out of an object object.property

const first = ({ name }) =>
    Either.fromNullable(name)


const name = compose(
    chain(first),
    Either.of
)

const myName = name({ name: 'Dimitri' })
const herName = name({ name: 'Anastasia' })

myName.fold(console.error, console.log)
herName.fold(console.error, console.log)

```

## Either.fromNullable - Code that never fails!

```js
const { Task, Either, prop, compose, trace, map, fold, chain } = require('ramda-x')

const findColor = name =>
    ({ red: '#ff4444', green: '#36599', blue: '#fff68f' })[name]

const getColor = name => Either.fromNullable(findColor(name))
const sliceBy = str => str.slice(1)
const upperCaseValue = str => str.toUpperCase()
const reportError = err => 'no color'
const showResult = fold(reportError, upperCaseValue)
const sliceByTwo = map(sliceBy)



const result = compose(
    showResult,
    sliceByTwo,
    getColor)


result('green') // 36599
result('red') // FF4444
result('blue') // FFF68F
result('yellow') // no color
result('orange') // no color
result('white') // no color
```

## ap && chain (Reigth/Left.chain || Right/Left.ap) - Code that never fails
```js
const { Task, Either, prop, compose, trace, map, fold, chain } = require('ramda-x')
const fs = require('fs')

// Important: If you'll try to get a non-existing property out of the object, 
//the app would not return undefined it will return 3000 as default value of the error function, defined in showResult()
const getProperty = o =>
    Either.of(p => p).ap(Either.fromNullable(o.port))

const readFile = Either.try(fs.readFileSync)
const parseJSON = Either.try(JSON.parse)
const isPortAvailable = chain(getProperty)
const parse = chain(parseJSON)
const showResult = fold(
    err => 3000,
    c => c)

const result = compose(
    showResult,
    isPortAvailable,
    parse,
    readFile
)


result('config.json') // 8888
result('confffig.json') // 3000
```

## Currying with Types (Boxes & Either)

```js
const { Box } = require('ramda-x')

const add = x => y => x + y
const res = Box(add).ap(Box(20)).ap(Box(20)).fold(x => x)


console.log(
    res // 40
)
//---------------------------------- // ----------------------------------
const { Task, Either, prop, compose, trace, map, fold, chain, ap } = require('ramda-x')

const $ = selector =>
    Either.of({ selector, height: 10 })


const getScreenSize = screen => head => foot =>
    screen - (head.height + foot.height)


const result = compose(
    fold(err => 'error', x => x),
    ap($('hooter')),
    ap($('header')),
    Either.of,
    getScreenSize
)

console.log(
    result(800), // 780
    result(1500) // 1480
)
```

## ap - safe and concurent IO operations - Code that never fails

```js
const { Task, Either, prop, compose, trace, map, fold, chain, ap } = require('ramda-x')
const request = require('request')

const url1 = 'https://jsonplaceholder.typicode.com/posts/4'
const url2 = 'https://jsonplaceholder.typicode.com/posts/2'

const e = e => 'error'
const identity = x => x
const getTitle = o => Either.fromNullable(o.title).fold(e, identity)
const getId = o => Either.fromNullable(o.id).fold(e, identity)

const reportHeader = p1 => p2 =>
    `Report: ${p1.fold(e, body => getTitle(body))} compared to ${p2.fold(e, body => getTitle(body))}`

const reportId = p1 => p2 =>
    `Report: ${p1.fold(e, body => getId(body))} compared to ${p2.fold(e, body => getId(body))}`

const parse = Either.try(JSON.parse)

const httpGet = url =>
    Task((reject, resolve) =>
        request(url, (err, response, body) =>
            err ? reject(err) : resolve(parse(body)))
    )

const res = compose(
    ap(httpGet(url2)),
    ap(httpGet(url1)),
    Task.of
)


res(reportHeader).fork(err => 'error', data => console.log(data))
// Report: eum et est occaecati compared to qui est esse

res(reportId).fork(err => 'error', data => console.log(data))
// Report: 4 compared to 2


```

## ap Redux - concurrent IO operations - Code that never fails

```js
const { Task, Either, prop, compose, trace, map, fold, chain, ap } = require('ramda-x')
const request = require('request')

const update = msg => model =>
    msg.type === 'UPDATE'
        ? { ...model, report: msg.payload }
        : msg.type === 'ERROR'
            ? { ...model, error: msg.error }
            : model

const dispatch = msg => {
    let model = {}
    model = update(msg)(model)
    reportHeader(model)
    console.log('UPDATED MODEL', model)
}

const updateModelMsg = payload => ({ type: 'UPDATE', payload })
const updateModelErrorMsg = error => ({ type: 'ERROR', error })


const url1 = 'https://jsonplaceholder.typicode.com/posts/4'
const url2 = 'https://jsonplaceholder.typicode.com/posts/2'

const e = () => dispatch(updateModelErrorMsg('value not found'))
const identity = x => x
const getTitle = o => Either.fromNullable(o.title)
const getId = o => Either.fromNullable(o.id)

const reportHeader = p1 => p2 =>
    `Report: ${p1.chain(getTitle).fold(e, identity)} compared to ${p2.chain(getTitle).fold(e, identity)}`

const reportId = p1 => p2 =>
    `Report: ${p1.chain(getId).fold(e, identity)} compared to ${p2.chain(getId).fold(e, identity)}`

const parse = Either.try(JSON.parse)

const httpGet = url =>
    Task((reject, resolve) =>
        request(url, (err, response, body) =>
            err ? reject(err) : resolve(parse(body)))
    )

const res = compose(
    ap(httpGet(url2)),
    ap(httpGet(url1)),
    Task.of
)


res(reportHeader).fork(err => dispatch(updateModelErrorMsg(err)), data => dispatch(updateModelMsg(data)))
res(reportId).fork(err => 'error', data => dispatch(updateModelMsg(data)))
// UPDATED MODEL { report: 'Report: 4 compared to 2' }
// UPDATED MODEL { report: 'Report: eum et est occaecati compared to qui est esse' }
``` 


## safe I/O Operations with Parsing - Code that never fails

```js
const { Task, Either, prop, compose, trace, map, fold, chain, ap, fork } = require('ramda-x')
const fs = require('fs')

const readFile = enc => file =>
    Task((reject, resolve) =>
        fs.readFile(file, enc, (err, content) =>
            err ? reject(err) : resolve(content)
        )
    )

const writeFile = file => content =>
    Task((reject, resolve) =>
        fs.writeFile(file, content, (err, success) =>
            err ? reject(err) : resolve('success')
        )
    )

const writeToConfigTwo = writeFile('config2.json')

const parse = Either.try(JSON.parse)
const stringify = Either.try(JSON.stringify)

const getProperty = b =>
    Task.of(c => Either.fromNullable(c.port)).ap(b)

const eitherToTask = e =>
    e.fold(Task.rejected, Task.of)

const error = e => console.log('from error:', e)
const success = c => console.log('from success', c)

const transformation = compose(
    fork(error)(success),
    chain(writeToConfigTwo), // Task(Task(value)) -> Task(value) 
    chain(eitherToTask), // Task(Right(value)) -> Task(Task(value)) -> Task(value)
    map(stringify), // returns: Task(Right(value))
    chain(eitherToTask), // Task(Right(value)) -> Task(Task(value)) -> Task(value)
    getProperty, // returns:  Task(Right(value))
    chain(eitherToTask), // Task(Right(value)) -> Task(Task(value)) -> Task(value)
    map(parse), // returns: Task(Right(value))
    readFile('utf-8') // returns: Task(value)
)

transformation('configs.json')
```

## Traversable with Lists

```js
const { Task } = require('ramda-x')
const fs = require('fs')


const readFile = file =>
    Task((reject, resolve) =>
        fs.readFile(file, 'utf-8', (err, content) =>
            err ? reject(err) : resolve(content)))


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


const files = List(['config.json', 'config2.json'])


files.traverse(Task.of, fn => readFile(fn)).fork(console.error, x => x.map(x => x + '!!!').fold(x => x))
``´

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

## Either - Instead of If/Else + Composition
```js
const { Task, Either, prop, compose, trace, map, fold, chain } = require('ramda-x')
const { fromNullable, Right, Left } = Either

const dispatch = x => console.log('action was dispatched', x)
const getItem = o => prop('item', o)

const someAction2 = dispatch => data =>
    compose(
        fold(e => 'comes from the err function', x => x),
        map(item => item),
        map(item => item + 2),
        chain(item => fromNullable(prop('item3', item))),
        fromNullable
    )(data)

const toUpperCase = str => str.toUpperCase()

const someAction3 = dispatch => data =>
    compose(
        toUpperCase,
        getItem
    )(data)

const prepeareAction = someAction2(dispatch)
const prepareNewAction = someAction3(dispatch)

prepeareAction(null) // comes from the err function -> the application runs without exiting
prepareNewAction(null) // TypeError: Cannot read property 'item' of null


```
## deepFreeze Examples - Immutable data

```js
const expect = require('expect')
const deepFreeze = require('./node_modules/deep-freeze')


const addCounter = list =>
    [...list, 0]


const removeCounter = list => index =>
    [
        ...list.slice(0, index),
        ...list.slice(index + 1)
    ]

const incrementCounter = list => index =>
    [
        ...list.slice(0, index),
        list[index] + 1,
        ...list.slice(index + 1)
    ]


const testAddCounter = before => after =>
    expect(
        addCounter(deepFreeze(before)) // deepFreeze makes the value immutable
    ).toEqual(after)


testAddCounter([])([0])

const testRemoveCounter = before => after =>
    expect(
        removeCounter(deepFreeze(before))(1)
    ).toEqual(after)

testRemoveCounter([0, 10, 20])([0, 20])

const testIncrementCounter = before => after =>
    expect(
        incrementCounter(deepFreeze(before))(1) // deepFreeze makes the value immutable
    ).toEqual(after)


testIncrementCounter([0, 10, 20])([0, 11, 20])
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




