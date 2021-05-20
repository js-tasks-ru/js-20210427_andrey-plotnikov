export default class Tooltip {
  // ссылка на экземпляр Синглтона
  static instance;

  // Обработчик когда указатель входит в границы элемента обрабатываемого события
  handlerPointerOver = (event) => {
    // Получаем элемент с селектором [data-tooltip]
    const element = event.target.closest('[data-tooltip]');

    // Если элемента не существует, то завершаем
    if (!element) {
      return;
    }

    // Рендерим компонент
    this.render(element.dataset.tooltip);
    // Устанавливаем позицию
    this.setTooltipPosition(event.pageX, event.pageY);

    document.addEventListener('pointermove', this.handlerPointerMove);
  };

  // Обработчик когда указатель изменяет координаты
  handlerPointerMove = (event) => {
    // Устанавливаем позицию
    this.setTooltipPosition(event.pageX, event.pageY);
  };

  // Обработчик когда указатель выходит за границы элемента обрабатываемого события
  handlerPointerOut = () => {
    // Удаляем элемент
    this.remove();
  };

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }

    return Tooltip.instance;
  }

  initialize() {
    document.body.addEventListener('pointerover', this.handlerPointerOver);
    document.body.addEventListener('pointerout', this.handlerPointerOut);
  }

  // Рендер компонента
  render(content) {
    const element = document.createElement('div');
    element.innerHTML = this.getTooltipTemplate(content);
    this.element = element.firstElementChild;

    document.body.append(this.element);
  }

  // Получение шаблона
  getTooltipTemplate(content) {
    return `<div class="tooltip">${content}</div>`;
  }

  // Установка позиции
  setTooltipPosition(pageX, pageY) {
    const offset = 10;

    this.element.style.left = `${pageX + offset}px`;
    this.element.style.top = `${pageY + offset}px`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;

      document.removeEventListener('pointermove', this.handlerPointerMove);
    }
  }

  destroy() {
    this.remove();

    document.removeEventListener('pointerover', this.handlerPointerOver);
    document.removeEventListener('pointerout', this.handlerPointerOut);
  }
}
