/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  // Получаем массив свойств из аргумента "path"
  const props = path.split('.');

  return function (obj) {
    // Иницаилизируем объект, для хранения результа
    let result = obj;

    // Перебираем массив свойств для доступа к свойствам объекта
    for (const item of props) {
      // Если свойство существует в объекте, ту мутируем "result"
      if (item in result) {
        result = result[item];
      // Иначе записываем "undefined" и выходим из цикла
      } else {
        result = undefined;
        break;
      }
    }

    // Возвращаем результат
    return result;
  };
}

// Второй вариант решения задачи, с помощью reduce
function createGetterVariant2(path) {
  return (obj) => path.split('.')
    .reduce((result, field) => {
      return result !== undefined && result[field] !== undefined
        ? result[field]
        : undefined;
    }, obj);
}
