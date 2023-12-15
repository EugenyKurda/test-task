<template>
  <div class="timer__wrapper">
    <h3>{{ timeLeft }} сек</h3>
    <v-btn
      class="reset__btn"
      @click="resetTimer"
    >
      Сбросить
    </v-btn>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'AppTimer',
  data() {
    return {
      timerActive: false,
      timeLeft: 15,
    };
  },
  computed: {
    ...mapGetters(['getExchangeRate']),
    exchangeRate() {
      return this.getExchangeRate;
    },
  },
  methods: {
    ...mapActions(['loadData', 'setManualExchangeRate']),
    startTimer() {
      const timerInterval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft -= 1;
        } else {
          this.setManualExchangeRate(this.exchangeRate);
          this.loadData();
          this.resetTimer();
        }
      }, 1000);

      this.$once('hook:beforeDestroy', () => clearInterval(timerInterval));
    },
    resetTimer() {
      this.timeLeft = 15;
    },
  },
  mounted() {
    this.startTimer();
  },
};
</script>

<style scoped lang="scss">
.timer__wrapper {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;

  h3 {
    font: normal 600 24px sans-serif;
    margin-right: 15px;
  }

  .reset__btn {
    font: normal 200 10px Verdana, Arial, Helvetica, sans-serif;
    height: 30px;
    background-color: blue;
    padding: 5px;
    border-radius: 4px;
    max-width: 80px;
  }
}
</style>
