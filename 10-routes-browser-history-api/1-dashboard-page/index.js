import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  components = {};
  subElements = {};

  // Обработчик на изменение даты в rangePicker
  handlerDateSelect = event => {
    const { from, to } = event.detail;

    // noinspection JSIgnoredPromiseFromCall
    this.updateComponents(from, to);
  };

  constructor() {
    this.urlBestsellers = new URL('/api/dashboard/bestsellers', BACKEND_URL);
  }

  // Рендер
  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const components = this.initComponents();
    this.renderComponents(components);
    this.components = components;

    this.addEventListeners();

    return this.element;
  }

  // Инициализация копонентов
  initComponents() {
    // Период
    const date = new Date();
    const period = {
      from: new Date(date.setMonth(date.getMonth() - 1)),
      to: new Date()
    };

    // URL для получения данных в таблице "Лидеры продаж"
    this.urlBestsellers.searchParams.set('from', period.from.toISOString());
    this.urlBestsellers.searchParams.set('to', period.to.toISOString());

    // Компоненты
    const rangePicker = new RangePicker(period);

    const sortableTable = new SortableTable(header, {
      url: this.urlBestsellers,
      isSortLocally: true
    });

    const ordersChart = new ColumnChart({
      label: 'orders',
      link: '#',
      url: 'api/dashboard/orders',
      range: period
    });
    ordersChart.element.classList.add('dashboard__chart_orders');

    const salesChart = new ColumnChart({
      label: 'sales',
      formatHeading: data => `$${data}`,
      url: 'api/dashboard/sales',
      range: period
    });
    salesChart.element.classList.add('dashboard__chart_sales');

    const customersChart = new ColumnChart({
      label: 'customers',
      url: 'api/dashboard/customers',
      range: period
    });
    customersChart.element.classList.add('dashboard__chart_customers');

    return {
      rangePicker,
      sortableTable,
      ordersChart,
      salesChart,
      customersChart
    };
  }

  // Рендер компонентов
  renderComponents(components) {
    const keysComponents = Object.keys(components);

    keysComponents.forEach(component => {
      const root = this.subElements[component];
      const { element } = components[component];

      root.append(element);
    });
  }

  // Обновление компонентов
  async updateComponents(from, to) {
    const { sortableTable, ordersChart, salesChart, customersChart } = this.components;

    const data = await this.fetchSortableTableData(from, to);

    sortableTable.addRows(data);
    ordersChart.update(from, to);
    salesChart.update(from, to);
    customersChart.update(from, to);
  }

  // Добавление обработчиков событий
  addEventListeners() {
    const { rangePicker } = this.components;

    rangePicker.element.addEventListener('date-select', this.handlerDateSelect);
  }

  // Получение данных для талицы "Лидеры продаж"
  async fetchSortableTableData(from, to) {
    this.urlBestsellers.searchParams.set('from', from.toISOString());
    this.urlBestsellers.searchParams.set('to', to.toISOString());

    return await fetchJson(this.urlBestsellers);
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

  // Получение шаблона страницы
  getTemplate() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div class="dashboard__charts">
          <div data-element="ordersChart"></div>
          <div data-element="salesChart"></div>
          <div data-element="customersChart"></div>
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable"></div>
      </div>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
