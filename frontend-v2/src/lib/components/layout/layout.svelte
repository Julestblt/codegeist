<script lang="ts">
	import { page } from '$app/state';
	import { Header } from './';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col overflow-y-auto">
	<Header />
	<div class="flex-1 overflow-hidden">
		{@render children()}
	</div>
</div>
