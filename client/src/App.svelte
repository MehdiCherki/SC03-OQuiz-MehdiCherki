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
  
  {#if !isLoading && !hasError && users.length === 0}
    <p>Aucun utilisateur trouvé.</p>
  {/if}

  {#if users.length > 0}
    <h2>Liste des utilisateurs</h2>
    <ul>
      {#each users as user}
        <li>{user.firstname}</li>
      {/each}
    </ul>
  {/if}
</main>

<footer>
  O'Clock - {new Date().getFullYear()} - Tous droits réservés
</footer>


<script lang="ts">
  import { toReadableDate } from "./lib/utils";
  import { api, type UserDTO } from "./services/api";

  let users = $state<UserDTO[]>([]);
  let hasError = $state(false);
  let isLoading = $state(false);

  $effect(() => {
    fetchUsers();
  });

  async function fetchUsers() {
    isLoading = true;
    
    try {
      users = await api.getUsers();
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
