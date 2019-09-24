<template>
  <div ref="scroll" :class="c('scroll')">
    <div :class="c('wrapper')">
      <div ref="content" :class="c('content')">
        <slot></slot>
      </div>

      <template v-if="pullUp">
        <slot name="pullUp"
              :isPullUp="isPullUp"
              :isPullUpDone="isPullUpDone">
          <div :class="c('pullUp')">
            <Loading v-if="isPullUp && !isPullUpDone" />
            <div v-if="isPullUpDone">{{ pullUpTips }}</div>
          </div>
        </slot>
      </template>
    </div>

    <template v-if="pullDown">
      <slot name="pullDown"
            :isPullDownBefore="isPullDownBefore"
            :isPullDown="isPullDown"
            :pullDownStyle="pullDownStyle"
            :pullDownTop="pullDownTop"
            :bubbleY="bubbleY">
        <div ref="pullDown" :class="c('pullDown')" :style="pullDownStyle">
          <div v-if="isPullDownBefore" :class="c('pullDown-before')"><Bubble :y="bubbleY" /></div>
          <div v-if="isPullDown" :class="c('pullDown-after')"><Loading /></div>
        </div>
      </slot>
    </template>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import Bubble from '~/Scroll/src/Bubble'
import Loading from '~/Scroll/src/Loading'

import mixinCommon from '~/mixins'
import { sleep } from '@zouxin/utils'

