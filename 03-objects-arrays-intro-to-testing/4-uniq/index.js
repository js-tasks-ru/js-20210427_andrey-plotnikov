/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  // Создаем объект Set, для удаления повторяющихся значений
  // Преобразуем полученый объект в массив и возвращаем результат
  return [...new Set(arr)];
}
