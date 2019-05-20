export const promiseSerial = (funcs:Array<any>) => 
  funcs.reduce((promise:Promise<any>, func) => 
    promise.then(result => func().then(Array.prototype.concat.bind(result))),
    Promise.resolve([]))
