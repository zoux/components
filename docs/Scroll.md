# Scroll

> 该组件基于 [better-scroll](https://github.com/ustbhuangyi/better-scroll) 封装，设计参考于 [vue-slim-better-scroll](https://github.com/wannaxiao/vue-slim-better-scroll)。


### 引用

```javascript
import { Scroll } from '@zouxin/components'

Vue.use(Scroll)
// 或者
export default {
  components: {
    [Scroll.name]: Scroll
  }
}
```


## 代码演示

### 基础用法

```html
<div style="height: 85%;">
  <ComScroll ref="scroll" :updateData="[dataList]" @loadRefresh="loadRefresh" @loadMore="loadMore">
    <div class="content">
      <div v-for="(item, index) of dataList" :key="index" class="item">{{ item }}</div>
    </div>
  </ComScroll>
</div>

<div style="height: 15%;">
  <div @click="scrollToTop">点击我滚动到顶部</div>
  <div @click="scrollToBottom">点击我滚动到底部</div>
</div>
```

```javascript
import { sleep } from '@zouxin/utils'

export default {
  data () {
    return {
      page: 1,
      pageSize: 10,
      dataList: []
    }
  },
  async mounted () {
    await this.loadRefresh()
  },
  methods: {
    async loadRefresh () {
      this.page = 1
      this.dataList = await this.fetchList()
    },
    async loadMore () {
      const data = await this.fetchList(this.page + 1)
      this.dataList.push(...data)
      if (data.length < this.pageSize) {
        this.$refs.scroll.update(true)
      } else {
        this.page += 1
      }
    },
    async fetchList (page = 1, pageSize = this.pageSize) {
      await sleep(1000)
      let data
      if (page <= 2) {
        data = Array.from({ length: pageSize }, (item, index) => `第${page}页的第${index}项`)
      } else if (page === 3) {
        data = Array.from({ length: pageSize / 2 }, (item, index) => `最后一页，第${page}页的第${index}项`)
      } else {
        data = []
      }
      return data
    },
    scrollToTop () {
      this.$refs.scroll.scrollToTop()
    },
    scrollToBottom () {
      this.$refs.scroll.scrollToBottom()
    }
  }
}
```


## API

### Props

|参数名|说明|类型|默认值|
|:---|:---|:---|:---|
|probeType|滚动事件监听类型|Number|1|
|click|派发列表click事件|Boolean|true|
|pullDown|启用下拉刷新|Boolean|true|
|pullDownRefresh|下拉刷新配置|Object|{ threshold: 90, stop: 40 }|
|pullUp|启用上拉加载|Boolean|true|
|pullUpLoad|上拉加载配置|Object|{ threshold: 100 }|
|pullUpTips|上拉提示语|String|'— 我是有底线的 —'|
|bounceTime|回弹动画的动画时长|Number|600|
|beforeScrollStart|派发列表滚动开始之前的事件|Boolean|false|
|listenScroll|派发滚动事件|Boolean|false|
|betterScrollOptions|better-scroll 配置项，与 props 冲突的配置项将被 props 覆盖|Object|{}|
|updateData|与下拉刷新/上拉加载相关的数据|Array|[]|


### Events

|事件名|说明|回调参数|
|:---|:---|:---|
|beforeScrollStart|触发时机：滚动开始之前 (触发事件在参数中需要开启 `beforeScrollStart`，该参数默认为 `false` )||
|scroll|触发时机：滚动过程中，具体时机取决于选项中的 probeType (触发事件在参数中需要开启 `listenScroll`，该参数默认为 `false` )|pos:Object|
|loadRefresh|触发时机：在一次下拉刷新的动作后，这个时机一般用来去后端刷新数据。(触发事件在参数中需要开启 `pullDown`，该参数默认为 `true` )||
|loadMore|触发时机：在一次上拉加载的动作后，这个时机一般用来去后端请求数据。(触发事件在参数中需要开启 `pullUp`，该参数默认为 `true` )||


### Methods

|方法名|说明|参数|
|:---|:---|:---|
|scrollToTop|滑动到顶部||
|scrollToBottom|滑动到底部||
|refresh|更新 Scroll 状态，DOM 结构发生变化后调用||
|update|更新 Scroll 状态，下拉刷新/上拉加载结束后调用|isPullUpDone: Boolean|


### Slots

|名称|说明|
|:---|:---|
|default|滚动的主体内容区域|
|pullDown|下拉刷新的内容|
|pullUp|上拉加载的内容|
