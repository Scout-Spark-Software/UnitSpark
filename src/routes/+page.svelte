<script lang="ts">
	import { onMount } from 'svelte';
	import companyLogo from '$lib/assets/Scout-Spark-Software.png';
	import hikingLogo from '$lib/assets/Scout-Spark-Hiking.png';

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

<div class="page">
	<!-- Navigation -->
	<nav class="nav" class:scrolled>
		<div class="container">
			<div class="nav-content">
				<div class="logo">
					<img src={companyLogo} alt="ScoutSpark" />
				</div>
				<div class="nav-links">
					<a href="#hiking">Hiking</a>
					<a href="#camping">Camping</a>
					<a href="#unit-management">Unit Management</a>
				</div>
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
	</section>

	<!-- Hiking Product Section -->
	<section id="hiking" class="product-section hiking">
		<div class="container">
			<div class="product-content">
				<div class="product-icon">
					<img src={hikingLogo} alt="Hiking" class="product-logo" />
				</div>
				<h2 class="section-title">Hiking</h2>
				<p class="section-description">
					Plan and track your hiking adventures with precision. Our hiking solution provides
					trail mapping, elevation tracking, and real-time location sharing to ensure safe and
					memorable outdoor experiences.
				</p>
				<div class="features">
					<div class="feature">
						<div class="feature-icon">📍</div>
						<h3>Trail Mapping</h3>
						<p>Detailed topographic maps with GPS navigation</p>
					</div>
					<div class="feature">
						<div class="feature-icon">📊</div>
						<h3>Progress Tracking</h3>
						<p>Monitor distance, elevation, and pace in real-time</p>
					</div>
					<div class="feature">
						<div class="feature-icon">🛡️</div>
						<h3>Safety First</h3>
						<p>Emergency alerts and location sharing features</p>
					</div>
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
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		color: #333;
		line-height: 1.6;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.page {
		width: 100%;
		overflow-x: hidden;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	/* Navigation */
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: transparent;
		transition: all 0.3s ease;
		padding: 1.5rem 0;
	}

	.nav.scrolled {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
		padding: 1rem 0;
	}

	.nav-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		display: flex;
		align-items: center;
	}

	.logo img {
		height: 50px;
		width: auto;
		transition: height 0.3s ease;
	}

	.nav.scrolled .logo img {
		height: 40px;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
	}

	.nav-links a {
		color: #4a5568;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.3s ease;
	}

	.nav-links a:hover {
		color: #2c5282;
	}

	/* Hero Section */
	.hero {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 12rem 0 8rem;
		text-align: center;
	}

	.hero-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.hero-title {
		font-size: 3.5rem;
		font-weight: bold;
		margin-bottom: 1.5rem;
		line-height: 1.2;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		margin-bottom: 2.5rem;
		opacity: 0.95;
		line-height: 1.8;
	}

	.hero-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn {
		padding: 1rem 2.5rem;
		border-radius: 50px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.3s ease;
		display: inline-block;
		cursor: pointer;
	}

	.btn-primary {
		background: white;
		color: #667eea;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	}

	.btn-secondary {
		background: transparent;
		color: white;
		border: 2px solid white;
	}

	.btn-secondary:hover {
		background: white;
		color: #667eea;
	}

	/* Product Sections */
	.product-section {
		padding: 6rem 0;
	}

	.product-section.hiking {
		background: linear-gradient(to bottom, #f7fafc, #edf2f7);
	}

	.product-section.camping {
		background: white;
	}

	.product-section.unit-management {
		background: linear-gradient(to bottom, #edf2f7, #e6fffa);
	}

	.product-content {
		text-align: center;
	}

	.product-icon {
		font-size: 5rem;
		margin-bottom: 1.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.product-logo {
		max-width: 300px;
		width: 100%;
		height: auto;
	}

	.section-title {
		font-size: 2.5rem;
		color: #2d3748;
		margin-bottom: 1.5rem;
		font-weight: bold;
	}

	.section-description {
		font-size: 1.125rem;
		color: #4a5568;
		max-width: 700px;
		margin: 0 auto 3rem;
		line-height: 1.8;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
		margin-top: 3rem;
	}

	.feature {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	.feature:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
	}

	.feature-icon {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	.feature h3 {
		font-size: 1.25rem;
		color: #2d3748;
		margin-bottom: 0.5rem;
	}

	.feature p {
		color: #718096;
		line-height: 1.6;
	}

	/* Footer */
	.footer {
		background: #2d3748;
		color: white;
		padding: 4rem 0 2rem;
	}

	.footer-content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 3rem;
		margin-bottom: 3rem;
	}

	.footer-section h3 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.footer-section h4 {
		font-size: 1.125rem;
		margin-bottom: 1rem;
		color: #e2e8f0;
	}

	.footer-section p {
		color: #cbd5e0;
		line-height: 1.8;
	}

	.footer-section ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.footer-section ul li {
		margin-bottom: 0.5rem;
	}

	.footer-section ul li a {
		color: #cbd5e0;
		text-decoration: none;
		transition: color 0.3s ease;
	}

	.footer-section ul li a:hover {
		color: white;
	}

	.footer-bottom {
		text-align: center;
		padding-top: 2rem;
		border-top: 1px solid #4a5568;
		color: #cbd5e0;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2.5rem;
		}

		.hero-subtitle {
			font-size: 1.125rem;
		}

		.section-title {
			font-size: 2rem;
		}

		.nav-links {
			gap: 1rem;
			font-size: 0.9rem;
		}

		.container {
			padding: 0 1.5rem;
		}

		.product-section {
			padding: 4rem 0;
		}

		.features {
			grid-template-columns: 1fr;
		}

		.logo img {
			height: 40px;
		}

		.nav.scrolled .logo img {
			height: 35px;
		}

		.product-logo {
			max-width: 250px;
		}
	}

	@media (max-width: 480px) {
		.hero {
			padding: 10rem 0 6rem;
		}

		.hero-title {
			font-size: 2rem;
		}

		.hero-buttons {
			flex-direction: column;
		}

		.btn {
			width: 100%;
		}

		.nav-links {
			display: none;
		}

		.logo img {
			height: 35px;
		}

		.nav.scrolled .logo img {
			height: 30px;
		}

		.product-logo {
			max-width: 200px;
		}
	}
</style>
