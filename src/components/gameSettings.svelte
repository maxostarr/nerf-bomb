<script>
	let round = $state({
		prePlant: 300,
		defuse: 45
	}); // Default round time in seconds
</script>

<main>
	<!-- Round time setting -->
	<div class="mb-4">
		<label for="roundTime" class="block text-sm font-medium text-gray-700"
			>Round Time (seconds)</label
		>
		<input
			type="number"
			id="roundTime"
			bind:value={round.prePlant}
			class="input input-primary"
			min="1"
			max="3600"
		/>
	</div>

	<!-- Defuse time setting -->
	<div class="mb-4">
		<label for="defuseTime" class="block text-sm font-medium text-gray-700"
			>Defuse Time (seconds)</label
		>
		<input
			type="number"
			id="defuseTime"
			bind:value={round.defuse}
			class="input input-primary"
			min="1"
			max="300"
		/>
	</div>
</main>
