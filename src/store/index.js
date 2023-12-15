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
    exchangeRate: 20,
    previousRate: null,
  },
  getters: {
    getGoods: (state) => state.goods,
    getCart: (state) => state.cart,
    getExchangeRate: (state) => state.exchangeRate,
    getTotalPrice: (state) => state.cart.reduce((total, item) => total + item.priceRub, 0),
    getPrevExchangeRate: (state) => state.prevExchangeRate,
  },
  mutations: {
    setGoods: (state, goods) => {
      state.goods = goods;
    },
    addToCart: (state, item) => {
      state.cart.push(item);
    },
    removeFromCart: (state, index) => {
      state.cart.splice(index, 1);
    },
    setManualExchangeRate(state, newRate) {
      state.exchangeRate = newRate;
    },
    setPreviousRate(state, rate) {
      state.previousRate = rate;
    },
  },
  actions: {
    // В вашем компоненте или модуле Vuex

    loadData: async (context) => {
      try {
        const [goodsResponse, categoriesResponse] = await Promise.all([
          axios.get('/data/data.json'),
          axios.get('/data/names.json'),
        ]);

        const goods = goodsResponse.data.Value.Goods;
        const categories = categoriesResponse.data;

        const mappedData = {};
        const getProductName = (categoryId, productId) => {
          const category = categories[categoryId];
          return category && category.B && category.B[productId] ? category.B[productId].N : '';
        };

        const { exchangeRate, previousRate } = context.state;

        goods.forEach((item) => {
          const categoryId = item.G;
          const productId = item.T;

          const productName = getProductName(categoryId, productId);

          if (productName) {
            const convertedPrice = item.C * exchangeRate;

            if (!mappedData[categoryId]) {
              mappedData[categoryId] = {
                categoryId,
                categoryName: categories[categoryId].G,
                goods: [],
              };
            }

            // Устанавливаем цвет текста
            let textColor = 'black';
            if (previousRate === null) {
              textColor = 'black'; // Черный, если previousRate равен null
            } else if (exchangeRate > previousRate) {
              textColor = 'red'; // Красный, если курс увеличился
            } else if (exchangeRate <= previousRate) {
              textColor = 'green'; // Зеленый, если курс уменьшился
            }

            mappedData[categoryId].goods.push({
              C: convertedPrice, // Цена в рублях
              T: productId, // ID товара
              P: item.P, // Количество товара
              Name: productName, // Название товара
              textColor, // Передаем цвет текста
            });
          }
        });

        const mappedDataArray = Object.values(mappedData);

        console.log(mappedDataArray);

        context.commit('setGoods', mappedDataArray);
        context.commit('setPreviousRate', exchangeRate); // Сохраняем текущий курс для следующего обновления
      } catch (error) {
        console.error('Не удалось загрузить данные', error);
      }
    },
    setManualExchangeRate({ commit }, newRate) {
      commit('setManualExchangeRate', newRate);
    },
    addToCart: ({ commit }, item) => {
      commit('addToCart', item);
    },
    removeFromCart: ({ commit }, index) => {
      commit('removeFromCart', index);
    },
  },
});
