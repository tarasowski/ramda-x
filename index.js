const { Either } = require('./src/index')




Either.of(null).map(x => x).chain(x => x * 2).fold(e => console.log('from error'), x => console.log(x))