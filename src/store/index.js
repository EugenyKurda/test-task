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

            let textColor = 'black';
            if (previousRate === null) {
              textColor = 'black';
            } else if (exchangeRate > previousRate) {
              textColor = 'red';
            } else if (exchangeRate <= previousRate) {
              textColor = 'green';
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

        context.commit('setGoods', mappedDataArray);
        context.commit('setPreviousRate', exchangeRate);
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
