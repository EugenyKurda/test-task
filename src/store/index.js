// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    goods: [],
    categories: {},
    cart: [],
    exchangeRate: 76,
    prevExchangeRate: 76,
  },
  getters: {
    getGoods: (state) => state.goods,
    getCategory: (state) => state.categories,
    getCart: (state) => state.cart,
    getExchangeRate: (state) => state.exchangeRate,
    getTotalPrice: (state) => state.cart.reduce((total, item) => total + item.priceRub, 0),
    getPrevExchangeRate: (state) => state.prevExchangeRate,
  },
  mutations: {
    setGoods: (state, goods) => {
      state.goods = goods;
    },
    setCategories: (state, categories) => {
      state.categories = categories;
    },
    addToCart: (state, item) => {
      state.cart.push(item);
    },
    removeFromCart: (state, index) => {
      state.cart.splice(index, 1);
    },
    setExchangeRate: (state, rate) => {
      state.exchangeRate = rate;
    },
  },
  actions: {
    loadData: async (context) => {
      try {
        const [goodsResponse, categoriesResponse] = await Promise.all([
          axios.get('/data/data.json'),
          axios.get('/data/names.json'),
        ]);

        const goods = goodsResponse.data.Value.Goods;
        const categories = categoriesResponse.data;

        context.commit('setGoods', goods);
        context.commit('setCategories', categories);
      } catch (error) {
        console.error('Не удалось загрузить данные', error);
      }
    },
    updateExchangeRate: async (context) => {
      try {
        const newRate = Math.floor(Math.random() * 61) + 20; // От 20 до 80
        const currentRate = context.getters.getExchangeRate;

        context.commit('setExchangeRate', newRate);

        if (newRate > currentRate) {
          console.log('Курс обмена увеличился');
        } else if (newRate < currentRate) {
          console.log('Курс обмена уменьшился');
        }
      } catch (error) {
        console.error('Не удалось обновить курс обмена', error);
      }
    },
    addToCart: ({ commit }, item) => {
      commit('addToCart', item);
    },
    removeFromCart: ({ commit }, index) => {
      commit('removeFromCart', index);
    },
  },
});
