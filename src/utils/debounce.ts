import { isPlainObject } from '@/utils/tools'

const nativeMax = Math.max
const nativeMin = Math.min

/**
 * 防抖
 */
interface DebounceOptions {
  delay: number
  maxWait?: number
  leading?: boolean
  trailing?: boolean
}
/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
export function debounce<T extends Function>(options: DebounceOptions, func: T): DebouncedFunction {
  let lastArgs: unknown[] | undefined
  let lastThis: any
  let maxWait: number
  let result: unknown
  let timerId: ReturnType<typeof setTimeout> | undefined
  let lastCallTime: number | undefined
  let lastInvokeTime: number = 0
  let leading: boolean = false
  let maxing: boolean = false
  let trailing: boolean = true

  const wait = options.delay || 0
  if (isPlainObject(options)) {
    leading = !!options.leading
    maxing = 'maxWait' in options
    maxWait = maxing ? nativeMax(options.maxWait || 0, wait) : 0
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }

  function invokeFunc(time: number) {
    const args = lastArgs
    const thisArg = lastThis
    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args!)
    return result
  }

  function leadingEdge(time: number) {
    lastInvokeTime = time
    timerId = setTimeout(timerExpired, wait)
    return leading ? invokeFunc(time) : result
  }

  function remainingWait(time: number) {
    const timeSinceLastCall = time - lastCallTime!
    const timeSinceLastInvoke = time - lastInvokeTime
    const result = wait - timeSinceLastCall

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - lastCallTime!
    const timeSinceLastInvoke = time - lastInvokeTime
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= maxWait)
    )
  }

  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) return trailingEdge(time)
    timerId = setTimeout(timerExpired, remainingWait(time))
  }

  function trailingEdge(time: number) {
    timerId = undefined

    if (trailing && lastArgs) return invokeFunc(time)

    lastArgs = lastThis = undefined
    return result
  }

  function cancel() {
    if (timerId !== undefined) clearTimeout(timerId)

    lastInvokeTime = 0
    lastArgs = lastCallTime = lastThis = timerId = undefined
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now())
  }

  function debounced(this: any, ...cargs: unknown[]) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = cargs

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timerId === undefined) return leadingEdge(lastCallTime)

      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait)
        return invokeFunc(lastCallTime)
      }
    }
    if (timerId === undefined) timerId = setTimeout(timerExpired, wait)

    return result
  }
  debounced.cancel = cancel
  debounced.flush = flush
  return debounced
}

export type DebouncedFunction = {
  (...args: any[]): any
  flush: () => void
  cancel: () => void
}
// /**
//  * 防抖
//  * @param fn
//  * @param timeout
//  */
// export function debounce<T extends Function>(fn: T, timeout: number = 300) {
//   let timer: number | undefined
//
//   let lastArgs: unknown[] | undefined
//   let lastThis: any
//
//   let lastNow: number | undefined
//
//   function fire(force: boolean) {
//     const now = Date.now()
//
//     const scheduledDiff = force ? 0 : lastNow! + timeout - now
//
//     if (scheduledDiff > 0) {
//       return schedule(scheduledDiff)
//     }
//
//     fn.apply(lastThis, lastArgs)
//
//     clear()
//   }
//
//   function schedule(timeout: number) {
//     timer = setTimeout(fire, timeout) as number
//   }
//
//   function clear() {
//     if (timer) {
//       clearTimeout(timer)
//     }
//
//     timer = lastNow = lastArgs = lastThis = undefined
//   }
//
//   function flush() {
//     if (timer) {
//       fire(true)
//     }
//
//     clear()
//   }
//
//   /**
//    * @type { DebouncedFunction }
//    */
//   function callback(...args: unknown[]) {
//     lastNow = Date.now()
//
//     lastArgs = args
//
//     // eslint-disable-next-line @typescript-eslint/no-this-alias
//     lastThis = this
//
//     if (!timer) {
//       schedule(timeout)
//     }
//   }
//
//   callback.flush = flush
//   callback.cancel = clear
//
//   return callback
// }
