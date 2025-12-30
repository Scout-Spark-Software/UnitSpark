<script lang="ts">
    import Navigation from "$lib/components/Navigation.svelte";
    import Hero from "$lib/components/Hero.svelte";
    import AdventuresSection from "$lib/components/AdventuresSection.svelte";
    import UnitManagementSection from "$lib/components/UnitManagementSection.svelte";
    import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
    <title>Unit Spark - Empowering Unit Adventures</title>
</svelte:head>

<Navigation />
<Hero />
<AdventuresSection />
<UnitManagementSection />
<Footer />

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>
