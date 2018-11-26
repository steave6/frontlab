document.addEventListener('DOMContentLoaded', function() {
  const template = `
<div>
  <h1>{{ title }}</h1>
  <section class='section'>
    <ul v-for='rank in amazonRanks'>
      <li><a class="button" :text='rank.category' @click='openRankRss($event, rank.category)'>{{ rank.category }}</a></li>
    </ul>
  </section>
  <section  class='section'>
    <div class="container">
      <ul v-for='item in displayItems.item'>
        <li>
          <div>
            <a :href='item.link'><h3 class="sutitle">{{ item.title }}</h3></a>
            <div v-html='item.description'></div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</div>
  `;
  new Vue({
    el: "#app",
    template: template,
    data: {
      title: 'Amazon Sales Ranking',
      amazonRanks: [
        {category: 'books', endpoint: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%20%3D%20'https%3A%2F%2Famazon.co.jp%2Fgp%2Frss%2Fbestsellers%2Fbooks%2F'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys" },
        {category: 'kitchen', endpoint: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%20%3D%20'https%3A%2F%2Famazon.co.jp%2Fgp%2Frss%2Fbestsellers%2Fkitchen%2F'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys" },
        {category: 'hpc', endpoint: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%20%3D%20'https%3A%2F%2Famazon.co.jp%2Fgp%2Frss%2Fbestsellers%2Fhpc'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys" },
        {category: 'automotive', endpoint: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%20%3D%20'https%3A%2F%2Famazon.co.jp%2Fgp%2Frss%2Fbestsellers%2Fautomotive'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys" },
        {category: 'shoes', endpoint: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%20%3D%20'https%3A%2F%2Famazon.co.jp%2Fgp%2Frss%2Fbestsellers%2Fshoes'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys" },
        {category: 'digital-text', endpoint: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%20%3D%20'https%3A%2F%2Famazon.co.jp%2Fgp%2Frss%2Fbestsellers%2Fdigital-text'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys" },
        {category: 'videogames', endpoint: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%20%3D%20'https%3A%2F%2Famazon.co.jp%2Fgp%2Frss%2Fbestsellers%2Fvideogames'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys" },
        {category: 'diy', endpoint: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%20%3D%20'https%3A%2F%2Famazon.co.jp%2Fgp%2Frss%2Fbestsellers%2Fdiy'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys" },
      ],
      displayItems: {},
    },
    computed: {
    },
    watch: {
    },
    filters: {
    },
    methods: {
      openRankRss: function(ev, category) {
        console.log(ev, category)
        const ctgy = this.amazonRanks.find(e => e.category === category)
        console.log(ctgy.endpoint)
        fetch(ctgy.endpoint)
          .then(d => d.json())
          .then(d => this.displayItems = d.query.results)
          .then(() => console.log(this.displayItems))
      },
    },
    mounted: function () {
    },
  });

}, false);
