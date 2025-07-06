<script lang="ts">
	import { Layout } from '@/lib/components/layout';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster />
<Layout>
	{@render children()}
</Layout>
