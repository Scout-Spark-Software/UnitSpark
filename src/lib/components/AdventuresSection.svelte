<script lang="ts">
    import adventuresLogo from "$lib/assets/Unit-Spark-Adventures.png";
</script>

<section id="adventures" class="py-24 bg-gradient-to-b from-blue-50 to-white">
    <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
            <img
                src={adventuresLogo}
                alt="Adventures"
                class="h-32 w-auto mx-auto mb-6"
            />
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Adventures
            </h2>
            <p
                class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
                Your compass to epic adventures! Navigate extraordinary hiking
                trails and discover perfect camping sites. Community-curated
                adventures from scouts who've been there.
            </p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
            <div
                class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
                <div class="text-5xl mb-4">🥾</div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">
                    Hiking Trails
                </h3>
                <p class="text-gray-600 leading-relaxed">
                    Handpicked trails for your next adventure with detailed
                    difficulty ratings and reviews
                </p>
            </div>
            <div
                class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
                <div class="text-5xl mb-4">⛺</div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">
                    Camping Sites
                </h3>
                <p class="text-gray-600 leading-relaxed">
                    Perfect basecamp locations for scouts with amenities and
                    accessibility information
                </p>
            </div>
            <div
                class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
                <div class="text-5xl mb-4">🗺️</div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">
                    Share Your Trail
                </h3>
                <p class="text-gray-600 leading-relaxed">
                    Submit your adventures and help other scouts discover
                    amazing outdoor experiences
                </p>
            </div>
        </div>
        <div class="text-center mt-12">
            <a
                href="https://adventures.unitspark.org/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
                Explore Adventures
                <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                </svg>
            </a>
        </div>
    </div>
</section>
