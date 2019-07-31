<template>
  <div class="hello">
    <div class="chart-layout" :style="wrapStyles">
      <canvas class="chart" ref="chart" :width="fWidth" :height="fHeight" :style="chartStyles"></canvas>
      <canvas class="chart-mask" ref="chartMask" :width="fWidth" :height="fHeight"></canvas>
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
      default: '300px'
    },
    width: {
      type: String,
      default: '600px'
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
    axisFontSize: {
      type: Number,
      default: 12
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
    tipsPrice: {
      type: String,
      default: '委托价'
    },
    tipsTotal: {
      type: String,
      default: '累计'
    }
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
      const data = {
        'sell': [
          { 'price': 9000, 'amount': 8176 },
          { 'price': 8999.84, 'amount': 10245 },
          { 'price': 8999.68, 'amount': 19147 },
          { 'price': 8999.52, 'amount': 4150 },
          { 'price': 8999.36, 'amount': 10420 },
          { 'price': 8999.2, 'amount': 16053 },
          { 'price': 8999.04, 'amount': 8480 },
          { 'price': 8998.88, 'amount': 12751 },
          { 'price': 8998.72, 'amount': 14187 },
          { 'price': 8998.56, 'amount': 7916 },
          { 'price': 8998.32, 'amount': 14187 },
          { 'price': 8998.22, 'amount': 14187 },
          { 'price': 8998.12, 'amount': 1000 },
          { 'price': 8998.02, 'amount': 4000 },
          { 'price': 8997.72, 'amount': 3000 },
          { 'price': 8997.42, 'amount': 2000 },
          { 'price': 8997.22, 'amount': 10000 }
        ],
        'buy': [
          { 'price': 8999, 'amount': 4000 },
          { 'price': 8748.74, 'amount': 6000 },
          { 'price': 8748.48, 'amount': 3000 },
          { 'price': 8748.22, 'amount': 4000 },
          { 'price': 8747.96, 'amount': 4000 },
          { 'price': 8747.7, 'amount': 3414 },
          { 'price': 8747.44, 'amount': 12062 },
          { 'price': 8747.18, 'amount': 19389 },
          { 'price': 8746.92, 'amount': 8999 },
          { 'price': 8746.66, 'amount': 8675 }
        ]
      };

      for (let i in data['buy']) {
        let total = 0;
        for (let n = 0; n <= i; n++) {
          total += data['buy'][n]['amount']
        }
        data['buy'][i]['total'] = total
      }

      for (let i in data['sell']) {
        let total = 0;
        for (let n = i; n < data['sell'].length; n++) {
          total += data['sell'][n]['amount']
        }
        data['sell'][i]['total'] = total
      }

      return data;
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

      const { maxAmount, scaleW } = args;
      const paddingTop = this.paddingTop;
      const gap = this.gap;
      let tempList = [];

      context.beginPath();
      context.fillStyle = this.buyFillColor;
      let x = 0;
      let y = paddingTop;
      let lastPoint = {x, y};

      for(let i in data.buy) {
        x = width / 2 - i * scaleW - gap;
        y = height - data.buy[i].total / maxAmount * (height) + (paddingTop / 2);

        if(y > height - paddingTop) {
          y = height;
        }

        tempList.push({
          x, y,
          value: data.buy[i],
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
      context.strokeStyle = "#0D7680";
      context.lineTo(0, y);
      context.lineTo(0, height);
      context.lineTo(width / 2 - gap, height);
      context.stroke();
      context.fill();
      context.closePath();


      context.beginPath();
      context.fillStyle = this.sellFillColor;
      context.moveTo(width / 2 + gap, height);
      lastPoint = {
        x: width / 2 + gap,
        y: height
      };

      for(let i in data.sell) {
        const index = data.sell.length - i - 1;

        x = width / 2 + i * scaleW + gap;
        y = height - data.sell[index].total / maxAmount * height + paddingTop;

        if(y > height - paddingTop) {
          y = height;
        }

        tempList.push({
          x, y,
          value: data.sell[index],
          side: 'sell'
        });

        if(this.jagged) {
          context.lineTo(x, lastPoint.y);
        }

        context.lineTo(x, y);
        lastPoint = { x, y };
      }


      tempList = tempList.sort((a, b) => a.x - b.x);

      tempList.forEach((item) => this.valueMap.set([item.x, item.y, item.side], item.value));

      context.lineWidth = 3;
      context.strokeStyle = "#8F223A";
      context.lineTo(width + gap, y);
      context.lineTo(width + gap, height);
      context.lineTo(width / 2 + gap, height);
      context.stroke();
      context.fill();
      context.closePath();
    },
    _drawXLine(data) {
      const context = this.xChartContext;
      const width = parseFloat(this.fWidth);

      if(this.hasPaint) {
        context.clearRect(0, 0, width, 24);
      }

      const { scaleW } = this.args;

      context.fillStyle = "#ccc";

      let x = 0;
      let y = 0;
      let buyLength = data.buy.length;
      let sellLength = data.sell.length;

      for(let i = 0; i < buyLength + sellLength; i++) {
        if( i % 4) {
          continue;
        }
        let index;
        let text;
        let textWidth;

        if( i < buyLength) {
          index = i;
          text = data.buy[index].price;
          textWidth = context.measureText(text).width;
          x = width / 2 - i * scaleW - textWidth;
        } else {
          index = sellLength - ( i - buyLength) - 1;
          text = data.sell[index].price;
          textWidth = context.measureText(text).width;
          x = width / 2 + index * scaleW;
        }

        if(x + textWidth >= width) {
          x = width - textWidth;
        } else if(x <= 0) {
          x = 0;
        }

        y = this.axisFontSize || 12;
        context.fillText(text, x, y);
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

      context.fillStyle = "#ccc";

      let seg = maxAmount / 5;
      for(let i = 1; i < 6; i++) {
        x = this.axisFontSize || 12;
        y = height - seg * i / maxAmount * height;
        context.fillText(utils.toPretty(seg * i), x, y);
      }
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
}

.chart-layout canvas {
  position: absolute;
}
</style>
