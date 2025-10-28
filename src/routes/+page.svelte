<script lang="ts">
    import Navigation from "$lib/components/Navigation.svelte";
    import Hero from "$lib/components/Hero.svelte";
    import HikingSection from "$lib/components/HikingSection.svelte";
    import CampingSection from "$lib/components/CampingSection.svelte";
    import UnitManagementSection from "$lib/components/UnitManagementSection.svelte";
    import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
    <title>ScoutSpark - Empowering Scouting Adventures</title>
</svelte:head>

<Navigation />
<Hero />
<HikingSection />
<CampingSection />
<UnitManagementSection />
<Footer />

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>
