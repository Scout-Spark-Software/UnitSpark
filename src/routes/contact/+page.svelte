<script lang="ts">
    import Navigation from "$lib/components/Navigation.svelte";
    import Footer from "$lib/components/Footer.svelte";

    let formData = {
        name: "",
        email: "",
        subject: "",
        message: "",
    };

    let submitted = false;

    function handleSubmit(e: Event) {
        e.preventDefault();
        // TODO: Implement actual form submission logic
        console.log("Form submitted:", formData);
        submitted = true;

        // Reset form after 3 seconds
        setTimeout(() => {
            submitted = false;
            formData = { name: "", email: "", subject: "", message: "" };
        }, 3000);
    }
</script>

<svelte:head>
    <title>Contact Us - Unit Spark</title>
    <meta
        name="description"
        content="Get in touch with Unit Spark. We're here to help with questions about our adventure resources and unit management platform."
    />
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
    <Navigation darkBackground={true} />

    <main class="container mx-auto px-4 py-16 mt-16">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-4xl md:text-5xl font-bold mb-8">Contact Us</h1>

            <div class="grid md:grid-cols-2 gap-12">
                <!-- Contact Information -->
                <div>
                    <h2 class="text-2xl font-semibold mb-6">Get in Touch</h2>
                    <p class="text-gray-300 mb-8">
                        Have questions about our adventure resources or unit
                        management platform? We'd love to hear from you. Fill
                        out the form and we'll get back to you as soon as
                        possible.
                    </p>

                    <div class="space-y-6">
                        <div>
                            <h3
                                class="text-lg font-semibold mb-2 text-blue-400"
                            >
                                Email
                            </h3>
                            <p class="text-gray-300">
                                <a
                                    href="mailto:hello@unitspark.org"
                                    class="hover:text-white transition-colors"
                                >
                                    hello@unitspark.org
                                </a>
                            </p>
                        </div>

                        <div>
                            <h3
                                class="text-lg font-semibold mb-2 text-green-400"
                            >
                                Office Hours
                            </h3>
                            <p class="text-gray-300">
                                Monday - Friday: 9:00 AM - 5:00 PM EST<br />
                                Weekend: Closed
                            </p>
                        </div>

                        <div>
                            <h3
                                class="text-lg font-semibold mb-2 text-purple-400"
                            >
                                Response Time
                            </h3>
                            <p class="text-gray-300">
                                We typically respond within 24-48 hours during
                                business days.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Contact Form -->
                <div>
                    {#if submitted}
                        <div class="bg-green-600 text-white p-6 rounded-lg">
                            <h3 class="text-xl font-semibold mb-2">
                                Thank You!
                            </h3>
                            <p>
                                Your message has been sent successfully. We'll
                                be in touch soon.
                            </p>
                        </div>
                    {:else}
                        <form on:submit={handleSubmit} class="space-y-6">
                            <div>
                                <label
                                    for="name"
                                    class="block text-sm font-medium mb-2"
                                    >Name *</label
                                >
                                <input
                                    type="text"
                                    id="name"
                                    bind:value={formData.name}
                                    required
                                    class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label
                                    for="email"
                                    class="block text-sm font-medium mb-2"
                                    >Email *</label
                                >
                                <input
                                    type="email"
                                    id="email"
                                    bind:value={formData.email}
                                    required
                                    class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label
                                    for="subject"
                                    class="block text-sm font-medium mb-2"
                                    >Subject *</label
                                >
                                <input
                                    type="text"
                                    id="subject"
                                    bind:value={formData.subject}
                                    required
                                    class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div>
                                <label
                                    for="message"
                                    class="block text-sm font-medium mb-2"
                                    >Message *</label
                                >
                                <textarea
                                    id="message"
                                    bind:value={formData.message}
                                    required
                                    rows="6"
                                    class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                    placeholder="Tell us more about your inquiry..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                Send Message
                            </button>
                        </form>
                    {/if}
                </div>
            </div>
        </div>
    </main>

    <Footer />
</div>
