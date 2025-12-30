<script lang="ts">
    import Navigation from "$lib/components/Navigation.svelte";
    import Footer from "$lib/components/Footer.svelte";

    const faqs = [
        {
            question: "How do I get started with Unit Spark?",
            answer: "Visit our adventures site at adventures.unitspark.org to explore hiking and camping resources. Our unit management platform is currently under development and will be available soon.",
        },
        {
            question: "Is Unit Spark free to use?",
            answer: "Our adventure resources are freely available to all scouting organizations. Pricing for the unit management platform will be announced closer to launch.",
        },
        {
            question: "What adventure activities do you cover?",
            answer: "We provide comprehensive resources for hiking and camping adventures, including trail recommendations, safety guidelines, equipment lists, and planning tools.",
        },
        {
            question: "Can I contribute adventure content?",
            answer: "We welcome contributions from experienced scout leaders and outdoor enthusiasts. Contact us through our contact page to learn more about contributing.",
        },
        {
            question: "When will the unit management platform be available?",
            answer: "The unit management platform is currently under active development. Sign up for our newsletter to receive updates on the launch timeline and beta testing opportunities.",
        },
        {
            question: "Do you offer training or tutorials?",
            answer: "Yes! We provide comprehensive guides and tutorials for using our platforms. Additional training resources and workshops will be available with the unit management platform launch.",
        },
    ];

    let openIndex = $state<number | null>(null);

    function toggleFaq(index: number) {
        openIndex = openIndex === index ? null : index;
    }
</script>

<svelte:head>
    <title>Support - Unit Spark</title>
    <meta
        name="description"
        content="Get help and support for Unit Spark's adventure resources and unit management platform. Find answers to common questions and resources."
    />
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
    <Navigation darkBackground={true} />

    <main class="container mx-auto px-4 py-16 mt-16">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-4xl md:text-5xl font-bold mb-8">Support Center</h1>

            <p class="text-gray-300 text-lg mb-12">
                Find answers to common questions and get the help you need to
                make the most of Unit Spark's platforms.
            </p>

            <!-- Quick Links -->
            <section class="mb-16">
                <h2 class="text-3xl font-semibold mb-6">Quick Links</h2>
                <div class="grid md:grid-cols-3 gap-6">
                    <a
                        href="/contact"
                        class="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg transition-colors"
                    >
                        <div class="text-blue-400 text-3xl mb-3">📧</div>
                        <h3 class="text-xl font-semibold mb-2">Contact Us</h3>
                        <p class="text-gray-400">Send us a message</p>
                    </a>
                    <a
                        href="/about"
                        class="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg transition-colors"
                    >
                        <div class="text-green-400 text-3xl mb-3">ℹ️</div>
                        <h3 class="text-xl font-semibold mb-2">
                            About Unit Spark
                        </h3>
                        <p class="text-gray-400">Learn more about us</p>
                    </a>
                    <a
                        href="/"
                        class="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg transition-colors"
                    >
                        <div class="text-purple-400 text-3xl mb-3">🏠</div>
                        <h3 class="text-xl font-semibold mb-2">Home</h3>
                        <p class="text-gray-400">Return to homepage</p>
                    </a>
                </div>
            </section>

            <!-- FAQs -->
            <section>
                <h2 class="text-3xl font-semibold mb-6">
                    Frequently Asked Questions
                </h2>
                <div class="space-y-4">
                    {#each faqs as faq, index}
                        <div class="bg-gray-800 rounded-lg overflow-hidden">
                            <button
                                onclick={() => toggleFaq(index)}
                                class="w-full text-left p-6 hover:bg-gray-750 transition-colors flex justify-between items-center"
                            >
                                <h3 class="text-lg font-semibold pr-4">
                                    {faq.question}
                                </h3>
                                <span
                                    class="text-2xl text-gray-400 flex-shrink-0"
                                >
                                    {openIndex === index ? "−" : "+"}
                                </span>
                            </button>
                            {#if openIndex === index}
                                <div class="px-6 pb-6 text-gray-300">
                                    <p>{faq.answer}</p>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </section>

            <!-- Additional Support -->
            <section
                class="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg"
            >
                <h2 class="text-2xl font-semibold mb-4">Need More Help?</h2>
                <p class="text-gray-100 mb-6">
                    Can't find what you're looking for? Our support team is here
                    to help you with any questions or issues.
                </p>
                <a
                    href="/contact"
                    class="inline-block bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    Contact Support
                </a>
            </section>
        </div>
    </main>

    <Footer />
</div>
