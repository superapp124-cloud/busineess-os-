'use strict';

const { BaseConnector } = require('../base-connector.cjs');

class SwiggyConnector extends BaseConnector {
  constructor() {
    super('swiggy', '1.0');
  }

  capabilities() {
    return ['DISCOVER', 'FETCH_MENU', 'CHECKOUT', 'TRACK'];
  }

  sla() {
    return 300;
  }

  async health() {
    return 'healthy';
  }

  async discover(context) {
    if (!context || !context.toLowerCase().includes('food') && !context.toLowerCase().includes('biryani')) {
      return []; 
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 120));

    // Raw JSON from "API"
    return [
      { id: 'blues_s', title: 'Biryani Blues', cost: 249, score: 4.5, deliveryTime: 31, fee: 0, offers: ['Free Delivery'], confidence: 0.90 }
    ];
  }
}

module.exports = { SwiggyConnector };
