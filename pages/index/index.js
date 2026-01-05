// index.js

Page({
  data: {
  
  },
  handleQuoteTap:()=>{
    wx.navigateTo({
      url: '/pages/quote/quote',
    })
  },

  handleShrinkLabelTap: ()=>{
    wx.navigateTo({
      url: '/pages/shrinklabel/shrinklabel',
    })
  }
})
