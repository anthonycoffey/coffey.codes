import '@testing-library/jest-dom'

const filterMessage = (msg: string) =>
  msg.includes('is using incorrect casing') ||
  msg.includes('is unrecognized in this browser') ||
  msg.includes('React does not recognize the') ||
  msg.includes('for a non-boolean attribute') ||
  msg.includes('Unknown event handler property')

const originalConsoleError = console.error
console.error = (...args) => {
  const fullMsg = args.map((a) => (typeof a === 'string' ? a : String(a))).join(' ')
  if (filterMessage(fullMsg)) return
  originalConsoleError(...args)
}

const originalConsoleWarn = console.warn
console.warn = (...args) => {
  const fullMsg = args.map((a) => (typeof a === 'string' ? a : String(a))).join(' ')
  if (filterMessage(fullMsg)) return
  originalConsoleWarn(...args)
}

