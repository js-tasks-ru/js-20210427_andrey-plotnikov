import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  isLoading = false;
  itemsPerPage = 15;
  urlParams = {
    _sort: 'title',
    _order: 'asc',
    _start: 0,
    _end: this.itemsPerPage
  };

  onSortClick = event => {
    const target = event.target.closest('[data-sortable="true"]');

    if (target) {
      const { id, order } = target.dataset;
      const newOrder = order === 'asc' ? 'desc' : 'asc';
      const arrow = target.querySelector('sortable-table__sort-arrow');

      target.dataset.order = newOrder;

      if (!this.subElements.arrow) {
        this.subElements.arrow = this.renderSortedArrow();
      }

      if (!arrow) {
        target.append(this.subElements.arrow);
      }

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        // noinspection JSIgnoredPromiseFromCall
        this.sortOnServer(id, newOrder);
      }
    }
  };

  onLoadScroll = async () => {
    const windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;

    if (!this.isLoading && windowRelativeBottom === document.documentElement.clientHeight) {
      this.urlParams._start += this.itemsPerPage;
      this.urlParams._end += this.itemsPerPage;

      const data = await this.fetchData();
      this.data = [...this.data, ...data];

      this.subElements.body.insertAdjacentHTML('beforeend', this.createTableBodyRow(data));
    }
  };

  constructor(headerConfig = [], {
    url = '',
    isSortLocally = false,
    sorted = {}
  } = {}) {
    this.headerConfig = headerConfig;
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;

    // noinspection JSIgnoredPromiseFromCall
    this.render();
  }

  // Рендер компонента
  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.createTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    if (this.sorted) {
      this.urlParams._sort = this.sorted.id;
      this.urlParams._order = this.sorted.order;
    }

    this.data = await this.fetchData();
    this.subElements.body.innerHTML = this.createTableBodyRow(this.data);

    this.addEventListeners();
  }

  // Добавление обработчиков событий
  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    document.addEventListener('scroll', this.onLoadScroll);
  }

  // Создание шаблона
  createTemplate() {
    return `
      <div class="sortable-table sortable-table_loading">
          <div data-element="header" class="sortable-table__header sortable-table__row">
              ${ this.createTableHeaderCell() }
          </div>
          <div data-element="body" class="sortable-table__body"></div>
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
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
        const order = this.sorted.id === item.id ? this.sorted.order : 'asc';

        return `
          <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="${order}">
              <span>${item.title}</span>
              ${isInitialSortField ? this.createSortedArrow() : '' }
          </div>
        `;
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

  // Рендер SortedArrow
  renderSortedArrow() {
    const element = document.createElement('div');
    element.innerHTML = this.createSortedArrow();
    return element.firstElementChild;
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

  // Получение данных
  async fetchData() {
    // Устанавливаем параметры URL
    this.url.searchParams.set('_sort', String(this.urlParams._sort));
    this.url.searchParams.set('_order', String(this.urlParams._order));
    this.url.searchParams.set('_start', String(this.urlParams._start));
    this.url.searchParams.set('_end', String(this.urlParams._end));

    // Статус загрузки: старт
    this.isLoading = true;
    this.element.classList.add('sortable-table_loading');

    // Получаем данные
    const data = await fetchJson(this.url);

    // Статус загрузки: завершена
    this.isLoading = false;
    this.element.classList.remove('sortable-table_loading');

    return data;
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

  // Сортировка на стороне клиента
  sortOnClient (id, order) {
    // Устанавливаем параметры URL
    this.urlParams._sort = id;
    this.urlParams._order = order;

    // Сортируем данные
    const sortedData = this.sortData(id, order);

    // Генерация отсортированных данных в тело таблицы
    this.subElements.body.innerHTML = this.createTableBodyRow(sortedData);
  }

  // Сортировка на стороне сервера
  async sortOnServer (id, order) {
    // Удаляем строки из таблицы
    this.subElements.body.innerHTML = null;

    // Устанавливаем параметры URL
    this.urlParams._sort = id;
    this.urlParams._order = order;
    this.urlParams._start = 0;
    this.urlParams._end = this.itemsPerPage;


    // Получаем данные и производим рендер
    this.data = await this.fetchData();
    this.subElements.body.innerHTML = this.createTableBodyRow(this.data);
  }

  remove() {
    if (this.element) {
      document.removeEventListener('scroll', this.onLoadScroll);
      this.element.remove();
      this.element = null;
    }
  }

  destroy() {
    this.subElements = {};
    this.data = [];
    this.isLoading = false;
    this.itemsPerPage = 15;
    this.urlParams = {
      _sort: 'title',
      _order: 'asc',
      _start: 0,
      _end: this.itemsPerPage
    };
    this.remove();
  }
}
