<script lang="ts">
let visible = $state(false);
const toggle = () => {
  visible = !visible;
};
</script>

<main>
  <div class="my-content-container">
    {#if visible}
      <div class="my-content">
        <h1>WebExtend + Svelte</h1>
        <p>This is a content script.</p>
      </div>
    {/if}

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div onclick={toggle}>
      <svg
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        style="cursor: pointer"
      >
        <title>Logo</title>
        <circle cx="512" cy="512" r="512" fill="#1296db" />
        <path
          d="M568.747 398.507l56.747 56.747h277.76L960 398.507v-277.76L903.253 64h-277.76l-56.747 56.747v277.76h0.001z m334.506-277.76v277.76h-277.76v-277.76h277.76zM64 903.253L120.747 960H736l56.747-56.747V622.507L736 568.747H455.253V288l-53.76-56.747H120.747L64 288V903.253z m56.747-334.506V288h280.747v280.747H120.747z m280.746 334.506H120.747V622.507h280.747v280.746h-0.001z m53.76-280.746H736v280.747H455.253V622.507z"
          fill="#fff"
          transform="scale(0.5 0.5) translate(512 512)"
        />
      </svg>
    </div>
  </div>
</main>

<style>
  .my-content-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    align-items: end;
    z-index: 1000;
  }

  .my-content {
    color: #000;
    background-color: #fff;
    margin-right: 8px;
    border: 1px solid #ccc;
    border-radius: 6px;
    text-align: center;
    padding: 12px;
  }

  .my-content h1 {
    font-size: 1.8rem;
    font-weight: 700;
  }

  .my-content p {
    font-size: 1.2rem;
    font-weight: 400;
    opacity: 0.5;
  }
</style>
