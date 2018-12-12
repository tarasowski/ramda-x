const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x)

const freezeObject = o =>
    Object.freeze(o)

const freezeProperties = o =>
    Object.getOwnPropertyNames(o).forEach(prop =>
        o.hasOwnProperty(prop) && o[prop] !== null && (typeof o[prop] === 'object' || typeof o[prop] === 'function') && !Object.isFrozen(o[prop])
            ? deepFreeze(o[prop])
            : o
    )

const deepFreeze = o =>
    compose(freezeProperties, freezeObject)(o)


module.exports = deepFreeze
