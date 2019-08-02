export default {
  getContext2D(element) {
    if(element) {
      return element.getContext('2d');
    }

    return null;
  },
  isEmpty(map) {
    if(!map) {
      return true;
    }

    if(map instanceof Array) {
      return !map.length;
    }

    return !Object.keys(map).length;
  },
  toPretty(num) {
    num = num || 0;
    if (num < 100) {
      return num.toFixed(2)
    }
    if (num < 1e6) {
      return (num /1e3).toFixed(1) + ' K'
    }
    if (num < 1e7) {
      return (num / 1e6).toFixed(1) + ' M'
    }
    if (num < 1e9) {
      return (num /1e6).toFixed(0) + ' M'
    }
    if (num < 1e10) {
      return (num / 1e9).toFixed(1) + ' B'
    }
    return (num / 1e9).toFixed(0) + ' B'
  },
  toThousand(num = 0) {
    if (typeof num === 'undefined') {
      return 0
    }
    return (num || 0).toString().replace(/\d+/, function (n) {
      let len = n.length;
      if (len % 3 === 0) {
        return n.replace(/(\d{3})/g, ',$1').slice(1)
      } else {
        return n.slice(0, len % 3) + n.slice(len % 3).replace(/(\d{3})/g, ',$1')
      }
    })
  },
}
