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

      context.font = '10px Sans-Serif';
      context.fillStyle = "rgba(0, 0, 0, 0.35)";

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

        y = 16;
        context.fillText(text, x, 16);
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
        y = height - seg * i / maxAmount * height;
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
          maskContext.setLineDash([6]);
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
          let maxTextWidth = Math.max(maskContext.measureText(this.tipsPrice).width, maskContext.measureText(this.tipsTotal).width);

          if(maxTextWidth + 20 > widthOffset) {
            widthOffset = maxTextWidth + 20;
          }

          if(left < 0) {
            left = 0
          }

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


          // console.log(leftPos, 'leftPos')
          // console.log(widthOffset, 'widthOffset')
          // console.log(rightPos, 'rightPos')
          // console.log(left, 'left')
          // maskContext.fillRect(left, top, widthOffset, heightOffset);
          this.drawRoundedRect(maskContext, isLeft ? leftPos : rightPos, top, widthOffset, heightOffset, 4, true, false);

          maskContext.fillStyle = colorsDepth;
          maskContext.fillRect(leftPos, top, 2, heightOffset);
          maskContext.textAlign = 'left';
          maskContext.shadowBlur = 6;
          maskContext.shadowColor = 'rgba(255, 206, 167, 0.5)';

          maskContext.fillStyle = 'rgba(0, 0, 0, 0.65)';
          maskContext.fillText(this.tipsPrice, textPos, top + marginTop);
          maskContext.fillStyle = 'black';
          maskContext.fillText(utils.toThousand(result.price), textPos, top + marginTop + 16);
          maskContext.fillStyle = 'rgba(0, 0, 0, 0.65)';
          maskContext.fillText(this.tipsTotal, textPos, top + marginTop + lineHeight + 24);
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
