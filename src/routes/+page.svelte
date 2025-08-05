<script lang="ts">
	import GameSettings from '../components/gameSettings.svelte';
	import TestUtils from '../components/testUtils.svelte';
</script>

<!-- using tailwind -->
<div class="container mx-auto flex flex-col items-center justify-center">
	<h1>Nerf Game</h1>

	<TestUtils />
	<GameSettings />
</div>
