/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  // Копирование входящего объекта
  const objCopy = { ...obj };
  // Удаление свойств из объекта
  fields.forEach(prop => {
    delete objCopy[prop];
  });
  // Возврат результата
  return objCopy;
};
