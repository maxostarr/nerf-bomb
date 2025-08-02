<script lang="ts">
	import '../app.css';
	import Toasts from '../components/toast/toasts.svelte';
	let { children } = $props();
</script>

<Toasts />

{@render children()}
