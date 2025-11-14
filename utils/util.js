const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

function throttle(fn, delay = 300) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

export function debounce(fn, delay = 300) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer); // 🔹(1) 清除上一次的定时器
    timer = setTimeout(() => {
      fn.apply(this, args); // 🔹(2) 延迟执行目标函数
    }, delay);
  };
}

module.exports = {
  formatTime,
  throttle,
  debounce
}
