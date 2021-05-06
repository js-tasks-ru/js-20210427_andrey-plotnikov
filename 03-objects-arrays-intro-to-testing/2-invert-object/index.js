/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  // Если объект не передан, то возвращаем undefined
  if (obj === undefined) {
    return;
  }

  // Инициализируем объект, для хранения результа преобразования
  const result = {};
  // Преобразование объекта в Map
  let map = new Map(Object.entries(obj));

  // Перебираем Мap и заполняем объект ивертируя ключи и значения
  map.forEach((value, key) => {
    result[value] = key;
  });

  // Возврат результата
  return result;
}
