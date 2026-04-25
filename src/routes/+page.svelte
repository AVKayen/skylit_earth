<script lang="ts">
    import type { PageData } from "./$types";
    import type { Photo } from "$lib/types";
    import { onMount } from "svelte";

    const CDN_URL = "https://cdn.skylit.studio";
    const cryptoAddresses = [
        { symbol: "BTC", address: "bc1q0c833xzl0mmefe3rsahmg93yzs40tm2x3e0x98" },
        { symbol: "LTC", address: "ltc1qrkqtcuuuel8g20ea4kdsrfrhsy6nyj9n029ejn" },
    ];

    let { data }: { data: PageData } = $props();
    const sections = $derived(data.sections);
    let isWideScreen = $state(false);
    let hasResolvedViewport = $state(false);
    
    const getPhotoSrc = (id: string, extension: string) =>
        `${CDN_URL}/photos/${id}.${extension}`;

    const getLqipSrc = (lqip?: string) =>
        lqip ? `data:image/webp;base64,${lqip}` : "";

    const splitPhotosByColumn = (photos: Photo[]): Array<Photo[]> => {
        const columns: Array<Photo[]> = [[], [], []];

        photos.forEach((photo) => {
            const index = Math.min(Math.max(photo.column - 1, 0), 2);
            columns[index].push(photo);
        });

        return columns;
    };

    const sectionColumns = $derived.by(() =>
        sections.map((section) => splitPhotosByColumn(section.photos))
    );

    const revealImage = (event: Event) => {
        const target = event.currentTarget;
        if (target instanceof HTMLImageElement) {
            target.style.opacity = "1";
        }
    };

    onMount(() => {
        const mediaQuery = window.matchMedia("(min-width: 901px)");
        isWideScreen = mediaQuery.matches;
        hasResolvedViewport = true;

        const handleMediaChange = (event: MediaQueryListEvent) => {
            isWideScreen = event.matches;
        };

        mediaQuery.addEventListener("change", handleMediaChange);

        return () => {
            mediaQuery.removeEventListener("change", handleMediaChange);
        };
    });
</script>

<svelte:head>
    <title>skylit/gallery</title>
    <meta name="description" content="About this website and its creator" />
</svelte:head>

{#snippet photoCard(photo: Photo, index: number)}
    <figure class="photo-card">
        <div
            class="image-container"
            style={`aspect-ratio: ${photo.width} / ${photo.height};`}
        >
            {#if photo.lqip}
                <img
                    class="lqip"
                    src={getLqipSrc(photo.lqip)}
                    alt=""
                    aria-hidden="true"
                />
            {/if}
            <img
                class="main-image"
                src={getPhotoSrc(photo.id, photo.extension)}
                alt={photo.title}
                loading={index < 6 ? "eager" : "lazy"}
                fetchpriority={index < 6 ? "high" : "auto"}
                decoding="async"
                width={photo.width}
                height={photo.height}
                onload={revealImage}
            />
        </div>
        <figcaption class="photo-caption">
            <span class="photo-id">{photo.id}</span>
            <span class="photo-title">{photo.title}</span>
        </figcaption>
    </figure>
{/snippet}

<div class="gallery-container">
    {#if (sections.length > 0) && hasResolvedViewport}
        {#each sections as section, sectionIndex}
            <section class="section">
                {#if section.title}
                    <div class="section-title">
                        <h2>{section.title}</h2>
                    </div>
                {/if}

                {#if isWideScreen}
                    <div class="masonry-grid">
                        {#each [1, 2, 3] as column}
                            <div class="masonry-column">
                                {#each sectionColumns[sectionIndex]?.[column - 1] ?? [] as photo, photoIndex}
                                    {@render photoCard(photo, photoIndex)}
                                {/each}
                            </div>
                        {/each}
                    </div>
                {:else}
                    {#each section.photos as photo, photoIndex}
                        {@render photoCard(photo, photoIndex)}
                    {/each}
                {/if}
                    <hr>
            </section>
        {/each}

        <div class="info-grid-element">
            <div class="info-content">
                <h3>skylit/gallery</h3>
                <p>
                    Everything on this website is under CC-BY-NC and is my own work.
                    <br />Feel free to use it ~
                    <a href="mailto:sky@skylit.studio" class="addr">sky@skylit.studio</a>
                </p>
                <p class="crypto">
                    {#each cryptoAddresses as crypto, idx}
                        <strong>{crypto.symbol}</strong>
                        <span class="crypto-address">{crypto.address}</span>
                        {#if idx < cryptoAddresses.length - 1}
                            <br />
                        {/if}
                    {/each}
                </p>
            </div>
        </div>
    {:else if hasResolvedViewport}
        <div class="loading-initial">
            <p>No photos available.</p>
        </div>
    {/if}
</div>

<style>
    .section-title {
        margin-bottom: 16px;
        display: flex;
        justify-content: center;
    }
    .section-title h2 {
        font-size: 1.6rem;
        font-weight: 500;
        font-family: var(--font-main), serif;
        margin: 0;
    }
    .gallery-container {
        width: 100%;
        margin: 0;
    }

    .masonry-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        column-gap: 16px;
    }

    .masonry-column {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .photo-card {
        margin: 0;
        overflow: hidden;
    }

    .section > .photo-card {
        margin-bottom: 16px;
    }

    .image-container {
        position: relative;
        width: 100%;
        overflow: hidden;
    }

    .image-container img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: top;
    }

    .lqip {
        position: absolute;
        top: 0;
        left: 0;
        filter: blur(20px);
        z-index: 1;
        transform: scale(1.03);
    }

    .main-image {
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        transition: opacity 0.4s ease-in-out;
        z-index: 2;
    }

    .photo-caption {
        margin-top: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-family: var(--font-main), serif;
        font-size: 1rem;
        font-weight: 300;
        line-height: 1.4;
    }

    .photo-id {
        font-weight: 500;
    }

    .photo-title {
        opacity: 0.9;
        text-align: right;
    }

    .info-grid-element {
        width: min(850px, calc(100% - 40px));
        margin: 24px auto 0;
    }

    .info-content {
        padding: 1.5rem;
        text-align: center;
        font-family: var(--font-main), serif;
    }

    .info-content h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.4rem;
        font-weight: 300;
    }

    .info-content p {
        margin: 0.5rem 0;
        font-size: 1rem;
        font-weight: 200;
    }

    .crypto {
        font-size: 0.8rem;
    }

    .crypto-address {
        overflow-wrap: anywhere;
        word-break: break-word;
    }

    .addr {
        color: inherit;
    }

    .loading-initial {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        min-height: 200px;
    }

    .loading-initial p {
        margin: 0;
        color: #666;
        font-family: var(--font-main), serif;
        font-size: 1rem;
    }

    hr {
        border: none;
        border-top: 1px solid #eee;
        margin: 24px 0;
    }
</style>
