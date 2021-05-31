import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  subElements = {};
  _defaultFormData = {
    id: null,
    title: '',
    description: '',
    subcategory: '',
    images: [],
    price: 100,
    discount: 0,
    quantity: 1,
    status: 1
  };
  _categoriesData = [];

  onSubmit = event => {
    event.preventDefault();
    // noinspection JSIgnoredPromiseFromCall
    this.save();
  };

  onUploadImage = () => {
    const imageInput = document.getElementById('imageInput');

    imageInput.onchange = async () => {
      const [file] = imageInput.files;

      if (!file) {
        return;
      }

      const { imageListContainer } = this.subElements;

      const formData = new FormData();
      formData.append('name', file.name);
      formData.append('image', file);

      const response = await this._fetchUploadImage(formData);

      if (response.data) {
        const imgObj = {
          source: escapeHtml(response.data.name),
          url: escapeHtml(response.data.link)
        };

        this._formData.images.push(imgObj);
        imageListContainer.append(this._addPhotoItem(imgObj));
      }
    };

    imageInput.click();
  };

  constructor (productId) {
    this.productId = productId;
  }

  async render() {
    const getCategories = this._fetchCategoriesData();
    const getProduct = this.productId
      ? this._fetchProductData(this.productId)
      : [this._defaultFormData];

    const [productData, categoriesData] = await Promise.all([getProduct, getCategories]);

    this._formData = productData[0];
    this._categoriesData = categoriesData;

    const element = document.createElement('div');
    element.innerHTML = productData.length ? this._getTemplate() : this._getEmptyTemplate();
    this.element = element.firstElementChild;
    this.subElements = this._getSubElements(this.element);

    if (productData.length) {
      this._setFormData();
      this._setImageData();
      this._addEventListeners();
    }

    return this.element;
  }

  async _fetchProductData(productId) {
    const url = new URL('/api/rest/products', BACKEND_URL);
    url.searchParams.set('id', productId);

    return await fetchJson(url);
  }

  async _sendProductData(product) {
    const url = new URL('/api/rest/products', BACKEND_URL);
    const params = {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    };

    return await fetchJson(url, params);
  }

  async _fetchCategoriesData() {
    const url = new URL('/api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return await fetchJson(url);
  }

  async _fetchUploadImage(formData) {
    const url = new URL('https://api.imgur.com/3/upload');
    const params = {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: formData,
    };

    return await fetchJson(url, params);
  }

  async save() {
    const product = this._getFormData();
    const response = await this._sendProductData(product);

    this._dispatchEvent(response.id);
  }

  _setFormData() {
    const { productForm } = this.subElements;
    const { title, description, subcategory, price, discount, quantity, status } = this._formData;

    productForm.elements.title.value = title;
    productForm.elements.description.value = description;
    productForm.elements.subcategory.value = subcategory;
    productForm.elements.price.value = price;
    productForm.elements.discount.value = discount;
    productForm.elements.quantity.value = quantity;
    productForm.elements.status.value = status;
  }

  _getFormData() {
    const { productForm, imageListContainer } = this.subElements;

    const images = [];
    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    for (const image of imagesHTMLCollection) {
      images.push({
        url: image.src,
        source: image.alt
      });
    }

    return {
      id: this.productId ? this.productId : null,
      title: productForm.elements.title.value,
      description: productForm.elements.description.value,
      subcategory: productForm.elements.subcategory.value,
      images: images,
      price: Number(productForm.elements.price.value),
      discount: Number(productForm.elements.discount.value),
      quantity: Number(productForm.elements.quantity.value),
      status: Number(productForm.elements.status.value)
    };
  }

  _setImageData() {
    const { imageListContainer } = this.subElements;
    const imagesHtmlCollection = [];

    for (const image of this._formData.images) {
      imagesHtmlCollection.push(this._addPhotoItem(image));
    }

    const sortableList = new SortableList({
      items: imagesHtmlCollection
    });

    imageListContainer.append(sortableList.element);
  }

  _dispatchEvent(id) {
    const eventDetail = { productId: id };
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: eventDetail })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  _addEventListeners() {
    const { productForm } = this.subElements;
    const btnSubmit = productForm.elements.save;
    const btnUploadImage = productForm.elements.uploadImage;

    btnSubmit.addEventListener('click', this.onSubmit);
    btnUploadImage.addEventListener('pointerdown', this.onUploadImage);
  }

  _getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  _getTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          ${this._createTemplateProductTitle()}
          ${this._createTemplateProductDescription()}
          ${this._createTemplateProductPhoto()}
          ${this._createTemplateProductCategories()}
          ${this._createTemplateProductPriceAndDiscount()}
          ${this._createTemplateProductQuantity()}
          ${this._createTemplateProductStatus()}
          ${this._createTemplateButtonSubmit()}
         </form>
      </div>
    `;
  }

  _getEmptyTemplate() {
    return `
      <div class="product-form">
        <h1>Страница не найдена</h1>
        <p>Извините, данный товар не существует</p>
      </div>
    `;
  }

  _createTemplateProductTitle() {
    return `
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
    `;
  }

  _createTemplateProductDescription() {
    return `
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea id="description" required="" class="form-control" name="description" placeholder="Описание товара"></textarea>
      </div>
    `;
  }

  _createTemplateProductPhoto() {
    return `
      <div class="form-group form-group__wide">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
          <input id="imageInput" type="file" accept="image/*" hidden>
        </div>
        <button type="button" name="uploadImage" class="button-primary-outline">
          <span>Загрузить</span>
        </button>
      </div>
    `;
  }

  _createTemplateProductPhotoItem(img) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="icon-grab.svg" alt="grab" data-grab-handle>
          <img class="sortable-table__cell-img" alt="${img.source}" src="${img.url}">
          <span>${img.source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>
    `;
  }

  _addPhotoItem(img) {
    const element = document.createElement('div');
    element.innerHTML = this._createTemplateProductPhotoItem(img);

    return element.firstElementChild;
  }

  _createTemplateProductCategories() {
    return `
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select id="subcategory" class="form-control" name="subcategory">
          ${this._createTemplateProductCategoriesOptions()}
        </select>
      </div>
    `;
  }

  _createTemplateProductCategoriesOptions() {
    const result = [];

    for (const category of this._categoriesData) {
      for (const child of category.subcategories) {
        result.push(`<option value="${child.id}">${category.title} > ${child.title}</option>`);
      }
    }

    return result.join('');
  }

  _createTemplateProductPriceAndDiscount() {
    return `
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input id="price" required="" type="number" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
    `;
  }

  _createTemplateProductQuantity() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
      </div>
    `;
  }

  _createTemplateProductStatus() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select id="status" class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
    `;
  }

  _createTemplateButtonSubmit() {
    return `
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          <span>${ this.productId ? 'Сохранить' : 'Добавить' } товар</span>
        </button>
      </div>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.subElements = {};
    this._categoriesData = [];
    this.remove();
  }
}