export default {
  name: 'Scroll',
  mixins: [mixinCommon],
  components: {
    Bubble,
    Loading
  },
  props: {
    // 滚动事件监听类型
    probeType: {
      type: Number,
      default: 1
    },
    // 派发列表click事件
    click: {
      type: Boolean,
      default: true
    },
    // 启用下拉刷新
    pullDown: {
      type: Boolean,
      default: true
    },
    // 下拉刷新配置
    pullDownRefresh: {
      type: Object,
      default: () => ({
        threshold: 90, // 触发 pullingDown 的距离
        stop: 40 // pullingDown 正在刷新 hold 时的距离
      })
    },
    // 启用上拉加载
    pullUp: {
      type: Boolean,
      default: true
    },
    // 上拉加载配置
    pullUpLoad: {
      type: Object,
      default: () => ({
        threshold: 100 // 提前触发 pullingUp 的距离
      })
    },
    // 上拉提示语
    pullUpTips: {
      type: String,
      default: '— 我是有底线的 —'
    },
    // 回弹动画的动画时长
    bounceTime: {
      type: Number,
      default: 600
    },
    // 派发列表滚动开始之前的事件
    beforeScrollStart: {
      type: Boolean,
      default: false
    },
    // 派发滚动事件
    listenScroll: {
      type: Boolean,
      default: false
    },
    // better-scroll 配置项，与 props 冲突的配置项将被 props 覆盖
    betterScrollOptions: {
      type: Object,
      default: () => ({})
    },
    // 与下拉刷新/上拉加载相关的数据
    updateData: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      scroll: null, // Scroll 实例
      isUpdate: false, // 正在 update 中
      isRebounding: false, // 正在回弹

      isPullDownBefore: true, // 下拉之前
      isPullDown: false, // 正在下拉
      pullDownStyle: '', // pullDown loading 的 translateY
      pullDownTop: 0, // 用于计算上述 translateY
      bubbleY: 0, // 气泡的 y 坐标

      isPullUp: false, // 正在上拉
      isPullUpDone: false // 上拉是否加载完毕
    }
  },
  watch: {
    // 监听数据的变化后调用 update 方法重新计算状态
    async updateData () {
      await this.update()
    }
  },
  async mounted () {
    await this._initScroll()
  },
  async activated () {
    await this.refresh()
  },
  methods: {
    // 滑动到顶部
    scrollToTop () {
      this.scroll.scrollTo(0, 0, this.bounceTime)
    },
    // 滑动到底部
    scrollToBottom () {
      this.scroll.scrollTo(0, this.scroll.maxScrollY, this.bounceTime)
    },
    // 更新 Scroll 状态，DOM 结构发生变化后调用
    async refresh () {
      await this.$nextTick()
      await this.scroll.refresh()
    },
    // 更新 Scroll 状态，下拉刷新/上拉加载结束后调用
    async update (isPullUpDone = false) {
      if (this.isUpdate) return
      this.isUpdate = true

      if (this.pullDown && this.isPullDown) {
        // await sleep(this.bounceTime / 2) // 结束后停滞，用于展示提示文案

        this.isRebounding = true // 进入回弹状态
        this.scroll.finishPullDown() // 通知 Scroll 加载完毕，开始回弹
        await sleep(this.bounceTime) // 等待回弹动效完成
        this.isRebounding = false // 结束回弹状态
        this.isPullDownBefore = true // 恢复状态
        this.isPullDown = false // 结束加载状态
        this.scroll.openPullDown(this.pullDownRefresh) // 重启下拉周期
      }

      if (this.pullUp && this.isPullUp) {
        this.scroll.finishPullUp() // 通知 Scroll 加载完毕，开始回弹
        this.isPullUp = false // 结束加载状态
      }

      this.isPullUpDone = isPullUpDone
      await this.refresh()

      this.isUpdate = false
    },
    async _initScroll () {
      // 初始化时计算 pullDownTop
      this.pullDownTop = parseInt(this.$refs.pullDown && getComputedStyle(this.$refs.pullDown).top) || -50

      // 设置 content 的最小高度，实现内容高度不足时也有回弹效果
      if (this.$refs.content) {
        this.$refs.content.style.minHeight = `${this.$refs.scroll.getBoundingClientRect().height + 1}px`
      }

      await this.$nextTick()

      this.scroll = new BScroll(this.$refs.scroll, {
        ...this.betterScrollOptions,
        probeType: this.probeType,
        click: this.click,
        pullDownRefresh: this.pullDown && this.pullDownRefresh,
        pullUpLoad: this.pullUp && this.pullUpLoad,
        bounceTime: this.bounceTime
      })

      if (this.beforeScrollStart) this.scroll.on('beforeScrollStart', () => { this.$emit('beforeScrollStart') })
      if (this.listenScroll) this.scroll.on('scroll', pos => { this.$emit('scroll', pos) })
      if (this.pullDown) this._initPullDown()
      if (this.pullUp) this._initPullUp()
    },
    _initPullDown () {
      this.scroll.on('pullingDown', () => {
        this.isPullDownBefore = false
        this.isPullDown = true
        this.$emit('loadRefresh')
        this.scroll.closePullDown() // 防止一个下拉周期内二次触发
      })

      this.scroll.on('scroll', pos => {
        if (!this.pullDown || pos.y < 0) return

        const posY = Math.floor(pos.y) // 滚动的 y 轴位置

        if (this.isPullDownBefore) {
          this.bubbleY = Math.max(0, posY + this.pullDownTop)
          this.pullDownStyle = `transform: translateY(${Math.min(posY, -this.pullDownTop)}px)`
        } else {
          this.bubbleY = 0
        }

        if (this.isRebounding) {
          this.pullDownStyle = `transform: translateY(${Math.min(posY, this.pullDownRefresh.stop)}px)`
        }
      })
    },
    _initPullUp () {
      this.scroll.on('pullingUp', () => {
        if (this.isPullUpDone) {
          this.scroll.finishPullUp()
        } else {
          this.isPullUp = true
          this.$emit('loadMore')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../../__common__/common";

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .#{$PREFIX_CLASS_NAME} {
    &scroll {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    &wrapper {
      position: relative;
      z-index: 1; // wrapper 层级高于 pullDown slot 来保证如绑定的点击事件能正常触发
    }

    &pullUp {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 50px;
      font-size: 14px;
      color: rgb(153, 153, 153);
    }

    &pullDown {
      position: absolute;
      top: -50px; /* no */
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      font-size: 14px;
      color: rgb(153, 153, 153);
      transition: all;

      &-before {
        display: flex;
      }

      &-after {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 40px; /* no */
      }
    }
  }
</style>
