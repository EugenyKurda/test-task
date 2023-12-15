<template>
  <div class="app-container">
    <div class="app-header">
      <div class="app-header__exchange-rate">
        <span>Курс: </span>
        <v-text-field
          solo
          dense
          type="number"
          prefix="$"
          placeholder="Введите курс доллара"
          :hide-details="true"
          style="max-width: 200px"
          class="exchange-rate__input"
          v-model="manualExchangeRate"
        ></v-text-field>
        <v-btn
          @click="setManualExchangeRate(manualExchangeRate)"
          class="exchange-rate__btn"
        >
          Применить
        </v-btn>
      </div>
      <div class="app-header__timer">
        <app-timer/>
      </div>
    </div>
    <div class="app-main__wrapper">
      <div class="app-product__block">
        <v-expansion-panels accordion class="app-list__goods" focusable>
          <v-expansion-panel
            v-for="(category, index) in goods"
            :key="index"
            class="app-list__item"
          >
            <v-expansion-panel-header
              class="app-list__item-header"
            >
              {{ category.categoryName }}
            </v-expansion-panel-header>
            <v-expansion-panel-content class="app-list__item-content">
              <div
                v-for="(product, index) in category.goods"
                :key="product.T"
              >
                <div
                  class="app-good__item"
                >
                  <p class="app-good__item-title">{{ product.Name + ' (' + product.P + ')'}}</p>
                  <div>
                    <span
                      class="app-good__item-price"
                      :style="{color: product.textColor}"
                    >
                      {{ product.C + ' руб' }}
                    </span>
                    <v-btn
                      elevation="2"
                      @click="addToCart(product)"
                    >Купить</v-btn>
                  </div>
                </div>
                <v-divider v-if="index < category.goods.length - 1" />
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      <div class="app-cart__block">
        <div class="app-cart__items-wrapper">
          <div
            v-for="(cartItem, index) in cart"
            :key="generateUniqueKey(cartItem, index + 1)"
          >
            <div
              class="app-cart__item"
            >
              <div class="app-cart__item-title">
                <v-chip
                  color="orange"
                  label
                  outlined
                  class="app-cart__item-chip"
                >
                  {{ 'Категория' }}
                </v-chip>
                <p>
                  {{ cartItem.Name }}
                </p>
              </div>
              <div>
                <span class="app-cart__item-price">{{ cartItem.C + ' руб' }}</span>
                <v-btn @click="removeFromCart(index)">Удалить</v-btn>
              </div>
            </div>
          </div>
        </div>
        <h2 class="app-total__price">Total: {{ totalPrice }}</h2>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import AppTimer from '@/components/Timer.vue';

export default {
  components: { AppTimer },
  data() {
    return {
      manualExchangeRate: 20,
    };
  },
  computed: {
    ...mapGetters(['getGoods', 'getCart', 'getTotalPrice']),
    goods() {
      return this.getGoods;
    },
    cart() {
      return this.getCart;
    },
    totalPrice() {
      return this.getTotalPrice;
    },
  },
  methods: {
    ...mapActions(['addToCart', 'setManualExchangeRate', 'removeFromCart', 'loadData']),
    generateUniqueKey(item, index) {
      return `${index}_${item.Name}`;
    },
  },
  mounted() {
    this.loadData();
  },
};
</script>

<style lang="scss">
.app-container {
  background-color: white;
  height: 100vh;
  max-width: 1240px !important;
  margin: 0 auto;

  .app-header {
    height: 60px;
    background-color: white;
    width: 80%;
    margin: 20px auto 20px auto;
    display: flex;
    justify-content: space-between;

    &__exchange-rate {
      background-color: white;
      height: 100%;
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      .exchange-rate__input {
        margin-right: 15px !important;
        max-width: 200px !important;
      }

      .exchange-rate__btn {
        width: 140px;
      }

      span {
        margin-right: 10px;
      }
    }

    &__timer {
      height: 100%;
      width: 50%;
      background-color: white;
    }
  }

  .app-main__wrapper {
    height: 600px;
    background-color: white;
    width: 90%;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;

    .app-product__block {
      width: 50%;
      background-color: white;
      margin-right: 20px;

      .app-list__goods {
        border-radius: 2px;
        box-shadow: 0 5px 10px 2px rgba(34, 60, 80, 0.2);
        border: 0.5px solid rgba(187, 189, 194, 0.23);

        .app-list__item {
          background-color: white;

          &-header {
            background-color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          &-content .v-expansion-panel-content__wrap {
            padding: 0 24px 0;
          }

          .app-good__item {
            padding: 10px 0 10px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .v-divider {
              margin-bottom: 10px;
            }

            &-title {
              max-width: 250px;
            }

            &-price {
              margin-right: 15px;
            }

            .price-increased {
              color: red;
            }

            .price-decreased {
              color: green;
            }
          }
        }
      }
    }

    .app-cart__block {
      width: 50%;
      background-color: white;
      border: 1px solid rgba(187, 189, 194, 0.23);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: fit-content;
      max-height: 500px;

      .app-cart__items-wrapper {
        overflow: auto;
        overflow-x: hidden;
      }

      .app-cart__item {
        padding: 10px 15px 10px 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 2px;
        box-shadow: 0 6px 5px -5px rgba(34, 60, 80, 0.6);
        border: 0.5px solid rgba(187, 189, 194, 0.23);
        margin-bottom: 10px;

        &-title {
          align-items: center;
          max-width: 250px;

          .app-cart__item-chip {
            background-color: orange !important;
            color: white;
            font-size: 14px;
            margin-bottom: 10px;
            height: 25px;
          }

          p {
            display: flex;
            flex-direction: column;
            max-width: 250px;
            margin-right: 10px;
          }
        }

        &-price {
          margin-right: 15px;
        }
      }

      .app-total__price {
        margin: 20px 0 20px 10px;
      }
    }
  }
}
</style>
