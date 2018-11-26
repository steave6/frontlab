'use strict';
const RENDER_TIMERINFOS = 'renderTimerSchedules';
const PUSH_TIMERINFO = 'pushTimerInfo';
const ClickPoint = Object.freeze({
  HEADER: Symbol('Header'),
  LEFT_SIDE: Symbol('LeftSide'),
  MIDDLE_BLOCK: Symbol('MiddleBlock'),
  RIGHT_SIDE: Symbol('RightSide'),
});
const GanntLine = Vue.component('gannt-line', {
	template: `<div class='gannt-contaier'>
    <div class='gannt-left-container'>
      <div class='gannt-header'>
        <div>{{ left_title }}</div>
      </div>
      <div class='gannt-body'>
        <div></div>
      </div>
    </div>
    <div class='gannt-right-container'>
      <div ref='timelineHeader' class='gannt-header'
        @mousedown='dragStartTimeline($event)'
        @mousemove='moveTimelineScroll($event)'
        @mouseup='dragStopTimeline($event)'>
        <div class='time-table-component'
          v-for="time in timeSettings.timeTables">
          {{ time }}
          <div></div>
        </div>
      </div>
      <div ref='timelineBody' class='gannt-body'>
        <div ref='timeIndicator' class='time-indicator' :style="indicaterStyle"></div>
        <div class='timer-info-bar'
          v-for="item in timerStylings" :style="item" :value="item.id">
          <div class='left-resize-bar'
            @mousedown='dragStartSideLine($event, "left")'
            @mousemove='moveSideLine($event, "left")'
            ></div>
          <div class='timer-progress' :style=''></div>
          <div class='right-resize-bar'
            @mousedown='dragStartSideLine($event, "right")'
            @mousemove='moveSideLine($event, "right")'
            ></div>
        </div>
        <div class='time-table-component'
          v-for="time in timeSettings.timeTables">
        </div>
      </div>
    </div>
    <button @click="test">test</button>
  </div>`,
	data: function() {
		return {
			left_title: 'header',
			timeSettings: {
				tableNumber: 16,
				offset: -1,
				timeTables: [],
			},
			mouse: {
			  isClicked: false,
			  where: null,
			},
			_clickX: 0,
			indicaterStyle: {
				left: 0,
			},
			clearIntervals: [],
			timerInfos: [
				{
					id: 1,
					sel: 1,
					start: new Date(),
					duration: 25,
					isRest: false,
				},
			],
			timerStylings: [],
		};
	},
	computed: {},
	methods: {
		test() {
			const last = this.timerInfos.slice(0).reverse()[0];
			const date = new Date(last.start);
			date.setHours(date.getHours() + 1);
			this.$emit(PUSH_TIMERINFO, {
				id: last.id + 1,
				seq: last.seq + 1,
				start: date,
				duration: 25,
				isRest: false,
			});
		},
		renderTimerSchedules() {
			const timerInfos = this.timerInfos;
			const workItem = timerInfos.filter(item => !item.isRest);

			this.timerStylings = [];
			for (let item of workItem) {
				const left = this._calcTimelineLeftPosition(item.start);
				const width = this._calcPixelByMinutes(item.duration);
				this.timerStylings.push({
				  id: item.id,
					left: `${left}px`,
					width: `${width}px`,
				});
			}
			this.timerStylings;
		},
		setTimeComponent() {
			const cHour = new Date().getHours();
			const offset = this.timeSettings.offset;
			for (let i = 0; i < this.timeSettings.tableNumber; i++) {
				let t = (cHour + i + offset) % 24;
				t = t >= 0 ? t : 24 + t;
				this.timeSettings.timeTables.push(t);
			}
		},
		dragStartTimeline(event) {
			this.mouse.isClicked = true;
			this.mouse.where = ClickPoint.HEADER;
			this._clickX = event.clientX;
		},
		moveTimelineScroll(event) {
			if (this.mouse.isClicked 
			  && this.mouse.where === ClickPoint.HEADER) {
				this._scrollHeader(event);
			}
		},
		dragStopTimeline(event) {
			event.preventDefault();
			this.mouse.isClicked = false;
		},
		dragStartSideLine(event, side) {
			if (
				side !== 'left' ||
				event.currentTarget.clientX > this.indicaterStyle.left
			) {
				this.mouse.isClicked = true;
				this.mouse.where = side === 'left' ? ClickPoint.LEFT_SIDE : ClickPoint.RIGHT_SIDE;
				this._clickX = event.clientX;
			}
		},
		moveSideLine(event, side) {
	    const parent = event.target.parentElement;
	    const target = this.timerInfos.find(e => e.id === parent.value);
	    const movePixcel = this._clickX - event.clientX;
		  if (side === 'left' 
		    && this.mouse.where === ClickPoint.LEFT_SIDE) {
		    const index = this.timerInfos.indexOf(target);
		    if (index === 0) return;
		    const prev = this.timerInfos[index - 1];
		    const prevStart = this._calcTimelineLeftPosition(prev.start);
		    // if (prevStart < event.)
		    prev.duration
		  } else if (side === 'right' 
		    && this.mouse.where === ClickPoint.RIGHT_SIDE) {
		    
		  }
		},
		setIndicatorPosition() {
			const now = new Date();
			const left = this._calcTimelineLeftPosition(now);
			// set Indicator's position
			this.indicaterStyle = {
				left: `${left}px`,
			};
		},
		pushTimerInfo(info) {
			this.timerInfos.push(info);
			this.$emit(RENDER_TIMERINFOS);
		},
		_calcTimelineLeftPosition(date) {
			const denominator = this.timeSettings.tableNumber;
			const startHour = this.timeSettings.timeTables[0];
			const hOffset = date.getHours() > startHour ? startHour : startHour - 24;
			const numerator = date.getHours() - hOffset + date.getMinutes() / 60;
			const positionRate = numerator / denominator;
			const fullWidth =
				this._getHourComponentWidth() * this.timeSettings.tableNumber;
			// set Indicator's position
			return parseInt(fullWidth * positionRate);
		},
		_calcPixelByMinutes(minutes) {
			const hourWidth = this._getHourComponentWidth();
			const minutesWidth = hourWidth / 60;
			return minutes * minutesWidth;
		},
    _getHourComponentWidth() {
      return this.$el.querySelector('.time-table-component').clientWidth;
    },
		_scrollHeader(event) {
			let target = event.currentTarget;
      const offset = this._clickX - event.clientX;
			this._scrollHeaderAndBody(offset);
			this._clickX = event.clientX;
		},
    _scrollHeaderAndBody(offset) {
      this.$refs['timelineHeader'].scrollLeft += offset;
			this.$refs['timelineBody'].scrollLeft += offset;
    },
		_checkTimeTableComponentRendered(self) {
			return !!self.$el.querySelector('.time-table-component');
		},
		_setInitialTimeline() {
      // syncronize 0 secondes
			const syncClockTiming = () => {
				this.setIndicatorPosition();
				const d = new Date();
				const remainMiliSecond = (60 - d.getSeconds()) * 1000;
				setTimeout(() => {
					this.clearIntervals.push(
						setInterval(() => {
							this.setIndicatorPosition();
						}, 60000)
					);
				}, remainMiliSecond);
			}
      // execute after timerTable width fixed
			let checkRenderInterval = setInterval(() => {
				if (this._checkTimeTableComponentRendered(this)) {
					this.$emit(RENDER_TIMERINFOS); // TODO for debug MUST BE delete
          this._scrollHeaderAndBody(this._getHourComponentWidth());
					syncClockTiming();
					clearInterval(checkRenderInterval);
				}
			}, 1500);
		},
	},
	mounted() {
		this.setTimeComponent();
		this._setInitialTimeline();
		this.$on(RENDER_TIMERINFOS, this.renderTimerSchedules);
		this.$on(PUSH_TIMERINFO, this.pushTimerInfo);
	},
	created() {
		document.addEventListener('mouseup', this.dragStopTimeline);
	},
	destroyed() {
		document.removeEventListener('mouseup', this.dragStopTimeline);
		for (let item of this.clearIntervals) {
			clearInterval(item);
		}
	},
});
