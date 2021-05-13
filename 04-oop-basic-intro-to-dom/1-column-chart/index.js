export default class ColumnChart {
  // Фиксированная высота колонок графика
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = data => data
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;

    this.render();
  }

  // Создание шаблона компонента
  createTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: this.chartHeight">
          <div class="column-chart__title">
              Total ${this.label}
              ${this.createLink()}
          </div>
              <div class="column-chart__container">
              <div class="column-chart__header">
                  ${this.formatHeading(this.value.toLocaleString())}
              </div>
              <div class="column-chart__chart">
                  ${this.createChartColumns(this.data)}
              </div>
          </div>
      </div>
    `;
  }

  // Генерация колонок графика
  createChartColumns(data) {
    const maxValue = Math.max(...data);

    return data
      .map(item => {
        const scale = this.chartHeight / maxValue;
        const value = Math.floor(item * scale);
        const percent = (item / maxValue * 100).toFixed(0) + '%';

        return `<div style='--value: ${value}' data-tooltip='${percent}' title="${item}"></div>`;
      })
      .join('');
  }

  // Создание ссылки
  createLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : '';
  }

  // Отрисовка графика
  render() {
    const element = document.createElement('div');
    element.innerHTML = this.createTemplate();
    this.element = element.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }
}

  // Обновление данных графика
  update(data) {
    const chartColumns = this.element.querySelector('.column-chart__chart');
    chartColumns.innerHTML = this.createChartColumns(data);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
