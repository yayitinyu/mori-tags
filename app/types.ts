export interface Tag {
    id: number;
    name_en: string;
    name_zh: string;
    category: string;
    is_negative: boolean;
    image_url?: string;
    wiki_url?: string;
}

export interface Collection {
    id: number;
    name: string;
    tags_string: string;
}
