<header>
  <h1>Oquiz</h1>
</header>

<main>
  <p>Nous sommes le {toReadableDate(new Date())}</p>

  {#if !isLoggedIn}
    <form onsubmit={handleLogin}>
      <label>
        Email
        <input type="email" bind:value={email} required />
      </label>
      <label>
        Mot de passe
        <input type="password" bind:value={password} required />
      </label>
      {#if loginError}
        <p>{loginError}</p>
      {/if}
      <button type="submit">Se connecter</button>
    </form>
  {:else}
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
  let isLoggedIn = $state(false);
  let email = $state("");
  let password = $state("");
  let loginError = $state("");

  async function handleLogin(e: Event) {
    e.preventDefault();
    loginError = "";
    try {
      await api.login(email, password);
      isLoggedIn = true;
      fetchUsers();
    } catch (error) {
      loginError = "Identifiants incorrects.";
    }
  }

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
