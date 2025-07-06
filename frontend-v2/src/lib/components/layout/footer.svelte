<script>
	import { Shield, Zap, Github, Twitter, Mail, Heart } from 'lucide-svelte';
	import { Button } from '../ui/button';
</script>

<footer class="bg-muted border-t transition-colors duration-200">
	<div class="mx-auto max-w-7xl px-6 py-12">
		<div>
			<div>
				<div class="mb-4 flex items-center space-x-3">
					<div class="relative">
						<Shield class="h-8 w-8 text-blue-400" />
						<Zap class="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
					</div>
					<div>
						<h3
							class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent"
						>
							CodeGeist
						</h3>
						<p class="text-muted-foreground text-xs font-medium">Intelligent Security Analysis</p>
					</div>
				</div>
				<p class="text-muted-foreground mb-6 max-w-md leading-relaxed">
					CodeGeist uses artificial intelligence to analyze your code and detect security
					vulnerabilities. Protect your applications with in-depth analysis and expert
					recommendations.
				</p>
				<div class="flex items-center space-x-4">
					<Button href="https://github.com" target="_blank" size="icon" variant="outline">
						<Github
							class="text-muted-foreground h-5 w-5 transition-colors group-hover:text-white"
						/>
					</Button>
					<Button href="https://twitter.com" target="_blank" size="icon" variant="outline">
						<Twitter
							class="text-muted-foreground h-5 w-5 transition-colors group-hover:text-white"
						/>
					</Button>
					<Button href="mailto:contact@codegeist.com" size="icon" variant="outline">
						<Mail class="text-muted-foreground h-5 w-5 transition-colors group-hover:text-white" />
					</Button>
				</div>
			</div>
		</div>

		<div class="mt-12 border-t pt-8">
			<div class="text-muted-foreground flex items-center justify-end space-x-2 text-sm">
				<span>© {new Date().getFullYear()} CodeGeist. Made with</span>
				<Heart class="h-4 w-4 text-red-400" />
				<span>for code security.</span>
			</div>
		</div>
	</div>
</footer>
