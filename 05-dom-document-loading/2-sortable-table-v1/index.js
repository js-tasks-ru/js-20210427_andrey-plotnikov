export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig = [], {
    data = []
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
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

  // Создание шаблона
  createTemplate() {
    return `
      <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
              ${this.createTableHeaderCell()}
          </div>
          <div data-element="body" class="sortable-table__body">
              ${this.createTableBodyRow(this.data)}
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
        return `
          <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
              <span>${item.title}</span>
              <span class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
              </span>
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

  // Установка DatasetOrder
  setHeaderCellDatasetOrder(field, order) {
    // Получение элементов
    const cells = this.subElements.header.querySelectorAll(`.sortable-table__cell`);

    for (const cell of cells) {
      if (cell.dataset.id === field) {
        cell.dataset.order = order;
      } else {
        delete cell.dataset.order;
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

  // Сортивка данных по ключу
  sort(fieldValue, orderValue) {
    // Получение объекта конфигурации
    const field = this.headerConfig.find(item => item.id === fieldValue);

    // Назначение dataset ячейки заголовка таблицы
    this.setHeaderCellDatasetOrder(fieldValue, orderValue);

    // Функция сортировки чисел
    function sortNumber(a, b) {
      if (orderValue === 'asc') {
        return a > b ? 1 : -1;
      }
      if (orderValue === 'desc') {
        return a > b ? -1 : 1;
      }
    }

    // Функция сортировки строк
    function sortStrings(a, b) {
      if (orderValue === 'asc') {
        return a.localeCompare(b, ['ru', 'en'], { caseFirst: 'upper' });
      }
      if (orderValue === 'desc') {
        return b.localeCompare(a, ['ru', 'en'], { caseFirst: 'upper' });
      }
    }

    // Функция сортировки даты
    function sortDate(a, b) {
      if (orderValue === 'asc') {
        return new Date(a) > new Date(b) ? 1 : -1;
      }
      if (orderValue === 'desc') {
        return new Date(a) > new Date(b) ? -1 : 1;
      }
    }

    // Сортировка данных
    const sortedData = [...this.data].sort((a, b) => {
      if (field.sortType.toLowerCase() === 'string') {
        return sortStrings(a[fieldValue], b[fieldValue]);
      }
      if (field.sortType.toLowerCase() === 'number') {
        return sortNumber(a[fieldValue], b[fieldValue]);
      }
      if (field.sortType.toLowerCase() === 'date') {
        return sortDate(a[fieldValue], b[fieldValue]);
      }
    });

    // Генерация отсортированных данных в тело таблицы
    this.subElements.body.innerHTML = this.createTableBodyRow(sortedData);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.subElements = {};
    this.remove();
  }
}

