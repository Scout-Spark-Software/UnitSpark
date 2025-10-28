<script lang="ts">
    import { onMount } from "svelte";
    import companyLogo from "$lib/assets/Scout-Spark-Software.png";

    let scrolled = $state(false);

    onMount(() => {
        const handleScroll = () => {
            scrolled = window.scrollY > 50;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    });
</script>

<nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {scrolled
        ? 'bg-white/95 backdrop-blur-lg shadow-lg'
        : 'bg-transparent'}"
>
    <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex justify-between items-center">
            <div class="transition-all duration-300">
                <img
                    src={companyLogo}
                    alt="ScoutSpark"
                    class="{scrolled
                        ? 'h-10'
                        : 'h-14'} w-auto transition-all duration-300"
                />
            </div>
            <div class="hidden md:flex gap-8">
                <a
                    href="#hiking"
                    class="{scrolled
                        ? 'text-gray-700 hover:text-purple-600'
                        : 'text-white hover:text-purple-200'} font-medium transition-colors"
                    >Hiking</a
                >
                <a
                    href="#camping"
                    class="{scrolled
                        ? 'text-gray-700 hover:text-purple-600'
                        : 'text-white hover:text-purple-200'} font-medium transition-colors"
                    >Camping</a
                >
                <a
                    href="#unit-management"
                    class="{scrolled
                        ? 'text-gray-700 hover:text-purple-600'
                        : 'text-white hover:text-purple-200'} font-medium transition-colors"
                    >Unit Management</a
                >
            </div>
        </div>
    </div>
</nav>
