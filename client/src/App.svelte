<header>
  <h1>Oquiz</h1>
</header>

<main>
  <p>Nous sommes le {toReadableDate(new Date())}</p>

  {#if isLoading}
    <p>Données en cours de chargement...</p>
  {/if}

  {#if hasError}
    <p>Une erreur est survenue. Merci de bien vouloir réessayer plus tard.</p>
  {/if}
  
  {#if !isLoading && !hasError && quizzes.length === 0}
    <p>Aucun quiz trouvé.</p>
  {/if}

  {#if quizzes.length > 0}
    <h2>Liste des quiz</h2>
    <ul>
      {#each quizzes as quiz}
        <li>{quiz.title}</li>
      {/each}
    </ul>
  {/if}
</main>

<footer>
  O'Clock - {new Date().getFullYear()} - Tous droits réservés
</footer>


<script lang="ts">
  import { toReadableDate } from "./lib/utils";
  import { api, type QuizDTO } from "./services/api";

  let quizzes = $state<QuizDTO[]>([]);
  let hasError = $state(false);
  let isLoading = $state(false);

  $effect(() => {
    fetchRecentQuizzes();
  });

  async function fetchRecentQuizzes() {
    isLoading = true;
    
    try {
      quizzes = await api.getRecentQuizzes();
    } catch (error) {
      console.error(error);
      hasError = true;
    } finally {
      isLoading = false;
    }
  }

</script>

<style lang="css" scoped>
  h1 {
    text-decoration: underline;
  }

  footer {
    padding-top: 2rem;
  }
</style>
