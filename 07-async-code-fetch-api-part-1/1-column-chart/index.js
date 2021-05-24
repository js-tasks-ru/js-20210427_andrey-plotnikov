import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  // Данные для графика
  chartData = {};
  // Фиксированная высота колонок графика
  chartHeight = 50;
  // Дочерние элементы
  subElements = {};

  constructor({
    url = '',
    range = {},
    label = '',
    link = '',
    formatHeading = data => data
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    // noinspection JSIgnoredPromiseFromCall
    this.render();
  }

  // Создание шаблона компонента
  getTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
          <div class="column-chart__title">
              Total ${this.label}
              ${this.getLink()}
          </div>
          <div class="column-chart__container">
              <div data-element="header" class="column-chart__header"></div>
              <div data-element="body" class="column-chart__chart"></div>
          </div>
      </div>
    `;
  }

  // Генерация колонок графика
  getChartColumns(data) {
    const arr = Object.values(data);
    const maxValue = Math.max.apply(null, arr);

    return arr
      .map(item => {
        const scale = this.chartHeight / maxValue;
        const value = Math.floor(item * scale);
        const percent = (item / maxValue * 100).toFixed(0) + '%';

        return `<div style='--value: ${value}' data-tooltip='${percent}'></div>`;
      })
      .join('');
  }

  // Получение суммарного
  getTotalValues(data) {
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    const sumValues = Object.values(data).reduce(reducer);

    return this.formatHeading(sumValues.toLocaleString());
  }

  // Создание ссылки
  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : '';
  }

  // Отрисовка графика
  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.chartData = await this.update(this.range.from, this.range.to);
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

  // Получение и обновление данных
  async update(dateStart, dateFinish) {
    // Устанавливаем параметры URL
    this.url.searchParams.set('from', dateStart.toISOString());
    this.url.searchParams.set('to', dateFinish.toISOString());

    // Статус загрузки: старт
    this.chartData = {};
    this.element.classList.add('column-chart_loading');

    // Получаем данные
    const data = await fetchJson(this.url);

    // Статус загрузки: завершена
    this.subElements.header.innerHTML = this.getTotalValues(data);
    this.subElements.body.innerHTML = this.getChartColumns(data);
    this.element.classList.remove('column-chart_loading');

    return data;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.chartData = {};
    this.chartHeight = 50;
    this.subElements = {};
    this.remove();
  }
}
