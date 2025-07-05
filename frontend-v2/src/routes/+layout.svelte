<script lang="ts">
	import { Layout } from '@/lib/components/layout';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';

	let { children } = $props();
</script>

<ModeWatcher />
<Layout>
	{@render children()}
</Layout>
