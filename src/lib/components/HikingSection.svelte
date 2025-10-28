<script lang="ts">
	import hikingLogo from '$lib/assets/Scout-Spark-Hiking.png';
</script>

<section id="hiking" class="py-24 bg-gradient-to-b from-white to-gray-50">
	<div class="max-w-7xl mx-auto px-6">
		<div class="text-center mb-16">
			<img src={hikingLogo} alt="Hiking" class="h-32 w-auto mx-auto mb-6" />
			<h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Hiking</h2>
			<p class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
				Discover and share amazing hiking trails with your scout troop. Browse local hiking destinations,
				submit new hikes you've explored, and save your favorite trails for future adventures.
			</p>
		</div>
		<div class="grid md:grid-cols-3 gap-8">
			<div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
				<div class="text-5xl mb-4">🔍</div>
				<h3 class="text-xl font-bold text-gray-900 mb-3">Browse Local Hikes</h3>
				<p class="text-gray-600 leading-relaxed">
					Search and discover hiking trails in your area perfect for scout activities
				</p>
			</div>
			<div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
				<div class="text-5xl mb-4">📝</div>
				<h3 class="text-xl font-bold text-gray-900 mb-3">Submit Hikes</h3>
				<p class="text-gray-600 leading-relaxed">
					Share your favorite trails and hiking experiences with other scout troops
				</p>
			</div>
			<div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
				<div class="text-5xl mb-4">⭐</div>
				<h3 class="text-xl font-bold text-gray-900 mb-3">Favorite Trails</h3>
				<p class="text-gray-600 leading-relaxed">
					Save your favorite hikes for easy access and trip planning
				</p>
			</div>
		</div>
	</div>
</section>
