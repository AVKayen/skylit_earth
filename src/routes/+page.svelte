<script lang="ts">
    import type { Photo, Section } from "$lib/types";
    import { onMount } from "svelte";

    const CDN_URL = "https://cdn.skylit.studio";

    let sections: Section[] | null = $state<Section[] | null>(null);
    let sectionColumns: Array<Array<Photo[]>> = $state([]);
    let isWideScreen = $state(false);
    let isLoading = $state(false);
    let loadedPhotoIds = $state<Record<string, boolean>>({});

    const isDesktopWidth = () => window.innerWidth > 900;
    
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

    const markImageLoaded = (id: string) => {
        loadedPhotoIds = {
            ...loadedPhotoIds,
            [id]: true,
        };
    };


    onMount(() => {
        isWideScreen = isDesktopWidth();
        isLoading = true;

        const handleResize = () => {
            isWideScreen = isDesktopWidth();
        };

        window.addEventListener("resize", handleResize);

        fetch(`${CDN_URL}/sections.json`)
            .then((response) => response.json())
            .then((data) => {
                sections = data;
                
            })
            .finally(() => {
                sectionColumns = (sections ?? []).map((section) =>
                    splitPhotosByColumn(section.photos)
                );
                isLoading = false;
            });


        return () => {
            window.removeEventListener("resize", handleResize);
        };
    });
</script>

<svelte:head>
    <title>skylit/gallery</title>
    <meta name="description" content="About this website and its creator" />
</svelte:head>

{#snippet photoCard(photo: Photo)}
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
                class:loaded={loadedPhotoIds[photo.id]}
                class="main-image"
                src={getPhotoSrc(photo.id, photo.extension)}
                alt={photo.title}
                loading="lazy"
                decoding="async"
                width={photo.width}
                height={photo.height}
                onload={() => markImageLoaded(photo.id)}
            />
        </div>
        <figcaption class="photo-caption">
            <span class="photo-id">{photo.id}</span>
            <span class="photo-title">{photo.title}</span>
        </figcaption>
    </figure>
{/snippet}

<div class="gallery-container">
    {#if sections && sections.length > 0}
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
                                {#each sectionColumns[sectionIndex]?.[column - 1] ?? [] as photo}
                                    {@render photoCard(photo)}
                                {/each}
                            </div>
                        {/each}
                    </div>
                {:else}
                    {#each section.photos as photo}
                        {@render photoCard(photo)}
                    {/each}
                {/if}
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
                    <strong>BTC</strong> bc1q0c833xzl0mmefe3rsahmg93yzs40tm2x3e0x98
                    <br />
                    <strong>LTC</strong> ltc1qrkqtcuuuel8g20ea4kdsrfrhsy6nyj9n029ejn
                </p>
            </div>
        </div>
    {:else if isLoading}
        <div class="loading-initial">
            <div class="loading-spinner"></div>
            <p>Loading photos...</p>
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
        font-weight: 400;
        font-family: var(--font-main), serif;
        margin: 0;
    }
    .gallery-container {
        width: 100%;
        margin: 0;
    }

    .section {
        margin-bottom: 48px;
    }

    .section h2 {
        font-size: 1.4rem;
        font-weight: 300;
        font-family: var(--font-main), serif;
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

    .main-image.loaded {
        opacity: 1;
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

    .loading-spinner {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid rgba(0, 0, 0, 0.15);
        border-top-color: rgba(0, 0, 0, 0.55);
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    .loading-initial p {
        margin: 0;
        color: #666;
        font-family: var(--font-main), serif;
        font-size: 1rem;
    }

    @media (max-width: 900px) {
    }

</style>
