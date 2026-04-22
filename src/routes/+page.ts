import type { PageLoad } from "./$types";
import type { Section } from "$lib/types";

const CDN_URL = "https://cdn.skylit.studio";

export const load: PageLoad = async ({ fetch }) => {
    const response = await fetch(`${CDN_URL}/sections.json`);

    if (!response.ok) {
        return {
            sections: [] as Section[],
        };
    }

    const sections = (await response.json()) as Section[];

    return {
        sections,
    };
};