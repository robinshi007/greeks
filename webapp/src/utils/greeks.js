export const sum = (a, b) => a + b

export const getStrikeOptionTypeStr = (i) => {
  return `${i.strike}-${i.option_type == 'call' ? 'C' : i.option_type == 'put' ? 'P' : ''}`
}

