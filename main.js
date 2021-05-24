const { createApp, h } = Vue

const LOCAL_STORAGE_ID = 'vue-app-topics'

const NotFoundComponent = { template: '<p>Page not found</p>' }
const DashboardComponent = {
  template:
    /*html*/
    ` 
    <div class="dashboard">
    <h1>The english practice</h1>
    <div v-if="$root.NumberOfAnswered === 0" class="dashboard__body">
      <p>English sentence a day, helps you learn in a new way!</p>
      <div class="dashboard__illustraton">
      <img
      src="/assets/images/heroimage.svg"
      alt="Introduction illustration"
      height="213"
      width="300" />
      </div>
    </div>
    <div v-else class="dashboard__body">
      <p>Your sentences so far</p>
      <ol class="dashboard__list">
        <li v-for="(topic, key) in $root.topics.filter(topic => topic.answer.length > 0)">
          <span class="dashboard__list__prefix">({{ topic.name }}) </span> <span
            class="dashboard__list__item">{{ topic.answer }}</span>
        </li>
      </ol>
    </div>
    <a v-if="$root.NumberOfAnswered >= 0 && $root.NumberOfAnswered < $root.topics.length" class="primary-btn" :href="href" @click.prevent="navigateTo" >Write a sentence</a>
    <div v-else>
      <p >You are done for this week. Enjoy!</p>
      <button class="primary-btn" @click="reset">Start over</button>
    </div>
    </div>
    `,
  data() {
    return {
      href: '/challenge'
    }
  },
  methods: {
    navigateTo() {
      this.$root.currentRoute = this.href
      window.history.pushState(null, routes[this.href], this.href)
    },
    reset() {
      fetch('/.netlify/functions/topic')
        .then((response) => response.json())
        .then((data) => {
          this.$root.topics = data.map((topic) => {
            return { ...topic, answer: '' }
          })
          localStorage.setItem(
            LOCAL_STORAGE_ID,
            JSON.stringify(this.$root.topics)
          )
          this.navigateTo()
        })
    }
  }
}

const ChallengeComponent = {
  template:
    /*html*/
    `
    <div class="writing">
    <p>Topic</p>
    <h1>{{currentTopic.name}}</h1>
    <div class="writing__body">
      <p>Use these words</p>
      <ul class="writing__list" role='list'>
        <li v-for="(item,key) in currentTopic.topicwords" :key="key">
          {{item.word}}
        </li>
      </ul>
    </div>
    <form @submit.prevent="onSubmit">
      <p class="writing__error" v-show="hasError">Enter a sentence.</p>
      <label for="sentence">Write here
        <input ref="sentence" class="writing__input" id="sentence" v-model="typedSentence" type="text"  />
      </label>      
      <button class="primary-btn" type="submit" >Submit</button>
    </form>
    </div>
`,
  data() {
    return {
      hasError: false,
      typedSentence: '',
      currentTopic: this.$root.topics.find((topic) => topic.answer.length < 1)
    }
  },
  mounted() {
    // Leave it out, as it is weird on mobile
    //this.$refs.sentence.focus()
  },
  methods: {
    onSubmit() {
      if (this.typedSentence === '') {
        this.hasError = true
        return
      }
      const newTopicList = this.$root.topics.map((topic) => {
        if (this.currentTopic.id === topic.id) {
          return { ...topic, answer: this.typedSentence }
        } else {
          return topic
        }
      })
      this.$root.topics = newTopicList
      localStorage.setItem(LOCAL_STORAGE_ID, JSON.stringify(newTopicList))

      this.$root.currentRoute = '/'
      window.history.pushState(null, routes['/'], '/')
    }
  }
}

const routes = {
  '/': DashboardComponent,
  '/challenge': ChallengeComponent
}

const EnglishWriter = {
  data: () => ({
    currentRoute: window.location.pathname,
    topics: []
  }),
  mounted() {
    const topics = localStorage.getItem(LOCAL_STORAGE_ID)
    if (!topics) {
      fetch('/.netlify/functions/topic')
        .then((response) => response.json())
        .then((data) => {
          this.topics = data.map((topic) => {
            return { ...topic, answer: '' }
          })
          localStorage.setItem(LOCAL_STORAGE_ID, JSON.stringify(this.topics))
        })
    } else {
      this.topics = JSON.parse(topics)
    }
  },
  computed: {
    CurrentComponent() {
      return routes[this.currentRoute] || NotFoundComponent
    },
    NumberOfAnswered() {
      return this.topics.filter((topic) => topic.answer.length > 0).length
    },
    NumberOfUnanswered() {
      return this.topics.filter((topic) => topic.answer.length < 1).length
    }
  },
  render() {
    return h(this.CurrentComponent)
  },
  created() {
    window.addEventListener('popstate', () => {
      this.currentRoute = window.location.pathname
    })
  }
}
createApp(EnglishWriter).mount('#app')
