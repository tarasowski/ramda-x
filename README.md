# Ramda X

Ramda X is a super small API with only 10 most important methods for functional programming. Original Ramda library is too big and abstracts almost everything away from the JavaScript language. That's why Ramda X uses the most important methods and leaves everything as it is. All implemented methods are auto-curried!!!


### Implemented API methods:

- **I.** curry()
- **II.** compose()
- **III.** pipe()
- **IV.** map() -> works only on lists
- **V.** filter() -> works only on lists
- **VI.** pluck() -> works only on lists `pluck('name')([{name: 'Dimitri', location: 'Berlin'}])`
- **VII.** prop() -> works only on objects `prop('name')({name: 'Dimitri', location: 'Berlin'})`
- **VIII.** propEq() // works only on object `propEq('location', 'Berlin')`

### Methods on the waiting list:
- **IX.** reduce()
- **X.** n/a

### Additional methods for debugging Ramda X

- trace() -> can be used to debug compose/pipe `trace('label')(value)`

If you want the full suite, just use the original [Ramda](https://ramdajs.com). 





