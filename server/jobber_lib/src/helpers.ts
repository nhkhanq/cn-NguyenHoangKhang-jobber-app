export function firstLetterUppercase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function lowerCase(str: string): string {
  return str.toLowerCase()
}

export const toUpperCase = (str: string): string => str.toUpperCase()

export function isEmail(email: string): boolean {
  const regexExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regexExp.test(email)
}

export function isDataURL(value: string): boolean {
  const dataUrlRegex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\\/?%\s]*)\s*$/i;
  return dataUrlRegex.test(value)
}
