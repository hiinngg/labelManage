// pages/quote/quote.js
import {supplier,materialsData,coverFilmData,materialPriceData} from '../../data/material'
const { debounce } = require('../../utils/util')
const genMaterialList=(data)=>{
  let res = []
   for (let index = 0; index < data.length; index++) {
     const element = data[index];
     res.push({
      label:element.name,
      value:element.code,
      children:materialPriceData.filter((f)=>{
        return f.materialCode==element.code
      }).map((m)=>{
          return {
            label:`${supplier[m.supplier]}--${m.price}`,
            value:JSON.stringify({
              ...m,
              materialName:element.name
            })
          }
      })
   })
  }
   return res
}

//烫金暂定2元每平方
const coverGoldPrice = 2.0
const errMsg = {
  '0001':'请选择材料',
  '0002':'请填写尺寸',
}
const labelItem = {
  width:0,
  height:0,
  bleedTopBotom:2,
  bleedLeftRight:1.5,
  spaceLeftRight:0,
  spaceTopBottom:0,
  coverGoldHeight:0,//是否烫金
  isUvReverse:false,//是否光油/逆向
  fluctuation:0   //浮动
 }

Page({
 

  /**
   * 页面的初始数据
   */
  data: {
      quoteForm:{
          labels:[],  //标签尺寸
          material:{},  //材料
          coverFilm:{},  //覆膜
      },
      totalPrice:0,
      totalPriceErrMsg:'',
      coverfilmVisible:false,
      materialVisible:false,
      _materialsData:genMaterialList(materialsData),
      _coverfilmData:genMaterialList(coverFilmData)
      // _materialPriceData:materialPriceData.map((m)=>{
      //      let material = materialsData.find((f)=>f.code==m.materialCode)
      //      if(material){
      //      return {
      //        label:`${material.name}-${supplier[m.supplier]}`,
      //        value:JSON.stringify({
      //          name:material.name,
      //          'supplier':supplier[m.supplier],
      //          price:m.price
      //        })
      //      }}
      // }).filter((fi)=>fi&&fi.value)
       
  },
  // 临时缓存，不立刻 setData
  cacheQuoteForm: null,


  handleAddLabel(){
     let arr = this.data.quoteForm.labels
    let data = arr.concat([JSON.parse(JSON.stringify({
      ...labelItem,
      id:Math.random().toString(36).substring(2, 10)
    }))])
      this.cacheQuoteForm.labels = data
      this.setData({
        'quoteForm.labels':data
      })
  },

 onInputChange(e){
  const { id, field } = e.currentTarget.dataset
  const { value } = e.detail || e;
  let arr = this.cacheQuoteForm.labels
  let itemIndex = arr.findIndex((v)=>v.id==id)
  if(itemIndex<0){
    return
  }
    // 更新缓存数据
    arr[itemIndex][field] = value
    console.log('输入触发计算价格=====》')
    this.updatePriceThrottled()
  // this.setData({
  //   [`quoteForm.labels[${itemIndex}].${field}`]: value
  // }) 
 },

 updatePrice() {
  try {
    if (!this.data.quoteForm.material || Object.keys(this.data.quoteForm.material).length === 0) {
      throw new Error(errMsg['0001'])
    }
    console.log('开始计算。。。。',this.cacheQuoteForm.labels)
    const arr = this.cacheQuoteForm.labels
    const plateWidth = 310
    let info = []
    let totalPrice = 0

    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      let whetherCanImpose = true 
      let itemArea = 0;
      let coverGoldArea = 0;
      let itemPrice = 0
      let itemWidth = 0
      let itemHeight = 0
      if((!element.width)||(!element.height)){
        throw new Error(errMsg['0002'])
      }
       itemWidth = parseFloat(element.width)+(parseFloat(element.bleedLeftRight))*2+parseFloat(element.spaceLeftRight)*2;
      
       itemHeight = parseFloat(element.height)+(parseFloat(element.bleedTopBotom))*2+parseFloat(element.spaceTopBottom)*2;
      if(itemHeight*2 > plateWidth){
        whetherCanImpose = false
      }else{
        whetherCanImpose = true
      }
      itemArea = (itemWidth/1000)*(itemHeight/1000+(whetherCanImpose?0.005:0.01))
      if(element.coverGoldHeight>0){
        coverGoldArea = (itemWidth/1000)*(parseFloat(element.coverGoldHeight)/1000)
      }else{
        coverGoldArea = 0
      }
      itemPrice = (parseFloat(this.data.quoteForm.material.price)+(element.isUvReverse?0.5:0)+parseFloat(element.fluctuation)+parseFloat(this.data.quoteForm.coverFilm.price||0))*parseFloat(itemArea)+parseFloat(coverGoldPrice)* parseFloat(coverGoldArea)
      totalPrice+=parseFloat(itemPrice)
      info.push({
        label:element,
        width:itemWidth,
        height:itemHeight,
        itemArea,
        coverGoldArea,
        itemPrice
      })
    }
    console.log(info,totalPrice,'infoooooooooo')
    // 一次性更新视图层
    this.setData({
      'quoteForm.labels': arr,
      totalPrice: totalPrice.toFixed(3),
      totalPriceErrMsg:''
    })
  } catch (error) {
    this.setData({
      totalPriceErrMsg:error.message
    })
  }

 
},



  onMaterialChange(e){
    const { value } = e.detail;
    //{"materialCode":"m1","supplier":"shengda","price":"2.0","materialName":"60#珠光膜30#透明pet水胶"}
    this.setData({ 'quoteForm.material': JSON.parse(value)},()=>{
      this.updatePriceThrottled()
    })
  },

  onCoverfilmChange(e){
    const { value } = e.detail;
    this.setData({ 'quoteForm.coverFilm': JSON.parse(value)},()=>{
      this.updatePriceThrottled()
    })
  },



  onMaterialPicker() {
    this.setData({ materialVisible: true });
  },

  onCoverfilmPicker() {
    this.setData({ coverfilmVisible: true });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 缓存逻辑层数据，避免频繁 setData
    this.cacheQuoteForm = JSON.parse(JSON.stringify(this.data.quoteForm))

    // 节流包装计算价格函数
    this.updatePriceThrottled = debounce(this.updatePrice.bind(this), 300)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})