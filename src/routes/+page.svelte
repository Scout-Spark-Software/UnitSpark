<script lang="ts">
	import { onMount } from 'svelte';

	let scrolled = $state(false);

	onMount(() => {
		const handleScroll = () => {
			scrolled = window.scrollY > 50;
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<svelte:head>
	<title>ScoutSpark - Empowering Scouting Adventures</title>
</svelte:head>

<!-- Navigation -->
<nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-white/90 backdrop-blur-sm shadow-md py-4'}">
	<div class="max-w-7xl mx-auto px-6">
		<div class="flex justify-between items-center">
			<div class="text-2xl font-bold text-blue-900">ScoutSpark</div>
			<div class="flex gap-8">
				<a href="#hiking" class="text-gray-700 hover:text-blue-900 font-medium transition-colors">Hiking</a>
				<a href="#camping" class="text-gray-700 hover:text-blue-900 font-medium transition-colors">Camping</a>
				<a href="#unit-management" class="text-gray-700 hover:text-blue-900 font-medium transition-colors">Unit Management</a>
			</div>
		</div>
	</div>
</nav>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-purple-600 to-purple-800 text-white pt-48 pb-32 text-center">
	<div class="max-w-4xl mx-auto px-6">
		<h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">
			Empowering Scouting Adventures
		</h1>
		<p class="text-xl md:text-2xl mb-10 opacity-95 leading-relaxed">
			Complete solutions for hiking, camping, and unit management to make every scouting experience unforgettable
		</p>
		<div class="flex gap-4 justify-center flex-wrap">
			<a href="#hiking" class="bg-white text-purple-600 px-10 py-4 rounded-full font-semibold hover:shadow-xl hover:-translate-y-1 transition-all">
				Explore Products
			</a>
			<a href="#contact" class="bg-transparent text-white px-10 py-4 rounded-full font-semibold border-2 border-white hover:bg-white hover:text-purple-600 transition-all">
				Get Started
			</a>
		</div>
	</div>
</section>

<!-- Hiking Product Section -->
<section id="hiking" class="py-24 bg-gradient-to-b from-gray-50 to-gray-100">
	<div class="max-w-7xl mx-auto px-6">
		<div class="text-center">
			<div class="text-7xl mb-6">🥾</div>
			<h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Hiking</h2>
			<p class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
				Discover and share amazing hiking trails with your scout troop. Browse local hiking destinations,
				submit new hikes you've explored, and save your favorite trails for future adventures.
			</p>
			<div class="grid md:grid-cols-3 gap-8 mt-12">
				<div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all">
					<div class="text-5xl mb-4">🔍</div>
					<h3 class="text-xl font-bold text-gray-900 mb-3">Browse Local Hikes</h3>
					<p class="text-gray-600 leading-relaxed">
						Search and discover hiking trails in your area perfect for scout activities
					</p>
				</div>
				<div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all">
					<div class="text-5xl mb-4">📝</div>
					<h3 class="text-xl font-bold text-gray-900 mb-3">Submit Hikes</h3>
					<p class="text-gray-600 leading-relaxed">
						Share your favorite trails and hiking experiences with other scout troops
					</p>
				</div>
				<div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all">
					<div class="text-5xl mb-4">⭐</div>
					<h3 class="text-xl font-bold text-gray-900 mb-3">Favorite Trails</h3>
					<p class="text-gray-600 leading-relaxed">
						Save your favorite hikes for easy access and trip planning
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Camping Product Section -->
<section id="camping" class="py-24 bg-white">
	<div class="max-w-7xl mx-auto px-6">
		<div class="text-center">
			<div class="text-7xl mb-6">⛺</div>
			<h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Camping</h2>
			<div class="max-w-2xl mx-auto">
				<div class="bg-purple-50 border-2 border-purple-200 rounded-xl p-8 inline-block">
					<p class="text-2xl font-semibold text-purple-900 mb-2">Coming Soon</p>
					<p class="text-lg text-purple-700">
						We're working on an amazing camping management tool for your scout troop. Stay tuned!
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Unit Management Product Section -->
<section id="unit-management" class="py-24 bg-gradient-to-b from-gray-100 to-teal-50">
	<div class="max-w-7xl mx-auto px-6">
		<div class="text-center">
			<div class="text-7xl mb-6">👥</div>
			<h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Unit Management</h2>
			<div class="max-w-2xl mx-auto">
				<div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 inline-block">
					<p class="text-2xl font-semibold text-blue-900 mb-2">Coming Soon</p>
					<p class="text-lg text-blue-700">
						Comprehensive tools for managing your scout unit are on the way. Get ready for simplified administration!
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="bg-gray-800 text-white py-16">
	<div class="max-w-7xl mx-auto px-6">
		<div class="grid md:grid-cols-3 gap-12 mb-12">
			<div>
				<h3 class="text-2xl font-bold mb-4">ScoutSpark</h3>
				<p class="text-gray-300 leading-relaxed">
					Empowering scouting organizations with modern tools for adventure and management.
				</p>
			</div>
			<div>
				<h4 class="text-lg font-semibold mb-4 text-gray-200">Products</h4>
				<ul class="space-y-2">
					<li><a href="#hiking" class="text-gray-300 hover:text-white transition-colors">Hiking</a></li>
					<li><a href="#camping" class="text-gray-300 hover:text-white transition-colors">Camping</a></li>
					<li><a href="#unit-management" class="text-gray-300 hover:text-white transition-colors">Unit Management</a></li>
				</ul>
			</div>
			<div>
				<h4 class="text-lg font-semibold mb-4 text-gray-200">Company</h4>
				<ul class="space-y-2">
					<li><a href="#about" class="text-gray-300 hover:text-white transition-colors">About Us</a></li>
					<li><a href="#contact" class="text-gray-300 hover:text-white transition-colors">Contact</a></li>
					<li><a href="#support" class="text-gray-300 hover:text-white transition-colors">Support</a></li>
				</ul>
			</div>
		</div>
		<div class="border-t border-gray-700 pt-8 text-center">
			<p class="text-gray-400">&copy; 2024 ScoutSpark. All rights reserved.</p>
		</div>
	</div>
</footer>
