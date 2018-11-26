document.addEventListener('DOMContentLoaded', function() {
  const url = "https://api.duckduckgo.com/?format=json&pretty=1&q=valley+forge+national+park"
  const template = `
<div >
  <!-- Wrapping elements For Searching  -->
  <div class="grey lighten-5" style="position:absolute;width:100%;height:100%;opacity: 0.75;"
    v-if="searchState === searchEnum.BEGIN"></div>
  <!-- Input Form -->
  <form class="container" @submit.prevent="onSubmit">
    <input type="text" v-model.trim="searchText"/>
  </form>
  <!-- Display Search Results -->
  <div class="container">
    <div class="row">
      <div class="col s12">
        <h3>Title: {{ getApiHeading }}</h3>
        <span v-html="searchResults.Abstract"></span>
        <div v-for="result in searchResults.Results">
          <span v-html="result.Result"></span>
        </div>
      </div>
      <h3 class="col s12 blue-text indigo lighten-5">Related Topics</h3>
      <div v-for="topic in searchResults.RelatedTopics" class="col l4 m6 s12">
        <div v-html="topic.Result"></div>
      </div>
    </div>
  </div>
</div>
  `;
  new Vue({
    el: "#search",
    template: template,
    data: {
      searchResults: {},
      searchText: "",
      searchState: 0,
      searchEnum: {
        NONE: 0,
        BEGIN: 1,
        END: 2,
      },
    },
    watch: {
    },
    filters: {
    },
    computed: {
      getApiHeading: function () {
        if (!this.searchText || this.searchState !== this.searchEnum.END) return "";
        return this.searchResults.Heading || "Not Found...";
      },
    },
    methods: {
      onSubmit: function() {
        const url = this._searchQuery(this.searchText);
        this._fetchExecute(url)
              .then(data => this.searchResults = data)
      },
      fetchResult: function () {
        
      },
      _searchQuery: function(text) {
        const searches = text.split(" ")
                     .filter(txt => {if(txt) return true; else false;});
        const query = encodeURIComponent(searches.join('+'));
        return `https://api.duckduckgo.com/?format=json&q=${query}`;
      },
      _fetchExecute: function(url) {
        this.searchState = this.searchEnum.BEGIN;
        return new Promise((resolve, reject) => {
          fetch(url)
            .then(res => res.json())
            .then(json => {
              this.searchState = this.searchEnum.END;
              resolve(json);
            })
            .catch(err => {
              this.searchState = this.searchEnum.END
              reject(err);
            })
        })
      },
    },
    mounted: function () {// test
    },
  });

}, false);
