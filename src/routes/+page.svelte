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

<div class="page">
	<!-- Navigation -->
	<nav class="nav" class:scrolled>
		<div class="container">
			<div class="nav-content">
				<div class="logo">ScoutSpark</div>
				<div class="nav-links">
					<a href="#hiking">Hiking</a>
					<a href="#camping">Camping</a>
					<a href="#unit-management">Unit Management</a>
				</div>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<section class="hero">
		<div class="container">
			<div class="hero-content">
				<h1 class="hero-title">Empowering Scouting Adventures</h1>
				<p class="hero-subtitle">
					Complete solutions for hiking, camping, and unit management to make every scouting experience unforgettable
				</p>
				<div class="hero-buttons">
					<a href="#hiking" class="btn btn-primary">Explore Products</a>
					<a href="#contact" class="btn btn-secondary">Get Started</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Hiking Product Section -->
	<section id="hiking" class="product-section hiking">
		<div class="container">
			<div class="product-content">
				<div class="product-icon">🥾</div>
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
	</section>

	<!-- Camping Product Section -->
	<section id="camping" class="product-section camping">
		<div class="container">
			<div class="product-content">
				<div class="product-icon">⛺</div>
				<h2 class="section-title">Camping</h2>
				<p class="section-description">
					Everything you need to organize successful camping trips. From site selection to
					equipment checklists, our camping tool streamlines planning and ensures nothing is
					left behind.
				</p>
				<div class="features">
					<div class="feature">
						<div class="feature-icon">🏕️</div>
						<h3>Site Planning</h3>
						<p>Find and reserve the perfect camping locations</p>
					</div>
					<div class="feature">
						<div class="feature-icon">✅</div>
						<h3>Gear Checklists</h3>
						<p>Comprehensive packing lists and inventory management</p>
					</div>
					<div class="feature">
						<div class="feature-icon">🌤️</div>
						<h3>Weather Integration</h3>
						<p>Real-time weather updates and forecasts</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Unit Management Product Section -->
	<section id="unit-management" class="product-section unit-management">
		<div class="container">
			<div class="product-content">
				<div class="product-icon">👥</div>
				<h2 class="section-title">Unit Management</h2>
				<p class="section-description">
					Simplify administration and communication for your scouting unit. Manage rosters,
					track attendance, coordinate events, and keep families informed with our comprehensive
					unit management platform.
				</p>
				<div class="features">
					<div class="feature">
						<div class="feature-icon">📋</div>
						<h3>Member Management</h3>
						<p>Maintain rosters, records, and advancement tracking</p>
					</div>
					<div class="feature">
						<div class="feature-icon">📅</div>
						<h3>Event Coordination</h3>
						<p>Schedule meetings, track RSVPs, and manage calendars</p>
					</div>
					<div class="feature">
						<div class="feature-icon">💬</div>
						<h3>Communication Hub</h3>
						<p>Announcements, messaging, and family notifications</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer">
		<div class="container">
			<div class="footer-content">
				<div class="footer-section">
					<h3>ScoutSpark</h3>
					<p>Empowering scouting organizations with modern tools for adventure and management.</p>
				</div>
				<div class="footer-section">
					<h4>Products</h4>
					<ul>
						<li><a href="#hiking">Hiking</a></li>
						<li><a href="#camping">Camping</a></li>
						<li><a href="#unit-management">Unit Management</a></li>
					</ul>
				</div>
				<div class="footer-section">
					<h4>Company</h4>
					<ul>
						<li><a href="#about">About Us</a></li>
						<li><a href="#contact">Contact</a></li>
						<li><a href="#support">Support</a></li>
					</ul>
				</div>
			</div>
			<div class="footer-bottom">
				<p>&copy; 2024 ScoutSpark. All rights reserved.</p>
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
		font-size: 1.5rem;
		font-weight: bold;
		color: #2c5282;
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
	}
</style>
