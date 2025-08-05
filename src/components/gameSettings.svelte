<script>
	let roundTime = $state(60); // Default round time in seconds
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
			bind:value={roundTime}
			class="input input-primary"
			min="1"
			max="3600"
		/>
	</div>
</main>
