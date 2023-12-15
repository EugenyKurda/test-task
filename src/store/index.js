import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

// Функция для вычисления общей суммы с учетом измененного курса
const calculateTotalPrice = (cart, exchangeRate, previousRate) => {
  let totalPrice = 0;

  cart.forEach((item) => {
    totalPrice += Number(item.C) * item.P;
  });

  totalPrice = Number(totalPrice.toFixed(2));

  // Пересчитываем сумму с учетом измененного курса
  const exchangeRateDiff = previousRate ? exchangeRate / previousRate : 1;

  return (totalPrice * exchangeRateDiff).toFixed(2);
};

// Функция для вычисления цвета цены с учетом измененного курса
const calculateTextColor = (previousRate, exchangeRate) => {
  if (previousRate === null || previousRate === exchangeRate) return 'black';
  if (exchangeRate > previousRate) return 'red';
  return 'green';
};

export default new Vuex.Store({
  state: {
    goods: [],
    categories: {},
    cart: [],
    exchangeRate: 20,
    previousRate: null,
    totalPrice: 0,
  },
  getters: {
    getGoods: (state) => state.goods,
    getCart: (state) => state.cart,
    getExchangeRate: (state) => state.exchangeRate,
    getTotalPrice: (state) => state.totalPrice,
    getPrevExchangeRate: (state) => state.prevExchangeRate,
  },
  mutations: {
    setGoods: (state, goods) => {
      state.goods = goods;
    },
    removeFromCart: (state, index) => {
      state.cart.splice(index, 1);
    },
    setManualExchangeRate(state, newRate) {
      state.exchangeRate = newRate;
    },
    updateCart: (state, updatedCart) => {
      state.cart = updatedCart;
    },
    setTotalPrice(state) {
      // Вычисляем общую сумму с учетом измененного курса
      state.totalPrice = calculateTotalPrice(state.cart, state.exchangeRate, state.previousRate);
    },
    setPreviousRate(state, rate) {
      state.previousRate = rate;
    },
    updateProductQuantity(state, { categoryIndex, productIndex, quantity }) {
      state.goods[categoryIndex].goods[productIndex].P -= quantity;
    },
    addToCart(state, item) {
      const existingItem = state.cart.find((cartItem) => cartItem.T === item.T);

      const { categoryId, T: productId } = item;
      const categoryIndex = state.goods.findIndex((category) => category.categoryId === categoryId);

      if (categoryIndex !== -1) {
        const productIndex = state.goods[categoryIndex].goods.findIndex(
          (product) => product.T === productId,
        );

        if (productIndex !== -1 && state.goods[categoryIndex].goods[productIndex].P > 0) {
          if (existingItem) {
            existingItem.P += 1;
          } else {
            const newItem = { ...item, P: 1 };
            state.cart.push(newItem);
          }

          state.goods[categoryIndex].goods[productIndex].P -= 1;

          // Обновляем цену товара в корзине с учетом изменения курса
          const exchangeRateDiff = state.previousRate ? state.exchangeRate / state.previousRate : 1;

          const cartItem = state.cart.find((cart) => cart.T === item.T);
          if (cartItem) {
            cartItem.C = (item.C / exchangeRateDiff).toFixed(2);
          }
        }
      }
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
        const { cart } = context.state;

        const textColor = calculateTextColor(previousRate, exchangeRate);

        goods.forEach((item) => {
          const categoryId = item.G;
          const productId = item.T;

          const productName = getProductName(categoryId, productId);

          if (productName) {
            const convertedPrice = (item.C * exchangeRate).toFixed(2);

            if (!mappedData[categoryId]) {
              mappedData[categoryId] = {
                categoryId,
                categoryName: categories[categoryId].G,
                goods: [],
              };
            }

            mappedData[categoryId].goods.push({
              C: convertedPrice,
              T: productId,
              P: item.P,
              Name: productName,
              textColor,
            });
          }
        });

        const mappedDataArray = Object.values(mappedData);
        const updatedGoods = mappedDataArray.map((category) => {
          if (category.goods.length) {
            return {
              ...category,
              goods: category.goods.map((product) => {
                const cartItem = cart.find((item) => item.T === product.T);
                if (cartItem) {
                  return {
                    ...product,
                    P: product.P - cartItem.P,
                  };
                }
                return product;
              }),
            };
          }
          return category;
        });

        context.commit('setGoods', updatedGoods);
        context.commit('setPreviousRate', exchangeRate);

        // Обновляем корзину с учетом изменения курса
        const updatedCart = context.state.cart.map((item) => ({
          ...item,
          textColor,
          C: Number(((item.C / previousRate) * exchangeRate).toFixed(2)),
        }));

        context.commit('updateCart', updatedCart);
        // Обновляем общую сумму товаров в корзине
        context.commit('setTotalPrice');
      } catch (error) {
        console.error('Не удалось загрузить данные', error);
      }
    },
    setManualExchangeRate({ commit }, newRate) {
      commit('setManualExchangeRate', newRate);
    },
    addToCart({ commit }, item) {
      const newItem = {
        ...item.product,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
      };

      commit('addToCart', newItem);
      commit('setTotalPrice');
    },
    removeFromCart: ({ commit }, index) => {
      commit('removeFromCart', index);
      commit('setTotalPrice');
    },
  },
});
