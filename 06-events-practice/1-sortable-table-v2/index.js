export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
    this.addEventListeners();
  }

  // Рендер компонента
  render() {
    const element = document.createElement('div');
    element.innerHTML = this.createTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    if (!this.data.length) {
      this.element.classList.add('sortable-table_empty');
      this.subElements.body.innerHTML = null;
    }
  }

  // Добавление обработчиков событий
  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', event => {
      // Получаем ближайшего предка, соответствующего селектору
      const target = event.target.closest('div');

      // Если сортирока по полю запрещена, то завершаем событие
      if (target.dataset.sortable === 'false') {
        return;
      }

      // Переключение направления сортировки
      const order = target.dataset.order === 'asc' ? 'desc' : 'asc';

      // Назначение dataset и добавления элемента "arrow" для ячейки заголовка таблицы
      this.setHeaderCellDatasetOrder(target.dataset.id, order);

      // Сортировка данных
      this.sort(target.dataset.id, order);
    });
  }

  // Создание шаблона
  createTemplate() {
    // Первоначальная сортировка данных
    const sortedData = this.sortData(this.sorted.id, this.sorted.order);

    return `
      <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
              ${ this.createTableHeaderCell() }
          </div>
          <div data-element="body" class="sortable-table__body">
              ${ this.createTableBodyRow(sortedData) }
          </div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
              <span style="margin: 10px 0;">Нет данных</span>
          </div>
      </div>
    `;
  }

  // Генерация Header -> Cell
  createTableHeaderCell() {
    return this.headerConfig
      .map(item => {
        const isInitialSortField = this.sorted.id === item.id;
        return `
          <div
            class="sortable-table__cell"
            data-id="${item.id}"
            data-sortable="${item.sortable}"
            data-order="${isInitialSortField ? this.sorted.order : 'asc' }"
          >
              <span>${item.title}</span>
              ${isInitialSortField ? this.createSortedArrow() : '' }
          </div>
        `;
      })
      .join('');
  }

  // Генерация Body -> Row
  createTableBodyRow(data) {
    return data
      .map(item => {
        return `
          <a href="#" class="sortable-table__row">
              ${this.createTableBodyCell(item)}
          </a>
        `;
      })
      .join('');
  }

  // Генерация Body -> Cell
  createTableBodyCell(dataItem) {
    return this.headerConfig
      .map(item => {
        return item.template !== undefined
          ? item.template(dataItem.images)
          : `<div class="sortable-table__cell">${dataItem[item.id]}</div>`;
      })
      .join('');
  }

  // Генерация SortedArrow
  createSortedArrow() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
      </span>`;
  }

  // Установка DatasetOrder и SortedArrow
  setHeaderCellDatasetOrder(field, order) {
    // Получение элементов
    const cells = this.subElements.header.querySelectorAll(`.sortable-table__cell`);

    for (const cell of cells) {
      if (cell.dataset.id === field) {
        cell.dataset.order = order;
        cell.append(this.subElements.arrow);
      } else {
        cell.dataset.order = 'acs';
      }
    }
  }

  // Получение дочерних элементов компонента
  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  // Сортировка и рендер новых данных
  sort(fieldValue, orderValue) {
    // Сортируем данные
    const sortedData = this.sortData(fieldValue, orderValue);

    // Генерация отсортированных данных в тело таблицы
    this.subElements.body.innerHTML = this.createTableBodyRow(sortedData);
  }

  // Сортивка данных
  sortData(field, order) {
    // Получение объекта конфигурации
    const column = this.headerConfig.find(item => item.id === field);

    // Функция сортировки чисел
    function sortNumber(a, b) {
      if (order === 'asc') {
        return a > b ? 1 : -1;
      }
      if (order === 'desc') {
        return a > b ? -1 : 1;
      }
    }

    // Функция сортировки строк
    function sortStrings(a, b) {
      if (order === 'asc') {
        return a.localeCompare(b, ['ru', 'en'], { caseFirst: 'upper' });
      }
      if (order === 'desc') {
        return b.localeCompare(a, ['ru', 'en'], { caseFirst: 'upper' });
      }
    }

    // Функция сортировки даты
    function sortDate(a, b) {
      if (order === 'asc') {
        return new Date(a) > new Date(b) ? 1 : -1;
      }
      if (order === 'desc') {
        return new Date(a) > new Date(b) ? -1 : 1;
      }
    }

    // Сортировка данных
    return [...this.data].sort((a, b) => {
      if (column.sortType === 'string') {
        return sortStrings(a[field], b[field]);
      }
      if (column.sortType === 'number') {
        return sortNumber(a[field], b[field]);
      }
      if (column.sortType === 'date') {
        return sortDate(a[field], b[field]);
      }
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.subElements = {};
    this.remove();
  }
}
