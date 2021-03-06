<template>
  <div class="repo">
    <div class="repoInfo">
      <div class="baseInfo">
        <div class="base_user">
          <img class="avatarImg" lazy-load :src="repoInfo.avatar_url" alt="avatar"/>
          <div>{{repoInfo.login}}</div>
        </div>
        <div class="base_name">{{repoInfo.name}}</div>
        <div class="base_description" v-if="repoInfo.description">{{repoInfo.description}}</div>
        <div class="base_star">
          <button class="starBtn" @click="starOperations()" v-bind:style="{'background-color':isStar?'rgb(219,219,219)':'rgb(0,114,225)'}">{{isStar?'Unstar':'Star'}}</button>
          <div>{{repoInfo.stargazers_count}}</div>
        </div>
      </div>
      <div class="dataInfo">
        <div class="buttonBar">
          <div class="bar">
            <img src="../../octicons/svg/eye.svg" class="iconMini"><span class="textMini">watch</span>{{repoInfo.watchers}}
          </div>
          <div class="bar">
            <img src="../../octicons/svg/git-branch.svg" class="iconMini"><span class="textMini">fork</span>{{repoInfo.forks}}
          </div>
          <div class="bar">
            <img src="../../octicons/svg/issue-opened.svg" class="iconMini"><span class="textMini">issues</span>{{repoInfo.open_issues}}
          </div>
          <div class="bar">
            <img src="../../octicons/svg/calendar.svg" class="iconMini"><span class="textMini">updated</span>{{repoInfo['updated_at']}}
          </div>
        </div>
        <div class="contributorList">
          <div class="listTitle">Contributor list</div>
          <div v-for="(item,index) in contributorList" :key="index" class="listItem" @click="toProfile(item.login)">
            <div class="listItemLeft">
              <img class="avatarImgMini" lazy-load :src="item.avatar_url" alt="avatar"/>
              <div class="loginMini">{{item.login}}</div>
            </div>
            <div class="listItemMiddle">{{item.contributions}} contributions</div>
            <div class="listItemRight">#{{index+1}}</div> 
          </div>
        </div>
      </div>
    </div>
    <div class="repoToolbar">
      <div class="block borderTop borderBottom">
        <div class="blockText">
          <img src="../../octicons/svg/file-code.svg" class="icon">
          View Code
        </div>
        <div class="arrow">
          <img src="../../../static/images/icon_arrow_right.png" class="icon">
        </div>
      </div>
      <div class="block borderTop borderBottom">
        <div class="blockText">
          <img src="../../octicons/svg/issue-opened.svg" class="icon">
          Issue
        </div>
        <div class="arrow">
          <img src="../../../static/images/icon_arrow_right.png" class="icon">
        </div>
      </div>
    </div>
    <div class="repoReadMe">
      <div class="block borderTop borderBottom">
        <div class="blockText">
          <img src="../../octicons/svg/book.svg" class="icon">
          README.md
        </div>
      </div>
      <div class="readme">
        <wxParse :content="readme"/>
      </div>
    </div>
  </div>
</template>
<script>
import { formatFigure } from '@/utils/index'
import { format } from 'date-fns'
import { Base64 } from 'js-base64'
import marked from 'marked'
import wxParse from 'mpvue-wxparse'
import api from '@/http/api'

export default {
  onLoad (options) {
    this.repoInfo = {}
    this.contributorList = []
    this.readme = '<p>此仓库无README.</p>'
    this.repoName = options.repoFullName

    this.getRepoInfo(this.repoName)
    this.getIsStar(this.repoName)
    this.getReadMe(this.repoName)
    this.getContributor(this.repoName)
  },
  mounted () {},
  async onPullDownRefresh () {
    await this.getRepoInfo(this.repoName)
    await this.getIsStar(this.repoName)
    await this.getReadMe(this.repoName)
    wx.stopPullDownRefresh()
  },
  data () {
    return {
      repoInfo: {},
      repoName: '',
      readme: '',
      isStar: false,
      contributorList: []
    }
  },
  components: {
    wxParse
  },
  methods: {
    async getRepoInfo (reponame) {
      const res = await api.getRepo(reponame)
      const data = res.data
      // item.owner.avatar_url在DOM渲染时报avatar_url属性undefined的错误
      // get请求是异步的,意味着该函数的执行不会阻塞后面代码的执行。所以会先执行下一个函数,再获得全部data数据
      this.repoInfo = this.dealRepo(data)
    },
    async getReadMe (reponame) {
      const res = await api.getReadme(reponame)
      const data = res.data
      if (res.statusCode === 404) {
        this.readme = '<p>此仓库无README.</p>'
      } else {
        let readme = Base64.decode(data.content)
        this.readme = marked(readme)
      }
    },
    async getIsStar (reponame) {
      const res = await api.getIsStar(reponame)
      if (res.statusCode !== 404) {
        this.isStar = true
      } else {
        this.isStar = false
      }
    },
    async getContributor (reponame) {
      const res = await api.getContributorList(reponame)
      this.contributorList = res.data.slice(0, 3)
    },
    async unstarRepo () {
      const reponame = this.repoName
      const res = await api.deleteStar(reponame)
      if (res.statusCode !== 404) {
        this.isStar = false
      }
    },
    async starRepo () {
      const reponame = this.repoName
      const res = await api.putStar(reponame)
      if (res.statusCode !== 404) {
        this.isStar = true
      }
    },
    starOperations () {
      if (this.isStar) {
        this.unstarRepo()
      } else {
        this.starRepo()
      }
    },
    toProfile (username) {
      wx.navigateTo({
        url: '/pages/profile/main?userName=' + username
      })
    },
    dealRepo (data) {
      return {
        updated_at: format(data.updated_at, 'MMM DD'),
        avatar_url: data.owner['avatar_url'],
        login: data.owner['login'],
        name: data.name,
        description: data.description,
        stargazers_count: formatFigure(data.stargazers_count),
        watchers: formatFigure(data.watchers),
        forks: formatFigure(data.forks),
        open_issues: data.open_issues
      }
    }
  }
}
</script>

<style lang='scss' scoped>
@import "./style.scss";
@import url("~mpvue-wxparse/src/wxParse.css");
</style>
