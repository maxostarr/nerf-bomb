<script lang="ts">
	import CloseIcon from '../icons/closeIcon.svelte';

	let { dismiss, type, dismissible, children } = $props();

	// type AlertType = 'info' | 'success' | 'warning' | 'error';

	// export let type: AlertType = 'error';
	// $: alertClass = `alert alert-${type}`;
	const alertClass = $derived(`alert alert-${type}`);
	// export let dismissible = true;
</script>

<article class={alertClass} role="alert">
	<div class="text">
		{@render children?.()}
	</div>

	{#if dismissible}
		<button class="close" onclick={() => dismiss()}>
			<CloseIcon />
		</button>
	{/if}
</article>

<style lang="postcss">
	button {
		background: transparent;
		border: 0 none;
		padding: 0;
		margin: 0 0 0 auto;
		line-height: 1;
		font-size: 1rem;
	}

	.alert-info {
		background-color: oklch(var(--in));
		color: oklch(var(--inc));
	}

	.alert-success {
		background-color: oklch(var(--su));
		color: oklch(var(--suc));
	}

	.alert-warning {
		background-color: oklch(var(--wa));
		color: oklch(var(--wac));
	}

	.alert-error {
		background-color: oklch(var(--er));
		color: oklch(var(--erc));
	}

	.text {
		max-width: 80vw;
		width: max-content;
		white-space: normal;
	}
</style>
