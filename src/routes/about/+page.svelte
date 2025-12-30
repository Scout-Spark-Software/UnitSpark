<script lang="ts">
    import Navigation from "$lib/components/Navigation.svelte";
    import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
    <title>About Us - Unit Spark</title>
    <meta
        name="description"
        content="Learn about Unit Spark and our mission to provide adventure resources and unit management solutions for scouting organizations."
    />
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
    <Navigation darkBackground={true} />

    <main class="container mx-auto px-4 py-16 mt-16">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-4xl md:text-5xl font-bold mb-8">
                About Unit Spark
            </h1>

            <div class="prose prose-invert max-w-none">
                <section class="mb-12">
                    <h2 class="text-3xl font-semibold mb-4">Our Mission</h2>
                    <p class="text-gray-300 text-lg leading-relaxed mb-4">
                        Unit Spark is dedicated to empowering scouting
                        organizations with comprehensive adventure resources and
                        innovative unit management solutions. We believe in
                        fostering outdoor experiences that build character,
                        leadership, and lifelong memories.
                    </p>
                </section>

                <section class="mb-12">
                    <h2 class="text-3xl font-semibold mb-4">What We Offer</h2>
                    <div class="grid md:grid-cols-2 gap-6 mb-6">
                        <div class="bg-gray-800 p-6 rounded-lg">
                            <h3
                                class="text-xl font-semibold mb-3 text-blue-400"
                            >
                                Adventure Resources
                            </h3>
                            <p class="text-gray-300">
                                Through adventures.unitspark.org, we provide
                                inspiration and resources for hiking, camping,
                                and outdoor adventure activities tailored for
                                scouting groups.
                            </p>
                        </div>
                        <div class="bg-gray-800 p-6 rounded-lg">
                            <h3
                                class="text-xl font-semibold mb-3 text-green-400"
                            >
                                Unit Management Platform
                            </h3>
                            <p class="text-gray-300">
                                Our comprehensive unit management platform
                                (currently under development) streamlines
                                administrative tasks, event planning, and
                                communication for scout leaders.
                            </p>
                        </div>
                    </div>
                </section>

                <section class="mb-12">
                    <h2 class="text-3xl font-semibold mb-4">Our Story</h2>
                    <p class="text-gray-300 text-lg leading-relaxed mb-4">
                        Founded by experienced scout leaders and outdoor
                        enthusiasts, Unit Spark emerged from a desire to make
                        adventure planning and unit management more accessible
                        and efficient. We understand the challenges faced by
                        volunteer leaders and aim to provide tools that simplify
                        their important work.
                    </p>
                </section>

                <section>
                    <h2 class="text-3xl font-semibold mb-4">Our Values</h2>
                    <ul class="space-y-3 text-gray-300 text-lg">
                        <li class="flex items-start">
                            <span class="text-blue-400 mr-3">•</span>
                            <span
                                ><strong class="text-white">Excellence:</strong> Delivering
                                high-quality resources and reliable technology</span
                            >
                        </li>
                        <li class="flex items-start">
                            <span class="text-blue-400 mr-3">•</span>
                            <span
                                ><strong class="text-white">Community:</strong> Supporting
                                scout leaders and fostering connections</span
                            >
                        </li>
                        <li class="flex items-start">
                            <span class="text-blue-400 mr-3">•</span>
                            <span
                                ><strong class="text-white">Adventure:</strong> Inspiring
                                outdoor exploration and personal growth</span
                            >
                        </li>
                        <li class="flex items-start">
                            <span class="text-blue-400 mr-3">•</span>
                            <span
                                ><strong class="text-white">Innovation:</strong> Continuously
                                improving our platforms and services</span
                            >
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    </main>

    <Footer />
</div>
