
export const isPromise = (p) => {
  if (typeof p === 'object' && typeof p.then === 'function') {
    return true;
  }
  return false;
}

export const round = (num, decimal = 1) => {
  if (decimal === 0) {
    return Math.round(num)
  }
  const multiplier = Math.pow(10, -Math.log10(decimal))
  return Math.round(num * multiplier) / multiplier
}

export const getAssetFromSymbol = (symbol) => {
  const parts = symbol.split('-')
  if (parts.length == 1) {
    return parts[0].slice(0, 3).toUpperCase()
  } else if (parts.length >= 2) {
    return parts[0].toUpperCase()
  }
}

export const getPriceLimits = (indexPrice, ratio = 3) => {
  // return [indexPrice / ratio, indexPrice * ratio]
  return [0, indexPrice * ratio]
}


export const getPriceRange = (indexPrice, ratio = 2, partsNum = 100) => {
  let res = []
  const [min, max] = getPriceLimits(indexPrice, ratio)
  const step = (max - min) / partsNum
  res.push(min)
  for (let i = 1; i < partsNum; i++) {
    res.push(min + i * step)
  }
  res.push(max)
  return res
}

export const getPriceStep = (indexPrice) => {
  return indexPrice > 50000 ? 500 :
    indexPrice > 40000 ? 200 :
      indexPrice > 30000 ? 200 :
        indexPrice > 20000 ? 100 :
          indexPrice > 10000 ? 100 :
            indexPrice > 9000 ? 90 :
              indexPrice > 8000 ? 80 :
                indexPrice > 7000 ? 70 :
                  indexPrice > 6000 ? 60 :
                    indexPrice > 5000 ? 50 :
                      indexPrice > 4000 ? 40 :
                        indexPrice > 3000 ? 30 :
                          indexPrice > 2000 ? 20 :
                            indexPrice > 1000 ? 10 :
                              indexPrice > 900 ? 9 :
                                indexPrice > 800 ? 8 :
                                  indexPrice > 700 ? 7 :
                                    indexPrice > 600 ? 6 :
                                      indexPrice > 500 ? 5 :
                                        indexPrice > 400 ? 4 :
                                          indexPrice > 300 ? 3 :
                                            indexPrice > 200 ? 2 : 1

}

export const getPriceRangeWithRound = (indexPrice, ratio = 2) => {
  const step = getPriceStep(indexPrice)
  let res = []
  const [min, max] = getPriceLimits(indexPrice, ratio)
  const partsNum = round(max / step);
  res.push(min)
  for (let i = 1; i <= partsNum; i++) {
    res.push(min + i * step)
  }
  res.push(max)
  return res
}

export const toFixed = (num, decimal = 2) => {
  if (typeof num == 'number') {
    return parseFloat(num).toFixed(decimal)
  } else {
    console.log(`cannot use tofixed() for type ${typeof num}`)
    return num
  }
}

