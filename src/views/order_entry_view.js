import Backbone from 'backbone';
import Order from '../models/order';

const OrderEntryView = Backbone.View.extend({
  initialize(params) {
    this.template = params.template;
    this.listenTo(this.model.quotes, 'update', this.renderForm);
  },
  renderForm() {
    this.$('select[name="symbol"]').empty();
    // this.$('input[name="price-target"]').empty();
    this.model.quotes.each((quote) => {
      this.$('select[name="symbol"]').append(this.template(quote));
    })
  },
  events: {
    'click button': 'createOrder',
  },
  createOrder: function(event) {
    event.preventDefault();

    const orderData = {};
    orderData.buy = event.target.className.includes('btn-buy') ? true : false;
    const fields = {select: 'symbol', input: 'price-target'};

    for (const field in fields) {
      const val = this.$(`${field}[name=${fields[field]}]`).val();
      if (val != '') {
        const key = fields[field].replace(/-\w/g, (word) => word[1].toUpperCase() ); // kebab-case to camelCase
        orderData[key] = val;
      }
    }

    orderData.priceTarget = Number(orderData.priceTarget)
    orderData.quote = this.model.quotes.where({symbol: orderData.symbol});

    const newOrder = new Order(orderData);
    if (newOrder.isValid()) {
      this.model.orders.add(newOrder);
      this.renderForm();
    } else {
      this.renderValidationFailure(newOrder.validationError);
    }
  },
  renderValidationFailure(errorsHash) {
    this.$('.form-errors ul').empty();
    for (const key in errorsHash) {
      this.$('.form-errors ul').append(`<h3>${errorsHash[key]}</h3>`);
    }
  }
});

export default OrderEntryView;
