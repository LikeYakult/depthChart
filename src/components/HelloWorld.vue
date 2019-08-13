<template>
  <div class="hello">
    <div class="chart-layout" :style="wrapStyles">
      <canvas class="chart" ref="chart" :width="fWidth" :height="fHeight" :style="chartStyles"></canvas>
      <canvas class="chart-mask"
              ref="chartMask"
              :width="fWidth"
              :height="fHeight"
              @mousemove="handleMouseMove"
              @mouseout="handleMouseOut"
      >
      </canvas>
      <canvas class="chart-x" ref="xChart" :width="fWidth" height="24" :style="xStyles"></canvas>
      <canvas class="chart-y" ref="yChart" width="48" :height="fHeight" :style="yStyles"></canvas>
    </div>
  </div>
</template>

<script>
import utils from "./utlis";
export default {
  name: 'HelloWorld',
  props: {
    height: {
      type: String,
      default: '260px'
    },
    width: {
      type: String,
      default: '1200px'
    },
    bgColor: {
      type: String,
      default: '#ffffff'
    },
    options: {
      type: Object,
      default: null
    },
    buyFillColor: {
      type: String,
      default: '#AACBCC'
    },
    sellFillColor: {
      type: String,
      default: '#D7ACB1'
    },
    gap: {
      type: Number,
      default: 10
    },
    // 锯齿
    jagged: {
      type: Boolean,
      default: false
    },
    paddingTop: {
      type: Number,
      default: 10
    },
  },
  data () {
    return {
      chart: null,
      context: null,
      maskChart: null,
      maskContext: null,
      xChart: null,
      xChartContext: null,
      yChart: null,
      yChartContext: null,
      finalOptions: {...this.options},
      fHeight: parseFloat(this.height) - 24,
      fWidth: parseFloat(this.width) - 48,
      hasPaint: false,
      args: null,
      valueMap: new Map()
    }
  },
  computed: {
    wrapStyles() {
      return {
        height: this.fHeight + 24 + 'px'
      }
    },
    chartStyles() {
      return {
        backgroundColor: this.bgColor,
        width: this.fWidth + 'px',
        height: this.fHeight + 'px'
      }
    },
    xStyles() {
      return {
        top: this.fHeight + 'px',
        left: 0
      }
    },
    yStyles() {
      return {
        top: 0,
        left: this.fWidth + 'px'
      }
    },
    chartData() {
      let data = {
        buy: [
          {
            index: 0,
            price: "0.0009370000",
            volume: "36.75000000"
          },
          {
            index: 1,
            price: "0.0009360000",
            volume: "374.55000000"
          },
          {
            index: 2,
            price: "0.0009340000",
            volume: "68.91000000"
          },
          {
            index: 3,
            price: "0.0009330000",
            volume: "93.34000000"
          },
          {
            index: 4,
            price: "0.0009320000",
            volume: "57.80000000"
          },
          {
            index: 5,
            price: "0.0009310000",
            volume: "4.66000000"
          },
          {
            index: 6,
            price: "0.0009300000",
            volume: "52.88000000"
          },
          {
            index: 7,
            price: "0.0009240000",
            volume: "2.87000000"
          },
          {
            index: 8,
            price: "0.0009230000",
            volume: "13.86000000"
          },
          {
            index: 9,
            price: "0.0009210000",
            volume: "5.11000000"
          },
          {
            index: 10,
            price: "0.0009200000",
            volume: "29.54000000"
          },
          {
            index: 11,
            price: "0.0009190000",
            volume: "7.67000000"
          },
          {
            index: 12,
            price: "0.0009180000",
            volume: "42.40000000"
          },
          {
            index: 13,
            price: "0.0009170000",
            volume: "84.40000000"
          },
          {
            index: 14,
            price: "0.0009160000",
            volume: "28.56000000"
          },
          {
            index: 15,
            price: "0.0009120000",
            volume: "2.28000000"
          },
          {
            index: 16,
            price: "0.0009100000",
            volume: "79.11000000"
          },
          {
            index: 17,
            price: "0.0008990000",
            volume: "1.33000000"
          },
          {
            index: 18,
            price: "0.0008980000",
            volume: "4.89000000"
          },
          {
            index: 19,
            price: "0.0008970000",
            volume: "40.22000000"
          },
          {
            index: 20,
            price: "0.0008960000",
            volume: "23.32000000"
          },
          {
            index: 21,
            price: "0.0008950000",
            volume: "9.11000000"
          },
          {
            index: 22,
            price: "0.0008940000",
            volume: "0.40000000"
          },
          {
            index: 23,
            price: "0.0008920000",
            volume: "2.84000000"
          },
          {
            index: 24,
            price: "0.0008910000",
            volume: "61.65000000"
          },
          {
            index: 25,
            price: "0.0008780000",
            volume: "4.02000000"
          },
          {
            index: 26,
            price: "0.0008740000",
            volume: "39.47000000"
          },
          {
            index: 27,
            price: "0.0008730000",
            volume: "43.94000000"
          },
          {
            index: 28,
            price: "0.0008720000",
            volume: "15.17000000"
          },
          {
            index: 29,
            price: "0.0008680000",
            volume: "570.51000000"
          },
          {
            index: 30,
            price: "0.0008670000",
            volume: "615.60000000"
          },
          {
            index: 31,
            price: "0.0008660000",
            volume: "49.96000000"
          },
          {
            index: 32,
            price: "0.0008650000",
            volume: "0.37000000"
          }
        ],
        sell: [
          {
            index: 0,
            price: "0.0009390000",
            volume: "12.23000000"
          },
          {
            index: 1,
            price: "0.0009470000",
            volume: "22.23000000"
          },
          {
            index: 2,
            price: "0.0009530000",
            volume: "53.50000000"
          },
          {
            index: 3,
            price: "0.0009540000",
            volume: "70.08000000"
          },
          {
            index: 4,
            price: "0.0009550000",
            volume: "0.60000000"
          },
          {
            index: 5,
            price: "0.0009560000",
            volume: "9.22000000"
          },
          {
            index: 6,
            price: "0.0009570000",
            volume: "1.36000000"
          },
          {
            index: 7,
            price: "0.0009580000",
            volume: "0.36000000"
          },
          {
            index: 8,
            price: "0.0009590000",
            volume: "1.83000000"
          },
          {
            index: 9,
            price: "0.0009600000",
            volume: "4.21000000"
          },
          {
            index: 10,
            price: "0.0009610000",
            volume: "1.38000000"
          },
          {
            index: 11,
            price: "0.0009620000",
            volume: "0.80000000"
          },
          {
            index: 12,
            price: "0.0009630000",
            volume: "30.37000000"
          },
          {
            index: 13,
            price: "0.0009640000",
            volume: "332.70000000"
          },
          {
            index: 14,
            price: "0.0009650000",
            volume: "979.60000000"
          },
          {
            index: 15,
            price: "0.0009660000",
            volume: "414.75000000"
          },
          {
            index: 16,
            price: "0.0009670000",
            volume: "126.67000000"
          },
          {
            index: 17,
            price: "0.0009680000",
            volume: "6.36000000"
          },
          {
            index: 18,
            price: "0.0009740000",
            volume: "3.74000000"
          },
          {
            index: 19,
            price: "0.0009760000",
            volume: "13.05000000"
          },
          {
            index: 20,
            price: "0.0009810000",
            volume: "2.28000000"
          },
          {
            index: 21,
            price: "0.0009820000",
            volume: "20.14000000"
          },
          {
            index: 22,
            price: "0.0009830000",
            volume: "5.66000000"
          },
          {
            index: 23,
            price: "0.0009840000",
            volume: "20.87000000"
          },
          {index: 24, price: "0.0009850000", volume: "7.30000000"},
          {index: 25, price: "0.0009860000", volume: "0.25000000"},
          {index: 26, price: "0.0009870000", volume: "0.54000000"},
          {index: 27, price: "0.0009910000", volume: "50.80000000"},
          {index: 28, price: "0.0009920000", volume: "6.56000000"},
          {index: 29, price: "0.0009960000", volume: "20.12000000"},
          {index: 30, price: "0.0009970000", volume: "21.97000000"},
          {index: 31, price: "0.0009980000", volume: "2.39000000"},
          {index: 32, price: "0.0009990000", volume: "0.33000000"},
          {index: 33, price: "0.0010000000", volume: "0.44000000"},
          {index: 34, price: "0.0010010000", volume: "3.46000000"},
          {index: 35, price: "0.0010030000", volume: "1.27000000"},
          {index: 36, price: "0.0010040000", volume: "2.23000000"},
          {index: 37, price: "0.0010050000", volume: "10.51000000"},
          {index: 38, price: "0.0010060000", volume: "2.60000000"},
          {index: 39, price: "0.0010150000", volume: "0.86000000"},
          {index: 40, price: "0.0010160000", volume: "11.96000000"},
          {index: 41, price: "0.0010170000", volume: "0.86000000"},
          {index: 42, price: "0.0010180000", volume: "0.73000000"},
          {index: 43, price: "0.0010210000", volume: "2.70000000"},
          {index: 44, price: "0.0010220000", volume: "3.52000000"},
          {index: 45, price: "0.0010230000", volume: "0.65000000"},
          {index: 46, price: "0.0010240000", volume: "0.78000000"},
          {index: 47, price: "0.0010250000", volume: "1.12000000"},
          {index: 48, price: "0.0010260000", volume: "2.04000000"},
          {index: 49, price: "0.0010270000", volume: "1.92000000"},
          {index: 50, price: "0.0010280000", volume: "1.74000000"},
          {index: 51, price: "0.0010310000", volume: "0.41000000"},
          {index: 52, price: "0.0010320000", volume: "21.80000000"},
          {index: 53, price: "0.0010330000", volume: "13.99000000"},
          {index: 54, price: "0.0010340000", volume: "14.74000000"},
          {index: 55, price: "0.0010350000", volume: "2.73000000"},
          {index: 56, price: "0.0010360000", volume: "4.48000000"},
          {index: 57, price: "0.0010390000", volume: "1.53000000"},
          {index: 58, price: "0.0010550000", volume: "11.84000000"},
          {index: 59, price: "0.0010560000", volume: "2.36000000"},
          {index: 60, price: "0.0010570000", volume: "1.86000000"},
          {index: 61, price: "0.0010580000", volume: "3.31000000"},
          {index: 62, price: "0.0010590000", volume: "5.01000000"},
          {index: 63, price: "0.0010600000", volume: "4.20000000"},
          {index: 64, price: "0.0010670000", volume: "0.48000000"},
          {index: 65, price: "0.0010680000", volume: "3.40000000"},
          {index: 66, price: "0.0010690000", volume: "1.15000000"},
          {index: 67, price: "0.0010700000", volume: "1.48000000"},
          {index: 68, price: "0.0010720000", volume: "0.20000000"},
          {index: 69, price: "0.0010740000", volume: "0.99000000"},
          {index: 70, price: "0.0010750000", volume: "0.78000000"},
          {index: 71, price: "0.0010770000", volume: "1.39000000"},
          {index: 72, price: "0.0010780000", volume: "7.10000000"},
          {index: 73, price: "0.0010790000", volume: "0.87000000"},
          {index: 74, price: "0.0010860000", volume: "0.49000000"},
          {index: 75, price: "0.0010890000", volume: "7.18000000"},
          {index: 76, price: "0.0010900000", volume: "6.00000000"},
          {index: 77, price: "0.0010910000", volume: "7.14000000"},
          {index: 78, price: "0.0010970000", volume: "2.21000000"},
          {index: 79, price: "0.0010980000", volume: "0.90000000"},
          {index: 80, price: "0.0010990000", volume: "0.27000000"},
          {index: 81, price: "0.0011070000", volume: "4.10000000"},
          {index: 82, price: "0.0011090000", volume: "1.20000000"},
          {index: 83, price: "0.0011100000", volume: "0.79000000"},
          {index: 84, price: "0.0011110000", volume: "2.92000000"},
          {index: 85, price: "0.0011120000", volume: "0.93000000"},
          {index: 86, price: "0.0011130000", volume: "0.56000000"},
          {index: 87, price: "0.0011140000", volume: "3.56000000"},
          {index: 88, price: "0.0011150000", volume: "13.23000000"},
          {index: 89, price: "0.0011160000", volume: "14.85000000"},
          {index: 90, price: "0.0011170000", volume: "10.81000000"}
        ]
      };

      let total = 0;
      data.buy.forEach((item) => {
        total += Number(item.volume);
        item.price = Number(item.price);
        item.total = total;
      });

      total = 0;
      data.sell.forEach((item) => {
        total += Number(item.volume);
        item.price = Number(item.price);
        item.total = total;
      });


      const buyLength = data.buy.length;
      const sellLength = data.sell.length;

      let gap;
      let indexFilter;
      let result = {};

      if(buyLength && sellLength) {
        const buy = data.buy;
        const buyFirstPrice = Number(buy[0].price);
        const buyLastPrice = Number(buy[buy.length - 1].price);
        const buyGap = Number(buyFirstPrice - buyLastPrice);


        const sell = data.sell;
        const sellFirstPrice = Number(sell[0].price);
        const sellLastPrice = Number(sell[sell.length - 1].price);
        const sellGap = Number(sellLastPrice - sellFirstPrice);

        const isBuySmall = buyGap < sellGap;


        if(isBuySmall) {
          gap = Number(sellFirstPrice + buyGap);

          result['buy'] = data.buy;

          for(let i = 0; i < data.sell.length; i++) {
            let item = data.sell[i];
            if(gap === item.price) {
              indexFilter = i;
              break;
            } else if(item.price > gap) {
              indexFilter = i;
              break;
            }
          }

          result['sell'] = data.sell.filter((item, index) => indexFilter >= index);
        } else {
          gap = Number(buyLastPrice + sellGap);

          result['sell'] = data.sell;

          for(let i = 0; i < data.buy.length; i++) {
            let item = data.buy[i];
            if(gap === item.price) {
              indexFilter = i;
              break;
            } else if(item.price > gap) {
              indexFilter = i;
              break;
            }
          }

          result['buy'] = data.buy.filter((item, index) => indexFilter <= index);
        }
      }

      return result;
    },
    isEmptyData() {
      return utils.isEmpty(this.chartData)
    }
  },
  mounted() {
    this._initChart();
  },
  beforeDestroy() {
    this._resetChart();
  },
  methods: {
    _initChart() {
      this.chart = this.$refs['chart'];
      this.context = utils.getContext2D(this.chart);
      this.maskChart = this.$refs['chartMask'];
      this.maskContext = utils.getContext2D(this.maskChart);
      this.xChart = this.$refs['xChart'];
      this.xChartContext = utils.getContext2D(this.xChart);
      this.yChart = this.$refs['yChart'];
      this.yChartContext = utils.getContext2D(this.yChart);

      this._drawChart(this.chartData);
    },
    _resetChart () {
      this.chart = this.maskChart = this.xChart = this.yChart = null
    },
    _drawChart(data) {
      if(!this.args) {
        this.args = this._calcArgs(data, this.fWidth, this.fHeight);
      }

      if(!this.isEmptyData) {
        const context = this.context;
        const width = parseFloat(this.fWidth);
        const height = parseFloat(this.fHeight);
        this._drawMainCanvas(context, data, width, height, this.args);
        this._drawXLine(data);
        this._drawYLine();
        this.hasPaint = true;
      }
    },
    _calcArgs(data, width, height) {
      if(!this.isEmptyData) {
        const maxAmount = Math.max(data.sell[0].total, data.buy[data.buy.length - 1].total);
        const scaleH = maxAmount / height;
        const scaleW = width / 2 / data.sell.length;

        return {
          maxAmount,
          scaleH,
          scaleW
        }
      }

      return null;
    },
    _drawMainCanvas(context, data, width, height, args) {
      if(!args) {
        throw new Error('args not ok');
      }

      if(this.hasPaint) {
        context.clearRect(0, 0, width, height);
      }

      context.fillStyle = '#FFFBF6';
      context.fillRect(0, 0, width, height);

      const { maxAmount } = args;
      const paddingTop = this.paddingTop;
      const gap = this.gap;
      const equalWidth = width / 2;

      let tempList = [];
      let x = 0;
      let y = paddingTop;
      let lastPoint = {x, y};
      let buyLength = data.buy.length;
      let sellLength = data.sell.length;

      if(data.buy.length) {

        const scaleW = equalWidth / (buyLength ? buyLength : 1);

        context.beginPath();
        context.fillStyle = this.buyFillColor;

        for(let i in data.buy) {
          let item = data.buy[i];

          x = equalWidth - i * scaleW - gap;
          y = height - item.total / maxAmount * (height - 24);

          if(Number(i) === 0 && x > 0) {
            context.lineTo(x, height);
          }

          if(x <= 2) {
            x = 2
          }

          tempList.push({
            x, y,
            value: item,
            side: 'buy'
          });

          if(this.jagged) {
            context.lineTo(x, lastPoint.y);
          }

          context.lineTo(x, y);
          context.stroke();
          lastPoint = { x, y };
        }

        context.lineWidth = 3;
        context.strokeStyle = '#0D7680';
        context.lineTo(0, y);
        context.lineTo(0, height);
        context.lineTo(equalWidth - gap, height);
        context.stroke();
        context.fill();
        context.closePath();
      }

      if(data.sell.length) {

        const scaleW = equalWidth / (sellLength ? sellLength : 1);

        context.beginPath();
        context.fillStyle = this.sellFillColor;
        context.moveTo(equalWidth + gap, height);

        lastPoint = {
          x: equalWidth + gap,
          y: height
        };

        for(let i in data.sell) {
          let item = data.sell[i];

          x = equalWidth + i * scaleW + gap;
          y = height - item.total / maxAmount * (height - 24);

          if(x > width - 2) {
            x = width - 2;
          }

          tempList.push({
            x, y,
            value: item,
            side: 'sell'
          });

          if(this.jagged) {
            context.lineTo(x, lastPoint.y);
          }

          context.lineTo(x, y);
          lastPoint = { x, y };
        }

        context.lineWidth = 3;
        context.strokeStyle = '#8F223A';
        context.lineTo(width + gap, y);
        context.lineTo(width + gap, height);
        context.lineTo(equalWidth + gap, height);
        context.stroke();
        context.fill();
        context.closePath();

        tempList = tempList.sort((a, b) => a.x - b.x);
        tempList.forEach((item) => this.valueMap.set([item.x, item.y, item.side], item.value));
      }
    },
    _drawXLine(data) {
      const context = this.xChartContext;
      const width = parseFloat(this.fWidth);

      if(this.hasPaint) {
        context.clearRect(0, 0, width, 24);
      }

      context.font = '10px Sans-Serif';
      context.fillStyle = "rgba(0, 0, 0, 0.35)";

      let buyLength = data.buy.length;
      let sellLength = data.sell.length;

      const equalWidth = width / 2;
      const step = width <= 650 ? 3 : 4;

      this._xPagesFn(buyLength, equalWidth, step, context, data, 'buy', width);
      this._xPagesFn(sellLength, equalWidth, step, context, data, 'sell', width);
    },
    _xPagesFn(length, equalWidth, step, context, data, type, width) {
      if(length) {
        let x = 0;
        let y = 16;
        const scaleW = equalWidth / (length ? length : 1);
        const Divisor = Math.ceil(length / step);

        for(let i = 0; i < length; i++) {
          let item = data[type][i];

          if(i % Divisor) {
            continue;
          }

          let text = item.price;
          let textWidth = Math.floor(context.measureText(text).width);

          if(type === 'sell') {
            x = equalWidth + 16 + i * scaleW;
          } else {
            x = equalWidth - i * scaleW - textWidth;
          }

          if(x + textWidth >= width) {
            x = width - textWidth;
          }

          context.fillText(text, x, y);
        }
      }
    },
    _drawYLine() {
      let x = 0;
      let y = 0;
      const height = parseFloat(this.fHeight);
      const { maxAmount } = this.args;
      const context = this.yChartContext;

      if(this.hasPaint) {
        context.clearRect(0, 0, 48, height);
      }

      context.font = '10px Sans-Serif';
      context.fillStyle = "rgba(0, 0, 0, 0.35)";

      let seg = maxAmount / 5;
      for(let i = 1; i < 6; i++) {
        x = 6;
        y = height - seg * (i - 1) / maxAmount * height - 16;
        context.fillText(utils.toPretty(seg * i), x, y);
      }
    },
    handleMouseMove({ offsetX, offsetY }) {
      const valueMap = this.valueMap;
      const maskContext = this.maskContext;
      const width = this.fWidth;
      const height = this.fHeight;
      const Half = width / 2;


      for(let key of valueMap.keys()) {
        const x = key[0];
        const y = key[1];
        const side = key[2];
        const result = valueMap.get(key);
        const colorsDepth = side === 'buy' ? '#0D7680' : '#8F223A';
        const colorsDepthArc = side === 'buy' ? 'rgba(13, 118, 128, 0.35)' : 'rgba(143, 34, 58, 0.35)';
        const isLeft = offsetX < Half;

        if(offsetX < x) {
          maskContext.strokeStyle = colorsDepth;
          maskContext.lineWidth = 2;
          maskContext.setLineDash([3]);
          maskContext.clearRect(0, 0, width, height);
          // maskContext.beginPath();
          // maskContext.moveTo(0, y);
          // maskContext.lineTo(width, y);
          // maskContext.stroke();
          // maskContext.closePath();

          maskContext.beginPath();
          maskContext.moveTo(x, y);
          maskContext.lineTo(x, height);
          maskContext.stroke();
          maskContext.closePath();

          maskContext.beginPath();
          // maskContext.shadowBlur = 10;
          // maskContext.shadowColor = 'rgba(0, 0, 0, 0.8)';

          maskContext.fillStyle = colorsDepthArc;
          maskContext.arc(x, y, 10, 0, 2 * Math.PI);
          maskContext.fill();
          maskContext.closePath();

          maskContext.beginPath();
          maskContext.fillStyle = colorsDepth;
          maskContext.arc(x, y, 5, 0, 2 * Math.PI);
          maskContext.fill();
          maskContext.closePath();


          maskContext.beginPath();
          maskContext.fillStyle = 'white';
          maskContext.font = '12px bold';


          let widthOffset = 152;
          let heightOffset = 96;
          let left = x - widthOffset / 2;
          let top = y - heightOffset - 10;
          let maxTextWidth = Math.max(maskContext.measureText('委托价').width, maskContext.measureText('累计').width);

          // if(maxTextWidth + 20 > widthOffset) {
          //   widthOffset = maxTextWidth + 20;
          // }
          //
          // if(left < 0) {
          //   left = 0
          // }

          // if(left >= width - widthOffset) {
          //   left = width - widthOffset;
          // }

          if(top <= 0) {
            top = y + 10;
          }

          const marginLeft = 10;
          const marginTop = 24;
          const lineHeight = 20;
          const leftPos = left + widthOffset / 2;
          const leftPosAndMargin = left + marginLeft + widthOffset / 2 + 6;
          const rightPos = left - widthOffset / 2;
          const rightPosAndMargin = left - marginLeft + widthOffset - 206;
          const textPos = isLeft ? leftPosAndMargin : rightPosAndMargin;

          // maskContext.fillRect(left, top, widthOffset, heightOffset);
          this.drawRoundedRect(maskContext, isLeft ? leftPos : rightPos, top, widthOffset, heightOffset, 4, true, false);

          maskContext.fillStyle = colorsDepth;
          maskContext.fillRect(leftPos, top, 2, heightOffset);
          maskContext.textAlign = 'left';
          maskContext.shadowBlur = 6;
          maskContext.shadowColor = 'rgba(255, 206, 167, 0.5)';

          maskContext.fillStyle = 'rgba(0, 0, 0, 0.65)';
          maskContext.fillText('委托价', textPos, top + marginTop);
          maskContext.fillStyle = 'black';
          maskContext.fillText(utils.toThousand(result.price), textPos, top + marginTop + 16);
          maskContext.fillStyle = 'rgba(0, 0, 0, 0.65)';
          maskContext.fillText('累计', textPos, top + marginTop + lineHeight + 24);
          maskContext.fillStyle = 'black';
          maskContext.fillText(utils.toThousand(result.total), textPos, top + marginTop + lineHeight + 40);
          maskContext.closePath();
          break;
        }
      }
    },
    handleMouseOut() {
      const maskContext = this.maskContext;
      const width = this.fWidth;
      const height = this.fHeight;
      maskContext.clearRect(0, 0, width, height)
    },
    drawRoundedRect(ctx, x, y, width, height, r, fill, stroke) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + r, r);
      ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
      ctx.arcTo(x, y + height, x, y + height - r, r);
      ctx.arcTo(x, y, x + r, y, r);

      if (fill) {
        ctx.fill();
      }

      if (stroke) {
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  line-height: 1;
}

.chart-layout {
  position: relative;
  margin-top: 120px;
}

.chart-layout canvas {
  position: absolute;
}
</style>
