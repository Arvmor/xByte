import type { ItemProps } from "@/components/track/item";
import type { UUID } from "crypto";

export interface TrackItem extends ItemProps {
    uuid: UUID;
}

export interface MovieItem extends ItemProps {
    uuid: UUID;
}

export const tracks: TrackItem[] = [
    {
        uuid: "123e4567-e89b-12d3-a456-426614174000",
        title: "September",
        name: "OceanKing",
        image: "https://picsum.photos/200/200?random=1",
        size: 200,
    },
    {
        uuid: "123e4567-e89b-12d3-a456-426614174001",
        title: "Dobranoc",
        name: "OceanKing",
        image: "https://picsum.photos/200/200?random=2",
        size: 200,
    },
    {
        uuid: "123e4567-e89b-12d3-a456-426614174002",
        title: "Always On The Way",
        name: "ft. Thunder, OceanKing",
        image: "https://picsum.photos/200/200?random=3",
        size: 200,
    },
    {
        uuid: "123e4567-e89b-12d3-a456-426614174003",
        title: "The Path Untrodden",
        name: "OceanKing",
        image: "https://picsum.photos/200/200?random=4",
        size: 200,
    },
];

export const movies: MovieItem[] = [
    {
        uuid: "e41b9041-9820-4ebe-b9b2-d1435b524220",
        title: "FonkETH",
        name: "P2P Protocol-Agnostic Mining Layer",
        image: "https://picsum.photos/200/200?random=5",
        size: 200,
    },
    {
        uuid: "123e4567-e89b-12d3-a456-426614174005",
        title: "Movie 2",
        name: "Actor 2",
        image: "https://picsum.photos/200/200?random=6",
        size: 200,
    },
    {
        uuid: "123e4567-e89b-12d3-a456-426614174006",
        title: "Movie 3",
        name: "Actor 3",
        image: "https://picsum.photos/200/200?random=7",
        size: 200,
    },
    {
        uuid: "123e4567-e89b-12d3-a456-426614174007",
        title: "Movie 4",
        name: "Actor 4",
        image: "https://picsum.photos/200/200?random=8",
        size: 200,
    },
];

export const trending: { title: string; items: (TrackItem | MovieItem)[] }[] = [
    {
        title: "Trending Songs",
        items: tracks,
    },
    {
        title: "Featured Movies",
        items: movies,
    },
];
