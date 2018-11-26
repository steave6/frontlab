'use strict';
const MOVE_HOURS = 'moveHours';
const MOVE_MINUTES = 'moveMinutes';
const MOVE_SECONDS = 'moveSeconds';
const PomodoroTimer = Vue.component('pomodoro-timer', {
	template: `
  <transition name='timerclock' mode='out-in'> 
    <div class='pomodoro-timer pomodoro' key='timer'
      v-if='isTimer'>
      <div class='clickable-wrapper' @click='toggleTimerAndClock()'></div>
      <div class='timer-container'>
        <div class='timer-info-container'>
          <div class='timer-letters'>
            <div class='timer-letter'><p>{{ }}</p></div>
            <div class='timer-letter'><p>{{ }}</p></div>
            <div class='timer-delimiter'></div>
            <div class='timer-letter'><p>{{ }}</p></div>
            <div class='timer-letter'><p>{{ }}</p></div>
          </div>
          <div class='timer-buttons'>
            <button class='timer-start'>play</button>
            <button class='timer-stop'>stop</button>
          </div>
        </div>
      </div>
    </div>
    <div class='pomodoro-clock pomodoro' key='clock'
      v-if='isClock'>
      <div class='clickable-wrapper' @click='toggleTimerAndClock()'></div>
      <div v-if='isLoading' class='load-sign-container'>
        <div class='loader loading-sign'></div>
      </div>
      <div class="hours-container" :style='hoursAngle'>
        <div class="hours" :style='baseHours'></div>
      </div>
      <div class="minutes-container" :style='minutesAngle'>
        <div class="minutes" :style='baseMinutes'></div>
      </div>
      <div class="seconds-container" :style='secondsAngle'>
        <div class="seconds" :style='baseSeconds'></div>
      </div>
    </div>
  </transition>`,
	data: function() {
		return {
      isLoading: false,
      timerOrClock: true,
      clearIntervals: [],
      clearClockIntervalId: null,
      startSecondsOffset: 0,
      clock: {
        base: {
          hours: 0,
          minutes: 0,
          seconds: 0,
        },
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
      refreshTime: 1,// x minutes
      shouldRefresh: false,
    }
	},
	computed: {
    baseHours() {
      return {
        webkitTransform: `rotateZ(${this.clock.base.hours}deg)`,
        transform: `rotateZ(${this.clock.base.hours}deg)`,
      }
    },
    baseMinutes() {
      return {
        webkitTransform: `rotateZ(${this.clock.base.minutes}deg)`,
        transform: `rotateZ(${this.clock.base.minutes}deg)`,
      }
    },
    baseSeconds() {
      return {
        webkitTransform: `rotateZ(${this.clock.base.seconds}deg)`,
        transform: `rotateZ(${this.clock.base.seconds}deg)`,
      }
    },
    hoursAngle() {
      return {
        webkitTransform: `rotateZ(${this.clock.hours}deg)`,
        transform: `rotateZ(${this.clock.hours}deg)`,
      }
    },
    minutesAngle() {
      return {
        webkitTransform: `rotateZ(${this.clock.minutes}deg)`,
        transform: `rotateZ(${this.clock.minutes}deg)`,
      }
    },
    secondsAngle() {
      return {
        webkitTransform: `rotateZ(${this.clock.seconds}deg)`,
        transform: `rotateZ(${this.clock.seconds}deg)`,
      }
    },
    isTimer() {
      return this.timerOrClock;
    },
    isClock() {
      return !this.timerOrClock;
    }
  },
	methods: {
		/*
    * Starts any clocks using the user's local time
    * From: cssanimation.rocks/clocks
    */
    setBaseHandsAngle() {
      // Get the local time using JS
      const date = new Date;
      const seconds = date.getSeconds();
      const minutes = date.getMinutes();
      const hours = date.getHours();
      this.startSecondsOffset = 360 - (seconds * 6);

      this.clock.base = {
        hours: (hours * 30) + (minutes / 2),
        minutes: (minutes * 6),
        seconds: (seconds * 6),
      }
    },
    /**
     * move hour hands
     */
    moveHourHands() {
      this.clock.hours += 0.5;
    },
    /*
    * Move the minute's containers
    */
    moveMinuteHands() {
      this.clock.minutes += 6;
    },
    /*
    * Move the second containers
    */
    moveSecondHands() {
      this.clock.seconds += 6;
      if (this.clock.seconds % 360 === this.startSecondsOffset) {
        this.$emit(MOVE_MINUTES);
        this.$emit(MOVE_HOURS);
      }
    },
    moveClockHandsEachSeconds() {
      clearInterval(this.clearClockIntervalId);
      const interval = 1000;
      const base = new Date();
      const weighedSecond = (1 / (this.refreshTime * 60)) * 1000;
      const adjust = parseInt(this._getDriftedTime() * weighedSecond);
      this.$emit(MOVE_SECONDS);
      this.clearClockIntervalId = setInterval(() => {
        if (this.shouldRefresh) {
          this.shouldRefresh = false;
          this.moveClockHandsEachSeconds();
        } else {
          this.$emit(MOVE_SECONDS);
        }
      }, interval - adjust);
      console.log(`adjust: ${adjust}`);
    },
    toggleTimerAndClock() {
      this.timerOrClock = !this.timerOrClock;
    },
    _clearAllIntervals() {
      for (let item of this.clearIntervals) {
        clearInterval(item);
      }
    },
    _setInterval(fn, interval) {
      const intv = setInterval(fn, interval);
      this.clearIntervals.push(intv);
    },
    _getDriftedTime() {
      const base = new Date();
      const currentSec = ((this.clock.seconds - this.startSecondsOffset) % 360) / 6;
      let driftedTime = base.getSeconds() - currentSec;
      if (Math.abs(base.getSeconds() - currentSec) > 40) {
        driftedTime += base.getSeconds() < currentSec ? 60 : -60 ;
      }
      return driftedTime;
    },
    setEvent() {
      this.$on(MOVE_HOURS, this.moveHourHands);
      this.$on(MOVE_MINUTES, this.moveMinuteHands);
      this.$on(MOVE_SECONDS, this.moveSecondHands);
    }
	},
	mounted() {
    this.setBaseHandsAngle();
    this.moveClockHandsEachSeconds();
    this._setInterval(() => {
      this.shouldRefresh = true
    }, this.refreshTime * 60000);// x minutes
	},
	created() {
    this.setEvent();
	},
	destroyed() {
    this._clearAllIntervals();
	},
});
