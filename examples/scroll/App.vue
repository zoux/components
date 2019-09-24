<template>
  <div id="app">

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

  </div>
</template>

<script>
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
</script>

<style lang="scss">
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body,
  #app {
    height: 100%;
    background: #fafafa;
  }

  .item {
    background: #fff;
    height: 40px;
    line-height: 40px;
    text-align: center;
    border-bottom: 1px solid #eee;
  }

  .fixed {
    position: fixed;
    top: 50%;
    left: 0;
  }

  .fixed-btn {
    border: 1px solid #ddd;
    background: skyblue;
  }
</style>
