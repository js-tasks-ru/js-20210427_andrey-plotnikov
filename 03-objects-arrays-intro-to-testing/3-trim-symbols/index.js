/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  // Если длина string равна 0 или size равен 0, то возвращаем пустую строку
  if (!string.length || size === 0) {
    return '';
  }

  // Если параметр size не был указан, то возвращаем исходную строку
  if (size == null) {
    return string;
  }

  // Инициализируем счётчик
  let i = 1;

  // Преобразуем строку в массив, перебираем его и конвертируем обратно в строку
  return [...string]
    .reduce((result, currentValue) => {
      // Предыдущее значение
      const previousValue = result[result.length - 1];
      // Если предыдущий значение не равно текущему,
      // то добавляем его массив и сбрасываем счетчик
      if (previousValue !== currentValue) {
        result.push(currentValue);
        i = 1;
      }
      // Если предыдущее значение равно текущему и счётчик не равен size,
      // то добавляем его массив и увеличиваем счетчик
      if (previousValue === currentValue && i !== size) {
        result.push(currentValue);
        i++;
      }
      return result;
    }, [])
    .join('');
}
