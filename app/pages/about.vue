<template>
  <div class="about-page">
    <h1>Om SupportiveToDo</h1>
    <p>Välkommen till vår about-sida!</p>

    <section class="info-section">
      <h2>Vad är SupportiveToDo?</h2>
      <p>
        SupportiveToDo är en applikation byggd med Nuxt.js som hjälper dig att
        organisera dina uppgifter på ett stödjande sätt.
      </p>
    </section>

    <section class="features">
      <h2>Funktioner</h2>
      <ul>
        <li>Enkelt att använda gränssnitt</li>
        <li>Responsiv design</li>
        <li>Byggd med Nuxt.js</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.info-section,
.features {
  margin: 2rem 0;
}

h1 {
  color: #2d3748;
  margin-bottom: 1rem;
}

h2 {
  color: #4a5568;
  margin-bottom: 0.5rem;
}

ul {
  list-style-type: disc;
  margin-left: 2rem;
}

li {
  margin: 0.5rem 0;
}
</style>
