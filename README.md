# Ramda X

Ramda X is a super small API with only 10 most important methods for functional programming. Original Ramda library is too big and abstracts almost everything away from the JavaScript language. That's why Ramda X uses the most important methods and leaves everything as it is. All implemented methods are auto-curried!!!


### Implemented API methods:

- **I.** curry()
- **II.** compose()
- **III.** pipe()
- **IV.** map() -> works only on lists
- **V.** filter() -> works only on lists
- **VI.** prop() -> works only on objects `prop('name')({name: 'Dimitri', location: 'Berlin'})`
- **VII.** propEq() // works only on object `propEq('location', 'Berlin')`

### Methods on the waiting list:
- **VIII.** n/a
- **IX.** reduce()
- **X.** n/a

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
````





