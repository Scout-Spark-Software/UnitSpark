<script lang="ts">
    import { onMount } from "svelte";
    import companyLogo from "$lib/assets/Unit-Spark-Software.png";

    interface Props {
        darkBackground?: boolean;
    }

    let { darkBackground = false }: Props = $props();

    let scrolled = $state(false);

    onMount(() => {
        const handleScroll = () => {
            scrolled = window.scrollY > 50;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    });

    function smoothScroll(e: MouseEvent, targetId: string) {
        e.preventDefault();
        const element = document.querySelector(targetId);
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }
</script>

<nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {scrolled ||
    darkBackground
        ? 'bg-white/95 backdrop-blur-lg shadow-lg'
        : 'bg-transparent'}"
>
    <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex justify-between items-center">
            <a
                href="/"
                class="transition-all duration-300 flex items-center gap-3"
            >
                <img
                    src={companyLogo}
                    alt="Unit Spark"
                    class="{scrolled || darkBackground
                        ? 'h-10'
                        : 'h-14'} w-auto transition-all duration-300"
                />
            </a>
            <div class="hidden md:flex gap-8">
                <a
                    href="#adventures"
                    onclick={(e) => smoothScroll(e, "#adventures")}
                    class="{scrolled || darkBackground
                        ? 'text-gray-700 hover:text-purple-600'
                        : 'text-white hover:text-purple-200'} font-medium transition-colors cursor-pointer"
                    >Adventures</a
                >
                <a
                    href="#unit-management"
                    onclick={(e) => smoothScroll(e, "#unit-management")}
                    class="{scrolled || darkBackground
                        ? 'text-gray-700 hover:text-purple-600'
                        : 'text-white hover:text-purple-200'} font-medium transition-colors cursor-pointer"
                    >Unit Management</a
                >
            </div>
        </div>
    </div>
</nav>
