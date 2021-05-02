/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  // Интернационализация
  const collator = new Intl.Collator(
    ['ru', 'en-GB', 'en-US'],
    {
      sensitivity: 'variant',
      caseFirst: param === 'desc' ? 'lower' : 'upper'
    }
  );
  // Создаем копию массива и сортируем его
  return arr.slice().sort((a, b) => {
    return param === 'desc'
      ? collator.compare(b, a)
      : collator.compare(a, b);
  });
}
